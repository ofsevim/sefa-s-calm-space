import assert from "node:assert";
import { readFileSync } from "node:fs";
import { parseImageUrl, resolveImageUrl, isImgbbViewerUrl, isValidUrl } from "./src/lib/imageUtils.ts";
import { slugify } from "./src/lib/slugify.ts";
import { services } from "./src/data/content.ts";
import { combineAppointmentDate, generateTimeSlots, getAppointmentDocumentId, parseTimeRange } from "./src/lib/booking.ts";
import { formatWhatsappLink } from "./src/lib/whatsapp.ts";

let passedCount = 0;
let totalCount = 0;

function runTest(name, fn) {
    totalCount++;
    try {
        fn();
        console.log(`  ✅ [GEÇTİ] ${name}`);
        passedCount++;
    } catch (err) {
        console.error(`  ❌ [BAŞARISIZ] ${name}:`, err.message);
    }
}

async function runAsyncTest(name, fn) {
    totalCount++;
    try {
        await fn();
        console.log(`  ✅ [GEÇTİ] ${name}`);
        passedCount++;
    } catch (err) {
        console.error(`  ❌ [BAŞARISIZ] ${name}:`, err.message);
    }
}

console.log("\n==========================================");
console.log("🚀 Sefa's Calm Space - Test Senaryoları");
console.log("==========================================\n");

// --- GRUP 1: ImgBB & Görsel URL Ayrıştırma Testleri ---
console.log("📁 1. ImgBB ve Görsel URL Ayrıştırma Testleri:");

runTest("1.1 Doğrudan i.ibb.co resim bağlantısını koruma", () => {
    const input = "https://i.ibb.co/mTVNNcL/error.jpg";
    const result = parseImageUrl(input);
    assert.strictEqual(result, "https://i.ibb.co/mTVNNcL/error.jpg");
});

runTest("1.2 HTML gömme kodundan doğrudan görseli ayıklama", () => {
    const input = '<a href="https://ibb.co/bmMbbKS"><img src="https://i.ibb.co/mTVNNcL/error.jpg" alt="error" border="0" /></a>';
    const result = parseImageUrl(input);
    assert.strictEqual(result, "https://i.ibb.co/mTVNNcL/error.jpg");
});

runTest("1.3 HTML entity kodlu gömme kodundan görseli ayıklama", () => {
    const input = '&lt;a href=&quot;https://ibb.co/bmMbbKS&quot;&gt;&lt;img src=&quot;https://i.ibb.co/mTVNNcL/error.jpg&quot; alt=&quot;error&quot; border=&quot;0&quot; /&gt;&lt;/a&gt;';
    const result = parseImageUrl(input);
    assert.strictEqual(result, "https://i.ibb.co/mTVNNcL/error.jpg");
});

runTest("1.4 BBCode kodundan görseli ayıklama ([url][img])", () => {
    const input = "[url=https://ibb.co/bmMbbKS][img]https://i.ibb.co/mTVNNcL/error.jpg[/img][/url]";
    const result = parseImageUrl(input);
    assert.strictEqual(result, "https://i.ibb.co/mTVNNcL/error.jpg");
});

runTest("1.5 Basit BBCode kodundan görseli ayıklama ([img])", () => {
    const input = "[img]https://i.ibb.co/mTVNNcL/error.jpg[/img]";
    const result = parseImageUrl(input);
    assert.strictEqual(result, "https://i.ibb.co/mTVNNcL/error.jpg");
});

runTest("1.6 Markdown bağlantısından görseli ayıklama", () => {
    const input = "[![error](https://i.ibb.co/mTVNNcL/error.jpg)](https://ibb.co/bmMbbKS)";
    const result = parseImageUrl(input);
    assert.strictEqual(result, "https://i.ibb.co/mTVNNcL/error.jpg");
});

runTest("1.7 Standart harici görsel bağlantılarını (Unsplash vb.) koruma", () => {
    const input = "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800";
    const result = parseImageUrl(input);
    assert.strictEqual(result, "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800");
});

