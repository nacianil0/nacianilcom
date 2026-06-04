# Password Gate Design

## Goal

Public web uygulamasina kullanici adi sormayan, tek sifreli ve 1 saatlik cookie ile calisan basit bir private gate ekle.

## Architecture

- `SITE_PASSWORD_SHA256` env var'i tek giris sifresinin SHA-256 hash'ini tasir; plaintext sifre repo'ya girmez.
- `AUTH_COOKIE_SECRET` env var'i 1 saatlik session cookie'sini HMAC ile imzalar.
- `/login` sadece sifre isteyen bir form sunar ve basarili giriste hedef URL'ye doner.
- `middleware.ts` korunan sayfalari cookie yoksa `/login?next=...` adresine yonlendirir.

## Routes And Exclusions

- Korumali: public page route'lari.
- Haric: `/login`, `/_next/*`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`, `/og`, `/api/*`, asset dosyalari.
- Env eksikse gate pasif kalir; local/dev ve mevcut deploy akislari kilitlenmez.

## Error Handling

- Yanlis sifre login sayfasinda genel bir hata mesaji gosterir.
- Eksik env durumunda login sayfasi konfigurasyon hatasi belirtir.
- `next` parametresi sadece internal relative path kabul eder; external redirect yok.

## Testing

- Hash karsilastirma.
- Session cookie uretme/dogrulama.
- Expire olmus ve bozulan cookie red.
- Internal-only next path sanitization.
