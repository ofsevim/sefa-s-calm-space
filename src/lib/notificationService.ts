import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./firebase";

export interface NotificationSettings {
    telegramEnabled: boolean;
    whatsappNumber?: string;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
    const [notificationSnapshot, generalSnapshot] = await Promise.all([
        getDoc(doc(db, "settings", "notifications")),
        getDoc(doc(db, "settings", "general")),
    ]);
    return {
        telegramEnabled: notificationSnapshot.exists() && notificationSnapshot.data().telegramEnabled === true,
        whatsappNumber: generalSnapshot.exists() && typeof generalSnapshot.data().whatsappNumber === "string"
            ? generalSnapshot.data().whatsappNumber
            : "",
    };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    await Promise.all([
        setDoc(doc(db, "settings", "notifications"), {
            telegramEnabled: settings.telegramEnabled,
            updatedAt: serverTimestamp(),
        }, { merge: true }),
        setDoc(doc(db, "settings", "general"), {
            whatsappNumber: settings.whatsappNumber?.trim() ?? "",
        }, { merge: true }),
    ]);
}

export async function sendTelegramTestNotification(): Promise<{ success: boolean; error?: string }> {
    const callable = httpsCallable<Record<string, never>, { success: boolean; error?: string }>(functions, "testTelegramNotification");
    const result = await callable({});
    return result.data;
}

export function formatWhatsappLink(phone: string, text: string): string {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("0")
        ? `9${cleanPhone}`
        : cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}
