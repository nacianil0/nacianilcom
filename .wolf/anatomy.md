# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-29T19:26:16.690Z
> Files: 60 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.editorconfig` (~59 tok)
- `.gitignore` — Git ignore rules (~130 tok)
- `.nvmrc` (~1 tok)
- `.prettierrc` (~33 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `nacianil-claude-code-prompt.md` — nacianil.com — Claude Code Master Prompt (v6 — cleanup) (~10737 tok)
- `package.json` — Node.js package manifest (~173 tok)
- `pnpm-workspace.yaml` (~12 tok)
- `tsconfig.base.json` (~160 tok)

## .claude/

- `settings.json` (~441 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## apps/studio/

- `eslint.config.mjs` — flat config; globals.node for server/, globals.browser for src/ (~196 tok)
- `index.html` — nacianil Studio (~81 tok)
- `package.json` — Node.js package manifest (~285 tok)
- `tsconfig.json` — TypeScript configuration (~69 tok)
- `tsconfig.server.json` (~97 tok)
- `vite.config.ts` (~74 tok)

## apps/studio/messages/

- `en.json` (~1 tok)
- `tr.json` (~1 tok)

## apps/studio/server/

- `index.ts` — API routes: GET (1 endpoints) (~138 tok)

## apps/studio/src/

- `App.tsx` — App (~53 tok)
- `main.tsx` — rootEl (~82 tok)

## apps/web/

- `eslint.config.mjs` — Declares __filename (~98 tok)
- `next.config.ts` — Declares nextConfig (~37 tok)
- `package.json` — Node.js package manifest (~164 tok)
- `tsconfig.json` — TypeScript configuration (~106 tok)

## apps/web/app/

- `layout.tsx` — metadata (~90 tok)
- `page.tsx` — Home (~49 tok)

## content/

- `redirects.json` (~1 tok)
- `taxonomy.json` (~11 tok)

## content/_ideas/

- `.gitkeep` (~0 tok)

## content/_inbox/

- `.gitkeep` (~0 tok)

## content/_inbox/unresolved/

- `.gitkeep` (~0 tok)

## content/plans/

- `.gitkeep` (~0 tok)

## content/resume/

- `.gitkeep` (~0 tok)

## content/series/

- `.gitkeep` (~0 tok)

## content/standalone/

- `.gitkeep` — RESERVED FOR FUTURE (~39 tok)

## docs/work-packages/

- `INDEX.md` — nacianil.com — Work Packages INDEX (~2882 tok)
- `WP-01-scaffold.md` — WP-01 — Monorepo Scaffold (~1670 tok)
- `WP-02-design-system.md` — WP-02 — Design System + Reference + UI Components + i18n (~2045 tok)
- `WP-03-content-core.md` — WP-03 — content-core (~2245 tok)
- `WP-04-public-reading.md` — WP-04 — Public Reading Experience (~2074 tok)
- `WP-05-seo-sitemap-redirects.md` — WP-05 — Bilingual SEO + URL + Redirects (~1890 tok)
- `WP-06-studio-mvp.md` — WP-06 — Studio MVP (~2140 tok)
- `WP-07-scheduled-publish-cache.md` — WP-07 — Scheduled Publish + Cache Invalidation (~1855 tok)
- `WP-08-security-hardening.md` — WP-08 — Production Security Hardening + A11y/Perf (~2221 tok)
- `WP-09-prompts-auto-routing.md` — WP-09 — Prompt Library + Auto Output Routing (~2045 tok)
- `WP-10-visual-studio.md` — WP-10 — Visual Studio (~1936 tok)
- `WP-11-monthly-planning.md` — WP-11 — Monthly Editorial Planning (~2043 tok)
- `WP-12-resume-portfolio.md` — WP-12 — Resume / Portfolio / CV PDF (~2201 tok)
- `WP-13-deploy-docs.md` — WP-13 — Deploy Docs + Smoke Tests (~1991 tok)

## packages/content-core/

- `eslint.config.mjs` — flat config; @typescript-eslint/recommended rules (~111 tok)
- `package.json` — Node.js package manifest (~171 tok)
- `tsconfig.json` — TypeScript configuration (~41 tok)

## packages/content-core/src/

- `index.ts` — content-core: zod schemas, parsers, QC, slug/url/redirect/taxonomy/isPublic (~33 tok)

## packages/ui/

- `eslint.config.mjs` — flat config; @typescript-eslint/recommended rules (~111 tok)
- `package.json` — Node.js package manifest (~180 tok)
- `tailwind.preset.ts` — Tailwind preset stub — real design tokens added in WP-02 (~28 tok)
- `tsconfig.json` — TypeScript configuration (~48 tok)

## packages/ui/src/

- `index.ts` — ui: framework-light design tokens + component core (§3) (~40 tok)
