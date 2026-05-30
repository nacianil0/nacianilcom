# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-05-29

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- Kullanıcı **Türkçe** iletişim kuruyor; master plan TR + İngilizce teknik terim karışımı. Üretilen plan/doküman çıktılarını bu dile uydur (Türkçe gövde + İngilizce teknik terim + İngilizce section başlıkları).
- **Plan-first**: kullanıcı planlama istediğinde kod yazma/implemente etme. Bu oturumda açıkça belirtti: "Şu an kod yazmanı veya projeyi implemente etmeni istemiyorum." Önce uygulanabilir, sıralı, bağımsız çalıştırılabilir plan üret.

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

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

- **[2026-05-29] Master plan 13 work package'a bölündü** (Faz 0–10 → WP-01..13). Büyük iki faz ayrıldı: **Faz 6 → WP-07 (scheduled publish + cache) + WP-08 (security hardening + a11y/perf)**; **Faz 9 → WP-11 (Monthly Plan) + WP-12 (Resume/Portfolio)**. Diğerleri ~1:1. Gerekçe: her WP ayrı Claude Code chat'inde self-contained çalışabilsin; çok küçük/çok büyük paket olmasın (kullanıcı isteği).
- **[2026-05-29] MVP = WP-01..08 (+ canlıya çıkış için WP-13).** WP-09 (prompts/auto-routing), WP-10 (visual studio), WP-11 (monthly plan), WP-12 (resume/portfolio) MVP sonrası planlı. §4 öncelik sırasıyla uyumlu.
- **[2026-05-29] WP dosyaları Türkçe içerik + İngilizce section başlığı + "Claude Code start prompt" (Türkçe) ile yazıldı.** Gerekçe: master plan dili + kullanıcı dili Türkçe; section adlarını kullanıcı İngilizce verdi. Start prompt'lar kopyala-yapıştır yeni chat'te çalışacak şekilde self-contained.
- **[2026-05-29] `/cv`,`/work` route'ları WP-12'de; visual-block presentational bileşenleri WP-04'te; technical-writing bileşenleri WP-02'de; Mermaid pipeline+sanitize WP-10'da** — render/authoring/validation sorumlulukları bilinçli ayrıldı (INDEX §6).
