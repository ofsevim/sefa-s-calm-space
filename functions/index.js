const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

initializeApp();

const telegramBotToken = defineSecret("TELEGRAM_BOT_TOKEN");
const telegramChatId = defineSecret("TELEGRAM_CHAT_ID");
const region = "europe-west1";
const adminEmails = new Set(["sefa.sevim@outlook.com"]);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function notificationsEnabled() {
  const snapshot = await getFirestore().doc("settings/notifications").get();
  return snapshot.exists && snapshot.data().telegramEnabled === true;
}

async function sendTelegram(message) {
  const token = telegramBotToken.value();
  const chatId = telegramChatId.value();
  if (!token || !chatId) throw new Error("Telegram secrets are not configured.");
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
  });
  if (!response.ok) throw new Error(`Telegram API returned ${response.status}.`);
}

function formatDate(value) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

exports.notifyNewAppointment = onDocumentCreated(
  { document: "appointments/{appointmentId}", region, secrets: [telegramBotToken, telegramChatId] },
  async (event) => {
    if (!event.data || !await notificationsEnabled()) return;
    const data = event.data.data();
    await sendTelegram([
      "🌿 <b>YENİ RANDEVU TALEBİ</b>",
      `👤 <b>Danışan:</b> ${escapeHtml(data.client_name)}`,
      `📞 <b>Telefon:</b> ${escapeHtml(data.client_phone)}`,
      `✉️ <b>E-posta:</b> ${escapeHtml(data.client_email)}`,
      `📅 <b>Tarih:</b> ${escapeHtml(formatDate(data.appointment_date))}`,
      data.notes ? `📝 <b>Not:</b> ${escapeHtml(data.notes)}` : null,
    ].filter(Boolean).join("\n"));
  },
);

exports.notifyNewMessage = onDocumentCreated(
  { document: "messages/{messageId}", region, secrets: [telegramBotToken, telegramChatId] },
  async (event) => {
    if (!event.data || !await notificationsEnabled()) return;
    const data = event.data.data();
    await sendTelegram([
      "📬 <b>YENİ İLETİŞİM MESAJI</b>",
      `👤 <b>Gönderen:</b> ${escapeHtml(data.name)}`,
      `✉️ <b>E-posta:</b> ${escapeHtml(data.email)}`,
      data.phone ? `📞 <b>Telefon:</b> ${escapeHtml(data.phone)}` : null,
      `💬 <b>Mesaj:</b> ${escapeHtml(data.message)}`,
    ].filter(Boolean).join("\n"));
  },
);

exports.testTelegramNotification = onCall(
  { region, secrets: [telegramBotToken, telegramChatId], enforceAppCheck: true },
  async (request) => {
    const email = request.auth?.token?.email?.toLowerCase();
    const isAdmin = request.auth?.token?.admin === true || adminEmails.has(email ?? "");
    if (!request.auth || !isAdmin) throw new HttpsError("permission-denied", "Yönetici yetkisi gerekli.");
    try {
      await sendTelegram("🔔 <b>TEST BİLDİRİMİ</b>\nTelegram entegrasyonu güvenli sunucu işlevi üzerinden çalışıyor.");
      return { success: true };
    } catch (error) {
      console.error("Telegram test failed", error);
      return { success: false, error: "Telegram ayarları doğrulanamadı." };
    }
  },
);
