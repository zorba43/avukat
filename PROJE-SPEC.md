# Gökçe Hukuk Bürosu — Kaza Bildirim Sitesi — Proje Spesifikasyonu

Bu doküman, Claude Code ile geliştirilecek projenin tasarım kararlarını, teknik
yapısını ve kullanıcı akışını tanımlar. Klasör adı: `avukat`

**Firma adı:** Gökçe Hukuk Bürosu

---

## 1. Proje Özeti

Bir hukuk bürosu için, trafik kazası geçiren **kuryelerin** online olarak kaza
bilgilerini ve belgelerini (kaza raporu + fotoğraflar) bildirebildiği bir web
sitesi. Belge yüklendiğinde büroya **Telegram bildirimi** gider.

**Hedef kullanıcı:** Kaza geçirmiş, muhtemelen stresli/acele bir kurye. Akış
basit, hızlı ve mobil öncelikli olmalı.

---

## 2. Teknoloji Yığını

| Katman | Seçim | Not |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | Frontend + API tek projede |
| Stil | Tailwind CSS | Aşağıdaki tasarım tokenlarıyla özelleştirilecek |
| Veritabanı | SQLite + Prisma ORM | Kurulum gerektirmez, tek dosya |
| Dosya depolama | Sunucu yerel diski (`/uploads`) | Veritabanında sadece dosya yolu tutulur |
| Bildirim | Telegram Bot API | node-fetch ile basit HTTP isteği |

### Ortam Değişkenleri (`.env`)
```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
DATABASE_URL="file:./dev.db"
```

---

## 3. Tasarım Sistemi

Referans alınan yön: **Kirkland & Ellis** (monokrom, sade, güçlü boşluk) +
**Baker McKenzie** (daha görsel/erişilebilir, sıcak). Sonuç: "sakin otorite +
insani sıcaklık" dengesi.

### Renkler
```css
--navy:        #16233F   /* birincil marka rengi, başlıklar, header */
--navy-deep:   #0D1526   /* hero arka planı, koyu bölümler */
--charcoal:    #22262E   /* gövde metni */
--paper:       #FFFFFF   /* zemin */
--mist:        #F4F5F7   /* alternatif açık zemin (steps section) */
--line:        #E4E6EA   /* border/ayraç */
--slate:       #5C6470   /* ikincil/muted metin */
--amber:       #B8862F   /* ince vurgular, ikon, kicker etiketleri */
--urgent:      #C1452B   /* TEK CTA rengi — "Kaza Bildir" butonu */
--urgent-dark: #A2381F   /* CTA hover */
```
Kural: `--urgent` rengi SADECE ana çağrı-to-action butonlarında kullanılır.
Başka hiçbir yerde tekrarlanmaz — böylece CTA görsel olarak öne çıkar.

### Tipografi
- Başlıklar: **Fraunces** (serif, karakterli) — Google Fonts, opsz ekseni açık
- Gövde/form/UI: **Inter** (sans-serif) — form sayfalarında da aynı font kullanılacak
- Başlık ağırlığı: 500 (medium), all-caps kullanılmaz
- Satır uzunluğu: gövde metinlerde ~60-70 karakter, max-width ile sınırlanır

### Layout İlkeleri
- Tek net CTA hiyerarşisi: sayfada birden fazla "birincil" buton olmaz
- Adım/süreç anlatımı numaralandırılır (01/02/03) — bu gerçek bir sıra olduğu için
- Kartlarda tek bir border-radius standardı (6px), gölge kullanımı minimal
- Motion: sadece CTA hover ve tek bir hero pulse noktası (canlılık göstergesi), sayfa yüklenirken fade/slide animasyonları YOK

### Hero Görseli — SEÇİLDİ ✓
Gerçek fotoğraf `public/hero.webp` olarak kaydedildi. Uygulanacak teknik:

