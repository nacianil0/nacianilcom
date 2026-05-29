# WP-10 — Visual Studio

## Title
Visual Studio: Mermaid .mmd→.svg + SVG Sanitize + Visual-block Validate + Asset Size (Faz 8)

## Purpose
Studio'da görsel üretim hattını kurmak: Mermaid `.mmd → .svg` local render + **zorunlu SVG sanitize** (§15), visual-block doğrulama (node/step limitleri, mobil reflow, zorunlu `title/caption/alt/source`), ve asset boyut uyarısı (§22). Web yalnız commit edilmiş SVG'yi okur (WP-04); bu paket o SVG'yi **güvenle üretir**.

## Why this package exists
Master plan §15 (Visual-block Production Standard + SVG Sanitization) + §2/§31 (Mermaid build kısıtı: Vercel'de headless browser yok → Studio local render + sanitize + commit). WP-04'te visual-block presentational bileşenleri ve SVG **render** vardı; bu paket diyagramların **authoring + sanitize + validate** tarafını ekler. SVG sanitize bir güvenlik gerekliliğidir (§29) ve CSP yerine geçmez.

## Depends on
- **WP-06** (Studio shell).
- **WP-03** (visual-block validation + "SVG sanitize failure → blocking" QC kuralı; "referanslı `.svg` yok → blocking").
- **WP-04** (web SVG render + presentational bileşenler Comparison/LayeredModel/Pyramid).
- **WP-09 önerilir** (router `visual`/`diagram` çıktısını `diagrams/`/`images/`'a yönlendirir).

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§15** (visual-block standard, MVP scope, **SVG Sanitization zorunlu**), **§16** (technical-writing bileşenleriyle ilişki), **§22** (asset boyut/a11y), **§29** (SVG sanitize güvenlik, CSP'den ayrı), **§2/§31** (Mermaid local build), **§32 Faz 8**.
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `.wolf/buglog.json`, `CLAUDE.md`.

## Files/folders likely to touch
```
apps/studio/server/ (mmd→svg render [local headless], SVG sanitize, asset boyut)
apps/studio/web/ (Visual Studio UI: diyagram üret/önizle/sanitize/commit; visual-block validate raporu)
packages/content-core/qc/ (SVG sanitize failure + visual-block alt/title/caption/source blocking kurallarını bağla)
content/series/.../diagrams/*.mmd  diagrams/*.svg   (sanitize edilmiş çıktı, commit)
content/series/.../images/*        (asset boyut kontrolü)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **9 görsel türünün hepsini custom React component yapma YOK** (§15 MVP): custom = Comparison/LayeredModel/Pyramid/editorial (bunlar zaten WP-04'te presentational); **Flow/Cycle/Timeline/ConceptMap = Mermaid**.
- **Web render değişikliği YOK** → WP-04 zaten commit edilmiş SVG'yi okuyor.
- **AI image üretimi YOK** (§6: cover opsiyonel, OG `next/og`).
- **Studio deploy YOK** (§28).
- Web tarafında Mermaid render etme (Vercel'de headless yok, §31).

## Implementation steps
1. **`.mmd → .svg` render (local, §2/§15/§31)**: Studio'da headless render (web'de değil). Çıktı `diagrams/*.svg`.
2. **SVG Sanitization (zorunlu, §15/§29)**: commit'ten **önce** sanitize. `<script>`, event handler attribute'ları (`onload`/`onclick`/…), external resource referansı, `foreignObject` **yasak**/whitelist. Yalnız sanitize edilmiş içerik commit edilir. **Sanitize failure → published'da blocking QC** (content-core kuralına bağla).
3. **Visual-block validate (§15)**: yazı başına ≤3–4 blok; blok başına ≤~7 node/step (warning/limit); mobil reflow + responsive `viewBox` (taşma → warning); metin seçilebilir; light token (ink + bordo + nötr); gradient/gökkuşağı/AI-infografik yok. **`title/caption/alt/source` zorunlu** (published blocking, draft warning).
4. **MVP scope (§15)**: custom = Comparison/LayeredModel/Pyramid/editorial (WP-04 presentational); Flow/Cycle/Timeline/ConceptMap = Mermaid. 9 tür kavramsal rehber.
5. **Asset boyut (§22)**: büyük asset → warning (cover 16:9 min 1600×900; OG 1200×630 — OG üretimi WP-05).
6. **Studio Visual Studio UI**: diyagram üret → önizle → sanitize → visual-block validate → commit. Router (WP-09) `visual`/`diagram` çıktısını buraya bağlar.
7. **QC entegrasyonu**: content-core `runQC`'deki "SVG sanitize failure → blocking" ve "referanslı `.svg` yok → blocking" kurallarını gerçek sanitize/var-yok kontrolüne bağla.
8. **Testler** (sanitize: script/onload/foreignObject/external ref temizleniyor/reddediliyor) + OpenWolf güncelle.

## Acceptance criteria
- Studio `.mmd`'den `.svg` üretiyor (local); web'de Mermaid render edilmiyor.
- Üretilen SVG **sanitize ediliyor**: `<script>`, event handler, external ref, `foreignObject` temizleniyor/reddediliyor; yalnız sanitize edilmiş SVG commit'leniyor.
- **SVG sanitize failure → published blocking QC**; referanslı `.svg` yoksa blocking.
- Visual-block validate: ≤3–4 blok/yazı, ≤~7 node/blok, mobil reflow/viewBox, `title/caption/alt/source` (published blocking) kontrol ediliyor.
- MVP scope doğru: Flow/Cycle/Timeline/ConceptMap Mermaid; Comparison/LayeredModel/Pyramid custom (WP-04).
- Büyük asset → warning.
- `pnpm -w typecheck/lint/build/test` temiz.

## Required tests/checks
```
pnpm -w test   # SVG sanitize: <script>/onload/onclick/foreignObject/external-ref temizlenir veya reddedilir;
               # visual-block: alt/title/caption/source eksik → published blocking; node/blok limit aşımı → warning;
               # referanslı .svg yok → blocking
pnpm -w typecheck && pnpm -w lint && pnpm -w build
```

## Commit message suggestion
```
feat(studio): visual studio (mermaid mmd→svg, mandatory svg sanitize, visual-block validate, asset size)
```

## Risks / gotchas
- **SVG sanitize CSP yerine geçmez ve ayrıca zorunludur** (§15/§29) — atlama.
- Web'de Mermaid render etmeye çalışma — Vercel'de headless browser yok (§31); render Studio'da.
- 9 türün hepsini custom yapmaya çalışma — MVP scope (§15): 4'ü Mermaid.
- Sanitize'ı commit'ten **sonra** yapma — önce sanitize, sonra commit.
- `title/caption/alt/source` published'da blocking — eksikse publish'i bloklamalı.

## Handoff to next package
- **WP-11 (Monthly Plan)** ve **WP-12 (Resume/Portfolio)** Studio modülleri olarak eklenir; görsel hattı artık hazır.
- Handoff notu: "Visual Studio çalışıyor: mmd→svg + zorunlu sanitize + visual-block validate + asset boyut; QC kuralları bağlı. Flow/Cycle/Timeline/ConceptMap Mermaid; custom bloklar WP-04'te."

## Claude Code start prompt
```
Sen kıdemli bir full-stack engineer'sın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) Visual Studio'yu kuracaksın. WP-06 (Studio shell), WP-03 (visual-block QC kuralları), WP-04 (web SVG render + presentational bloklar) hazır; WP-09 router visual/diagram hedefini sağlıyor.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §15 (visual-block standard + MVP scope + SVG Sanitization ZORUNLU), §16, §22 (asset boyut), §29 (SVG sanitize güvenlik, CSP'den ayrı), §2/§31 (Mermaid local build), §32 Faz 8
- docs/work-packages/WP-10-visual-studio.md → tam kapsam
- CLAUDE.md, .wolf/OPENWOLF.md (+ cerebrum, buglog); anatomy.md'ye bak

KAPSAM (yalnız bu, apps/studio + content-core/qc): .mmd→.svg local render (web'de DEĞİL); SVG sanitize commit'ten ÖNCE (<script>/event handler/external ref/foreignObject yasak/whitelist; yalnız sanitize edilmiş commit); sanitize failure → published blocking QC + referanslı .svg yok → blocking (content-core kurallarına bağla); visual-block validate (≤3-4 blok/yazı, ≤~7 node/blok, mobil reflow/viewBox, title/caption/alt/source published blocking); MVP scope (Flow/Cycle/Timeline/ConceptMap=Mermaid; Comparison/LayeredModel/Pyramid custom=WP-04); asset boyut warning; Visual Studio UI (üret→önizle→sanitize→validate→commit).

YAPMA: 9 türü custom React yapma; web'de Mermaid render; AI image üretimi; studio deploy; web render değişikliği (WP-04 zaten okur).

BİTİRİNCE: pnpm -w test (sanitize + visual-block kuralları) + typecheck/lint/build temiz. anatomy.md/memory.md (+buglog) güncelle. Commit: `feat(studio): visual studio (...)`. 5 satır özet + WP-11'in başlayabileceğini belirt.
```
