# nacianilcom

Personal publishing + CV/portfolio site — [nacianil.com](https://nacianil.com)

**Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, .NET-aligned content model, local authoring Studio (Fastify + Vite).

---

## Setup

**Requirements:** Node.js ≥ 20, pnpm ≥ 9

```bash
# Install pnpm globally (if needed)
npm install -g pnpm@9

# Clone and install
git clone https://github.com/nacianilakman/nacianilcom
cd nacianilcom
pnpm install

# Copy env files
cp .env.example apps/web/.env           # fill REVALIDATE_SECRET, CRON_SECRET
cp apps/studio/.env.example apps/studio/.env  # fill REVALIDATE_SECRET, WEB_URL
```

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev:web` | Start Next.js web dev server (`http://localhost:3000`) |
| `pnpm dev:studio` | Start Studio (Fastify + Vite) (`http://127.0.0.1:3001`) |
| `pnpm -w build` | Build all packages |
| `pnpm -w typecheck` | TypeScript check (all packages) |
| `pnpm -w lint` | ESLint (all packages) |
| `pnpm -w test` | Vitest (all packages) |
| `pnpm audit` | Security audit |
| `pnpm smoke [BASE_URL]` | Smoke tests (requires running web server) |

---

## Content Structure

```
content/
  taxonomy.json            # Tag + category registry
  series/
    <seriesSlug>/
      series.json          # Title, description, articleOrder
      articles/<id>/
        meta.json          # Status, publishDate, tags, slugBase, …
        final.tr.mdx       # Turkish article
        final.en.mdx       # English article
        references.json
  resume/
    resume.json            # Bilingual CV (tr + en) with visibility model
    portfolio/
      <caseSlug>/case.json # Bilingual case study
    sources/               # Raw PDFs (not served publicly)
  plans/
    YYYY-MM.json           # Monthly editorial plans
  _inbox/                  # AI output inbox (auto-routing)
  _ideas/                  # Topic candidates from monthly plans
```

### Taxonomy & Internal Links

Every article references `taxonomy.json` categories/tags via `meta.json`. Internal links use `[[series-slug/article-slug]]` syntax in MDX and are validated at build time by `checkInternalLinks` from `@nacianilcom/content-core`.

**Internal Link Contract:** Only slugs that exist in `taxonomy.json` and are public at build time may be linked. Dead links surface as QC issues in Studio.

---

## Technical-Writing Components

Available in all `.mdx` files (from `packages/ui`):

| Component | Purpose |
|---|---|
| `<Callout>` | Highlighted note/tip |
| `<Definition>` | Term + explanation |
| `<Example>` | Concrete example block |
| `<Warning>` | Critical warning |
| `<Takeaway>` | Key takeaway |
| `<CodeBlock language="ts">` | Syntax-highlighted code |
| `<Comparison>` | Side-by-side comparison |
| `<LayeredModel>` | Layered architecture diagram |
| `<Pyramid>` | Pyramid concept visual |
| `<VisualBlock>` | SVG diagram embed (sanitized) |

Visual diagrams: author `.mmd` in Studio → Visual Studio renders to sanitized `.svg` → committed to `content/series/<slug>/diagrams/`.

---

## UI i18n

All UI strings live in `apps/web/messages/{tr,en}.json` and `apps/studio/messages/{tr,en}.json`. Locale files must have the same keys as `MessageKey` in `packages/content-core/src/i18n.ts`. Adding a new key: update `i18n.ts`, both JSON files, and rebuild.

---

## Asset / A11y / Perf Rules

- All images need `alt` text. `WebImage` wraps `next/image` (required in web).
- Article cover images: `aspect-[16/9] object-contain` + blurred bleed stage.
- Visual blocks: `alt` + `caption` required for published articles.
- Target: Lighthouse SEO ≥ 95, A11y ≥ 95 on all published pages.
- Bundle: no large client-side deps in RSC paths (MDX rendering is server-side).

---

## URL / Slug / Redirects

- All URLs: `trailingSlash: false`
- Root `/` redirects to `/tr` (via `app/page.tsx` `notFound()` redirect)
- Article slugs: `normalizeSlug(raw)` (TR chars → ASCII, lowercase)
- Redirects: add to `content/redirects.json` → loaded by `apps/web/next.config.ts` via `resolveRedirects`
- URL builder: `buildUrl(lang, kind, slugs?)` from `@nacianilcom/content-core`

---

## Bilingual SEO

- `generateMetadata` with `alternates.canonical` + `alternates.languages` on all routes
- `x-default` → `/tr` on all hreflang sets
- Sitemap: `apps/web/app/sitemap.ts` — includes articles, series, CV, work, case studies
- RSS: `/[lang]/feed.xml` per language
- JSON-LD: `WebSite+Person` on home, `TechArticle` on articles, `BreadcrumbList` on all routes, `Person` on CV/work
- OG image: edge route `/og?...` (1200×630)

---

## Adding New Series / Articles

1. Create `content/series/<new-slug>/series.json` (title, description, articleOrder)
2. Create `content/series/<new-slug>/articles/<id>/` with `meta.json` (status: `draft`), `final.tr.mdx`, `final.en.mdx`, `references.json`
3. Validate in Studio (SEO/QC check)
4. Set `status: published` + `publishDate` via Studio Publisher (triggers Git commit + ISR revalidation)

---

## Studio Usage

Studio runs locally at `http://127.0.0.1:3001` — **never deployed**.

```bash
pnpm dev:studio
```

**Screens:**

| Screen | Purpose |
|---|---|
| Draft Review | Preview MDX with all components |
| SEO / QC Check | Run `runQC` — blocking issues prevent publish |
| Publisher | Publish (commits to Git + calls /api/revalidate) |
| Prompts | Copy-paste Claude Code prompts |
| AI Inbox | Route AI output to correct content files |
| Visual Studio | Mermaid `.mmd` → sanitized `.svg` |
| Monthly Plan | Generate candidate pool → select 10-topic plan |
| Resume Studio | Preview resume.json + generate Playwright PDF |

---

## Publish + Scheduled Cache / Revalidation

- `status: published` + past `publishDate` → public
- `status: scheduled` + future `publishDate` → hidden until date passes
- ISR: `revalidate = 3600` on article/series pages
- Explicit revalidation: `POST /api/revalidate` (HMAC-secured, supports path + tag arrays)
- Daily cron: `/api/cron` (Vercel, 03:00 UTC) — revalidates all public articles (clears 404-cache for future-scheduled URLs)

**404-cache test:** visit a future-scheduled URL before publish date → gets 404. After cron runs or explicit revalidate call, URL returns 200.

---

## Auto Output Routing + AI Inbox

Claude Code outputs (drafts, revisions, outlines) are dropped into `content/_inbox/` as JSON. Studio AI Inbox polls, shows items, lets you route to target path (MDX file) or discard. Unroutable items go to `_inbox/unresolved/`.

---

## CV / Resume + Visibility

`content/resume/resume.json` — bilingual (tr/en). Visibility model:

| Value | Where shown |
|---|---|
| `public` | Web + PDF |
| `pdf` | PDF only (not in HTML/JSON-LD/sitemap) |
| `private` | Nowhere |

Phone and address default to `private`. Private fields are filtered by `filterResumeByVisibility()` in `@nacianilcom/content-core` before any render. Leak test: `pnpm smoke` checks `/tr/cv` HTML.

**PDF (local only):** Studio → Resume Studio → "PDF Üret". Requires web server running on `WEB_URL`. Uses Playwright to render `/[lang]/cv/print` → A4 PDF saved to repo root. Never generated on Vercel.

---

## CSP Rollout — Report-Only → Enforce

Current state: `Content-Security-Policy-Report-Only` is active. When the report queue is clean (no violations for 7+ days on production):

1. In `apps/web/next.config.ts`, change `Content-Security-Policy-Report-Only` → `Content-Security-Policy`
2. Deploy
3. Monitor for 1 week before considering stable

---

## Production Security Checklist

Run before every deploy:

- [ ] `pnpm -w test` passes
- [ ] `pnpm audit` — no high/critical unfixed vulnerabilities
- [ ] No secrets in `apps/web/.env` committed to Git
- [ ] `REVALIDATE_SECRET` min 32 chars, rotated from defaults
- [ ] `CRON_SECRET` set in Vercel env (server-only)
- [ ] CSP header present in response (`content-security-policy` or `-report-only`)
- [ ] `X-Content-Type-Options: nosniff` present
- [ ] `/api/revalidate` returns 401 for unauthenticated POST
- [ ] Private fields (phone, address, ehliyet, askerlik) not in CV HTML
- [ ] Studio not deployed (only `apps/web` in Vercel)
- [ ] `trailingSlash: false` in `next.config.ts`
- [ ] `pnpm smoke https://nacianil.com` passes on production

---

## Environment Variables

See [`.env.example`](.env.example) for full reference.

| Variable | Location | Purpose |
|---|---|---|
| `REVALIDATE_SECRET` | `apps/web/.env` + Vercel | HMAC secret for `/api/revalidate` |
| `CRON_SECRET` | Vercel (server-only) | Auth for `/api/cron` |
| `REVALIDATE_SECRET` | `apps/studio/.env` | Same secret, used after publish |
| `WEB_URL` | `apps/studio/.env` | Local web URL for Playwright + revalidate |

---

## Vercel Deploy

**Only `apps/web` is deployed.** Studio is never deployed.

1. Connect GitHub repo to Vercel
2. Set **Root Directory**: `apps/web`
3. Set **Framework**: Next.js
4. **Build and Output Settings** (monorepo — workspace packages must compile first):
   - **Install Command:** `cd ../.. && pnpm install --frozen-lockfile`
   - **Build Command:** `cd ../.. && pnpm --filter @nacianilcom/web... build`
   - Enable **Include source files outside of the Root Directory in the Build Step**
5. Add env vars: `REVALIDATE_SECRET`, `CRON_SECRET` (server-only)
6. Cron is configured in `apps/web/vercel.json` (daily at 03:00 UTC)
7. First deploy: CSP is Report-Only — check console for violations before enforcing

Local equivalent: `pnpm build:web`

---

## Monthly Plan + API Key

Monthly editorial plan is generated locally by Studio (no LLM required for heuristic mode). File-based mode generates a Claude Code prompt saved to the session. No API key needed for heuristic mode.

If LLM features are added: `ANTHROPIC_API_KEY` in `apps/studio/.env` only (local, never Vercel).

---

## Future Scope

The following are intentionally out of scope for MVP:

- Static search index (Pagefind or similar)
- Privacy-friendly analytics (Plausible, Umami)
- KV/Redis nonce + rate-limit for CSP enforce
- `content/standalone/` public single-article route
- Comment system
- Newsletter

---

## Font Licenses

- **Newsreader** (serif) — SIL Open Font License 1.1
- **Inter** (sans) — SIL Open Font License 1.1
- **JetBrains Mono** (mono) — SIL Open Font License 1.1

All fonts loaded via `next/font/google` (self-hosted at build time by Next.js).

---

## Troubleshooting

**`pnpm install` fails:** Ensure pnpm ≥ 9.0.0 and Node.js ≥ 20.

**`pnpm -w build` fails with type errors:** Run `pnpm --filter @nacianilcom/content-core build` first to rebuild dist/.

**Studio server won't start on 127.0.0.1:3001:** Check if port is occupied (`netstat -aon | findstr 3001`). Kill the process or change `PORT` in `apps/studio/server/index.ts`.

**`/api/revalidate` returns 401:** Ensure `REVALIDATE_SECRET` in `apps/studio/.env` matches `apps/web/.env`.

**Playwright PDF fails:** Ensure web dev server is running at `WEB_URL` (default `http://localhost:3000`) before clicking PDF Üret in Studio.

**ESLint `no-undef` for `__dirname`:** Studio server files need `globals.node` in ESLint config (already configured).

**`workspace:*` resolve error:** Never use `workspace:*` for external npm packages — only for local workspace packages (`@nacianilcom/*`).

**CSP violation in browser console:** Add the offending source to the `connect-src`/`img-src`/`script-src` directive in `apps/web/next.config.ts` headers, then redeploy. Only enforce after violations stop.
