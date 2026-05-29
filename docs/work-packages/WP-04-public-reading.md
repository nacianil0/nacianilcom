# WP-04 — Public Reading Experience

## Title
Public Reading Experience: [lang] Routing + Series Landing + Article + Visual/Technical-Writing Render (Faz 3)

## Purpose
`apps/web`'de premium okuma deneyimini kurmak: `[lang]` (tr|en) routing, seri landing, article sayfası, MDX render (technical-writing + visual-block + InternalLink), Reading Experience standardı (§21), ve her yerde `isPublic` filtresi. 1 örnek seri + 3 yazı (TR+EN) ile doğrulanır.

## Why this package exists
Master plan §1/§21 ürünün kalbi okuma deneyimidir; §4 önceliği (2). content-core (WP-03) kontratları ve ui (WP-02) bileşenleri hazır olunca, bunları **gerçek, gezilebilir, premium** bir public okuma akışına bağlamak gerekir. SEO/scheduled/security sonraki paketlerde bunun üzerine biner.

## Depends on
- **WP-02** (token + technical-writing bileşenleri + web wrapper'ları).
- **WP-03** (`isPublic`, `buildUrl`, parser, derive, `InternalLink` resolver).

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§21** (routes + rendering + Reading Experience), **§15** (visual-block — MVP custom scope), **§16** (technical-writing render), **§17** (internal link), **§9/§10** (isPublic, contracts), **§20** (URL/slug — buildUrl, `/→/tr`), **§22** (a11y/perf), **§32 Faz 3**.
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `CLAUDE.md`.

## Files/folders likely to touch
```
apps/web/app/page.tsx               → redirect('/tr')  (TEK kaynak root redirect)
apps/web/app/[lang]/layout.tsx page.tsx
apps/web/app/[lang]/series/page.tsx                         (seri listesi)
apps/web/app/[lang]/series/[seriesSlug]/page.tsx            (seri landing)
apps/web/app/[lang]/series/[seriesSlug]/[articleSlug]/page.tsx (article)
apps/web/.../components/ (reading layout, TOC, metadata row, prev/next)
packages/ui/components/ (visual-block presentational: Comparison, LayeredModel, Pyramid + generic VisualBlock)
apps/web/.../mdx/ (next-mdx-remote/rsc bileşen haritası: technical-writing + visual-block + InternalLink web wrapper)
content/series/<örnek-seri>/...     (1 seri + 3 yazı, TR+EN)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **SEO metadata / sitemap / RSS / OG image / JSON-LD YOK** → WP-05.
- **`next.config redirects()` / `headers()` YOK** → WP-05 (redirects) / WP-08 (headers).
- **Scheduled publish / cron / cache invalidation YOK** → WP-07 (ama `isPublic` filtresi + future içerik `notFound()` BURADA uygulanır).
- **Studio YOK** → WP-06.
- **`/cv`, `/cv/print`, `/work`, `/work/[caseSlug]` route'ları YOK** → WP-12.
- **`content/standalone/` route YOK** (reserved for future, §4).
- **Mermaid `.mmd→.svg` pipeline YOK** → WP-10. Web yalnız **commit edilmiş statik SVG'yi okur/render eder**.
- Security headers / CSP **YOK** → WP-08.

## Implementation steps
1. **Root redirect (§20)**: `app/page.tsx` → `redirect('/tr')`. **Yalnız burada**; `next.config`'e root redirect koyma.
2. **`[lang]` segment**: yalnız `tr|en`; browser-locale auto-redirect **YOK**; dil yalnız kullanıcı aksiyonuyla.
3. **Seri listesi + landing (§21)**: `series/` ve `series/[seriesSlug]`. Landing seri yolculuğunu gösterir (§14). `buildUrl` ile linkler.
4. **Article sayfası (§21)**: hero/title, summary, metadata satırı (okuma süresi/zorluk/tarih/category — Intl + messages), seri konumu, kaynakça, prev/next, seri landing'e dönüş. Desktop opsiyonel sticky TOC; mobil sade/kapalı.
5. **MDX render**: `next-mdx-remote/rsc`; bileşen haritası technical-writing (WP-02) + InternalLink (web wrapper, resolver WP-03) + visual-block.
6. **Visual-block presentational bileşenleri (§15 MVP custom)**: `Comparison`, `LayeredModel`, `Pyramid` + generic `VisualBlock` (title/caption/alt/source proplarını taşır, seçilebilir metin, light token, mobil reflow/responsive viewBox). **Commit edilmiş `.svg`'yi (Mermaid çıktısı) render eder** ama üretmez.
7. **`isPublic` her yerde (§9/§27)**: list/landing/`generateStaticParams` yalnız public; article route'ta runtime `if (!isPublic(meta, now)) notFound()`. (Scheduled mantığının ISR/cron tarafı WP-07; burada doğru filtre + `notFound()` yeterli.)
8. **Örnek içerik**: 1 seri + 3 yazı, TR + EN (aynı `slugBase`), en az biri visual-block + technical-writing + internal link içersin (render'ı kanıtlamak için).
9. **A11y/Perf çıtası (§22)**: semantic HTML, keyboard nav, focus state, `prefers-reduced-motion`, okunabilir max-width, gereksiz client JS yok (interaktif parça `"use client"`).
10. **Doğrula** + OpenWolf güncelle.

## Acceptance criteria
- `/` → `/tr` redirect çalışıyor (yalnız `app/page.tsx`).
- `/tr/series`, `/tr/series/<slug>`, `/tr/series/<slug>/<article>` ve `/en/...` karşılıkları render ediliyor.
- Article sayfası §21 reading experience öğelerini içeriyor (summary, metadata, seri konumu, kaynakça, prev/next, landing'e dönüş).
- Technical-writing bileşenleri + visual-block (Comparison/LayeredModel/Pyramid) + commit edilmiş SVG + InternalLink doğru render.
- draft/scheduled-future içerik **hiçbir liste/landing'de görünmüyor** ve doğrudan URL'de `notFound()`.
- TR/EN aynı `slugBase` ile çalışıyor; dil yalnız kullanıcı aksiyonuyla değişiyor.
- Örnek 1 seri + 3 yazı (TR+EN) canlı ve gezilebilir.
- `pnpm -w typecheck/lint/build` temiz.

## Required tests/checks
```
pnpm -w build
pnpm -w dev (web) → manuel: /tr, /en, seri landing, article; draft/scheduled URL → 404
# (varsa) route-level test: isPublic filtresi list + notFound
```

## Commit message suggestion
```
feat(web): public reading experience ([lang] routing, series, article, visual + technical-writing render)
```

## Risks / gotchas
- **`/→/tr` yalnız `app/page.tsx`'te** — `next.config`'e root redirect ekleme (WP-05 redirects.json sahibi).
- Web **Mermaid render etmez**; yalnız commit edilmiş statik SVG okur (Vercel'de headless browser yok, §31). SVG üretimi WP-10.
- `isPublic`'i burada **yeniden yazma**; content-core'dan import et.
- Gereksiz `"use client"` yayma — server-render öncelik (§22).
- standalone içerik için route açma (reserved for future).
- `packages/ui`'ye `next/*` sızdırma (visual-block bileşenleri framework-light kalmalı; Next'e özel şeyler web wrapper'da).

## Handoff to next package
- **WP-05 (SEO)** bu route'lara metadata/canonical/hreflang/JSON-LD/OG ekleyecek, sitemap/rss/redirects kuracak.
- Handoff notu: "public reading canlı; [lang] routing + series + article + visual/technical-writing render + isPublic + örnek içerik hazır. SEO/sitemap/OG/JSON-LD henüz YOK; `/cv`,`/work` route'ları henüz YOK (WP-12)."

## Claude Code start prompt
```
Sen kıdemli bir Next.js/full-stack engineer'sın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) public okuma deneyimini kuracaksın. WP-01 (scaffold), WP-02 (design system + technical-writing bileşenleri), WP-03 (content-core: isPublic/buildUrl/InternalLink/parser) hazır.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §21 (routes + Reading Experience), §15 (visual-block MVP custom), §16, §17, §9/§10 (isPublic/contracts), §20 (URL/slug, /→/tr), §22 (a11y/perf), §32 Faz 3
- docs/work-packages/WP-04-public-reading.md → tam kapsam
- CLAUDE.md, .wolf/OPENWOLF.md (+ cerebrum Do-Not-Repeat); dosya okumadan anatomy.md'ye bak

KAPSAM (yalnız bu, apps/web): app/page.tsx → redirect('/tr') (TEK kaynak); [lang] (tr|en) layout/page; series listesi + seri landing + article route; next-mdx-remote/rsc render (technical-writing + visual-block + InternalLink web wrapper); visual-block presentational bileşenleri Comparison/LayeredModel/Pyramid + generic VisualBlock (commit edilmiş SVG'yi render eder, üretmez); Reading Experience (§21: summary, metadata satırı [Intl+messages], seri konumu, kaynakça, prev/next, landing'e dönüş, opsiyonel sticky TOC); isPublic her yerde (list/generateStaticParams + runtime notFound); 1 örnek seri + 3 yazı (TR+EN, aynı slugBase, en az biri visual+technical+internal-link).

YAPMA: SEO metadata/sitemap/RSS/OG/JSON-LD (WP-05); next.config redirects()/headers() (WP-05/WP-08); cron/cache invalidation (WP-07); studio (WP-06); /cv,/work route (WP-12); standalone route; Mermaid .mmd→.svg pipeline (WP-10) — web yalnız statik SVG okur.

BİTİRİNCE: pnpm -w typecheck/lint/build temiz; draft/scheduled URL → 404; /→/tr çalışıyor. anatomy.md/memory.md güncelle. Commit: `feat(web): public reading experience (...)`. 5 satır özet + WP-05'in başlayabileceğini belirt.
```
