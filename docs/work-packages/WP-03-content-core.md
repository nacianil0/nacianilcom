# WP-03 — content-core

## Title
content-core: Schemas, isPublic, buildUrl, QC, Taxonomy & Internal-Link Helpers + Unit Tests (Faz 2)

## Purpose
`packages/content-core`'u kurmak: tüm zod şemaları, MDX/JSON parser, türetilen alanlar, **`isPublic` truth table**, `normalizeSlug`, `buildUrl`, canonical/hreflang, taxonomy doğrulayıcı, internal-link checker + `InternalLink` resolver, redirect güvenlik çözücü, ve `runQC` iskeleti — **unit testlerle**. Bu paket projenin çekirdek kontrat katmanıdır; web ve studio onu paylaşır.

## Why this package exists
Master plan §9/§10 içerik modelini ve dosya kontratlarını tanımlar; §18 QC kurallarını; §20 URL/slug/redirect standardını. Bunların **tek bir paylaşılan implementasyonu** olmalı (§33: "tek `isPublic`/`runQC`/`buildUrl`/`normalizeSlug`/taxonomy-link doğrulayıcı"). Web (WP-04/05) ve Studio (WP-06) bunu import eder; kopyalanmaz. Bu yüzden public reading'den önce gelir.

## Depends on
- **WP-01** (monorepo, boş `packages/content-core`).
- WP-02'den **bağımsız** — paralel yapılabilir.

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§9** (content schema + isPublic truth table), **§10** (File I/O contracts), **§11** (lifecycle), **§13** (TR/EN adaptation), **§17** (taxonomy & internal linking + Internal Link Contract), **§18** (QC blocking vs warning), **§20** (URL/lang/slug/redirect), **§32 Faz 2**.
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `CLAUDE.md`.

## Files/folders likely to touch
```
packages/content-core/
  schemas/ (meta, series, references, taxonomy, redirects, plans, inbox — zod)
  parse/ (gray-matter + zod MDX frontmatter parser; JSON loader)
  derive/ (readingTime, prev/next, "seride konum", canonical, hreflang)
  url/ (normalizeSlug, buildUrl)
  taxonomy/ (category/tag doğrulayıcı)
  links/ (internal-link checker, InternalLink resolver — buildUrl üzerinden)
  redirects/ (loop / hedef-public / open-redirect çözücü)
  qc/ (runQC iskeleti — §18 blocking/warning kategorileri)
  isPublic.ts
  index.ts
  __tests__/ (vitest)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- React bileşeni / sayfa / route **YOK** (`InternalLink` burada **resolver** mantığıdır; MDX bileşeni render'ı WP-04).
- Studio UI / web routes **YOK**.
- Gerçek içerik yazımı **YOK** (test fixture'ları hariç).
- Mermaid/SVG sanitize implementasyonu **YOK** — ama `runQC` "SVG sanitize failure → blocking" **kuralını** ve "referanslı `.svg` yok → blocking" kuralını tanımlar; gerçek sanitize WP-10.
- `og:image` üretimi **YOK** (WP-05).

## Implementation steps
1. **Test runner kur**: vitest (önerilen) + `pnpm -w test` scripti. Sonraki WP'ler bunu kullanır.
2. **zod şemaları (§9)**: `meta.json`, `.mdx frontmatter` (her dil), `references.json`, `series.json`, `taxonomy.json`, `redirects.json`, **`plans/YYYY-MM.json`** (Topic + scores; WP-11 kullanacak), **`_inbox` discriminated item** (`kind`/`status`; WP-09 kullanacak). Hepsi tek yerde.
3. **Parser**: MDX frontmatter `gray-matter` + zod; JSON loader + zod. Hatalı JSON/MDX → yapısal hata (QC'de blocking).
4. **`isPublic(meta, now)` (§9 truth table)**: `meta.status !== 'draft' && new Date(meta.publishDate) <= now`. **Unit test: truth table'ın her satırı.**
5. **`normalizeSlug` (§20)**: kebab-case; ç→c, ş→s, ğ→g, ü→u, ö→o, ı→i, İ→i; boşluk→`-`; emoji/noktalama temizle. **Unit test: TR karakter dönüşümleri.**
6. **`buildUrl(lang, kind, slugs)` (§20)**: TR/EN **aynı `slugBase`**; route'lar §20 yapısına uygun. **Unit test: TR/EN stable URL.**
7. **canonical/hreflang türeticileri (§20)**: her dilin kendi URL'si canonical; karşılıklı hreflang; `x-default → /tr`.
8. **Taxonomy doğrulayıcı (§17)**: 1 primary category (taxonomy'de var olmalı) + ≤5 tag (kebab-case). Bilinmeyen category / kebab-olmayan / >5 tag → blocking.
9. **Internal-link checker + `InternalLink` resolver (§17 Internal Link Contract)**: linkler article id / series slug / case slug üzerinden `buildUrl` ile çözülür; **prose'da çıplak hardcoded URL yok**. Kırık link → blocking; **scheduled/draft hedefe link → published'da blocking**. **Unit test: resolver + draft/scheduled hedef bloklama.**
10. **Redirect çözücü (§20/§29)**: yalnız site-içi relative public URL; absolute/external → blocking; loop → blocking; hedef draft/scheduled/future → blocking; open redirect → blocking.
11. **`runQC(article, now)` iskeleti (§18)**: blocking/warning kategorilerini ve raporlama gruplarını (taxonomy/internal-link/slug/redirect/hreflang/canonical ayrı grup) tanımla. Kuralların bir kısmı sonraki WP'lerde dolar (örn. SVG sanitize WP-10, cover/og çözümü WP-05), ama **iskelet + isPublic/slug/taxonomy/internal-link/redirect/reference kuralları burada çalışır**. References: research/explainer/architecture veya `schemaType=TechArticle` → 0 referans **blocking**; essay/cv/case-study → 0 referans **warning** (§18).
12. **Türetilen alanlar (§9)**: `readingTime`, `prev`/`next`, "seride kaçıncı", canonical, hreflang — yazılmaz, hesaplanır.
13. **Doğrula** + OpenWolf güncelle.

## Acceptance criteria
- Tüm §9 şemaları zod ile tanımlı ve `index.ts`'ten export ediliyor (plans + inbox dahil).
- `isPublic` §9 truth table'ının **her satırı için** unit test geçiyor.
- `normalizeSlug` TR karakter setini doğru çeviriyor (test).
- `buildUrl` TR/EN için aynı `slugBase` ile stable URL üretiyor (test).
- `InternalLink` resolver article/series/case'i `buildUrl` üzerinden çözüyor; draft/scheduled hedefe link **blocking** (test).
- Taxonomy doğrulayıcı bilinmeyen category / >5 tag / kebab-olmayan tag'i **blocking** veriyor.
- Redirect çözücü open-redirect / loop / non-public hedefi reddediyor.
- `runQC` iskeleti blocking ve warning'i ayrı raporluyor; reference kuralı contentType'a göre çalışıyor.
- `pnpm -w typecheck/lint/build/test` temiz.

## Required tests/checks
```
pnpm -w test         # vitest: isPublic truth-table, normalizeSlug TR, buildUrl TR/EN,
                     #         InternalLink resolver, draft/scheduled hedef link blocking,
                     #         taxonomy/redirect kuralları
