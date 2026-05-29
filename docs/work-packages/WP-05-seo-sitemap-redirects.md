# WP-05 — Bilingual SEO + URL + Redirects

## Title
Bilingual SEO: Metadata + JSON-LD + Sitemap + RSS + OG Image + Redirects (Faz 4)

## Purpose
Public site'a tam bilingual SEO/GEO katmanını eklemek: `generateMetadata` (canonical/hreflang/x-default/og:locale), JSON-LD (Article/Series/Person/Breadcrumb/FAQ), root sitemap (hreflang alternates) + robots, per-lang `feed.xml`, `next/og` ile 1200×630 OG image, ve `next.config redirects()` (yalnız `redirects.json`).

## Why this package exists
Master plan §20 (URL/dil/slug/redirect) + §21 (metadata/JSON-LD) + §22 (OG) + §4 önceliği (3, SEO/GEO). Okuma deneyimi (WP-04) hazır olunca, içeriğin keşfedilebilir + paylaşılabilir + arama/AI-uyumlu olması için bu katman gelir. Sadece public içerik indekslenmeli (`isPublic`).

## Depends on
- **WP-04** (route'lar + reading experience mevcut).
- **WP-03** (canonical/hreflang/buildUrl/redirect helper'ları).

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§20** (URL/lang/slug + redirects + bilingual SEO), **§21** (generateMetadata + JSON-LD + routes), **§22** (OG 1200×630, asset), **§9** (isPublic, schemaType), **§32 Faz 4**.
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `CLAUDE.md`.

## Files/folders likely to touch
```
apps/web/app/[lang]/.../generateMetadata (article, series, layout)
apps/web/app/sitemap.ts                  (root, hreflang alternates)
apps/web/app/robots.ts                   (root)
apps/web/app/[lang]/feed.xml/route.ts    (per-lang RSS)
apps/web/.../og/ (next/og ImageResponse template, 1200×630)
apps/web/next.config.*  → redirects() = yalnız content/redirects.json ; trailingSlash:false
apps/web/.../jsonld/ (Article/BlogPosting/TechArticle, CollectionPage, WebSite+Person, BreadcrumbList, FAQPage)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **Scheduled publish / cron / cache invalidation YOK** → WP-07 (ama sitemap/rss/static params **isPublic** filtresini BURADA uygular).
- **Security headers / CSP YOK** → WP-08.
- **Studio YOK** → WP-06.
- **`/cv`, `/work` route'ları için içerik YOK** → WP-12 (varsa mevcut route'lara metadata eklenir; CV/work metadata'sı WP-12'de tamamlanır).
- **AI image API YOK** — OG `next/og` template'ten üretilir (§6/§22).
- Analytics / search index **YOK** (§4 future scope).

## Implementation steps
1. **`generateMetadata` (§21)**: title/description; canonical = dil-bazlı kendi URL'si; karşılıklı hreflang + `x-default → /tr`; OG/Twitter; **`og:locale` + `og:locale:alternate`**. content-core helper'larını kullan.
2. **JSON-LD (§21)**: article'da `schemaType` (Article|BlogPosting|TechArticle); seri `CollectionPage`; layout `WebSite` + `Person`; `faq` → `FAQPage`; **article ve seri sayfalarında `BreadcrumbList`**. Geçersiz JSON-LD → QC blocking (content-core kuralı).
3. **Sitemap (`app/sitemap.ts`, root)**: yalnız `isPublic`; her URL için **hreflang alternates** (tr/en + x-default); `lastmod = updatedDate ?? publishDate`.
4. **Robots (`app/robots.ts`, root)**.
5. **Per-lang RSS (`[lang]/feed.xml/route.ts`)**: yalnız public içerik. (Opsiyonel `/feed.xml → /tr/feed.xml` permanent redirect §20.)
6. **OG image (`next/og` `ImageResponse`)**: 1200×630, editorial template (sıcak zemin, nötr ton, ince ayraç, kontrollü bordo aksan; §6). AI image API'ye bağımlı değil.
7. **Redirects (§20)**: `next.config redirects()` **yalnız `content/redirects.json`**'dan üretir. **Root redirect İÇERMEZ** (`/→/tr` yalnız `app/page.tsx`, WP-04). `trailingSlash:false`. content-core redirect çözücüsüyle doğrula (open-redirect/loop/non-public hedef reddi).
8. **isPublic filtresi**: tüm list/sitemap/rss/`generateStaticParams` `isPublic` kullanır; sızıntı yok.
9. **Doğrula** (Rich Results test edilebilir JSON-LD; sitemap geçerli XML) + OpenWolf güncelle.

## Acceptance criteria
- Article/series/layout `generateMetadata` canonical + karşılıklı hreflang + x-default + og:locale(:alternate) üretiyor.
- JSON-LD: article (schemaType), seri CollectionPage, layout WebSite+Person, faq→FAQPage, article+seri BreadcrumbList — geçerli (Rich Results'tan geçer).
- `sitemap.xml` her URL için hreflang alternates içeriyor; yalnız public; `lastmod` doğru.
- `robots.txt` + per-lang `feed.xml` çalışıyor; feed yalnız public.
- OG image `next/og` ile 1200×630 üretiliyor; editorial estetik (§6 yasakları yok).
- `next.config redirects()` yalnız `redirects.json`'dan; root redirect yok; `trailingSlash:false`.
- draft/scheduled-future hiçbir SEO yüzeyinde (sitemap/rss/metadata) yok.
- `pnpm -w typecheck/lint/build` temiz.

## Required tests/checks
```
pnpm -w build
# /sitemap.xml geçerli XML + hreflang alternates; /robots.txt; /tr/feed.xml & /en/feed.xml yalnız public
# article JSON-LD Rich Results'tan geçer; OG image 1200×630 render
# redirects.json'a örnek kayıt → next.config redirect çalışır; open-redirect/loop reddedilir
```

## Commit message suggestion
```
feat(web): bilingual seo (metadata, jsonld, sitemap hreflang, rss, og image) + url redirects
```

## Risks / gotchas
- **Sitemap hreflang alternates** sık unutulur — her URL için tr/en + x-default zorunlu (§20).
- **`og:locale` + `og:locale:alternate`** zorunlu (§20).
- `next.config redirects()` **yalnız** `redirects.json` — başka redirect ekleme; root redirect WP-04'te.
- OG için AI image API kullanma — `next/og` template (§6).
- Sitemap/rss'e draft/scheduled sızdırma — `isPublic` filtresi şart (§27).
- `trailingSlash:false` sabit politika (§20).

## Handoff to next package
- **WP-06 (Studio MVP)** publish orchestration + `/api/revalidate` ekleyecek; SEO yüzeyleri publish sonrası revalidate edilecek (WP-07).
- Handoff notu: "bilingual SEO tam: metadata/canonical/hreflang/x-default/og:locale, JSON-LD (+Breadcrumb), sitemap (hreflang alternates), robots, per-lang RSS, OG 1200×630, redirects (yalnız redirects.json), trailingSlash:false. Cron/cache invalidation ve security headers henüz YOK."

## Claude Code start prompt
```
Sen kıdemli bir Next.js SEO/full-stack engineer'sın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) bilingual SEO katmanını kuracaksın. WP-04 (public reading) ve WP-03 (content-core: canonical/hreflang/buildUrl/redirect) hazır.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §20 (URL/lang/slug + redirects + bilingual SEO), §21 (generateMetadata + JSON-LD), §22 (OG 1200×630), §9 (isPublic/schemaType), §32 Faz 4
- docs/work-packages/WP-05-seo-sitemap-redirects.md → tam kapsam
- CLAUDE.md, .wolf/OPENWOLF.md (+ cerebrum); anatomy.md'ye bak

KAPSAM (yalnız bu, apps/web): generateMetadata (title/description, dil-bazlı canonical, karşılıklı hreflang + x-default→/tr, OG/Twitter, og:locale + og:locale:alternate); JSON-LD (Article/BlogPosting/TechArticle schemaType, seri CollectionPage, layout WebSite+Person, faq→FAQPage, article+seri BreadcrumbList); app/sitemap.ts (root, yalnız isPublic, her URL hreflang alternates, lastmod=updatedDate??publishDate); app/robots.ts; [lang]/feed.xml (per-lang, yalnız public); next/og ImageResponse 1200×630 editorial OG; next.config redirects() = YALNIZ content/redirects.json (root redirect YOK), trailingSlash:false. content-core helper'larını kullan; isPublic ile sızıntı engelle.

YAPMA: cron/cache invalidation (WP-07), security headers/CSP (WP-08), studio (WP-06), /cv,/work içerik (WP-12), AI image API, analytics/search.

BİTİRİNCE: pnpm -w typecheck/lint/build temiz; sitemap geçerli + hreflang; JSON-LD Rich Results'tan geçer; draft/scheduled SEO yüzeyinde yok. anatomy.md/memory.md güncelle. Commit: `feat(web): bilingual seo (...) + url redirects`. 5 satır özet + WP-06'nın başlayabileceğini belirt.
```
