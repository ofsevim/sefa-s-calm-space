# İçerik Yönetimi Sistemi

## Genel Bakış

Bu proje, Hero ve Hakkımda bölümlerinin içeriklerini Firebase Firestore üzerinden yönetebileceğiniz bir admin paneline sahiptir.

## Nasıl Kullanılır?

### 1. Admin Paneline Giriş

1. `/admin/login` adresine gidin
2. Admin bilgilerinizle giriş yapın

### 2. İçerik Yönetimi Sayfası

1. Sol menüden **"İçerik Yönetimi"** seçeneğine tıklayın
2. İki bölüm göreceksiniz:
   - **Hero Bölümü** (Anasayfa)
   - **Hakkımda Bölümü**

### 3. İçerikleri Düzenleme

#### Hero Bölümü
- **Ana Başlık**: Ana sayfa başlığının ilk kısmı
- **Vurgulu Kısım**: Renkli olarak gösterilen kısım
- **Açıklama Metni**: Ana sayfa açıklama yazısı
- **Birinci Buton Yazısı**: "Randevu Oluştur" butonu metni
- **İkinci Buton Yazısı**: "Hizmetleri İncele" butonu metni

#### Hakkımda Bölümü
- **Rozet Yazısı**: "Hakkımda" badge metni
- **Başlık**: "Merhaba, Ben" kısmı
- **İsim (Vurgulu)**: Renkli gösterilen isim
- **Birinci Paragraf**: İlk açıklama paragrafı
- **İkinci Paragraf**: İkinci açıklama paragrafı

### 4. Değişiklikleri Kaydetme

- Her bölüm için ayrı **"Kaydet"** butonu bulunmaktadır
- Değişikliklerinizi yaptıktan sonra ilgili butona tıklayın
- Başarılı olduğunda bir bildirim göreceksiniz

### 5. Gerçek Zamanlı Güncelleme

- Yaptığınız değişiklikler **anında** web sitesinde görünür
- Sayfayı yenilemenize gerek yoktur
- Birden fazla admin aynı anda çalışabilir

## Teknik Detaylar

### Firestore Yapısı

Veriler `content` koleksiyonunda saklanır:

```
content/
  ├── hero (document)
  │   ├── title: string
  │   ├── titleHighlight: string
  │   ├── description: string
  │   ├── primaryButtonText: string
  │   └── secondaryButtonText: string
  │
  └── about (document)
      ├── badge: string
      ├── title: string
      ├── titleHighlight: string
      ├── paragraph1: string
      └── paragraph2: string
```

### Dosya Yapısı

- **Hook**: `src/hooks/useContent.ts` - Firebase'den veri okuma
- **Admin Sayfası**: `src/pages/admin/ContentManagement.tsx` - İçerik düzenleme arayüzü
- **Hero Component**: `src/components/HeroSection.tsx`
- **About Component**: `src/components/AboutSection.tsx`

## İlk Kurulum

Eğer Firestore'da henüz veri yoksa, varsayılan değerler otomatik olarak kullanılır. İlk kaydetme işleminde veriler Firestore'a yazılacaktır.

## Sorun Giderme

### İçerikler görünmüyorsa:
1. Firebase bağlantınızı kontrol edin (`.env` dosyası)
2. Firestore kurallarınızı kontrol edin (okuma/yazma izinleri)
3. Konsol hatalarını kontrol edin

### Kaydetme başarısız oluyorsa:
1. Firebase Authentication'ın aktif olduğundan emin olun
2. Admin kullanıcısının yazma yetkisi olduğunu kontrol edin
3. Firestore kurallarını gözden geçirin

## Firebase Firestore Kuralları (Önerilen)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Content koleksiyonu - herkes okuyabilir, sadece admin yazabilir
    match /content/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Destek

Sorun yaşarsanız, Firebase Console'dan Firestore verilerinizi manuel olarak da düzenleyebilirsiniz.
