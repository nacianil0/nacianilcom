# WP-09 — Prompt Library + Auto Output Routing

## Title
Prompt Library + Automated Output Routing + AI Output Inbox (Faz 7)

## Purpose
İçerik üretim akışını otomatikleştirmek: tam prompt kütüphanesi (§19) ve **zero-manual import** standardı (§26) — Studio/Claude Code çıktıları manuel taşıma gerektirmeden doğru content kontratına map edilip doğru klasöre yazılır. Universal **AI Output Inbox**, auto-router, discriminated inbox schema (content-core'dan), file watcher, idempotency, overwrite diff/preview, ve `needs review`/`unresolved` kuyruğu.

## Why this package exists
Master plan §26 (Automated Output Routing & Zero-Manual Import) + §19 (Prompt Library). WP-06'da çekirdek prompt şablonları **manuel** çıktı ile vardı; bu paket çıktıyı **otomatik anlamlandırıp route eder**, böylece kullanıcı path seçmez. İçerik üretim verimini artırır ama public site bunsuz da çalışır (MVP sonrası).

## Depends on
- **WP-06** (Studio MVP + çekirdek prompt şablonları).
- Şemalar (inbox/plans dahil) zaten **WP-03**'te.

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§26** (Auto Output Routing + AI Output Inbox + router map + discriminated schema + pipeline), **§19** (prompt library + alt-modlar), **§9** (`_inbox` item schema + plans), **§10** (File I/O contracts — idempotent, no silent overwrite), **§32 Faz 7**.
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `.wolf/buglog.json`, `CLAUDE.md`.

## Files/folders likely to touch
```
apps/studio/server/ (auto-router, file watcher, inbox pipeline, idempotency, diff/backup)
apps/studio/web/ (AI Output Inbox UI: detected/routed/needsReview/failed)
apps/studio/.../prompts/ (tam prompt seti + alt-modlar: revizyon, AI-generic koku temizleme, publish-öncesi QC)
content/_inbox/ + content/_inbox/unresolved/ (kuyruk; schema content-core)
(router hedefleri: content/plans, _ideas, series/.../articles, diagrams, images, resume.json, redirects.json)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **Monthly Plan modülü/UI YOK** → WP-11 (ama Monthly Plan'ın **file-mode çıktısı** bu router'la import edilir; entegrasyon noktası burada hazır).
- **Visual Studio `.mmd→.svg`/sanitize YOK** → WP-10 (router `visual`/`diagram` çıktısını `diagrams/`/`images/`'a yönlendirir; SVG üretimi/sanitize WP-10).
- **Resume Studio UI YOK** → WP-12 (router `resume` çıktısını `resume.json`'a yönlendirir).
- **Yeni public web özelliği YOK**.
- Harici LLM API entegrasyonu **zorunlu değil** (§4) — Inbox dosya bırakma ile çalışır.

## Implementation steps
1. **Discriminated inbox schema kullan (§9/§26)**: `{kind, target, payload, source, createdAt, status}` — `kind` ∈ {monthlyPlan, idea, seriesPlan, brief, outline, finalMdx, visual, diagram, resume, caseStudy, seoQc, redirect}; `status` ∈ {detected, routed, needsReview, failed}. (Şema content-core'dan import.)
2. **Claude Code akışı (§26)**: Studio prompt üretirken **hangi schema + hangi hedef** olduğunu açıkça bildirir; Claude doğru path'e yazar; Studio otomatik algılar, parse eder, **zod doğrular**, ekranda `detected/routed/needsReview/failed` gösterir. Kullanıcı path seçmez.
3. **Universal AI Output Inbox (§26)**: harici LLM çıktısı için tek kuyruk; kullanıcı çıktıyı bırakır; Studio `kind/targetMonth/seriesSlug/articleId/language/contentType/nextAction` alanlarından sınıflandırıp yönlendirir.
4. **Router map (§26)**: monthlyPlan→`plans/YYYY-MM.json`; idea→`_ideas/`; brief/outline→ilgili article klasörü; finalMdx→ilgili language dosyası; visual→`diagrams/`/`images/`; resume→`resume.json`; redirect→`redirects.json`.
5. **Pipeline (her modül aynı)**: schema validate → hedef content path hesapla → QC → ilgili ay/seri/yazı/CV akışına bağla.
6. **Güvenli/kontrollü (§26)**: **sessiz overwrite yok** — gerekirse diff/preview + backup; **idempotent** (duplicate üretmez); anlaşılamayan çıktı kaybolmaz → `content/_inbox/unresolved/` veya "Needs Review" + tek net sebep.
7. **File watcher veya explicit refresh** ile algılama.
8. **Tam prompt seti + alt-modlar (§19)**: çekirdek setin tamamı + Revizyon/Editing, AI-generic Koku Temizleme, Publish-öncesi QC Raporu (çekirdek ekranların modu olarak).
9. **Testler** (overwrite/duplicate/schema validation) + OpenWolf güncelle.

## Acceptance criteria
- Claude Code çıktısı doğru path'e yazıldığında Studio onu **otomatik algılıyor, zod doğruluyor, route ediyor**; durum `detected/routed/needsReview/failed` görünüyor; kullanıcı path seçmiyor.
- Universal AI Output Inbox harici çıktıyı `kind` vb. alanlardan sınıflandırıp doğru hedefe yönlendiriyor.
- Router map tüm `kind`'lar için doğru hedefi hesaplıyor.
- **Sessiz overwrite yok**: overwrite gerektiğinde diff/preview + backup; **idempotent** (duplicate yok); anlaşılamayan çıktı `unresolved/`'a düşüyor (tek net sebeple), kaybolmuyor.
- Tam prompt seti + alt-modlar Studio'dan erişilebilir; her prompt hedef path + schema bildiriyor.
- `pnpm -w typecheck/lint/build/test` temiz.

## Required tests/checks
```
pnpm -w test   # overwrite diff/backup; idempotency (duplicate üretmez); schema validation (geçersiz → failed/needsReview);
               # her kind doğru hedefe route; anlaşılamayan → unresolved/
pnpm -w typecheck && pnpm -w lint && pnpm -w build
```

## Commit message suggestion
```
feat(studio): full prompt library + automated output routing + AI output inbox
```

## Risks / gotchas
- **Sessiz overwrite = veri kaybı riski** — her zaman diff/preview + backup (§26).
- **Idempotency** zorunlu — aynı çıktı iki kez gelince duplicate üretme.
- Anlaşılamayan çıktıyı **silme/yok sayma** — `unresolved/` + tek net sebep.
- Schema'yı yeniden tanımlama — inbox/plans **content-core'dan** (WP-03) import.
- Monthly Plan/Visual/Resume modüllerinin kendileri sonraki WP'lerde; burada yalnız **routing entegrasyon noktaları** hazırlanır.

## Handoff to next package
- **WP-10 (Visual Studio)** `visual`/`diagram` route hedefini kullanır; SVG üretimi/sanitize'ı ekler.
- **WP-11 (Monthly Plan)** file-mode çıktısını bu router'la import eder.
- Handoff notu: "auto-routing + AI Output Inbox + tam prompt seti çalışıyor; idempotent, diff/preview backup, unresolved kuyruğu. visual/diagram/resume/monthlyPlan route hedefleri hazır, modülleri WP-10/11/12."

## Claude Code start prompt
```
Sen kıdemli bir full-stack engineer'sın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) Prompt Library + Auto Output Routing kuracaksın. WP-06 (Studio MVP + çekirdek prompt şablonları) hazır; inbox/plans şemaları WP-03'te.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §26 (Auto Output Routing + AI Output Inbox + router map + discriminated schema + pipeline), §19 (prompt library + alt-modlar), §9 (_inbox item + plans), §10 (idempotent, no silent overwrite), §32 Faz 7
- docs/work-packages/WP-09-prompts-auto-routing.md → tam kapsam
- CLAUDE.md, .wolf/OPENWOLF.md (+ cerebrum, buglog); anatomy.md'ye bak

KAPSAM (yalnız bu, apps/studio + content/_inbox): discriminated inbox schema kullan (content-core'dan import); Claude Code akışı (Studio schema+hedef bildirir → Claude doğru path'e yazar → Studio otomatik algılar/zod doğrular/route eder; detected/routed/needsReview/failed; kullanıcı path seçmez); universal AI Output Inbox (harici çıktı kind/targetMonth/seriesSlug/articleId/language/contentType/nextAction'dan sınıflandırılır); router map (monthlyPlan→plans, idea→_ideas, brief/outline→article klasörü, finalMdx→language dosyası, visual→diagrams/images, resume→resume.json, redirect→redirects.json); pipeline (schema validate→path hesapla→QC→akışa bağla); sessiz overwrite YOK (diff/preview+backup), idempotent, unresolved/ kuyruğu + tek net sebep; file watcher/refresh; tam prompt seti + alt-modlar (revizyon, AI-generic koku temizleme, publish-öncesi QC).

YAPMA: Monthly Plan modülü/UI (WP-11), Visual Studio mmd→svg/sanitize (WP-10), Resume Studio UI (WP-12), yeni public web özelliği. Şemaları yeniden tanımlama (content-core'dan import).

BİTİRİNCE: pnpm -w test (overwrite/idempotency/schema/route/unresolved) + typecheck/lint/build temiz. anatomy.md/memory.md (+buglog) güncelle. Commit: `feat(studio): full prompt library + automated output routing + AI output inbox`. 5 satır özet + WP-10'un başlayabileceğini belirt.
```
