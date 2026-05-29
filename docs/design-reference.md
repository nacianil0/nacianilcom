# Design Reference

> Faz 1 çıktısı. Portal dashboard duyuru ekranından çıkarılan prensipler + nacianil.com'a uyarlama.
> Güncelleme: 2026-05-29

---

## 1. Source Reference

**Dashboard:** `C:\Users\anil.akman\source\repos\Portal`  
**İncelenen:** `Eroglu.HR.UI/UI/src/page/Dashboard/AnnouncementDetailPage.tsx`, `AnnouncementCoverFrame.tsx`

Amaç: görsel/UX esinlenme. Kod, component, class veya içerik kopyalanmadı.

---

## 2. Adopted Principles

### 2.1 Title Treatment

Başlık büyük serif display font, sıkı satır aralığı (1.06), ardında ince **aksan renginde nokta/işaret** motifi. Dashboard'da `<h1>` sonuna `<span className="text-dsh-signal">.</span>` ekleniyor.

**nacianil.com uyarlaması:** Seri landing ve article başlıklarında `text-accent` renginde ince dikey sol çizgi (`border-l-4 border-accent`) veya başlık sonunda bordo nokta. Opsiyonel — uygulama WP-04'te.

### 2.2 Reading Column

Makale içeriği `max-width: 760px`, ortalanmış, `flex-col gap-8`. Mobil-first; kenarlık padding `px-6 sm:px-10 lg:px-14`.

**nacianil.com uyarlaması:** Article ve series landing sayfalarında `max-w-[760px] mx-auto`. WP-04'te uygulanır.

### 2.3 Masthead & Breadcrumb

`border-b` ile ayrılmış masthead. Breadcrumb: `font-mono text-[10px] uppercase tracking-[0.22em]` — küçük, harf-aralıklı, mono. Back link + ID badge + sağa uzanan `flex-1 bg-dsh-ink-faint` hairline.

**nacianil.com uyarlaması:** Seri içi navigasyonda üst breadcrumb aynı dil kullanılır (`font-mono text-[10px] uppercase tracking-wider text-ink-secondary`). Hairline separator (`h-px flex-1 bg-hairline`) sağa uzar.

### 2.4 Metadata Satırı

`flex flex-wrap items-center gap-3` — inline, sarmalı. Tarih `font-mono text-[10.5px] tabular-nums`. Yazarlar / etiketler arasında `<span className="h-[10px] w-px bg-hairline">` dikey ayraçlar. Hiç abartısız.

**nacianil.com uyarlaması:** Yayın tarihi, okuma süresi, zorluk seviyesi, kategori — aynı inline flat dil. Tarih `Intl.DateTimeFormat` ile locale formatı. WP-04'te uygulanır.

### 2.5 Cover Frame

Container `aspect-[16/9] max-h-[520px]`. İçerik **kırpılmaz** — `object-contain object-center`. Arka plan: aynı görsel blurlanmış (`scale-[1.06] blur-[14px] opacity-[0.33]`) sahne katmanı + `bg-card/50` perdesi. Yüklenirken `animate-pulse` shimmer. Görsel yoksa placeholder (logo watermark).

**nacianil.com uyarlaması:**  
- Cover `16:9, min 1600×900`. Görsel yoksa editorial template fallback (bordo aksan + boş alan, logo değil).  
- `object-contain` ile no-crop, blurred bleed arka plan. `border border-hairline` + `rounded-card`.
- `fetchPriority="high"` ilk ekrandaki cover için.

### 2.6 Body Typography

`text-[14.5px] leading-[1.7]` — 14.5px body text, 1.7 satır aralığı. Nefes alıyor, rahat okunuyor.

**nacianil.com uyarlaması:**  
- Article body: `font-sans text-[15px] leading-[1.75] text-ink` (hafif büyütüldü, editorial aralık).  
- Secondary text (tarih, meta): `text-ink-secondary`.

### 2.7 Loading States

Skeleton: `animate-pulse` ile `bg-card` bloklar. Layout kayması yok. `aria-busy="true"` kapsayıcıda.

**nacianil.com uyarlaması:** `prefers-reduced-motion` aktifken pulse animation kapatılır (global `@layer base` override).

### 2.8 Error / Empty States

Sade: ikon + mono uppercase metin. Sol hizalı, dramatik değil.

**nacianil.com uyarlaması:** 404 sayfası ve boş seri — aynı sakin dil. Büyük centered "Page not found" kutuları yok.

---

## 3. Consciously NOT Copied

