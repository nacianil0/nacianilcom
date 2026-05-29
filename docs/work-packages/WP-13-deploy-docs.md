# WP-13 — Deploy Docs + Smoke Tests

## Title
Deploy Documentation + Vercel Deploy + Smoke Tests (Faz 10)

## Purpose
Sistemi belgelemek ve canlıya almak: kapsamlı `README` (§34, CSP rollout + Production Security Checklist dahil), Vercel (Hobby) deploy + env yapılandırması, ve `pnpm audit` içeren smoke script. Bu paket projeyi "Definition of Done" (§33) durumuna getirir.

## Why this package exists
Master plan §34 (README/Documentation) + §32 Faz 10 + §33 (DoD). Tüm fonksiyonel paketler tamamlandıktan sonra, başkasının (veya gelecekteki bir chat'in) projeyi kurup çalıştırabilmesi, güvenli deploy edebilmesi ve düzenli içerik ekleyebilmesi için tek, eksiksiz dokümantasyon + deploy + smoke gerekir.

## Depends on
- **Tüm WP'ler** (WP-01..WP-12). Pratikte MVP için en az WP-01..WP-08 tamam olmalı; ertelenen WP'ler (09–12) eklendikçe README ilgili bölümlerle güncellenir.

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§34** (README içeriği — tam liste), **§33** (Definition of Done / guardrails), **§29** (Production Security Checklist + CSP rollout), **§4** (Future Scope), **§31** (risk notları), **§32 Faz 10**.
- Mevcut `docs/design-reference.md` (WP-02), `docs/work-packages/` (bu plan).
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `.wolf/buglog.json`, `CLAUDE.md`.

## Files/folders likely to touch
```
README.md                  (§34 tam içerik)
.env.example               (tüm env değişkenleri + açıklama)
package.json               (smoke script + pnpm audit)
scripts/smoke.*            (smoke test script'i)
vercel.json / Vercel proje ayarları (deploy + cron + env)
docs/ (gerekirse Production Security Checklist / troubleshooting ayrı dosya)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **Yeni feature / yeni route / yeni içerik YOK** — yalnız dokümantasyon, deploy, smoke.
- **Studio deploy YOK** (§28: yalnız `apps/web` deploy edilir).
- **Mimari değişiklik YOK** — sorun bulunursa ilgili WP kapsamına bug olarak loglanır (`buglog.json`) ve gerekirse o WP'ye dönülür.
- Refactor / yeniden tasarım **YOK**.

## Implementation steps
1. **README (§34)** — şunları içermeli: kurulum; Node/pnpm; scriptler (`dev:web`/`dev:studio`/`build`/`typecheck`/`lint`/`pnpm audit`/`test`); content yapısı; **taxonomy & internal linking (§17) + Internal Link Contract**; **technical-writing bileşenleri (§16)**; **UI i18n (§23)**; **asset/a11y/perf (§22)**; **URL/dil/slug + redirects (§20, trailingSlash:false)**; **bilingual SEO (hreflang sitemap, og:locale, BreadcrumbList)**; `STYLE.md` opsiyonel; `docs/design-reference.md`; **Monthly Plan (§25) + API key local kuralı**; **Auto Output Routing + AI Output Inbox (§26)**; yeni seri/yazı ekleme; Studio kullanımı; publish + **scheduled cache/revalidate (§27)**; env (`.env.example`); Vercel deploy; `/→/tr`, per-lang RSS, scheduled publish + **404-cache testi**; CV PDF + resume visibility; **CSP rollout notu (Report-Only → enforce)**; **Production Security Checklist (§29)**; **Future Scope (§4)**; font lisansları (SIL OFL); troubleshooting.
2. **`.env.example`**: tüm env değişkenleri (HMAC secret, revalidate URL, opsiyonel LLM API key — yalnız local) + her birinin açıklaması; secret'ların nereye konacağı (local `.env` / Vercel server env).
3. **Vercel deploy**: yalnız `apps/web`; env vars; cron (WP-07) yapılandırması; `trailingSlash:false`; CSP enforce (Report-Only'den sonra).
4. **Smoke script**: `pnpm audit` + temel sağlık kontrolleri (build, kritik route'lar, sitemap/robots/feed, `/→/tr`, scheduled 404-cache senaryosu referansı). `package.json`'a script.
5. **DoD doğrulaması (§33)**: typecheck+lint+build temiz; public bundle'da secret yok; studio deploy edilemez; prod security headers aktif; emoji/klişe/pazarlama yok; en az bir canlı yazı Lighthouse SEO+A11y 95+ ve Rich Results'tan geçer; tek `isPublic`/`runQC`/`buildUrl`/`normalizeSlug`/taxonomy-link doğrulayıcı; draft/scheduled/private sızmıyor.
6. **OpenWolf güncelle** (anatomy/memory; varsa buglog).

## Acceptance criteria
- `README.md` §34'teki **tüm** bölümleri içeriyor (kurulum → troubleshooting; CSP rollout + Production Security Checklist + Future Scope + font lisansları dahil).
- `.env.example` tüm env değişkenlerini açıklamasıyla içeriyor; secret konum kuralı net.
- `apps/web` Vercel'e deploy edilebiliyor (studio deploy edilmiyor); cron + env + CSP enforce yapılandırılmış.
- Smoke script (`pnpm audit` dahil) çalışıyor ve temel sağlık kontrollerini geçiyor.
- §33 DoD maddeleri sağlanıyor (canlı yazı Lighthouse 95+ ve Rich Results geçer; sızıntı yok; tek helper'lar).
- `pnpm -w typecheck/lint/build/test` + `pnpm audit` temiz.

## Required tests/checks
```
pnpm -w typecheck && pnpm -w lint && pnpm -w build && pnpm -w test
pnpm audit
# smoke: /→/tr; /sitemap.xml; /robots.txt; /tr/feed.xml & /en/feed.xml; bir canlı article 200;
#        scheduled 404-cache senaryosu; secret leak yok; protected API unauthorized reddi
# Vercel: apps/web deploy başarılı; studio deploy YOK; CSP enforce + cron aktif
# Lighthouse (canlı article): SEO ≥95, A11y ≥95; Rich Results geçer
```

## Commit message suggestion
```
docs: deploy guide + production security checklist + smoke tests (pnpm audit)
```

## Risks / gotchas
- **Yalnız `apps/web` deploy** — Studio asla (§28). Vercel proje köküne studio'yu dahil etme.
- **Secret'lar yalnız Vercel server env / local `.env`** — README/örnek'te gerçek değer yazma; `.env.example` placeholder.
- **CSP enforce'a geçiş** Report-Only'de sorun kalmayınca yapılır (§29) — erken enforce ile sayfa kırma.
- README'de §34 bölümlerinden birini atlama — checklist olarak teyit et.
- Sorun bulursan burada büyük refactor yapma — `buglog.json`'a logla, ilgili WP'ye dön.

## Handoff to next package
- **Son paket.** Proje §33 DoD'de. Sonraki adımlar Future Scope (§4): static search index, privacy-friendly analytics, KV/Redis tabanlı nonce/rate-limit, `content/standalone/` public route — hepsi MVP dışı, ayrı planlanır.
- Handoff notu: "nacianil.com canlı (apps/web Vercel); README tam (§34); smoke + pnpm audit geçiyor; DoD sağlandı. Future Scope ileride."

## Claude Code start prompt
```
Sen kıdemli bir full-stack engineer + teknik yazarsın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) deploy dokümantasyonu + Vercel deploy + smoke testleri yapacaksın. Fonksiyonel paketler (WP-01..WP-12; en az WP-01..08 MVP) tamam.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §34 (README tam içerik), §33 (Definition of Done), §29 (Production Security Checklist + CSP rollout), §4 (Future Scope), §31, §32 Faz 10
- docs/work-packages/WP-13-deploy-docs.md → tam kapsam; docs/design-reference.md; docs/work-packages/INDEX.md
- CLAUDE.md, .wolf/OPENWOLF.md (+ cerebrum, buglog); anatomy.md'ye bak

