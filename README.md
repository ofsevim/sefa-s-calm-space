# Sefa's Calm Space

Sefa Sevim için hazırlanmış psikolojik danışmanlık sitesi ve Firebase tabanlı yönetim paneli.

## Teknoloji

- React 18, TypeScript, Vite ve Tailwind CSS
- Firebase Authentication, Firestore, Storage, App Check ve Cloud Functions
- Radix UI / shadcn-ui, React Hook Form ve Zod

## Yerel kurulum

Node.js 20 veya üzeri ve npm kullanın.

```bash
npm ci
copy .env.example .env.local
npm run dev
```

`.env.local` içindeki Firebase web uygulaması değerlerini Firebase Console'dan doldurun. Üretimde App Check için `VITE_RECAPTCHA_V3_SITE_KEY` de tanımlanmalıdır. `.env*` dosyaları Git'e dahil edilmez; yalnızca `.env.example` sürüm kontrolündedir.

## Kalite kontrolleri

```bash
npm run check
```

Bu komut sırasıyla TypeScript, ESLint, birim testleri ve üretim derlemesini çalıştırır.

## Firebase kurulumu

Proje kimliği `.firebaserc` içinde `sefasevim-9d8f8` olarak ayarlıdır. Güvenlik kuralları yalnızca `admin: true` custom claim'ine veya geçiş dönemi için `sefa.sevim@outlook.com` hesabına yönetici yetkisi verir.

```bash
npx firebase-tools login
npx firebase-tools use sefasevim-9d8f8
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage
```

Telegram bildirimleri tarayıcıdan gönderilmez. Bot anahtarı ve sohbet kimliği Secret Manager'da saklanır:

```bash
npx firebase-tools functions:secrets:set TELEGRAM_BOT_TOKEN
npx firebase-tools functions:secrets:set TELEGRAM_CHAT_ID
npm --prefix functions install
npx firebase-tools deploy --only functions
```

Ardından yönetim panelinde **Ayarlar → Bildirimler** bölümünden bildirimleri etkinleştirin. Cloud Functions yeni randevu ve mesaj belgelerini dinler.

## Veri modeli

- `content/{hero,about}`: ana sayfa içerikleri
- `settings/{general,services,workingHours,faqs,media}`: herkese açık site ayarları
- `settings/notifications`: yalnızca yöneticinin okuyabildiği bildirim ayarları
- `appointments/slot_*`: benzersiz randevu talepleri
- `messages/*`: iletişim talepleri

Yeni herkese açık yazmalar Firestore Rules tarafından alan, tür, boyut, tarih ve onay sürümü açısından doğrulanır. Firebase Console'da App Check zorlamasını Firestore, Storage ve Functions için etkinleştirin.

## Yayın

`npm run build` çıktısı `dist/` klasörüne yazılır. SPA yönlendirmesi `public/_redirects`, güvenlik başlıkları `public/_headers`, arama motoru rotaları ise `public/sitemap.xml` tarafından sağlanır.