pnpm -w typecheck && pnpm -w lint && pnpm -w build
```

## Commit message suggestion
```
feat(content-core): zod schemas, isPublic, buildUrl, slug, taxonomy/link, redirect, runQC skeleton + tests
```

## Risks / gotchas
- **`isPublic` tek kaynak olmalı** — her yerde bu fonksiyon çağrılacak (WP-04/05/07). İkinci bir kopya yazma.
- **Ortak `slugBase`** bilinçli karar (§20): TR/EN aynı URL slug. EN için ayrı keyword-slug üretme.
- Internal Link Contract: prose'da **çıplak hardcoded internal URL yasak** — resolver zorunlu.
- `runQC` iskeletini aşırı doldurmaya çalışma; SVG sanitize (WP-10) ve cover/og çözümü (WP-05) gibi kurallar ilgili WP'de bağlanır. Ama kuralın **var olduğunu** iskelette belgele (TODO + tip).
- Şemaları sonraki WP'lerde yeniden tanımlama riski — plans/inbox dahil **hepsi burada**.

## Handoff to next package
- **WP-04 (Public Reading)** `isPublic`, `buildUrl`, parser, derive, `InternalLink` resolver'ı import edip render eder.
- **WP-05** canonical/hreflang/redirect helper'larını kullanır.
- **WP-06** `runQC`'yi Studio'da çağırır.
- Handoff notu: "content-core hazır; tüm şemalar (plans/inbox dahil) + isPublic/buildUrl/normalizeSlug/taxonomy/internal-link/redirect + runQC iskeleti + testler. Import et, kopyalama."

## Claude Code start prompt
```
Sen kıdemli bir TypeScript/full-stack engineer'sın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) içerik çekirdeği paketini kuracaksın. Monorepo iskeleti (WP-01) hazır.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §9 (schema + isPublic truth table), §10, §11, §13, §17 (taxonomy + Internal Link Contract), §18 (QC blocking/warning), §20 (URL/slug/redirect), §32 Faz 2
- docs/work-packages/WP-03-content-core.md → tam kapsam
- CLAUDE.md, .wolf/OPENWOLF.md + .wolf/cerebrum.md (Do-Not-Repeat)

KAPSAM (yalnız bu, packages/content-core): vitest kur (pnpm -w test); tüm zod şemaları (meta/frontmatter/references/series/taxonomy/redirects/PLANS/INBOX); MDX+JSON parser; isPublic(meta,now) + truth table; normalizeSlug (TR karakter); buildUrl (TR/EN ortak slugBase, stable); canonical/hreflang; taxonomy doğrulayıcı; internal-link checker + InternalLink resolver (buildUrl üzerinden, çıplak URL yasak, draft/scheduled hedef blocking); redirect çözücü (open-redirect/loop/non-public hedef blocking); runQC iskeleti (§18 blocking/warning + reference kuralı contentType'a göre). UNIT TEST: isPublic truth-table her satır, normalizeSlug TR, buildUrl TR/EN, InternalLink resolver, draft/scheduled hedef link blocking.

YAPMA: React bileşeni/route/sayfa, studio UI, gerçek içerik (fixture hariç), Mermaid/SVG sanitize implementasyonu (kural tanımı tamam, impl WP-10), og:image (WP-05).

BİTİRİNCE: pnpm -w test && pnpm -w typecheck && pnpm -w lint && pnpm -w build temiz. anatomy.md/memory.md güncelle. Commit: `feat(content-core): zod schemas, isPublic, buildUrl, slug, taxonomy/link, redirect, runQC skeleton + tests`. 5 satır özet + WP-04'ün başlayabileceğini belirt.
```
