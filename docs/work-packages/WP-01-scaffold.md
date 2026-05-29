# WP-01 — Monorepo Scaffold

## Title
Monorepo Scaffold (Faz 0)

## Purpose
`nacianil.com` monorepo'sunun **boş ama çalışan** iskeletini kurmak: pnpm workspaces, TypeScript, Node 20+, dört workspace (`apps/web`, `apps/studio`, `packages/content-core`, `packages/ui`), `docs/`, ve örnek `content/` ağacı. Sonraki tüm WP'ler bunun üzerine inşa edilir.

## Why this package exists
Master plan §2 teknolojiyi sabitliyor (pnpm monorepo, Next.js App Router web, Fastify+Vite/React studio, content-core + ui paketleri). Tek seferde her şeyi kurmak yerine önce **derlenen, lint'ten geçen, build alan** minimal bir temel olmalı ki her sonraki WP `pnpm -w typecheck/lint/build` ile doğrulanabilsin. Bu paket o temeli atar.

## Depends on
- Hiçbir şey. İlk paket.

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§2** (teknoloji kararları), **§8** (klasör yapısı), **§32 Faz 0**.
- OpenWolf protokolü: `CLAUDE.md`, `.wolf/OPENWOLF.md`.
- `.wolf/cerebrum.md` (Do-Not-Repeat) ve `.wolf/buglog.json` (başlamadan).