runTest("1.8 Başında/sonunda boşluk veya tırnak olan URL'leri temizleme", () => {
    const input = '   "https://i.ibb.co/mTVNNcL/error.jpg"   ';
    const result = parseImageUrl(input);
    assert.strictEqual(result, "https://i.ibb.co/mTVNNcL/error.jpg");
});

runTest("1.9 ImgBB sayfa bağlantısını (viewer link) tespit etme", () => {
    assert.strictEqual(isImgbbViewerUrl("https://ibb.co/bmMbbKS"), true);
    assert.strictEqual(isImgbbViewerUrl("https://ibb.co.com/bmMbbKS"), false);
    assert.strictEqual(isImgbbViewerUrl("https://i.ibb.co/mTVNNcL/error.jpg"), false);
});

runTest("1.10 isValidUrl ile geçerli/geçersiz URL doğrulama", () => {
    assert.strictEqual(isValidUrl("https://i.ibb.co/mTVNNcL/error.jpg"), true);
    assert.strictEqual(isValidUrl("gecersiz-link"), false);
    assert.strictEqual(isValidUrl(""), false);
});

await runAsyncTest("1.11 ibb.co sayfa linkini asenkron olarak doğrudan resme dönüştürme", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response("Görsel: https://i.ibb.co/mock/image.jpg");
    try {
        const resolved = await resolveImageUrl("https://ibb.co/bmMbbKS");
        assert.strictEqual(resolved, "https://i.ibb.co/mock/image.jpg");
    } finally {
        globalThis.fetch = originalFetch;
    }
});

// --- GRUP 2: Türkçe Slug ve URL Yapısı Testleri ---
console.log("\n📁 2. Türkçe Karakter & Slugify Testleri:");

runTest("2.1 Türkçe karakterleri doğru dönüştürme (ç, ğ, ı, ö, ş, ü)", () => {
    assert.strictEqual(slugify("Bireysel Danışmanlık"), "bireysel-danismanlik");
    assert.strictEqual(slugify("Ergen Danışmanlığı"), "ergen-danismanligi");
    assert.strictEqual(slugify("Sınav Kaygısı"), "sinav-kaygisi");
    assert.strictEqual(slugify("Kariyer Danışmanlığı"), "kariyer-danismanligi");
    assert.strictEqual(slugify("Online Terapi"), "online-terapi");
});

runTest("2.2 Hizmetler listesindeki tüm servislerin geçerli slug üretmesi", () => {
    services.forEach((s) => {
        const slug = slugify(s.title);
        assert.ok(slug.length > 0, `${s.title} için slug boş olamaz`);
        assert.doesNotMatch(slug, /[çğıöşüÇĞİÖŞÜ\s]/, `${slug} Türkçe karakter veya boşluk içeremez`);
    });
});

// --- GRUP 3: Randevu Saatleri Mantığı Testleri ---
console.log("\n📁 3. Randevu ve Çalışma Saatleri Mantığı Testleri:");

runTest("3.1 Saat aralığından doğru slot listesi üretme (13:00 - 20:00)", () => {
    const slots = generateTimeSlots([{ day: "Pazartesi - Cuma", hours: "13:00 - 20:00" }], new Date(2026, 8, 14));
    assert.strictEqual(slots.length, 7);
    assert.strictEqual(slots[0], "13:00");
    assert.strictEqual(slots[slots.length - 1], "19:00");
});

runTest("3.2 Hafta sonu / kapalı gün kontrolü", () => {
    const workingHours = [
        { day: "Pazartesi - Cuma", hours: "13:00 - 20:00" },
        { day: "Cumartesi", hours: "13:00 - 20:00" },
        { day: "Pazar", hours: "Kapalı" },
    ];
    assert.deepStrictEqual(generateTimeSlots(workingHours, new Date(2026, 8, 13)), []);
});

runTest("3.3 Dakikalı çalışma aralığını koruma", () => {
    const slots = generateTimeSlots([{ day: "Pazartesi", hours: "09:30 - 12:30" }], new Date(2026, 8, 14));
    assert.deepStrictEqual(slots, ["09:30", "10:30", "11:30"]);
});