| Dashboard Özelliği | Neden Alınmadı |
|---|---|
| Okuma boyutu kontrolleri (A+/A-) | Statik editorial site — font kontrolü kullanıcıya bırakılmaz; tarayıcı zoom yeterli |
| Pinned badge (signal dot) | HR uygulamasına özgü; editorial sitede anlam taşımaz |
| `dsh-*` color tokens | Farklı renk sistemi; nacianil.com'un kendi token seti var |
| Dashboard breadcrumb yapısı | HR modülü yapısına özgü; nacianil.com seri/article hiyerarşisiyle uyuşmaz |
| Eroglu logo watermark | Kurumsal kimlik, kullanılmaz |
| `border-dsh-ink` kenarlık sistemi | nacianil.com `border-hairline` (`#E8E3DC`) kullanıyor — çok daha yumuşak |
| Component class isimleri (`dsh-display`, `dsh-paper`, vb.) | Farklı token sistemi |

---

## 4. nacianil.com Specific Additions

Dashboard'da olmayan ama premium editorial için gerekli:

### 4.1 Series Position Indicator

"Seride 3/7" — küçük mono uppercase. WP-04'te render edilir.

### 4.2 Previous / Next Navigation

Hairline separator + prev/next card. Dashboard'da sayfalama yok. Seri içi okuyucu yolculuğu için kritik.

### 4.3 References Section

Kaynakça sona yakın, `font-mono text-xs`, sıralı liste. Dashboard'da yok.

### 4.4 Technical Writing Components

`Callout`, `Definition`, `Example`, `Warning`, `Takeaway`, `CodeBlock` — dashboard yoktur. nacianil.com akademik/teknik içeriğin temel araçları.

### 4.5 Table of Contents

Opsiyonel sticky sidebar (desktop) veya kapalı açılır (mobil). Dashboard'da yoktur.

---

## 5. Token Rationale

| Token | Değer | Gerekçe |
|---|---|---|
| `--color-surface` | `#F7F5F2` | Sıcak krem beyaz — kağıt hissi |
| `--color-card` | `#FCFBF9` | Yüzey üstü kart — hafifçe daha açık |
| `--color-hairline` | `#E8E3DC` | Sıcak tonlu hairline — soğuk gri değil |
| `--color-ink` | `#1B1A18` | Sıcak siyah — soğuk `#000` değil |
| `--color-ink-secondary` | `#625D56` | AA ≥4.5:1 sıcak zeminde doğrulandı |
| `--color-accent` | `#9B2335` | Derin editorial bordo — "başlık önü çizgi" |
| `--color-positive` | `#3F7A52` | Doğal yeşil — pozitif/tamamlandı |
| `--color-negative` | `#A23B2E` | Toprak kırmızı — uyarı/hata |

**Kontrast:** `#625D56` / `#F7F5F2` kontrastı ≥ 4.5:1 (WCAG AA). Dekoratif/büyük metin değil, body metin için kullanılır. Daha düşük kontrast sadece ikon ve dekoratif ayraçlar için kabul edilir.

---

## 6. Typography Scale

| Rol | Font | Kullanım |
|---|---|---|
| Display / Başlık | Newsreader (serif) | H1, H2, seri başlığı |
| Body | Inter (sans) | Paragraflar, UI metni |
| Code / Meta | JetBrains Mono | Kod, tarih, ID badge, kategori/etiket |

**Etiket/kategori:** `font-mono text-[10px] uppercase tracking-wider text-ink-secondary` — dashboard'dan alınan dil.

---

## 7. Article Detail Adaptation

Dashboard duyuru detayı → nacianil.com makale detayına uyarlama:

| Dashboard | nacianil.com |
|---|---|
| Masthead breadcrumb (liste'ye dön) | Masthead: "← Seri adı / Yazı N" |
| `#007` ID badge | `N/M` seri pozisyon göstergesi |
| Pinned badge | Kategori chip (`font-mono uppercase`) |
| Relative tarih | Yayın tarihi + opsiyonel güncelleme tarihi |
| Yazar adı | — (tek yazarlı site) |
| Okuma boyutu kontrolleri | — (kullanılmaz) |
| Cover 16:9 (contain) | Cover 16:9 (contain) ✓ |
| Body 14.5px / 1.7 | Body 15px / 1.75 ✓ |
| Trailing accent period | Başlık öncesi bordo `border-l-4` veya trailing nokta ✓ |

---

## 8. Series Landing Adaptation

Dashboard'da doğrudan karşılık yok. Tasarım prensipleri:

- **Hero:** seri başlığı büyük serif + kısa açıklama + makale sayısı
- **Makale listesi:** hairline ayraçlarla; sıra numarası `font-mono text-ink-secondary`; başlık `font-serif`; meta satırı inline
- **Devam:** ilerleme göstergesi opsiyonel (kaç bölüm okundu)

---

## 9. Font Licensing

| Font | Lisans | Kaynak |
|---|---|---|
| Newsreader | SIL OFL 1.1 | Google Fonts |
| Inter | SIL OFL 1.1 | Google Fonts |
| JetBrains Mono | SIL OFL 1.1 | Google Fonts |

Web: `next/font/google` — Next.js fontları kendi sunucusundan serve eder (Google CDN runtime'da çağrılmaz). Studio (local): Google Fonts CDN import (only local use, §28).
