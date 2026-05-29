# WP-07 — Scheduled Publish + Cache Invalidation

## Title
Scheduled Publish + Cache/Invalidation: Cron + Explicit revalidatePath/Tag + 404-Cache Fix (Faz 6a)

## Purpose
Zamanlanmış yayını ve cache tutarlılığını kurmak: günlük cron, **explicit** `revalidatePath`/`revalidateTag` matrisi (article/series/list/home/sitemap/feed), future-scheduled içerik için `notFound()` + ISR, ve "future URL erken ziyaret edilip 404 cache'e düştü" probleminin publish anında temizlenmesi. `isPublic` tek kaynağı tüm yüzeylerde teyit edilir.

## Why this package exists
Master plan §27 (Cache/Invalidation Standard) + §11 (lifecycle sonu: explicit revalidate) + §4 önceliği (3, scheduled publish). WP-06'da `/api/revalidate` endpoint'i ve Publisher var; bu paket onu **doğru tag/path matrisi + cron + 404-cache temizleme** ile tamamlar ki scheduled içerik zamanı gelince gerçekten görünür olsun.

## Depends on
- **WP-05** (sitemap/feed/route'lar — revalidate edilecek yüzeyler).
- **WP-06** (`/api/revalidate` endpoint + Publisher).

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§27** (publish & scheduling cache/invalidation — tag/path stratejisi, 404-cache, cron), **§9** (isPublic truth table), **§21** (generateStaticParams/dynamicParams/ISR), **§32 Faz 6** (scheduled kısmı + testler).
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `.wolf/buglog.json`, `CLAUDE.md`.

## Files/folders likely to touch
```
apps/web/app/[lang]/.../ (generateStaticParams yalnız public; dynamicParams=true; revalidate=ISR)
apps/web/.../revalidate-targets.ts (tag/path matrisi: article:<id>, series:<slug>, list, sitemap, feed:<lang>)
apps/web/app/api/revalidate/route.ts (WP-06 endpoint'ine tag/path aksiyonu bağla)
apps/web/vercel.json veya cron route (günlük cron)
apps/web/.../__tests__ veya integration test (scheduled/notFound/404-cache/leak senaryoları)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **Security headers / CSP / secret-leak audit / Lighthouse YOK** → WP-08.
- **Yeni içerik özelliği / route YOK**.
- **`/api/revalidate` güvenlik mekanizması (HMAC) YOK** — o WP-06'da; burada yalnız **ne revalidate edileceği** (tag/path) ve cron.
- **Studio değişikliği YOK** (Publisher zaten WP-06'da revalidate tetikliyor).
- KV/Redis tabanlı distributed state **YOK** (§29 MVP dışı).

## Implementation steps
1. **Tag/path stratejisi (§27)**: içerik tag'lenir → `article:<id>`, `series:<slug>`, `list`, `sitemap`, `feed:<lang>`. Kritik path'ler için `revalidatePath`. Tek bir `revalidate-targets` haritası tanımla; Publisher (WP-06) ve cron aynı haritayı kullanır.
2. **Publish sonrası explicit revalidate**: bir yazı publish olunca → ilgili **article path, series landing, series list, home/list, sitemap, per-lang feed** path/tag'leri açıkça revalidate edilir (genel "revalidate all" değil).
3. **Scheduled rendering (§21/§27)**: `generateStaticParams` yalnız public; `dynamicParams=true`; ISR `revalidate`. Future-scheduled URL route tahmin edilse bile `isPublic` false → **`notFound()`**.
4. **404-cache problemi (§27)**: future-scheduled URL publishDate öncesi ziyaret edilip 404 cache'e düşerse, publish zamanı geldiğinde cron/revalidate ilgili path'i **yeniden generate ederek** 404 etkisini temizler.
5. **Günlük cron**: Vercel cron (veya eşdeğer) ilgili tag/path'leri günlük tetikler — `scheduled & publishDate<=now` olanları görünür kılar ve eski 404'leri temizler. Cron, korumalı `/api/revalidate`'i imzalı çağırır.
6. **isPublic teyidi**: list/landing/article/`generateStaticParams`/sitemap/rss/redirect-internal-link hedefi **tek `isPublic`** kullanır (kopya yok).
7. **Senaryo/integration testleri (§32 Faz 6)**: aşağıdaki "Required tests".
8. **Doğrula** + OpenWolf (memory/anatomy; bug → buglog).

## Acceptance criteria
- Publish (ve cron) **explicit** olarak article/series-landing/series-list/home/sitemap/per-lang-feed path/tag'lerini revalidate ediyor (genel çağrı değil).
- `scheduled & publishDate<=now` içerik zamanı gelince görünür oluyor; `published & publishDate>now` görünmüyor.
- Future-scheduled URL doğrudan ziyarette `notFound()`.
- Erken ziyaretten kaynaklı 404-cache, publish anında cron/revalidate ile temizleniyor (içerik 404'e takılmıyor).
- draft/scheduled-future içerik list/sitemap/rss'te **yok**.
- Tek `isPublic` tüm yüzeylerde kullanılıyor.
- `pnpm -w typecheck/lint/build/test` temiz.

## Required tests/checks
```
pnpm -w test   # senaryolar:
# - scheduled publish sonrası ilgili path/tag explicit revalidate edilir
# - future article doğrudan ziyaret → notFound()
# - scheduled publish 404-cache'i temizler (erken-ziyaret 404 sonrası publish → içerik görünür)
# - draft/scheduled list/sitemap/rss'te yok
pnpm -w build
```

## Commit message suggestion
```
feat(web): scheduled publish + explicit cache invalidation (revalidatePath/Tag, 404-cache fix, cron)
```

## Risks / gotchas
- **Genel "revalidate all" KULLANMA** — §27 explicit path/tag ister. Tag isimlerini (`article:<id>`, `series:<slug>`, `list`, `sitemap`, `feed:<lang>`) tutarlı kullan.
- **404-cache tuzağı**: future URL erken ziyaret → kalıcı 404 olmasın; cron/revalidate temizlemeli.
- Scheduled içerik `generateStaticParams`'a girmemeli (yalnız public) ama `dynamicParams=true` + `notFound()` ile zamanı gelince ISR üretmeli.
- `isPublic`'i yeniden yazma; content-core tek kaynak.
- Cron `/api/revalidate`'i **imzalı** çağırmalı (HMAC, WP-06).

## Handoff to next package
- **WP-08** production security hardening + a11y/perf + smoke testlerini ekleyecek (bu paketin senaryo testleriyle örtüşen güvenlik senaryoları orada toplanır).
- Handoff notu: "scheduled publish + explicit cache invalidation + 404-cache temizleme + cron çalışıyor; isPublic her yüzeyde tek kaynak. Security headers/CSP ve Lighthouse henüz YOK (WP-08)."

## Claude Code start prompt
```
Sen kıdemli bir Next.js/full-stack engineer'sın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) scheduled publish + cache invalidation kuracaksın. WP-05 (SEO/sitemap/feed) ve WP-06 (/api/revalidate HMAC endpoint + Publisher) hazır.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §27 (cache/invalidation: tag/path, 404-cache, cron), §9 (isPublic truth table), §21 (generateStaticParams/dynamicParams/ISR), §32 Faz 6 (scheduled + testler)
- docs/work-packages/WP-07-scheduled-publish-cache.md → tam kapsam
- CLAUDE.md, .wolf/OPENWOLF.md (+ cerebrum, buglog); anatomy.md'ye bak

KAPSAM (yalnız bu, apps/web): tag/path matrisi (article:<id>, series:<slug>, list, sitemap, feed:<lang>) + kritik revalidatePath; publish/cron sonrası EXPLICIT revalidate (article path + series landing + series list + home/list + sitemap + per-lang feed); generateStaticParams yalnız public + dynamicParams=true + ISR revalidate; future-scheduled → notFound(); 404-cache temizleme (erken ziyaret 404 → publish anında cron/revalidate temizler); günlük cron (imzalı /api/revalidate çağırır); isPublic tek kaynak teyidi. Senaryo testleri: explicit revalidate, future notFound, 404-cache temizleme, draft/scheduled sitemap/rss/list'te yok.

YAPMA: security headers/CSP/secret-leak/Lighthouse (WP-08); yeni içerik/route; HMAC mekanizması (WP-06'da); studio değişikliği; KV/Redis distributed state.

BİTİRİNCE: pnpm -w test (senaryolar) + typecheck/lint/build temiz. anatomy.md/memory.md (+gerekirse buglog) güncelle. Commit: `feat(web): scheduled publish + explicit cache invalidation (...)`. 5 satır özet + WP-08'in başlayabileceğini belirt.
```