runTest("3.4 Geçersiz çalışma saatini reddetme", () => {
    assert.strictEqual(parseTimeRange("25:00 - 18:00"), null);
    assert.strictEqual(parseTimeRange("18:00 - 09:00"), null);
});

runTest("3.5 Randevu belge kimliğini aynı slot için deterministik üretme", () => {
    const appointment = combineAppointmentDate(new Date(2026, 8, 14), "13:30");
    assert.strictEqual(getAppointmentDocumentId(appointment), getAppointmentDocumentId(new Date(appointment)));
    assert.ok(getAppointmentDocumentId(appointment).startsWith("slot_"));
});

// --- GRUP 4: Bildirim & WhatsApp Entegrasyon Testleri ---
console.log("\n📁 4. Bildirim ve WhatsApp Entegrasyon Testleri:");

runTest("4.1 formatWhatsappLink standart Türkiye numarası (0555...)", () => {
    const link = formatWhatsappLink("0555 123 45 67", "Randevu talebi");
    assert.strictEqual(link, "https://wa.me/905551234567?text=Randevu%20talebi");
});

runTest("4.2 formatWhatsappLink uluslararası format (+90 532...)", () => {
    const link = formatWhatsappLink("+90 532 999 88 77", "Merhaba & Test");
    assert.strictEqual(link, "https://wa.me/905329998877?text=Merhaba%20%26%20Test");
});

runTest("4.3 formatWhatsappLink başında 0 olmayan 10 haneli numara", () => {
    const link = formatWhatsappLink("5321112233", "Danışmanlık");
    assert.strictEqual(link, "https://wa.me/905321112233?text=Dan%C4%B1%C5%9Fmanl%C4%B1k");
});

// --- GRUP 5: Üretim Cache Politikası Testleri ---
console.log("\n📁 5. Üretim Cache Politikası Testleri:");

const headersConfig = readFileSync(new URL("./public/_headers", import.meta.url), "utf8");

runTest("5.1 İçerik hash'li asset'ler immutable cache kullanıyor", () => {
    assert.match(
        headersConfig,
        /(?:^|\n)\/assets\/\*\r?\n\s+Cache-Control:\s*public,\s*max-age=31536000,\s*immutable/,
    );
});

runTest("5.2 HTML ve SPA rotaları her dağıtımda yeniden doğrulanıyor", () => {
    ["/", "/index.html", "/hizmet/*", "/gizlilik", "/kvkk"].forEach((route) => {
        const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        assert.match(
            headersConfig,
            new RegExp(`(?:^|\\n)${escapedRoute}\\r?\\n\\s+Cache-Control:\\s*public,\\s*max-age=0,\\s*must-revalidate`),
            `${route} için yeniden doğrulama politikası eksik`,
        );
    });
});

runTest("5.3 Admin rotaları paylaşımlı önbellekte tutulmuyor", () => {
    ["/admin", "/admin/*"].forEach((route) => {
        const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        assert.match(
            headersConfig,
            new RegExp(`(?:^|\\n)${escapedRoute}\\r?\\n\\s+Cache-Control:\\s*private,\\s*max-age=0,\\s*must-revalidate`),
            `${route} için private yeniden doğrulama politikası eksik`,
        );
    });
});

runTest("5.4 Geri/ileri önbelleğini devre dışı bırakan no-store kullanılmıyor", () => {
    assert.doesNotMatch(headersConfig, /Cache-Control:[^\r\n]*\bno-store\b/i);
});

console.log("\n==========================================");
console.log(`📊 Test Sonucu: ${passedCount} / ${totalCount} test başarıyla tamamlandı!`);
if (passedCount === totalCount) {
    console.log("🎉 Tüm test senaryoları eksiksiz GEÇTİ.");
    console.log("==========================================\n");
    process.exit(0);
} else {
    console.error("⚠️ Bazı testler başarısız oldu.");
    process.exit(1);
}
