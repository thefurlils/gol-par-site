# GOL PARK — Modern Web + Admin Panel

Bu proje **Node.js + Express + SQLite + EJS** ile hazırlanmış, Gol Park Halı Saha / Parkta Mola konseptine göre modern ve responsive bir web sitesidir.

## Özellikler

- Modern koyu / neon-yeşil tasarım
- Mobil / tablet / masaüstü responsive
- Gol Park tanıtım görseli ve Parkta Mola menü görseli projeye dahil
- Admin giriş sistemi
- Dashboard:
  - toplam ziyaretçi
  - bugün
  - son 7 gün
  - menü ürün sayısı
  - son 14 gün ziyaretçi grafiği
- Ana sayfa metinlerini panelden değiştirme
- İstatistik kartlarını ekleme / düzenleme / pasifleştirme
- Menü ürünlerini ekleme / silme / düzenleme
- Fiyatları anında değiştirme
- Admin şifresi değiştirme
- SQLite ile kalıcı veri
- Ziyaretçi sayacı
- Login rate limit
- HTTP-only session cookie
- `.env` ile gizli ayarlar

## Kurulum

### 1. Node.js kur

Node.js 20+ önerilir.

### 2. Proje klasörüne gir

```bash
cd golpark-web
```

### 3. Paketleri kur

```bash
npm install
```

### 4. Ortam dosyasını oluştur

Linux/macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
copy .env.example .env
```

`.env` içindeki değerleri değiştir:

```env
PORT=3000
SESSION_SECRET=cok-uzun-rastgele-bir-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=CokGucluBirSifre123!
```

### 5. Veritabanını oluştur ve örnek verileri yükle

```bash
npm run seed
```

> `npm run seed`, örnek menü/istatistik verilerini yeniden yazar ve admin hesabının şifresini `.env` değerine göre günceller.

### 6. Çalıştır

```bash
npm start
```

Tarayıcı:

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## Geliştirme modu

```bash
npm run dev
```

## Önemli güvenlik notları

- Canlıya almadan önce `.env` içindeki `SESSION_SECRET` değerini uzun ve rastgele yap.
- `ADMIN_PASSWORD` değerini değiştir.
- İlk girişten sonra admin panelindeki **Güvenlik** bölümünden şifreyi tekrar değiştirebilirsin.
- `.env`, `data.sqlite` ve `sessions.sqlite` Git'e gönderilmemeli; `.gitignore` zaten ekli.
- Canlı kullanımda HTTPS kullan.
- Reverse proxy (Nginx/Cloudflare vb.) arkasında `NODE_ENV=production` kullan.

## Dosya yapısı

```text
golpark-web/
├── db/
│   ├── database.js
│   └── seed.js
├── middleware/
│   └── auth.js
├── public/
│   ├── assets/
│   │   ├── gol-park-promo.png
│   │   └── parkta-mola-menu.png
│   ├── css/
│   │   ├── site.css
│   │   └── admin.css
│   └── js/
│       └── site.js
├── routes/
│   ├── admin.js
│   ├── api.js
│   └── public.js
├── views/
│   ├── admin.ejs
│   ├── admin-login.ejs
│   ├── home.ejs
│   └── 404.ejs
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

## Canlıya alma

Bu yapı Render, Railway, VPS veya benzeri Node.js hosting'e uyarlanabilir. SQLite kullanıldığı için deploy ortamında diskin kalıcı olması önemlidir. Daha büyük trafik için PostgreSQL/MongoDB'ye geçiş yapılabilir.

## Özelleştirme

Ana sayfadaki içeriklerin çoğu Admin > Site İçeriği bölümünden değişir.

Menü:
**Admin > Menü & Fiyatlar**

İstatistikler:
**Admin > İstatistikler**

Şifre:
**Admin > Güvenlik**

Görseller:
`public/assets/` içindeki dosyaları değiştirerek güncelleyebilirsin.