## Files/folders likely to touch
```
package.json  pnpm-workspace.yaml  tsconfig.base.json  .gitignore  .nvmrc
.editorconfig  .env.example
apps/web/        (Next.js App Router iskeleti — boş home)
apps/studio/     (Fastify + Vite/React iskeleti — 127.0.0.1)
  apps/studio/messages/{tr,en}.json   (boş/placeholder; içerik WP-02)
packages/content-core/   (boş index + package.json + tsconfig)
packages/ui/             (boş index + package.json + tsconfig + Tailwind preset stub)
docs/                     (zaten var: docs/work-packages/)
content/
  taxonomy.json          (boş iskelet: {categories:[],tags:[]})
  redirects.json         (boş: [])
  _ideas/.gitkeep  _inbox/.gitkeep  _inbox/unresolved/.gitkeep  plans/.gitkeep
  series/.gitkeep  resume/.gitkeep
  standalone/.gitkeep    (RESERVED FOR FUTURE — README notu)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- Design token / renk / font **YOK** (WP-02).
- zod şema, `isPublic`, `buildUrl`, QC **YOK** (WP-03).
- Gerçek route / reading experience **YOK** (WP-04).
- Studio iş mantığı (preview/QC/publisher) **YOK** (WP-06).
- Gerçek içerik (yazı/seri) **YOK** — yalnız boş iskelet JSON'lar.
- Deploy / CSP / security headers **YOK**.

## Implementation steps
1. **Git init**: repo henüz git değil → `git init`, `.gitignore` (node_modules, .next, dist, .env, .vercel, Playwright çıktıları, OpenWolf dışı geçici dosyalar). `.wolf/` izlenir (commit edilir).
2. **Workspace kökü**: `pnpm-workspace.yaml` (`apps/*`, `packages/*`), root `package.json` (private, packageManager pin), `.nvmrc` Node 20+, `tsconfig.base.json` (strict).
3. **Root scriptler**: `typecheck`, `lint`, `build` (ve `-w` üzerinden tüm workspace'leri kapsayacak şekilde). ESLint + Prettier temel config. Tailwind dependency'leri (preset gerçek tokenlar WP-02).
4. **`apps/web`**: Next.js (App Router) minimal — `app/layout.tsx`, `app/page.tsx` (şimdilik basit placeholder; `/→/tr` redirect WP-04'te eklenecek), `next.config` iskeleti (boş; `redirects()`/`headers()` sonraki WP'ler). `trailingSlash:false` ayarını şimdiden koy (§20).
5. **`apps/studio`**: Fastify backend (`127.0.0.1` bind, asla `0.0.0.0`) + Vite/React frontend iskeleti. `dev:studio` scripti. Deploy edilmez notu README'ye.
6. **`packages/content-core`** ve **`packages/ui`**: derlenebilir boş `index.ts` + `package.json` + `tsconfig`. `ui` için Tailwind preset **stub** dosyası (gerçek token'lar WP-02).
7. **`content/` iskeleti**: §8 ağacı; boş `taxonomy.json` (`{"categories":[],"tags":[]}`), `redirects.json` (`[]`), boş klasörler `.gitkeep` ile. `standalone/` "reserved for future".
8. **`.env.example`**: ileride dolacak değişkenler için placeholder başlığı (HMAC secret, revalidate URL vb. yorum satırı).
9. **Doğrula**: `pnpm install`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w build` → hepsi geçmeli.
10. **OpenWolf**: `.wolf/anatomy.md`'ye yeni dosya/klasörleri ekle; `.wolf/memory.md`'ye satır(lar) ekle.

## Acceptance criteria
- `pnpm install` temiz; `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w build` **hata yok**.
- `apps/web` boş home ile build alıyor; `apps/studio` local dev başlatılabiliyor (`127.0.0.1`).
- `packages/content-core` ve `packages/ui` import edilebilir (boş bile olsa).
- `content/` ağacı §8'e uygun; boş `taxonomy.json`/`redirects.json` geçerli JSON.
- `git` repo başlatıldı; `.gitignore` `.env`'i ve build çıktılarını dışlıyor.
- `.wolf/anatomy.md` yeni yapıyı yansıtıyor.

## Required tests/checks
```
pnpm install
pnpm -w typecheck
pnpm -w lint
pnpm -w build
```

## Commit message suggestion
```
chore: scaffold monorepo (pnpm workspaces, web/studio/content-core/ui, content tree)
```

## Risks / gotchas
- **Windows yolları**: PowerShell ortamı; script'lerde POSIX-only komut kullanma (cross-env / pnpm script'leri tercih et).
- `apps/studio` mutlaka `127.0.0.1`'e bind — `0.0.0.0` veya LAN'a açma (§28).
- `next.config`'e şimdiden `redirects()` veya `headers()` koyma; bunlar WP-04/05/08'in sahipliğinde. Sadece `trailingSlash:false`.
- Tailwind preset'i gerçek değerlerle doldurma — token'lar WP-02. Şimdi sadece derlenebilir stub.
- `.env` dosyasını commit'leme; yalnız `.env.example`.

## Handoff to next package
- **WP-02 (Design System)** ve **WP-03 (content-core)** artık başlayabilir; ikisi de yalnız bu iskelete bağlı, birbirinden bağımsız.
- Sonraki chat'e: "monorepo iskeleti hazır, 4 workspace derleniyor, `content/` boş iskelet var, `apps/studio/messages/{tr,en}.json` boş bekliyor (WP-02 dolduracak)."

## Claude Code start prompt
```
Sen kıdemli bir full-stack engineer'sın. Bu OpenWolf-yönetimli repo'da (C:\dev\nacianilcom) nacianil.com monorepo'sunun ilk iskeletini kuracaksın.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §2 (teknoloji), §8 (klasör yapısı), §32 Faz 0
- docs/work-packages/WP-01-scaffold.md → bu paketin tam kapsamı
- CLAUDE.md ve .wolf/OPENWOLF.md → OpenWolf protokolü (dosya okumadan anatomy.md'ye bak; aksiyon sonrası memory.md/anatomy.md güncelle; bug olursa buglog.json)

KAPSAM (yalnız bu): pnpm workspaces monorepo + apps/web (Next.js App Router boş home) + apps/studio (Fastify+Vite/React, 127.0.0.1) + packages/content-core + packages/ui (boş ama derlenebilir) + docs/ + örnek content/ ağacı (§8) boş taxonomy.json/redirects.json ile + git init + .gitignore + .env.example + root typecheck/lint/build scriptleri.

YAPMA: design token, zod şema, route, studio mantığı, gerçek içerik, deploy, CSP — bunlar sonraki paketlerde.

BİTİRİNCE: pnpm -w typecheck && pnpm -w lint && pnpm -w build temiz geçmeli. anatomy.md'yi güncelle, memory.md'ye yaz. Commit: `chore: scaffold monorepo (...)`. Son olarak 5 satırlık durum özeti ver ve WP-02/WP-03'ün başlayabileceğini belirt.
```
