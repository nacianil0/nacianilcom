# WP-11 — Monthly Editorial Planning

## Title
Monthly Editorial Planning System (Faz 9a)

## Purpose
Studio'ya aylık editorial plan modülü eklemek (§25): girdi analizi → **25–40 aday konu havuzu** → skorlama → **önerilen 10 yazılık plan** (haftalara dağıtılmış, dengeli), `content/plans/YYYY-MM.json`'a kaydedilir. İki mod (local LLM API key VEYA dosya-tabanlı Claude Code prompt + Auto Routing import). Studio önerir/gerekçelendirir; **kullanıcı seçer**.

## Why this package exists
Master plan §25 (Monthly Editorial Planning System). Tek tek yazı akışı (WP-06/09) çalışıyor; bu paket **aylık planlama disiplinini** ekler: tekrar riskini, kategori/zorluk dengesini ve okuyucu yolculuğunu gözeten, gerekçeli 10'luk plan. MVP sonrası; içerik üretimi bunsuz da mümkün.

## Depends on
- **WP-06** (Studio shell).
- **WP-03** (`plans/YYYY-MM.json` + Topic + scores şeması).
- **WP-09 önerilir** (dosya-tabanlı mod çıktısını Auto Routing ile import eder).

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§25** (Monthly Editorial Planning — girdi/akış/saklama/öneri alanları/denge/iki mod/UI/seçim/QC), **§9** (plans schema + Topic + scores), **§26** (file-mode import — Auto Routing), **§4** (non-goals: spam değil, API zorunlu değil), **§32 Faz 9**.
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `.wolf/buglog.json`, `CLAUDE.md`.

## Files/folders likely to touch
```
apps/studio/server/ (plan üretimi: girdi analizi, skorlama, iki mod; .env LLM key local)
apps/studio/web/ (Monthly Plan UI: ay seç → hedef → aday havuzu filtrele → 10 plan/hafta → onayla/aktar)
content/plans/YYYY-MM.json (schema content-core)
apps/studio/.env.example (LLM API key — yalnız local)
(seçim çıktısı: _ideas/, series/<slug>/articles/, brief.md/outline.md akışına dönüşür)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **Otomatik içerik üretimi / spam makinesi YOK** (§4). Plan **önerir**; yazıyı üretmez.
- **AI API zorunlu değil** (§4/§25) — dosya-tabanlı mod (Claude Code prompt + Auto Routing import) tam çalışmalı.
- **Resume/Portfolio YOK** → WP-12.
- **Yeni public web özelliği YOK**.
- **Studio deploy YOK**; **API key yalnız local `.env`** (client/public bundle'a sızmaz, §25/§29).
- **Trend uydurma YOK** (§25) — yoksa yalnız kullanıcı notları + içerik haritası + backlog.

## Implementation steps
1. **Girdi analizi (§25)**: önceki yayınlanmış yazılar, mevcut seriler, yarım konular, `_ideas` backlog, kategori/tag dağılımı, tekrar riski, okuyucu yolculuğu, kullanıcının girdiği trend/not başlıkları.
2. **Aday havuzu**: 25–40 aday konu üret.
3. **Skorlama (§25)**: `relevance, seriesFit, novelty, riskOfRepetition, seoPotential, geoPotential, difficulty, estimatedEffort, visualPotential, suggestedPublishWeek` → önerilen 10'luk plan.
4. **Topic alanları (§9)**: her öneri title/angle/whyNow/targetAudience/seriesFit/difficulty/estimatedReadingTime/suggestedPublishWeek/contentType/seoPotential/geoPotential/visualPotential/riskOfRepetition/requiredResearch/sourceBasis/nextAction + scores taşır (sadece başlık değil).
5. **Denge zorunlu (§25)**: aynı ay tüm yazılar aynı zorluk/kategori/seride yığılmaz; teknik derinlik + açıklayıcı + mimari/ürün + essay dengeli dağıtılır.
6. **Saklama**: `content/plans/YYYY-MM.json` (schema content-core).
7. **İki mod (§25)**: (1) local OpenAI/LLM API key → Studio doğrudan önerir; (2) API yoksa Studio **dosya-tabanlı Claude Code prompt** üretir → kullanıcı Claude'a verir → çıktı JSON/Markdown olarak **Auto Routing (WP-09) ile geri import**. API key yalnız local `.env`.
8. **UI Standard (§25)**: ay seç → hedef sayı (=10) → aday havuzu filtrele → 10 plan haftalara göre → onayla/aktar. Her konu: kısa başlık, seri bağlantısı, önerilen hafta, zorluk, skor, tekrar riski, "neden önerildi?". Tek tık: `regenerate`, `replace similar`, `make more technical`, `make more beginner-friendly`, `continue this series`, `avoid this topic`. **Studio karar verici değil; önerir, kullanıcı seçer.**
9. **Seçim → akış (§25)**: seçilen konu `_ideas/`, `series/<slug>/articles/`, `brief.md`/`outline.md` akışına dönüşür; seçilmeyen kaliteliler backlog'da kalır.
10. **QC eklentileri (§25)**: tekrar riski, kategori/tag dengesi, seçilen 10'un ay içi dağılımı, eksik `sourceBasis`.
11. **Doğrula** + OpenWolf güncelle.

## Acceptance criteria
- Modül 25–40 aday → skorlu **10'luk plan** üretip `content/plans/YYYY-MM.json`'a (şemaya uygun) yazıyor.
- Her öneri §9 Topic alanlarının tamamını + scores taşıyor.
- Denge sağlanıyor (zorluk/kategori/seri yığılması yok).
- İki mod da çalışıyor: API key local mod **ve** dosya-tabanlı mod (Auto Routing import). **API key yalnız local `.env`; client bundle'a sızmıyor.**
- UI: ay/hedef/aday-filtre/haftalık-plan/onayla-aktar + tek-tık aksiyonları (`regenerate` vb.); her konuda "neden önerildi?".
- Seçim `_ideas/`/`series/.../articles/`/`brief`/`outline` akışına dönüşüyor; backlog korunuyor.
- QC: tekrar riski/denge/dağılım/eksik sourceBasis raporlanıyor. Trend uydurulmuyor.
- `pnpm -w typecheck/lint/build/test` temiz.

## Required tests/checks
```
pnpm -w test   # plan şeması (plans/YYYY-MM.json zod); 10 öneri Topic alanları tam; denge kontrolü;
               # dosya-mod çıktısı Auto Routing ile plans'e route; QC eklentileri (eksik sourceBasis vb.)
