# WP-08 — Production Security Hardening + A11y/Perf

## Title
Production Security Hardening: CSP/Headers + Secret/Leak Audit + A11y/Perf 95+ + Smoke (Faz 6b)

## Purpose
Production güvenlik ve kalite çıtasını kurmak: security headers (CSP — Report-Only→enforce rollout, frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy), secret/leak denetimi, draft/scheduled/private veri sızıntısı doğrulaması, MDX raw-HTML & upload güvenliği, ve **Lighthouse SEO+A11y 95+** ile a11y/perf doğrulaması + güvenlik smoke senaryoları.

## Why this package exists
Master plan §29 (Production Security Standard) + §22 (a11y/perf) + §28 (güvenlik modeli) + §33 DoD ("prod security headers aktif; secret yok; Lighthouse 95+; sızıntı yok"). Public site (WP-04/05) ve scheduled publish (WP-07) hazır olunca, canlıya çıkmadan önce production-grade güvenlik + erişilebilirlik + performans bu pakette sağlanır.

## Depends on
- **WP-05** (web route'ları + sitemap/rss — güvenlik headers ve leak audit hedefleri).
- **WP-07 sonrası önerilir** (scheduled/cache davranışı yerleşik; leak senaryoları tam test edilir).

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§29** (Production Security Standard — CSP rollout, headers, HMAC uçları, secret, leak, redirect güvenliği, MDX/upload, dependency), **§28** (güvenlik modeli), **§22** (a11y/perf, Lighthouse 95+), **§15** (SVG sanitize — çapraz referans), **§32 Faz 6** (security + a11y/perf + testler).
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `.wolf/buglog.json`, `CLAUDE.md`.

## Files/folders likely to touch
```
apps/web/next.config.*  → headers() (CSP + güvenlik header'ları)
apps/web/.../mdx/ (raw HTML sanitize/whitelist veya kapalı)
apps/web/next.config images.remotePatterns (allowed domains) + upload kontrolleri
apps/web/.env.example (secret separation; NEXT_PUBLIC_* dışı sızmaz)
docs/ veya README taslağı (CSP rollout notu — tam README WP-13)
apps/web/.../__tests__ (güvenlik smoke: leak yok, protected API unauthorized reddi, open-redirect reddi)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **SVG sanitize implementasyonu YOK** → WP-10 (burada yalnız **checklist + QC blocking kuralının var olduğunu teyit** + çapraz referans; sanitize pipeline Studio'da).
- **`/api/revalidate` HMAC mekanizması YOK** → WP-06 (burada yalnız "protected API unauthorized reddi" smoke testi).
- **Nonce / distributed rate-limit / KV/Redis YOK** (§29 MVP dışı — in-memory nonce/rate-limit production security sayılmaz).
- **Yeni içerik/feature/route YOK**. **Tam README YOK** → WP-13 (yalnız CSP rollout notu taslağı).
- **Studio deploy YOK** (§28: 127.0.0.1).

## Implementation steps
1. **Security headers (`next.config headers()`, §29)**:
   - **CSP**: mümkün olduğunca sıkı; Next static/ISR gerçekliği kabul → **nonce tüm sayfalarda zorunlu değil**, yalnız gerçekten dynamic uçlarda. Inline gerekiyorsa **kontrollü hash veya sınırlı `unsafe-inline`**; neden README'de. **Report-Only → enforce** rollout. **Dev gevşekliği prod'a taşınmaz.**
   - `frame-ancestors 'none'` (+ `X-Frame-Options: DENY`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (kullanılmayan özellikler kapalı).
2. **Secret yönetimi (§29)**: yalnız server env / local `.env`; `NEXT_PUBLIC_*` dışı env client'ta kullanılmaz; build loglarında secret yok; environment separation; minimal env; `.env.example` güncel.
3. **Veri sızıntısı denetimi (§29/§30)**: draft/scheduled + `private` resume alanları **hiçbir** public response/sitemap/rss/OG/JSON-LD/static output'ta yok. Smoke testiyle doğrula.
4. **Redirect güvenliği (§20/§29)**: open redirect reddi (kural content-core'da, WP-03) — enforcement'ı `next.config redirects()` + smoke ile teyit.
5. **MDX/Markdown güvenliği (§29)**: raw HTML destekleniyorsa whitelist/sanitize; bilinmiyorsa **raw HTML kapalı**.
6. **Upload/external image (§29)**: `remotePatterns` allowed domains; dosya tipi/boyut; path traversal kontrolü.
7. **A11y/Perf (§22/§33)**: en az bir canlı yazıda **Lighthouse SEO + Accessibility 95+**; keyboard nav, focus state, semantic HTML, `prefers-reduced-motion`; gereksiz client JS yok.
8. **Dependency (§29)**: `pnpm audit` sürecine dahil (tam smoke script WP-13).
9. **SVG sanitize çapraz referansı (§15/§29)**: SVG sanitize'ın **zorunlu** ve CSP'den **ayrı** olduğunu README/checklist'e yaz; `runQC`'de "SVG sanitize failure → blocking" kuralının var olduğunu teyit et (impl WP-10).
10. **Güvenlik smoke senaryoları** (aşağıda) + OpenWolf güncelle.

## Acceptance criteria
- `next.config headers()` prod'da CSP (+ frame-ancestors/X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy) uyguluyor; CSP rollout (Report-Only→enforce) belgeli; dev gevşekliği prod'da yok.
- Public client bundle'da secret **yok** (yalnız `NEXT_PUBLIC_*`); build loglarında secret yok; `.env.example` güncel.
- draft/scheduled + private resume alanı **hiçbir** public yüzeyde görünmüyor (smoke ile kanıtlı).
- Open redirect / harici redirect reddediliyor.
- MDX raw HTML sanitize/whitelist veya kapalı; image `remotePatterns` tanımlı.
- En az bir canlı yazı **Lighthouse SEO + A11y ≥95**; keyboard/focus/reduced-motion çalışıyor.
- Protected API (`/api/revalidate`) imzasız istekte reddediyor (smoke).
- `pnpm -w typecheck/lint/build/test` + `pnpm audit` temiz/kabul edilebilir.

## Required tests/checks
```
pnpm -w build && pnpm -w test
pnpm audit
# Lighthouse (bir canlı article): SEO ≥95, Accessibility ≥95
# smoke: secret leak yok; draft/scheduled & private hiçbir public yüzeyde yok;
#        protected /api/revalidate unauthorized → reddedilir; open-redirect → reddedilir
# headers: CSP + frame-ancestors none + nosniff + Referrer-Policy + Permissions-Policy aktif (prod)
```

## Commit message suggestion
```
feat: production security hardening (CSP/headers, secret/leak audit, image/mdx safety) + a11y/perf 95+
```

## Risks / gotchas
- **CSP gerçekliği (§29)**: tüm statik/ISR'de nonce zorunlu tutma; hash/sınırlı unsafe-inline + Report-Only rollout. **Dev CSP gevşekliğini prod'a taşıma.**
- **In-memory nonce/rate-limit = production security DEĞİL** (§29). MVP'de eklemeye çalışma; ileride KV/Redis.
- **SVG sanitize ayrıca zorunlu, CSP yerine geçmez** (§15/§29) — ama impl WP-10; burada yalnız checklist + QC kuralı teyidi.
- Leak audit'i atlama: draft/scheduled **+ private resume alanları** dahil tüm yüzeyler (response/sitemap/rss/OG/JSON-LD/static).
- A11y/Perf çıtası (§7/§22) aslında her UI fazında geçerli; burası **final doğrulama kapısı**.

## Handoff to next package
- **WP-09** (Prompts + Auto Output Routing) içerik üretim hızlandırmasına başlayabilir — public site artık production-secure.
- Handoff notu: "production security headers (CSP rollout dahil) + secret/leak audit + image/mdx güvenliği + Lighthouse 95+ tamam. SVG sanitize impl WP-10'da; tam README + smoke script WP-13'te. Public site canlıya hazır (deploy WP-13)."

## Claude Code start prompt
```
Sen kıdemli bir güvenlik-bilinçli full-stack engineer'sın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) production security hardening + a11y/perf yapacaksın. WP-05 (web/SEO) ve WP-07 (scheduled/cache) hazır.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §29 (Production Security Standard), §28, §22 (a11y/perf, Lighthouse 95+), §15 (SVG sanitize çapraz referans), §32 Faz 6 (security + a11y + testler)
- docs/work-packages/WP-08-security-hardening.md → tam kapsam
- CLAUDE.md, .wolf/OPENWOLF.md (+ cerebrum, buglog); anatomy.md'ye bak

KAPSAM (yalnız bu, apps/web): next.config headers() → CSP (sıkı; nonce tüm sayfada zorunlu DEĞİL, gerçekten dynamic uçta; inline için kontrollü hash/sınırlı unsafe-inline; Report-Only→enforce rollout; dev gevşekliği prod'a taşınmaz) + frame-ancestors 'none' (+X-Frame-Options DENY) + X-Content-Type-Options nosniff + Referrer-Policy strict-origin-when-cross-origin + Permissions-Policy; secret/leak audit (client bundle'da secret yok; build log temiz; .env.example; draft/scheduled + private resume alanı hiçbir public yüzeyde yok); open-redirect reddi teyidi; MDX raw HTML sanitize/whitelist veya kapalı; image remotePatterns + upload kontrol; Lighthouse SEO+A11y ≥95 (bir canlı yazı) + keyboard/focus/reduced-motion; pnpm audit; güvenlik smoke (leak yok, protected API unauthorized reddi, open-redirect reddi). SVG sanitize: yalnız checklist + runQC blocking kuralı teyidi (impl WP-10).

YAPMA: SVG sanitize implementasyonu (WP-10); /api/revalidate HMAC mekanizması (WP-06); nonce/distributed rate-limit/KV (MVP dışı); yeni feature/route; tam README (WP-13); studio deploy.

BİTİRİNCE: pnpm -w build/test + pnpm audit temiz; headers prod'da aktif; Lighthouse ≥95; leak/unauthorized/open-redirect smoke geçiyor. anatomy.md/memory.md (+buglog) güncelle. Commit: `feat: production security hardening (...) + a11y/perf 95+`. 5 satır özet + WP-09'un başlayabileceğini belirt.
```
