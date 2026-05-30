# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-30T20:46:40.531Z
> Files: 201 tracked | Anatomy hits: 0 | Misses: 0

## ../../Users/anil.akman/.claude/projects/C--dev-nacianilcom/memory/

- `MEMORY.md` — Memory Index (~294 tok)
- `project_wp05_06_done.md` — WP-05 — Bilingual SEO (apps/web) (~605 tok)
- `project_wp07_done.md` — ` ignore added to `apps/web/eslint.config.mjs` (~382 tok)
- `project_wp08_09_done.md` — WP-08 — Security Hardening (done) (~452 tok)
- `project_wp10_11_done.md` — WP-10 deliverables (~596 tok)
- `project_wp12_13_done.md` — CV/PDF hardening (2026-05-30) (~749 tok)

## ./

- `package.json` — Node.js package manifest (~208 tok)
- `README.md` — Project documentation (~2758 tok)

## .claude/

- `launch.json` (~116 tok)

## .claude/rules/


## apps/studio/

- `.env.example` — REVALIDATE_SECRET + WEB_URL for studio server (~40 tok)
- `package.json` — Node.js package manifest (~377 tok)
- `postcss.config.mjs` (~22 tok)
- `tailwind.config.ts` — /*.{ts,tsx}', (~107 tok)
- `vitest.config.ts` — /*.test.ts'], (~126 tok)

## apps/studio/messages/

- `en.json` (~155 tok)
- `tr.json` (~151 tok)

## apps/studio/prompts/

- `ai-smell-cleaning.md` — Prompt: AI-Generic Smell Cleaning (~361 tok)
- `article-brief.md` — §19: brief + meta.json taslağı (~180 tok)
- `article-brief.md` — Prompt: Article Brief (~282 tok)
- `en-adaptation.md` — §19: EN uyarlama (~150 tok)
- `en-adaptation.md` — Prompt: EN Adaptation (İngilizce Uyarlama) (~238 tok)
- `idea-series-plan.md` — §19: fikir → seri planı (~200 tok)
- `idea-series-plan.md` — Prompt: Idea → Series Plan (~278 tok)
- `monthly-plan.md` — §19: aylık içerik takvimi (~150 tok)
- `monthly-plan.md` — Prompt: Monthly Plan (~233 tok)
- `outline.md` — §19: makale iskelet (~160 tok)
- `outline.md` — Prompt: Article Outline (~222 tok)
- `pre-publish-qc.md` — Prompt: Pre-Publish QC Report (~425 tok)
- `resume-case-study.md` — §19: CV + case study (~160 tok)
- `resume-case-study.md` — Prompt: Resume / Case Study (~238 tok)
- `revision.md` — Prompt: Revision / Editing (~336 tok)
- `seo-qc-review.md` — §19: SEO + QC review (~150 tok)
- `seo-qc-review.md` — Prompt: SEO / QC Review (~238 tok)
- `tr-draft.md` — §19: Türkçe ilk taslak (~140 tok)
- `tr-draft.md` — Prompt: TR Draft (Türkçe Taslak) (~195 tok)
- `tr-final-mdx.md` — §19: TR Final MDX ile frontmatter + bileşenler (~200 tok)
- `tr-final-mdx.md` — Prompt: TR Final MDX (~329 tok)
- `visual-diagram-suggestion.md` — §19: görsel/diyagram önerisi (~160 tok)
- `visual-diagram-suggestion.md` — Prompt: Visual / Diagram Suggestion (~276 tok)

## apps/studio/server/

- `index.ts` — API routes: GET (6 endpoints) (~7152 tok)
- `planner.ts` — Generates a 25-40 topic candidate pool from content analysis. (~4326 tok)
- `router.ts` — Maps an InboxItem to its target file path in the content tree. (~1242 tok)
- `visual.ts` — Renders a Mermaid .mmd string to sanitized SVG. (~848 tok)

## apps/studio/src/

- `App.tsx` — NAV (~834 tok)
- `main.css` — Styles: 6 rules, 3 vars (~346 tok)
- `main.tsx` — rootEl (~92 tok)

## apps/studio/src/__tests__/

- `planner.test.ts` — Declares SAMPLE_ANALYSIS (~1375 tok)
- `router.test.ts` — Declares ROOT (~2847 tok)

## apps/studio/src/screens/

- `DraftReview.tsx` — @mdx-js/mdx evaluate; packages/ui bileşen map; parseMdx frontmatter display (~800 tok)
- `DraftReview.tsx` — MDX_COMPONENTS (~1759 tok)
- `Inbox.tsx` — STATUS_ORDER (~2396 tok)
- `MonthlyPlan.tsx` — DIFFICULTY_COLOR (~4859 tok)
- `Prompts.tsx` — /api/prompts list + copy-to-clipboard görüntüleyici (~400 tok)
- `Prompts.tsx` — Prompts (~877 tok)
- `Publisher.tsx` — koşullu publish buton (QC=0 gerekli) → /api/publish → commit+push+revalidate (~700 tok)
- `Publisher.tsx` — extractInternalLinks (~2415 tok)
- `ResumeStudio.tsx` — ResumeStudio (~1367 tok)
- `SeoCheck.tsx` — runQC client-side; group bazlı blocking/warning ayrımı (~900 tok)
- `SeoCheck.tsx` — extractInternalLinks (~2203 tok)
- `VisualStudio.tsx` — VisualStudio (~3213 tok)

## apps/studio/src/ui/

- `StudioImage.tsx` — Vite/Studio wrapper around the framework-light ImagePrimitive (§3). (~121 tok)
- `StudioLink.tsx` — Vite/Studio wrapper around the framework-light LinkPrimitive (§3). (~111 tok)

## apps/web/

- `eslint.config.mjs` — ', 'node_modules/**'] }, (~116 tok)
- `next.config.ts` — Declares loadRedirects (~760 tok)
- `package.json` — Node.js package manifest (~264 tok)
- `postcss.config.mjs` — Declares postcssConfig (~32 tok)
- `tailwind.config.ts` — /*.{ts,tsx}', (~520 tok)
- `vercel.json` (~26 tok)
- `vitest.config.ts` — /*.test.ts'], (~45 tok)

## apps/web/app/

- `globals.css` — Styles: 6 rules (~393 tok)
- `layout.tsx` — newsreader (~502 tok)
- `page.tsx` — §20: root redirect — single source, not duplicated in next.config (~51 tok)
- `robots.ts` — Declares robots (~71 tok)
- `sitemap.ts` — alt: sitemap (~800 tok)

## apps/web/app/[lang]/

- `layout.tsx` — VALID_LANGS (~411 tok)
- `page.tsx` — VALID_LANGS (~1562 tok)

## apps/web/app/[lang]/cv/

- `page.tsx` — VALID_LANGS (~6180 tok)

## apps/web/app/[lang]/cv/print/

- `page.tsx` — Accent mono section label — replaces the web's left rail to save print width. (~3201 tok)

## apps/web/app/[lang]/feed.xml/

- `route.ts` — Next.js API route: GET (~827 tok)

## apps/web/app/[lang]/series/

- `page.tsx` — VALID_LANGS (~1209 tok)

## apps/web/app/[lang]/series/[seriesSlug]/

- `page.tsx` — VALID_LANGS (~1894 tok)

## apps/web/app/[lang]/series/[seriesSlug]/[articleSlug]/

- `page.tsx` — VALID_LANGS (~2983 tok)

## apps/web/app/[lang]/work/

- `page.tsx` — VALID_LANGS (~1315 tok)

## apps/web/app/[lang]/work/[caseSlug]/

- `page.tsx` — Small, low-key section marker — keeps the page reading like a story, not a form. (~2074 tok)

## apps/web/app/api/cron/

- `route.ts` — Daily cron: CRON_SECRET auth → revalidateTag/Path for all public articles (ISR + 404-cache fix) (~554 tok)

## apps/web/app/api/revalidate/

- `route.ts` — HMAC+timestamp+zod secured POST; supports single path/tag (backward compat) + arrays for batch revalidation (~588 tok)

## apps/web/app/og/

- `route.tsx` — runtime (~1112 tok)

## apps/web/messages/

- `en.json` (~155 tok)
- `tr.json` (~151 tok)

## apps/web/src/__tests__/

- `revalidate-targets.test.ts` — Declares params (~1166 tok)
- `security.test.ts` — ─── Open Redirect Guard ────────────────────────────────────────────────────── (~1205 tok)

## apps/web/src/components/

- `Crumbs.tsx` — Portal-style breadcrumb trail for the masthead bar. First link carries a back-arrow. (~351 tok)
- `ListRow.tsx` — Left mono rail cell — a 2-digit index or short date. (~469 tok)
- `MetadataRow.tsx` — DIFFICULTY_KEY (~282 tok)
- `PrevNextNav.tsx` — PrevNextNav (~606 tok)
- `QrTag.tsx` — URL (or text) to encode. (~287 tok)
- `ReferencesSection.tsx` — ReferencesSection (~487 tok)
- `SeriesPositionBadge.tsx` — SeriesPositionBadge (~137 tok)
- `SiteFooter.tsx` — SiteFooter (~642 tok)
- `SiteNav.tsx` — SiteNav (~563 tok)
- `TOC.tsx` — TOC (~424 tok)

## apps/web/src/content/

- `loader.ts` — Exports loadSeries, loadMeta, MdxData, loadMdx + 11 more (~1987 tok)

## apps/web/src/lib/

- `dateRange.ts` — Format a "YYYY-MM" (or "YYYY") string as a short localized month-year. (~911 tok)
- `jsonld.ts` — Exports websiteJsonLd, personJsonLd, breadcrumbJsonLd, ArticleJsonLdOptions + 4 more (~696 tok)
- `messages.ts` — Exports WebMessages, getMessages (~146 tok)
- `origin.ts` — Resolve the origin to advertise inside the printable CV (link + QR). (~386 tok)
- `qr.ts` — Render `text` as an inline QR-code SVG string (server-only). (~184 tok)
- `revalidate-targets.ts` — Explicit tag/path matrix for a published article. (~418 tok)
- `site.ts` — Exports SITE_URL, SITE_NAME, SITE_AUTHOR, SITE_TWITTER, localeToOgLocale (~79 tok)

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

- `resume.json` (~5738 tok)

## content/resume/portfolio/kurumsal-dashboard/

- `case.json` — Declares everyone (~1125 tok)

## content/resume/portfolio/seyahat-projesi/

- `case.json` — Declares looked (~1112 tok)

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
- `index.ts` — Schemas (~646 tok)
- `isPublic.ts` — Exports isPublic (~50 tok)

## packages/content-core/src/__tests__/

- `buildUrl.test.ts` — Declares slug (~742 tok)
- `isPublic.test.ts` — Declares PAST (~484 tok)
- `links.test.ts` — NOW: blocking (~1064 tok)
- `normalizeSlug.test.ts` (~537 tok)
- `planQC.test.ts` — makeTopic: makePlan (~1169 tok)
- `redirects.test.ts` — NOW: makeRedirect (~1031 tok)
- `resume.test.ts` — Declares makeResume (~1179 tok)
- `svgSanitizer.test.ts` — Declares clean (~1324 tok)
- `taxonomy.test.ts` — Declares taxonomy (~694 tok)
- `visualValidator.test.ts` — Declares mdx (~1224 tok)

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

- `planQC.ts` — Runs QC on a monthly plan per §25. (~925 tok)
- `runQC.ts` — Exports QCGroup, SvgAsset, QCSeverity, QCIssue + 3 more (~1374 tok)

## packages/content-core/src/redirects/

- `resolver.ts` — Exports ArticlePublicPath, RedirectIssue, resolveRedirects (~742 tok)

## packages/content-core/src/resume/

- `visibility.ts` — Exports filterResumeByVisibility (~251 tok)

## packages/content-core/src/schemas/

- `frontmatter.ts` — Zod schemas: FaqItemSchema, FrontmatterSchema (~110 tok)
- `inbox.ts` — Zod schemas: InboxKindSchema, InboxStatusSchema, InboxItemSchema (~430 tok)
- `index.ts` (~432 tok)
- `meta.ts` — Zod schemas: AssetSchema, MetaSchema (~255 tok)
- `plans.ts` — Zod schemas: ScoresSchema, TopicSchema, MonthlyPlanSchema (~415 tok)
- `redirects.ts` — Zod schemas: RedirectItemSchema, RedirectsSchema (~103 tok)
- `references.ts` — Zod schemas: ReferenceItemSchema, ReferencesSchema (~109 tok)
- `resume.ts` — Short, punchy value proposition shown above the longer summary. (~1330 tok)
- `series.ts` — Zod schemas: BilingualTextSchema, SeriesSchema (~127 tok)
- `taxonomy.ts` — Zod schemas: BilingualLabelSchema, CategorySchema, TagSchema, TaxonomySchema (~168 tok)

## packages/content-core/src/svg/

- `sanitizer.ts` — Sanitizes SVG content before commit. (~838 tok)

## packages/content-core/src/taxonomy/

- `validator.ts` — Exports TaxonomyIssue, validateTaxonomy (~246 tok)

## packages/content-core/src/url/

- `buildUrl.ts` — Exports UrlKind, BuildUrlSlugs, buildUrl (~365 tok)
- `normalizeSlug.ts` — Exports normalizeSlug (~140 tok)

## packages/content-core/src/visual/

- `validator.ts` — Extracts <VisualBlock ...> usages from raw MDX content. (~778 tok)

## packages/ui/

- `eslint.config.mjs` — ', 'node_modules/**'] }, (~136 tok)
- `package.json` — Node.js package manifest (~238 tok)
- `tailwind.preset.ts` — Exports preset (~327 tok)
- `tokens.css` — Styles: 24 vars (~323 tok)
- `tsconfig.json` — TypeScript configuration (~64 tok)

## packages/ui/src/

- `index.ts` — packages/ui — framework-light design tokens + component core (§3) (~407 tok)

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

## packages/ui/src/components/editorial/

- `Chip.tsx` — Square mono tag chip for stacks / tags (no radius — Swiss-Industrial). (~155 tok)
- `Frame.tsx` — Aspect-ratio utility, e.g. 'aspect-[16/9]'. Omit for intrinsic height. (~186 tok)
- `Masthead.tsx` — Breadcrumb / back-link slot (left of the rule). (~723 tok)
- `MetaRow.tsx` — Each entry becomes a meta cell; falsy entries are dropped. Hairlines are inserted between. (~304 tok)
- `MonoLabel.tsx` — Swiss-Industrial mono uppercase label — the project's signature meta voice. (~185 tok)
- `Rule.tsx` — Hairline (default) or strong ink rule. Vertical variant is the inline meta separator. (~185 tok)
- `SectionRail.tsx` — Optional right-aligned label (e.g. a count) past the rail. (~308 tok)
- `SpecRow.tsx` — Left mono label (spec-sheet key). (~216 tok)

## packages/ui/src/lib/

- `cn.ts` — Minimal className combiner — joins truthy strings. No external deps (§3 framework-light). (~64 tok)

## packages/ui/src/primitives/

- `index.ts` — Exports LinkPrimitiveProps, ImagePrimitiveProps (~124 tok)

## scripts/

- `smoke.js` — nacianilcom smoke test — run after build: node scripts/smoke.js [BASE_URL] (~1287 tok)