pnpm -w typecheck && pnpm -w lint && pnpm -w build
# manuel: API key client bundle'da değil (yalnız local .env)
```

## Commit message suggestion
```
feat(studio): monthly editorial planning (candidate pool, scoring, 10-plan, two modes)
```

## Risks / gotchas
- **API key sızıntısı** — yalnız local `.env`; public/client bundle'a koyma (§25/§29).
- **Trend uydurma yasak** (§25) — kaynak yoksa kullanıcı notları + içerik haritası + backlog.
- **Studio karar verici değil** — önerir/gerekçelendirir; kullanıcı seçer.
- Spam üretimine kayma — plan önerir, otomatik yazı üretmez (§4).
- `plans` şemasını yeniden tanımlama — content-core'dan (WP-03) import.

## Handoff to next package
- **WP-12 (Resume/Portfolio/PDF)** son içerik-domaini ekler.
- Handoff notu: "Monthly Plan modülü çalışıyor: 25–40 aday → dengeli 10 plan → plans/YYYY-MM.json; iki mod (API local + dosya/Auto Routing); QC eklentileri; Studio önerir, kullanıcı seçer."

## Claude Code start prompt
```
Sen kıdemli bir full-stack engineer'sın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) Monthly Editorial Planning modülünü kuracaksın. WP-06 (Studio), WP-03 (plans/Topic/scores şeması), WP-09 (Auto Routing — dosya-mod import) hazır.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §25 (Monthly Editorial Planning tümü), §9 (plans schema + Topic + scores), §26 (file-mode import), §4 (spam değil, API zorunlu değil), §32 Faz 9
- docs/work-packages/WP-11-monthly-planning.md → tam kapsam
- CLAUDE.md, .wolf/OPENWOLF.md (+ cerebrum, buglog); anatomy.md'ye bak

KAPSAM (yalnız bu, apps/studio + content/plans): girdi analizi (önceki yazılar/seriler/yarım konular/_ideas backlog/kategori-tag dağılımı/tekrar riski/okuyucu yolculuğu/kullanıcı notları); 25–40 aday havuzu; skorlama (relevance/seriesFit/novelty/riskOfRepetition/seoPotential/geoPotential/difficulty/estimatedEffort/visualPotential/suggestedPublishWeek) → 10'luk plan; her öneri §9 Topic alanları tam; denge zorunlu (zorluk/kategori/seri yığılmaz); content/plans/YYYY-MM.json'a kaydet (content-core şeması); iki mod (local LLM API key → doğrudan; API yok → dosya-tabanlı Claude prompt + Auto Routing import; API key YALNIZ local .env); UI (ay→hedef→aday filtre→haftalık 10 plan→onayla/aktar + regenerate/replace similar/make more technical/beginner-friendly/continue series/avoid topic + "neden önerildi?"); seçim → _ideas/series/articles/brief/outline akışı; QC (tekrar riski/denge/dağılım/eksik sourceBasis). Studio ÖNERİR, kullanıcı seçer. Trend UYDURMA.

YAPMA: otomatik içerik üretimi/spam; API key'i client/public bundle'a koyma; Resume/Portfolio (WP-12); yeni public web özelliği; studio deploy; plans şemasını yeniden tanımlama.

BİTİRİNCE: pnpm -w test + typecheck/lint/build temiz; API key client bundle'da değil. anatomy.md/memory.md (+buglog) güncelle. Commit: `feat(studio): monthly editorial planning (...)`. 5 satır özet + WP-12'nin başlayabileceğini belirt.
```