KAPSAM (yalnız bu): README.md (§34 TÜM bölümler: kurulum/Node-pnpm/scriptler/content yapısı/taxonomy+Internal Link Contract/technical-writing/UI i18n/asset-a11y-perf/URL-slug-redirects-trailingSlash:false/bilingual SEO/STYLE.md opsiyonel/design-reference/Monthly Plan + API key local/Auto Output Routing+Inbox/yeni seri-yazı/Studio/publish+scheduled cache-revalidate/env/.env.example/Vercel deploy/→tr+RSS+scheduled 404-cache testi/CV PDF+resume visibility/CSP rollout Report-Only→enforce/Production Security Checklist/Future Scope/font lisansları SIL OFL/troubleshooting); .env.example (tüm env + açıklama + secret konum kuralı); Vercel deploy (YALNIZ apps/web; cron+env+CSP enforce); smoke script (pnpm audit + sağlık kontrolleri); §33 DoD doğrulaması.

YAPMA: yeni feature/route/içerik; studio deploy; mimari değişiklik/refactor (sorun → buglog + ilgili WP'ye dön); README'de gerçek secret yazma.

BİTİRİNCE: pnpm -w typecheck/lint/build/test + pnpm audit temiz; smoke geçiyor; apps/web deploy (studio değil); canlı article Lighthouse ≥95 + Rich Results. anatomy.md/memory.md (+buglog) güncelle. Commit: `docs: deploy guide + production security checklist + smoke tests (pnpm audit)`. 5 satır özet + projenin §33 DoD'de olduğunu belirt.
```
