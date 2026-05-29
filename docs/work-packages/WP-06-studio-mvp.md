# WP-06 — Studio MVP

## Title
Studio MVP: Draft Review + SEO/GEO Check + Publisher + /api/revalidate (HMAC) + Core Prompt Templates (Faz 5)

## Purpose
`apps/studio`'yu çalışır hale getirmek: fonksiyonel-eşdeğer preview (Draft Review), `runQC` tabanlı SEO/GEO Check, ve **Publisher** (status/publishDate set → `simple-git` commit/push → imzalı `/api/revalidate` çağrısı). `apps/web`'e güvenli `/api/revalidate` endpoint'i (HMAC + timestamp + method + zod + safe error) eklenir. Ayrıca çekirdek prompt şablonları (§19) Studio ekranı olarak sunulur.

## Why this package exists
Master plan §24 Studio'yu, §27 publish/revalidate yolunu, §29 endpoint güvenliğini tanımlar; §4 önceliği (4). İçerik yazma yolu = **Studio commit/push → Vercel build → explicit revalidate** (§10/§27). Public site ve SEO hazır olunca (WP-04/05), gerçek publish orchestration'ı kuran paket budur. Scheduled cron (WP-07) bu endpoint'i tüketir.

## Depends on
- **WP-03** (`runQC`, şemalar, `isPublic`, `buildUrl`).
- **WP-02** (framework-light ui + Vite wrapper — preview için).
- **WP-04 önerilir** (preview, web reading bileşenlerini yeniden kullanır — yoksa fonksiyonel eşdeğer ui çekirdeğiyle yapılır).
- **WP-05 önerilir** (revalidate edilecek yüzeyler nettir).

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§24** (Studio modülleri + data flow + Publisher), **§3** (framework-light preview), **§7** (user-friendly UX), **§19** (prompt library çekirdek set), **§27** (publish/revalidate), **§28/§29** (güvenlik, HMAC), **§10** (File I/O — ST CC'nin final gövdesini bozmaz), **§32 Faz 5**.
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `.wolf/buglog.json`, `CLAUDE.md`.

## Files/folders likely to touch
```
apps/studio/server/ (Fastify, 127.0.0.1; runQC çağrısı; simple-git; revalidate tetikleyici)
apps/studio/web/ (Vite/React: Draft Review, SEO/GEO Check, Publisher ekranları)
apps/studio/.../prompts/ (çekirdek prompt şablonları — §19, file-based)
apps/web/app/api/revalidate/route.ts (HMAC + timestamp + method + zod + safe error)
apps/web/.env.example / apps/studio/.env.example (HMAC secret, revalidate URL — yalnız local)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **Auto Output Routing / AI Output Inbox / watcher YOK** → WP-09. Bu pakette prompt çıktısı **manuel** ele alınır.
- **Scheduled cron / explicit revalidate tag/path matrisi YOK** → WP-07 (endpoint BURADA; cron + tag stratejisi orada).
- **Visual Studio (`.mmd→.svg` + sanitize) YOK** → WP-10.
- **Monthly Plan modülü YOK** → WP-11. **Resume Studio YOK** → WP-12.
- **Studio asla deploy edilmez** (§28): `127.0.0.1` bind; LAN/public'e açma.
- Security headers / CSP (web) → WP-08 (yalnız `/api/revalidate` güvenliği BURADA).

## Implementation steps
1. **Fastify backend (§24/§28)**: `127.0.0.1` bind (asla `0.0.0.0`). content-core'u import eder; CC'nin `final.*.mdx` gövdesini **bozmaz** — yalnız `meta.json` status/publishDate, redirects, taxonomy, plans, inbox gibi alanlara dokunur (§10).
2. **Draft Review (§3/§21)**: fonksiyonel-eşdeğer preview — aynı design token + ui çekirdeği + MDX/visual/technical-writing bileşenleri (Vite wrapper). "Birebir RSC" iddiası taşımaz.
3. **SEO/GEO Check (§18/§24)**: `runQC` + ayrı **taxonomy/internal-link/slug/redirect/hreflang/canonical** raporu grubu. Blocking/warning ayrımı net gösterilir.
4. **`/api/revalidate` (apps/web, §29 — prod zorunlu)**: **HMAC signature + dar timestamp window + method whitelist + zod input validation + safe error response** (stack/iç detay sızdırma yok). Secret yalnız server env / local `.env`. (Tag/path **matrisi** WP-07; burada endpoint güvenli + parametre alır.)
5. **Publisher (§24/§27)**: buton şu sağlanınca aktif → `runQC` blocking=0; diller tam; görsel/diagram çözümlü; redirect/internal-link hedefleri public. Aksiyon: `meta.json` status/publishDate → `simple-git` commit/push → imzalı `/api/revalidate` çağrısı.
6. **Çekirdek prompt şablonları (§19)**: Idea/Series Plan, Article Brief, Outline, TR Draft, TR Final MDX, EN Adaptation, Visual/Diagram Suggestion, SEO/QC Review, Resume/Case Study, Monthly Plan — file-based, her biri Amaç/Okur/Üretir/Format/Kurallar/Aşama. Hedef path + schema'yı Claude'a açıkça bildirir. **Bu pakette çıktı manuel** (otomatik routing WP-09).
7. **User-friendly UX (§7)**: anlaşılır, hızlı, hataları net gösteren. Karmaşık CMS değil.
8. **Doğrula** + OpenWolf (memory/anatomy; bug olursa buglog).

## Acceptance criteria
- Studio `127.0.0.1`'de çalışıyor; deploy edilebilir değil.
- Draft Review fonksiyonel-eşdeğer preview gösteriyor (token + ui çekirdeği + MDX bileşenleri).
- SEO/GEO Check `runQC` sonucunu + taxonomy/link/slug/redirect/hreflang/canonical grubunu ayrı gösteriyor.
- `/api/revalidate` HMAC + timestamp window + method whitelist + zod + safe error ile korunuyor; imzasız/eski/yanlış-method istek **reddediliyor**.
- Publisher yalnız tüm ön koşullar (blocking=0, diller tam, görsel çözümlü, hedefler public) sağlanınca aktif; aksiyon status/publishDate set → commit/push → imzalı revalidate.
- Çekirdek prompt şablonları (§19) Studio'dan erişilebilir; hedef path + schema bildiriyor.
- Secret client bundle'a sızmıyor (yalnız `NEXT_PUBLIC_*` public).
- `pnpm -w typecheck/lint/build` temiz.

## Required tests/checks
```
pnpm -w typecheck && pnpm -w lint && pnpm -w build
# /api/revalidate: geçerli HMAC+timestamp → 200; imzasız/eski timestamp/yanlış method → reddedilir; hatalı body → zod reject (safe error)
# Publisher: blocking>0 iken pasif; koşullar sağlanınca commit/push + revalidate tetikler
# Studio yalnız 127.0.0.1 dinliyor (0.0.0.0 değil)
```

## Commit message suggestion
```
feat(studio): draft review, seo/qc check, publisher + secured /api/revalidate (HMAC)
```

## Risks / gotchas
- **`/api/revalidate` güvenliği prod-zorunlu** (§29): HMAC + timestamp + method + zod + safe error. **In-memory nonce/rate-limit production security sayılmaz** — nonce/distributed rate-limit MVP DIŞI (DB-yok), eklenirse ileride KV/Redis.
- Studio **CC final gövdesini bozmamalı** (§10) — yalnız izinli alanlara dokun.
- Preview "birebir web" değil, **fonksiyonel eşdeğer** (§3) — abartılı iddia yok.
- `127.0.0.1` zorunlu; `0.0.0.0`/LAN yasak (§28).
- Prompt çıktısını bu pakette otomatik route etme — o WP-09. Karışmasın.
- Secret'ı log'lama (§29).

## Handoff to next package
- **WP-07** `/api/revalidate`'i cron + explicit `revalidatePath`/`revalidateTag` matrisiyle tüketecek; 404-cache temizleme.
- **WP-09** prompt çıktılarını otomatik route edecek (Auto Output Inbox).
- Handoff notu: "Studio MVP çalışıyor (127.0.0.1): Draft Review + SEO/QC + Publisher; /api/revalidate HMAC-korumalı endpoint hazır (cron/tag matrisi WP-07); çekirdek prompt şablonları manuel modda."

## Claude Code start prompt
```
Sen kıdemli bir full-stack engineer'sın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) Studio MVP'yi kuracaksın. WP-03 (content-core: runQC/şemalar), WP-02 (framework-light ui), WP-04/05 (public reading + SEO) hazır.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §24 (Studio modülleri + Publisher), §3 (framework-light preview), §7 (user-friendly UX), §19 (çekirdek prompt set), §27 (publish/revalidate), §28/§29 (güvenlik + HMAC), §10 (ST CC final gövdesini bozmaz), §32 Faz 5
- docs/work-packages/WP-06-studio-mvp.md → tam kapsam
- CLAUDE.md, .wolf/OPENWOLF.md (+ cerebrum, buglog); anatomy.md'ye bak

KAPSAM (yalnız bu): apps/studio Fastify (127.0.0.1) + Vite/React; Draft Review (fonksiyonel-eşdeğer preview, ui çekirdeği + Vite wrapper); SEO/GEO Check (runQC + ayrı taxonomy/link/slug/redirect/hreflang/canonical grubu); Publisher (blocking=0 + diller tam + görsel çözümlü + hedefler public → meta status/publishDate set → simple-git commit/push → imzalı /api/revalidate); apps/web/app/api/revalidate/route.ts (HMAC + dar timestamp window + method whitelist + zod input + safe error); çekirdek prompt şablonları (§19, file-based, hedef path+schema bildirir, çıktı MANUEL).

YAPMA: Auto Output Routing/Inbox/watcher (WP-09); cron + revalidate tag/path matrisi (WP-07); Visual Studio mmd→svg (WP-10); Monthly Plan (WP-11); Resume Studio (WP-12); studio'yu deploy etme/0.0.0.0; web security headers (WP-08). CC final.*.mdx gövdesini bozma.

BİTİRİNCE: pnpm -w typecheck/lint/build temiz; /api/revalidate imzasız/eski/yanlış-method/hatalı-body reddediyor; Publisher koşullu aktif; studio yalnız 127.0.0.1. anatomy.md/memory.md (+gerekirse buglog) güncelle. Commit: `feat(studio): draft review, seo/qc check, publisher + secured /api/revalidate (HMAC)`. 5 satır özet + WP-07'nin başlayabileceğini belirt.
```
