# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-30T00:01:49.803Z
> Files: 101 tracked | Anatomy hits: 0 | Misses: 0

## ../../Users/anil.akman/.claude/projects/C--dev-nacianilcom/memory/


## ./

- `package.json` — Node.js package manifest (~188 tok)

## .claude/


## .claude/rules/


## apps/studio/

- `package.json` — Node.js package manifest (~332 tok)
- `postcss.config.mjs` (~22 tok)
- `tailwind.config.ts` — /*.{ts,tsx}', (~107 tok)

## apps/studio/messages/

- `en.json` (~155 tok)
- `tr.json` (~151 tok)

## apps/studio/server/


## apps/studio/src/

- `main.css` — Styles: 6 rules, 3 vars (~346 tok)
- `main.tsx` — rootEl (~92 tok)

## apps/studio/src/ui/

- `StudioImage.tsx` — Vite/Studio wrapper around the framework-light ImagePrimitive (§3). (~121 tok)
- `StudioLink.tsx` — Vite/Studio wrapper around the framework-light LinkPrimitive (§3). (~111 tok)

## apps/web/

- `package.json` — Node.js package manifest (~253 tok)
- `postcss.config.mjs` — Declares postcssConfig (~32 tok)
- `tailwind.config.ts` — /*.{ts,tsx}', (~520 tok)

## apps/web/app/

- `globals.css` — Styles: 5 rules (~231 tok)
- `layout.tsx` — newsreader (~274 tok)
- `page.tsx` — §20: root redirect — single source, not duplicated in next.config (~51 tok)

## apps/web/app/[lang]/

- `layout.tsx` — VALID_LANGS (~120 tok)
- `page.tsx` — LangHomePage (~99 tok)

## apps/web/app/[lang]/series/

- `page.tsx` — VALID_LANGS (~991 tok)

## apps/web/app/[lang]/series/[seriesSlug]/

- `page.tsx` — VALID_LANGS (~1510 tok)

## apps/web/app/[lang]/series/[seriesSlug]/[articleSlug]/

- `page.tsx` — VALID_LANGS (~2102 tok)

## apps/web/messages/

- `en.json` (~155 tok)
- `tr.json` (~151 tok)

## apps/web/src/components/

- `MetadataRow.tsx` — DIFFICULTY_KEY (~364 tok)
- `PrevNextNav.tsx` — PrevNextNav (~585 tok)
- `ReferencesSection.tsx` — ReferencesSection (~438 tok)
- `SeriesPositionBadge.tsx` — SeriesPositionBadge (~126 tok)
- `SiteNav.tsx` — SiteNav (~451 tok)
- `TOC.tsx` — TOC (~376 tok)

## apps/web/src/content/

- `loader.ts` — Exports loadSeries, loadMeta, MdxData, loadMdx + 7 more (~1533 tok)

## apps/web/src/lib/

- `messages.ts` — Exports WebMessages, getMessages (~146 tok)

## apps/web/src/mdx/

- `components.tsx` — MdxPre (~525 tok)

## apps/web/src/ui/

- `InternalLinkWeb.tsx` — InternalLinkWeb (~301 tok)
- `WebImage.tsx` — Next.js wrapper around the framework-light ImagePrimitive (§3). (~200 tok)
- `WebLink.tsx` — Next.js wrapper around the framework-light LinkPrimitive (§3). (~119 tok)

## content/

- `taxonomy.json` (~191 tok)

## content/_ideas/


## content/_inbox/


## content/_inbox/unresolved/


## content/plans/


## content/resume/


## content/series/


## content/series/yazilimda-temel-kavramlar/

- `series.json` (~149 tok)

## content/series/yazilimda-temel-kavramlar/articles/01-degisken-ve-tip/

- `final.en.mdx` — What is a variable? (~640 tok)
- `final.tr.mdx` — Değişken nedir? (~637 tok)
- `meta.json` (~124 tok)
- `references.json` (~118 tok)

## content/series/yazilimda-temel-kavramlar/articles/02-fonksiyon-ve-kapsam/

- `final.en.mdx` — What is a function? (~687 tok)
- `final.tr.mdx` — Fonksiyon nedir? (~729 tok)
- `meta.json` (~126 tok)
- `references.json` (~137 tok)

## content/series/yazilimda-temel-kavramlar/articles/03-veri-yapilari/

- `final.en.mdx` — Why data structures matter (~759 tok)
- `final.tr.mdx` — Neden veri yapısı önemlidir? (~818 tok)
- `meta.json` (~124 tok)
- `references.json` (~149 tok)

## content/standalone/


## docs/

- `design-reference.md` — Design Reference (~1863 tok)

## docs/work-packages/


## packages/content-core/

- `package.json` — Node.js package manifest (~206 tok)
- `tsconfig.build.json` (~33 tok)
- `tsconfig.json` — TypeScript configuration (~46 tok)
- `vitest.config.ts` — /*.test.ts'], (~48 tok)

## packages/content-core/src/

- `i18n.ts` — Supported UI locales (§23) (~373 tok)
- `index.ts` — Schemas (~493 tok)
- `isPublic.ts` — Exports isPublic (~50 tok)

## packages/content-core/src/__tests__/

- `buildUrl.test.ts` — Declares slug (~742 tok)
- `isPublic.test.ts` — Declares PAST (~484 tok)
- `links.test.ts` — NOW: blocking (~1064 tok)
- `normalizeSlug.test.ts` (~537 tok)
- `redirects.test.ts` — NOW: makeRedirect (~1031 tok)
- `taxonomy.test.ts` — Declares taxonomy (~694 tok)

## packages/content-core/src/derive/

- `canonical.ts` — Exports HreflangEntry, CanonicalResult, CanonicalUrlInput, deriveCanonical (~456 tok)
- `prevNext.ts` — Exports PrevNext, derivePrevNext, deriveSeriesPosition (~173 tok)
- `readingTime.ts` — Exports calcReadingTime (~59 tok)

## packages/content-core/src/links/

- `checker.ts` — Exports LinkIssue, checkInternalLinks (~313 tok)
- `resolver.ts` — Exports InternalLinkKind, ArticleLookup, SeriesLookup, CaseLookup + 4 more (~483 tok)

## packages/content-core/src/parse/

- `json.ts` — Exports ParseJsonResult, parseJson (~159 tok)
- `mdx.ts` — Exports ParseMdxResult, parseMdx (~249 tok)

## packages/content-core/src/qc/

- `runQC.ts` — Exports QCGroup, QCSeverity, QCIssue, QCReport + 2 more (~1097 tok)

## packages/content-core/src/redirects/

- `resolver.ts` — Exports ArticlePublicPath, RedirectIssue, resolveRedirects (~742 tok)

## packages/content-core/src/schemas/

- `frontmatter.ts` — Zod schemas: FaqItemSchema, FrontmatterSchema (~110 tok)
- `inbox.ts` — Zod schemas: InboxKindSchema, InboxStatusSchema, InboxItemSchema (~195 tok)
- `index.ts` (~268 tok)
- `meta.ts` — Zod schemas: AssetSchema, MetaSchema (~255 tok)
- `plans.ts` — Zod schemas: ScoresSchema, TopicSchema, MonthlyPlanSchema (~415 tok)
- `redirects.ts` — Zod schemas: RedirectItemSchema, RedirectsSchema (~103 tok)
- `references.ts` — Zod schemas: ReferenceItemSchema, ReferencesSchema (~109 tok)
- `series.ts` — Zod schemas: BilingualTextSchema, SeriesSchema (~127 tok)
- `taxonomy.ts` — Zod schemas: BilingualLabelSchema, CategorySchema, TagSchema, TaxonomySchema (~168 tok)

## packages/content-core/src/taxonomy/

- `validator.ts` — Exports TaxonomyIssue, validateTaxonomy (~246 tok)

## packages/content-core/src/url/

- `buildUrl.ts` — Exports UrlKind, BuildUrlSlugs, buildUrl (~365 tok)
- `normalizeSlug.ts` — Exports normalizeSlug (~140 tok)

## packages/ui/

- `eslint.config.mjs` — ', 'node_modules/**'] }, (~136 tok)
- `package.json` — Node.js package manifest (~238 tok)
- `tailwind.preset.ts` — Exports preset (~276 tok)
- `tokens.css` — Styles: 20 vars (~279 tok)
- `tsconfig.json` — TypeScript configuration (~64 tok)

## packages/ui/src/

- `index.ts` — packages/ui — framework-light design tokens + component core (§3) (~239 tok)

## packages/ui/src/components/

- `Callout.tsx` — Callout (~174 tok)
- `CodeBlock.tsx` — Required per §16 — build will block if absent (~611 tok)
- `Comparison.tsx` — COLUMN_VARIANT_CLASS (~517 tok)
- `Definition.tsx` — Definition (~156 tok)
- `Example.tsx` — Example (~192 tok)
- `LayeredModel.tsx` — LayeredModel (~366 tok)
- `Pyramid.tsx` — Pyramid (~393 tok)
- `Takeaway.tsx` — Takeaway (~176 tok)
- `VisualBlock.tsx` — VisualBlock (~324 tok)
- `Warning.tsx` — Warning (~186 tok)

## packages/ui/src/primitives/

- `index.ts` — Exports LinkPrimitiveProps, ImagePrimitiveProps (~124 tok)
