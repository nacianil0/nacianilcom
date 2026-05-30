# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-05-29

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- Kullanıcı **Türkçe** iletişim kuruyor; master plan TR + İngilizce teknik terim karışımı. Üretilen plan/doküman çıktılarını bu dile uydur (Türkçe gövde + İngilizce teknik terim + İngilizce section başlıkları).
- **Plan-first**: kullanıcı planlama istediğinde kod yazma/implemente etme. Bu oturumda açıkça belirtti: "Şu an kod yazmanı veya projeyi implemente etmeni istemiyorum." Önce uygulanabilir, sıralı, bağımsız çalıştırılabilir plan üret.
- **CV/yazı tonu**: klişe yasak (passionate, hard-working, dynamic, team player). Deneyim maddeleri sonuç/etki odaklı (güçlü fiil + yapılan iş + etki). Rakam uydurma — yoksa nitel anlat ve `needsReview: true` bırak. ATS anahtar kelimeleri doğal yedir (.NET, ASP.NET Core, C#, React, TypeScript, SQL Server, EF, REST API, dashboard, portal, authentication, permission management, reporting, migration, AI/API integration, product ownership, end-to-end delivery). Konumlandırma: Eroğlu = amiral/güncel (enterprise), Kansuk = enterprise destek, Digitallica = müşteri/ürün/startup.

## Key Learnings

- **Project:** nacianilcom
- **Master plan** = `nacianil-claude-code-prompt.md` (v6 — cleanup). nacianil.com: (1) public kişisel yayın + CV/portfolio sitesi, (2) yalnız-local authoring "studio". Repo şu an **greenfield** (yalnız master plan + OpenWolf scaffold; `apps/`, `packages/`, `content/` HENÜZ yok).
- **Canonical execution order** master planda **§32 Execution Plan (Faz 0–10)**.
- Plan `docs/work-packages/`'a **13 WP + INDEX** olarak bölündü (INDEX.md tüm sıra/bağımlılık/MVP haritasını taşır).
- **content-core (WP-03)** = tüm zod şemalarının (plans/inbox dahil) + `isPublic`/`buildUrl`/`normalizeSlug`/`runQC`/taxonomy-internal-link/redirect doğrulayıcının **tek kaynağı**. Sonraki WP'ler import eder, kopyalamaz (§33).
- **Sabit kararlar:** `packages/ui` framework-light (next/link|image|font yok, §3); içerik DB'siz MDX+JSON Git'te (§2); `isPublic` tek truth-table (§9); Mermaid `.mmd→.svg`+sanitize Studio'da local, web statik SVG okur (§15/§31); `/→/tr` yalnız app/page.tsx + next.config redirects() yalnız redirects.json + trailingSlash:false (§20); CSP nonce zorunlu değil + Report-Only→enforce, KV/nonce/rate-limit MVP dışı (§29); Studio asla deploy edilmez 127.0.0.1 (§28).
- **`<DASHBOARD_PATH>`** zorunlu referans, **WP-02**'de gerekli; yoksa Faz 1 başlamadan durup sorulmalı (§5). **Çözülmüş yol:** `C:\Users\anil.akman\source\repos\Portal` — duyuru detay: `Eroglu.HR.UI/UI/src/page/Dashboard/AnnouncementDetailPage.tsx`.
- **CV kaynakları:** `content/resume/sources/README.md` — PDF + kariyer/katkı notları. EGH: Dashboard modülü (Portal, uçtan uca); Travel `/dashboard/travel/*` altında entegre; İK projesi aktif. Portal memory: `C:\Users\anil.akman\source\repos\Portal\memory\`. Canonical `resume.json` → WP-12.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- **[2026-05-30] `@types/gray-matter` doesn't exist on npm.** gray-matter ships its own TypeScript definitions — do not add `@types/gray-matter` to devDependencies.
- **[2026-05-29] `workspace:*` protocol only works for local workspace packages.** Using `"typescript": "workspace:*"` in a sub-package's devDependencies fails because `typescript` is an npm package, not a local workspace package. Fix: use explicit version strings (`"typescript": "^5.7.2"`) in sub-packages.
- **[2026-05-29] ESLint flat config needs explicit globals for Node.js/browser environments.** `__dirname`, `process` (Node.js) and `document` (browser) cause `no-undef` errors. Fix: `import globals from 'globals'` and set `languageOptions.globals: globals.node` for server files, `globals.browser` for client files. The `globals` package must be a **direct** devDependency (pnpm strict mode does not allow transitive-only access).
- **[2026-05-29] `next lint` is deprecated in Next.js 15.x.** Use `eslint .` with `eslint.config.mjs` instead. For flat config, use `FlatCompat` from `@eslint/eslintrc` to bridge `eslint-config-next`.
- **[2026-05-29] ESLint `import/no-anonymous-default-export` warning for eslint.config.mjs.** Assign the config array to a named variable before exporting: `const eslintConfig = [...]; export default eslintConfig;`
- **[2026-05-29] Tailwind v3 preset cast: `presets: [preset as Config]` fails if preset doesn't have `content`.** Use `preset as unknown as Config` for Tailwind preset objects (presets don't need `content`). Apply in both apps/web and apps/studio tailwind.config.ts.
- **[2026-05-29] `packages/ui` typecheck from consumer apps requires built `dist/` OR source-first exports.** Set `"types": "./src/index.ts"` in package.json exports so TypeScript resolves from source without needing a prior build. Fixes `pnpm -w typecheck` from failing when dist/ is stale.
- **[2026-05-29] `@import url()` must precede `@tailwind` directives in CSS.** PostCSS/CSS spec requires all `@import` statements before other at-rules. Put Google Fonts `@import url(...)` as the first line in any CSS file that also has `@tailwind base/components/utilities`.
- **[2026-05-30] Zod `.default()` incompatible with `exactOptionalPropertyTypes: true`.** `z.enum([...]).default('x')` and `z.array(z.string()).default([])` generate types with `| undefined` in the value position, conflicting with exactOptionalPropertyTypes. Fix: remove `.default()` from Zod schemas and make fields required; ensure all content JSON files provide those values explicitly. Applied to `MetaSchema.schemaType` and `AssetSchema.diagrams`.

## Key Learnings

- **pnpm was not pre-installed** on this machine. Installed via `npm install -g pnpm@9`. Node.js v24.14.0 is the actual runtime (`.nvmrc` says 20 but not enforced).
- **pnpm version**: 9.15.9 installed, 11.5.0 available. Stay on 9.x for this project unless explicitly upgraded.
- **apps/studio uses two tsconfigs**: `tsconfig.json` (noEmit typecheck, covers src/ + vite.config.ts) and `tsconfig.server.json` (CommonJS build, covers server/). This is necessary because client needs DOM libs while server needs Node types.
- **Next.js 15 modifies apps/web/tsconfig.json automatically** on first lint/build, adding `allowJs`, `noEmit`, `incremental`. This is expected behavior; do not revert those fields.
- **Fastify server must bind to 127.0.0.1 (§28)** — never 0.0.0.0. Vite dev server also set to 127.0.0.1.

## Key Learnings

- **WP-03 content-core complete (2026-05-30).** All §9 schemas (meta/frontmatter/references/series/taxonomy/redirects/plans/inbox) + isPublic truth table + normalizeSlug TR chars + buildUrl TR/EN stable URLs + canonical/hreflang + taxonomy validator + InternalLink resolver+checker + redirect resolver (cycle detection) + runQC skeleton + 82 unit tests. `pnpm -w test && typecheck && lint && build` all clean.
- **`@types/gray-matter` does NOT exist on npm** — gray-matter v4 ships its own .d.ts, no @types needed.
- **tsconfig.build.json pattern for packages with tests:** use a `tsconfig.json` (noEmit, includes src) for typecheck, and a `tsconfig.build.json` (extends tsconfig, noEmit:false, excludes `src/__tests__`) for the actual build output. This keeps tests type-checkable without polluting dist/.
- **vitest in content-core:** installed at package level (`"vitest": "^3.1.1"` in devDeps), test script `"vitest run"`, config at `vitest.config.ts`. Root workspace gets `"test": "pnpm -r test"`.
- **WP-02 design system complete.** Token set: `packages/ui/tokens.css` (CSS vars + RGB channels for Tailwind opacity). Tailwind preset: `packages/ui/tailwind.preset.ts`. Technical-writing components: Callout/Definition/Example/Warning/Takeaway/CodeBlock in `packages/ui/src/components/`. Framework-light primitives: `LinkPrimitiveProps`, `ImagePrimitiveProps` (no Next.js deps). Web wrappers: `apps/web/src/ui/WebLink|WebImage`. Studio wrappers: `apps/studio/src/ui/StudioLink|StudioImage`. i18n: `apps/{web,studio}/messages/{tr,en}.json` + `packages/content-core/src/i18n.ts`.
- **Portal dashboard UX reference (§5):** Title `text-[36-46px] leading-[1.06]` serif + trailing accent period; masthead `font-mono text-[10px] uppercase tracking-[0.22em]`; metadata inline with `h-[10px] w-px` hairline separators; cover `aspect-[16/9] object-contain` + blurred bleed stage; body `text-[14.5px] leading-[1.7]`. Observations documented in `docs/design-reference.md`.
- **Fonts for web:** `next/font/google` (Newsreader/Inter/JetBrains Mono — SIL OFL) injected as CSS variables `--font-serif`, `--font-sans`, `--font-mono` on `<html>` className. Studio uses Google Fonts CDN @import (local-only use is acceptable).
- **CodeBlock has `"use client"` directive** — uses `useState`/`navigator.clipboard`. In Next.js RSC contexts the import site must be a client component or wrapped; in Vite the directive is ignored as a string.
- **WP-04 public reading complete (2026-05-30).** [lang] routing, series list/landing/article routes, MDXRemote RSC render, technical-writing + visual-block + InternalLink, 1 seri + 3 yazı (TR+EN). 16 static pages SSG. `pnpm -w typecheck/lint/build` all clean.
- **content loader path pattern:** `process.cwd()` = `apps/web` during Next.js dev/build; content root = `path.join(process.cwd(), '..', '..', 'content')`. Works both locally and on Vercel when root dir is `apps/web`.
- **InternalLink MDX component:** `getMdxComponents(lang, catalog)` creates component map with InternalLink as a closure that captures `lang` and `catalog` server-side. No client state needed.
- **MDXRemote RSC:** import from `next-mdx-remote/rsc`. Pass `rehypeSlug` in `options.mdxOptions.rehypePlugins` for heading IDs. The component is server-rendered; no hydration overhead for static MDX.
- **@tailwindcss/typography:** installed as devDep in apps/web, configured with custom prose CSS vars for design token colors. `prose` class on the MDX content wrapper.

## Key Learnings

- **WP-05 bilingual SEO complete (2026-05-30).** generateMetadata on all routes (article/series/series-list/lang-layout); canonical+hreflang+x-default+og:locale+alternateLocale; JSON-LD (TechArticle/CollectionPage/WebSite+Person/BreadcrumbList/FAQPage); sitemap.ts with hreflang alternates; robots.ts; per-lang feed.xml RSS; next/og edge route 1200×630 OG image; next.config redirects() from content/redirects.json; trailingSlash:false.
- **WP-06 Studio MVP complete (2026-05-30).** Fastify 127.0.0.1 CJS server; content API (list/read meta/mdx/taxonomy/redirects/catalog); publish API (meta.json update → simple-git commit/push → HMAC revalidate call); /api/revalidate HMAC+timingSafeEqual+zod+30s window+safe error; studio React screens: DraftReview (@mdx-js/mdx evaluate), SeoCheck (runQC client-side), Publisher (conditional on QC pass), Prompts; 10 prompt templates in apps/studio/prompts/.
- **DraftReview architecture**: Studio server (CJS) stays simple — only file I/O. Client (Vite) imports @nacianilcom/content-core (ESM) + @mdx-js/mdx for MDX rendering. No ESM deps in CJS server.
- **HMAC revalidate security**: signature = HMAC-SHA256(secret, rawBody) as hex; compare with timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) after length check; timestamp window 30s; Zod body validation; safe error responses (no stack traces).
- **exactOptionalPropertyTypes fix pattern**: When meta.updatedDate (string|undefined) is optional, spread conditionally: `...(meta.updatedDate ? { updatedDate: meta.updatedDate } : {})`.
- **Next.js hreflang output**: Next.js generates `hrefLang` (camelCase) not `hreflang` (lowercase) in HTML output — both are valid per HTML spec. alternates.languages maps correctly.
- **Studio @mdx-js/mdx bundle**: ~829KB minified (large but acceptable for local studio). gray-matter uses eval() → Vite warns but does not block.

## Key Learnings

- **WP-07 scheduled publish + cache invalidation complete (2026-05-30).** revalidate-targets.ts (tag/path matrix: article:<id>, series:<slug>, list, sitemap, feed:<lang>); /api/revalidate updated to accept arrays (paths/tags) for batch + backward-compat single values; /api/cron (daily Vercel cron, CRON_SECRET auth, deduped revalidateTag/Path for all public articles — clears 404 cache on scheduled publish); dynamicParams=true + revalidate=3600 on article/series-landing pages; series landing generateStaticParams now filters public-only; 13 vitest tests in apps/web; .eslintignore .next pattern fixed.
- **Next.js ESLint flat config must explicitly ignore `.next/**`** — `FlatCompat` from `@eslint/eslintrc` does not inherit the `.next` ignore from `eslint-config-next`. Fix: add `{ ignores: ['.next/**', 'node_modules/**'] }` as first entry in the config array.
- **Vercel cron authentication**: Vercel automatically passes `Authorization: Bearer <CRON_SECRET>` to cron route handlers when CRON_SECRET is set in project env vars. Guard with: `if (cronSecret && authHeader !== 'Bearer ${cronSecret}') return 401`.
- **dynamicParams=true + revalidate=N combo**: pages NOT in generateStaticParams are rendered on-demand (ISR) when first accessed. On-demand revalidation via revalidatePath clears stale 404 cache. This is the mechanism for 404-cache fix for future-scheduled URLs visited early.
- **revalidateTag only works for fetch-cached data**; for fs-based content, revalidatePath is the effective tool. Tags are defined as constants for future unstable_cache integration.

## Key Learnings

- **WP-08 security hardening complete (2026-05-30).** CSP (Report-Only→enforce rollout) + frame-ancestors + X-Frame-Options:DENY + nosniff + Referrer-Policy + Permissions-Policy in next.config.ts headers(); open redirect guard in loadRedirects() filters external destinations; image remotePatterns HTTPS only; .env.example updated; 13 security smoke tests (open-redirect, HMAC verification, isPublic gate).
- **WP-09 auto output routing complete (2026-05-30).** InboxItemSchema extended (seriesSlug/articleId/language/targetMonth/nextAction/reviewReason/backupPath); studio server: inbox API (POST/GET/route/delete); router.ts pure functions (resolveTargetPath, writeWithBackup, serializePayload, moveToUnresolved); Inbox UI screen (5s polling, status badges, route/discard); 3 new prompts (revision, ai-smell-cleaning, pre-publish-qc); 23 router unit tests all pass.
- **content-core dist/ must be rebuilt** when schema changes are made: `pnpm --filter @nacianilcom/content-core build`. The `"import": "./dist/index.js"` in exports means runtime uses compiled dist, not source. Apps using `workspace:*` read from dist at runtime. Studio vitest.config.ts uses `resolve.alias` to bypass this for tests.
- **RedirectItemSchema.permanent is `z.literal(true)`** — NOT `z.boolean()`. Always pass `permanent: true` in redirect test fixtures; `permanent: false` causes TypeScript error TS2322.
- **@fastify/static 8.x has path traversal + route guard bypass vulnerabilities** — fix: upgrade to ^9.1.1 (compatible with Fastify 5.x). Done in WP-08.
- **pnpm audit acceptable residuals (WP-08):** next-mdx-remote (all MDX is author-controlled trusted content; CVE is for untrusted SSR content); postcss (transitive dep of Next.js 15.x — cannot upgrade without Next.js upgrade → WP-13 tracking).

## Key Learnings

- **WP-10 Visual Studio complete (2026-05-30).** SVG sanitizer (content-core/src/svg/sanitizer.ts): removes `<script>`, event handlers, `<foreignObject>`, external href/xlink:href via regex. Visual block validator (content-core/src/visual/validator.ts): parses `<VisualBlock>` from MDX, checks title/alt/caption/source (published→blocking, draft→warning), ≤4 blocks/article. QC integration: SvgAsset type + mdxContent optional in QCContext, SVG_MISSING/SVG_SANITIZE_FAILURE/VISUAL_BLOCK_* rules wired. Studio server: visual.ts (mmdc spawn via child_process), index.ts visual routes. VisualStudio UI: edit→preview→sanitize→commit flow. `@mermaid-js/mermaid-cli` installed as devDep (Chromium bundled via puppeteer).
- **WP-11 Monthly Editorial Planning complete (2026-05-30).** planQC.ts: sourceBasis/difficulty-balance/repetition-risk/week-distribution/series-concentration checks. planner.ts: analyzeContent (reads series+articles+_ideas), generateCandidatePool (deterministic heuristics, no LLM), selectBalancedPlan (score-sorted + week distribution), generateFilePrompt (file-based Claude Code prompt). MonthlyPlan UI: two modes (generate local + file-prompt), weekly 4-column view, candidate pool, QC issues display, approve→_ideas/ routing.
- **`exactOptionalPropertyTypes: true` and optional interface fields**: use `field?: T | undefined` (not just `field?: T`) when the field may be set to undefined explicitly. The `| undefined` explicit union is required; without it, TypeScript rejects `field: value | undefined` assignments.

## Key Learnings

- **WP-12 Resume/Portfolio complete (2026-05-30).** Resume Zod schema (packages/content-core/src/schemas/resume.ts): VisibilitySchema (public/pdf/private), ResumeSchema, BilingualResumeSchema, CaseStudySchema, BilingualCaseStudySchema. filterResumeByVisibility() helper in resume/visibility.ts. resume.json bilingual (tr/en) with all experience/credentials/skills. portfolio/ case studies: kurumsal-dashboard + seyahat-projesi. /[lang]/cv (visibility-filtered profile page), /[lang]/cv/print (PDF source), /[lang]/work (case study index), /[lang]/work/[caseSlug] (case study detail). Studio: ResumeStudio screen + /api/resume + /api/resume/pdf (Playwright, optional dep). Sitemap updated with CV/work routes. 12 new tests (visibility filter: private never in web mode, pdf-only in pdf mode).
- **WP-13 Deploy Docs complete (2026-05-30).** README.md (§34 full: setup, scripts, content structure, taxonomy, components, i18n, URLs, SEO, publishing, Studio, CV/resume visibility, CSP rollout, Production Security Checklist, env vars, Vercel deploy, Future Scope, font licenses, troubleshooting). .env.example expanded (all vars with locations and descriptions). scripts/smoke.js (routing, sitemap, RSS, CV/work routes, /api/revalidate 401 guard, private field leak check, security headers). root package.json: pnpm smoke + pnpm audit scripts.
- **Playwright optional dep pattern:** Use `const pwModuleName = 'playwright'; await import(pwModuleName)` with a local type declaration to bypass TypeScript static module resolution when the module is an optional devDependency. Wrap in try/catch and return 503 if not installed.
- **Playwright PDF generation (local only):** POST /api/resume/pdf in Studio server; requires web server running at WEB_URL (default :3000); navigates to /[lang]/cv/print, calls page.pdf({ format: 'A4', printBackground: true }), saves to repo root. Never runs on Vercel.
- **Photo serving:** Copy content/resume/sources/my-photo.jpg to apps/web/public/photo/naci.jpg. Set basics.photo to /photo/naci.jpg in resume.json. Next.js Image component serves from public/.
- **Smoke script pattern:** scripts/smoke.js uses fetch() with { redirect: 'manual' } for redirect checks. Runs against BASE_URL (default localhost:3000). Checks: routing, sitemap, RSS, CV/work, /api/revalidate 401, private field leak in HTML, security headers.

## Key Learnings

- **CV/PDF hardening complete (2026-05-30).** `/[lang]/cv` (SSG) + `/[lang]/cv/print` (now `force-dynamic`). Print is a single A4 with a corner QR + live link, recruiter-oriented content, private fields filtered (visibility 'pdf' mode).
- **QR on the print CV:** `qrcode` npm package (+ `@types/qrcode`) in apps/web. `QRCode.toString(text, { type: 'svg' })` runs server-side and returns SVG markup — render it inline via `dangerouslySetInnerHTML` in a **server** component (`apps/web/src/components/QrTag.tsx` → `apps/web/src/lib/qr.ts`). No client-bundle cost. The encoded URL becomes numeric `<path>` data, never echoed markup → safe from injection. Colors set to design tokens (ink `#1b1a18` on surface `#f7f5f2`) so it blends into warm paper; `printBackground: true` already handled by `@media print { print-color-adjust: exact }`.
- **Dynamic export origin:** `apps/web/src/lib/origin.ts` `resolveSiteOrigin()` (async, server-only — isolates `next/headers` from the client bundle). Priority: runtime/export origin (`x-forwarded-host`/`host`, **localhost & loopback skipped**) → `NEXT_PUBLIC_SITE_URL` → `SITE_URL` constant. `headers()` is async in Next 15. Verified: forged `x-forwarded-host` is reflected; on localhost it falls back to nacianil.com. **NEXT_PUBLIC_SITE_URL was previously documented but unreferenced — now actually consumed here** (canonical/sitemap/OG still use the `SITE_URL` constant in `site.ts`).
- **Single-A4 measurement:** A4 @96dpi = 1123px. Target `document.querySelector('main').scrollHeight <= 1123`. Print page uses `min-h-[297mm] max-w-[210mm] px-[15mm] py-[13mm]` → a true A4 sheet on screen and print. When it overflowed (1146px), the fix was tightening section gaps (gap-5→gap-3.5 etc.), **not** shrinking fonts (user rule). Also cap content for one page: drop company logos + earlierExperience on print, cap highlights to 4 for the most-recent role / 2 for the rest.
- **Print page noindex:** static `export const metadata = { robots: { index: false, follow: false } }` — print/source views must stay out of the index and out of sitemap (sitemap.ts only lists home/series/cv/work + cases).
- **basics.tagline + basics.primaryStack** are new optional fields on `BasicsSchema`. Adding optional resume fields REQUIRES `pnpm --filter @nacianilcom/content-core build` — runtime parses via dist Zod schema which strips unknown keys; a stale dist silently drops the new fields (see [[bug-014]]/bug-035 pattern). Web hero reads them; `filterResumeByVisibility` passes `basics` through untouched.
- **PDF generation path:** Studio `POST /api/resume/pdf` (server/index.ts:611) drives Playwright to `${WEB_URL}/${lang}/cv/print` and `page.pdf({ format: 'A4', printBackground: true })`. So the print page is the single source of truth; QR/link/layout all flow through it. Local export from `WEB_URL=localhost:3000` → origin falls back to nacianil.com (localhost skipped) — set NEXT_PUBLIC_SITE_URL to override.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

- **[2026-05-29] Master plan 13 work package'a bölündü** (Faz 0–10 → WP-01..13). Büyük iki faz ayrıldı: **Faz 6 → WP-07 (scheduled publish + cache) + WP-08 (security hardening + a11y/perf)**; **Faz 9 → WP-11 (Monthly Plan) + WP-12 (Resume/Portfolio)**. Diğerleri ~1:1. Gerekçe: her WP ayrı Claude Code chat'inde self-contained çalışabilsin; çok küçük/çok büyük paket olmasın (kullanıcı isteği).
- **[2026-05-29] MVP = WP-01..08 (+ canlıya çıkış için WP-13).** WP-09 (prompts/auto-routing), WP-10 (visual studio), WP-11 (monthly plan), WP-12 (resume/portfolio) MVP sonrası planlı. §4 öncelik sırasıyla uyumlu.
- **[2026-05-29] WP dosyaları Türkçe içerik + İngilizce section başlığı + "Claude Code start prompt" (Türkçe) ile yazıldı.** Gerekçe: master plan dili + kullanıcı dili Türkçe; section adlarını kullanıcı İngilizce verdi. Start prompt'lar kopyala-yapıştır yeni chat'te çalışacak şekilde self-contained.
- **[2026-05-29] `/cv`,`/work` route'ları WP-12'de; visual-block presentational bileşenleri WP-04'te; technical-writing bileşenleri WP-02'de; Mermaid pipeline+sanitize WP-10'da** — render/authoring/validation sorumlulukları bilinçli ayrıldı (INDEX §6).