```html
<div class="hero">
  <img src="/hero.webp" alt="" class="hero-photo" />
  <div class="hero-scrim"></div>
  <div class="wrap"><div class="hero-content">...</div></div>
</div>
```
```css
.hero { position: relative; overflow: hidden; min-height: 620px; }
.hero-photo {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover; z-index: 0;
}
.hero-scrim {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(100deg,
    rgba(13,21,38,0.96) 0%, rgba(13,21,38,0.86) 38%,
    rgba(13,21,38,0.35) 68%, rgba(13,21,38,0.05) 100%);
}
```
Mobilde (dar ekran) scrim'i dikey gradyana çevirmek okunabilirliği korur (bkz.
design-preview v2/v3 `@media (max-width: 900px)` bloğu).

---

## 4. Kullanıcı Akışı

```
Ana Sayfa
  └─ [Kaza Bildir] butonu
       └─ Adım 1: Kişisel Bilgiler
            - İsim Soyisim
            - Telefon Numarası
            - Kaza Tarihi
       └─ Adım 2: Kaza Raporu Belgesi
            - Tek dosya yükleme (PDF/görsel)
       └─ Adım 3: Kaza Yeri Fotoğrafları
            - Maksimum 10 fotoğraf
       └─ Gönder
            - Veritabanına kayıt
            - Dosyalar /uploads içine kaydedilir
            - Telegram'a bildirim gider (isim, telefon, tarih, dosya sayısı)
```

Not: Sonraki aşamalar (teşekkür sayfası, admin paneli vb.) henüz kapsamda değil.

---

## 5. Route / Sayfa Yapısı

```
app/
├── page.tsx                          # Ana sayfa
├── kaza-bildir/
│   ├── page.tsx                      # Adım 1: kişisel bilgi formu
│   ├── belge-yukle/page.tsx          # Adım 2: kaza raporu yükleme
│   └── fotograf-yukle/page.tsx       # Adım 3: fotoğraf yükleme (maks. 10)
└── api/
    └── kaza-bildirimi/route.ts       # form verisi + dosya + Telegram bildirimi
```

---

## 6. Klasör Yapısı (Proje Kökü: `avukat/`)

```
avukat/
├── app/                    (yukarıdaki route yapısı)
├── components/             # tekrar kullanılan UI parçaları (Button, StepIndicator vb.)
├── lib/
│   ├── prisma.ts
│   └── telegram.ts         # Telegram bildirim gönderme fonksiyonu
├── prisma/
│   └── schema.prisma
├── public/
│   └── hero.webp           # ✓ eklendi — bkz. Bölüm 3
├── uploads/                # yüklenen belgeler (.gitignore'a eklenecek)
├── .env
├── .gitignore
└── package.json
```

---

## 7. Telegram Bot Kurulumu

1. Telegram'da `@BotFather` → `/newbot`
2. Bot adı ve kullanıcı adı belirlenir (kullanıcı adı "bot" ile bitmeli)
3. BotFather'dan alınan **token**, `.env` dosyasına `TELEGRAM_BOT_TOKEN` olarak eklenir
4. Bota bir mesaj gönderilip `https://api.telegram.org/bot<TOKEN>/getUpdates`
   adresinden dönen JSON'daki `chat.id` değeri `TELEGRAM_CHAT_ID` olarak eklenir

---

## 8. Şu Ana Kadar Onaylanan Tasarım Önizlemeleri

Sırasıyla geliştirilen 3 önizleme dosyası (referans için, gerçek kod tabanına
kopyalanmayacak, sadece görsel/CSS mantığı kaynak alınacak):
- `design-preview/index.html` — v1, ilk basit versiyon
- `design-preview/index-v2.html` — v2, kurye/yol hero + kart grid steps
- `design-preview/index-v3.html` — v3, kurumsal kule hero

Sıradaki adım: hero görseli kararlaştırılıp Adım 1 (Ana Sayfa) Claude Code'da
gerçek Next.js projesine dönüştürülecek.
