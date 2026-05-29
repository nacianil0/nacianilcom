# WP-02 — Design System + Reference + UI Components + i18n

## Title
Design System + Announcement Reference + Technical-Writing Components + UI i18n (Faz 1)

## Purpose
Premium, **light-only**, editorial tasarım dilini kurmak: design token'lar, self-host fontlar, technical-writing bileşenleri (§16), `packages/ui` framework-light çekirdeği + ince Next/Vite wrapper'lar (§3), UI string i18n (§23), ve `<DASHBOARD_PATH>` referansından çıkarılan `docs/design-reference.md`.

## Why this package exists
nacianil.com "çalışan demo değil, gerçek premium ürün" hissi vermeli (§7). Bunun için tutarlı token + bileşen sistemi WP-04'ten (public reading) **önce** kurulmalı. Ayrıca `packages/ui`'nin framework-light olması (§3) iki ortamda (web RSC + studio Vite) çalışmanın ön koşulu — bu mimari karar burada hayata geçer.

## Depends on
- **WP-01** (monorepo iskeleti, boş `packages/ui`, boş `apps/*/messages/{tr,en}.json`).
- **ZORUNLU ÖN KOŞUL: `<DASHBOARD_PATH>`** çözülmüş olmalı (aşağıda).

## Resolved prerequisites (bu workspace)

| Sabit | Değer |
|---|---|
| **`<DASHBOARD_PATH>`** | `C:\Users\anil.akman\source\repos\Portal` |
| **Announcement detail (§5 UX referansı)** | `Eroglu.HR.UI\UI\src\page\Dashboard\AnnouncementDetailPage.tsx` (Portal repo köküne göre) |

İlgili bileşenler (esinlenme; kopyalama yok): `dashboard/components/AnnouncementCoverFrame.tsx`, `dashboard/components/SanitizedAnnouncementHtml.tsx`.

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§3** (platform constraints / framework-light), **§5** (tokenlar + announcement reference), **§6** (cover), **§7** (premium UX), **§16** (technical-writing bileşenleri), **§22** (a11y/perf), **§23** (UI i18n), **§32 Faz 1**.
- **`<DASHBOARD_PATH>`** altındaki portal dashboard — özellikle **duyuru (announcement) detay/view ekranı**.
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md` (Do-Not-Repeat), `CLAUDE.md`.

## Files/folders likely to touch
```
docs/design-reference.md            (Faz 1 çıktısı)
packages/ui/                        (tokens, fonts, framework-light bileşen çekirdeği)
  ui/tokens/ (CSS variables, Tailwind preset — light-only)
  ui/components/ (Callout, Definition, Example, Warning, Takeaway, CodeBlock)
  ui/primitives/ (framework-light Link/Image/Text soyutlamaları — §3)
apps/web/.../ (next/font/local self-host + Next wrapper'lar: web-only Link/Image)
apps/studio/.../ (Vite wrapper'lar: <a>/<img> saran studio-only)
apps/web/messages/{tr,en}.json  apps/studio/messages/{tr,en}.json  (§23)
packages/content-core/ (paylaşılan i18n tipleri — yalnız tip, gerekirse)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **Visual-block presentational bileşenleri (Comparison/LayeredModel/Pyramid) YOK** — onlar WP-04'te (render bağlamında).
- Mermaid pipeline / SVG sanitize **YOK** (WP-10).
- Gerçek route, sayfa, reading layout **YOK** (WP-04).
- zod şema / QC / `buildUrl` **YOK** (WP-03).
- Dark theme **YOK** ve eklenmeyecek (§5: tek tema; `prefers-color-scheme` dark override etmez).
- Dashboard'dan kod/component/class/layout/içerik **kopyalama YOK** — yalnız görsel/UX esinlenme.

## Implementation steps
1. **`<DASHBOARD_PATH>` kontrolü**: bulunamıyorsa **DUR ve tek soru sor** (master plan §5/§32 Faz 1 — bu referans zorunlu, soft fallback yok). Bulunduysa announcement detail/view ekranını incele.
2. **`docs/design-reference.md`** yaz: alınan prensipler (spacing, başlık hiyerarşisi, cover kullanımı, metadata yerleşimi, kart-ayraç dili, "başlık önü ince dikey bordo çizgi" motifi), **bilinçli kopyalanmayanlar**, article detail / seri landing / case-study'ye uyarlama.
3. **Token'lar (§5, light-only)**: zemin `#F7F5F2`, kart `#FCFBF9`, hairline `#E8E3DC`, metin `#1B1A18`, ikincil `#625D56` (AA ≥4.5:1), aksan bordo `~#9B2335`, pozitif `#3F7A52`, negatif `#A23B2E`. CSS variables + Tailwind preset. **Kontrast kuralı**: normal body/secondary ≥ 4.5:1.
4. **Tipografi**: başlık serif (Newsreader/Source Serif 4/Lora), gövde sans (Inter/Geist), kod mono (JetBrains Mono). UPPERCASE harf-aralıklı kategori/etiket. **Self-host** (`next/font/local` web tarafında; SIL OFL; lisans README'ye not).
5. **Framework-light çekirdek (§3)**: `packages/ui` içine `next/link|image|font` **GİRMEZ**. Çekirdek bileşenler düz prop alır; web tarafında `next/link`/`next/image` saran ince wrapper, studio tarafında `<a>`/`<img>` saran ince wrapper.
6. **Technical-writing bileşenleri (§16)**: `Callout`, `Definition`, `Example`, `Warning`, `Takeaway`, `CodeBlock`. `CodeBlock`: **dil etiketi zorunlu**, pseudo-code işaretlenir, mobil taşmada blok kayar (sayfa değil), erişilebilir **copy button**. `Definition` ilk teknik terim için.
7. **UI i18n (§23)**: `apps/{web,studio}/messages/{tr,en}.json` — "Okuma süresi", "Önceki/Sonraki yazı", "Kaynakça", "Serideki konum", "Yayın tarihi", "Güncellendi", "CV", "Projeler". Tarih/sayı/reading-time `Intl` ile locale formatı. Paylaşılan tipler content-core'da (yalnız tip).
8. **Premium UX çıtası (§7/§22)**: bilinçli boşluk, tipografi hiyerarşisi, yumuşak köşe (~14px), hairline ayraç, focus state, `prefers-reduced-motion`, semantic HTML. Emoji/klişe/pazarlama dili yok.
9. **Doğrula** + OpenWolf güncelle (anatomy/memory).

## Acceptance criteria
- `docs/design-reference.md` mevcut; alınan/alınmayan prensipler + article'a uyarlama net.
- Light-only token seti CSS variables + Tailwind preset olarak çalışıyor; **dark override yok**.
- Tüm normal metin kontrastı ≥ 4.5:1 (özellikle ikincil `#625D56`).
- Technical-writing bileşenleri (`Callout/Definition/Example/Warning/Takeaway/CodeBlock`) render ediliyor; `CodeBlock` dil etiketi + copy button + mobil yatay kaydırma destekliyor.
- `packages/ui` içinde `next/*` import'u **yok** (framework-light kanıtı); web ve studio wrapper'ları ayrı.
- `messages/{tr,en}.json` (web + studio) anahtarları örtüşüyor; `Intl` ile tarih/sayı formatı.
- `pnpm -w typecheck/lint/build` temiz.

## Required tests/checks
```
pnpm -w typecheck && pnpm -w lint && pnpm -w build
# Manuel/araç: kontrast kontrolü (≥4.5:1), packages/ui içinde `next/` grep → 0 sonuç
# (varsa) bileşenlerin render snapshot / Storybook-light kontrolü
```

## Commit message suggestion
```
feat(ui): design system + technical-writing components + i18n + design-reference
```

## Risks / gotchas
- **`<DASHBOARD_PATH>` yoksa BAŞLAMA** — soft fallback yok; tek soru sor.
- `packages/ui`'ye yanlışlıkla `next/link|image|font` sızdırma — framework-light ihlali olur (§3); CI/grep ile koru.
- Dark theme ekleme isteğine direnme — tek tema kararı sabit (§5).
- Kontrastı estetik için düşürme; AA zorunlu (§5/§22).
- Font lisansı yalnız SIL OFL; lisans notu README'ye (WP-13).

## Handoff to next package
- **WP-04 (Public Reading)** artık token + technical-writing bileşenleri + wrapper'ları kullanabilir; visual-block presentational bileşenlerini WP-04 ekleyecek.
- **WP-06 (Studio)** preview için aynı framework-light çekirdeği + Vite wrapper'ları kullanır.
- Handoff notu: "design tokens + §16 bileşenleri + messages hazır; ui framework-light (next/* yok); design-reference.md yazıldı."

## Claude Code start prompt
```
Sen kıdemli bir full-stack engineer + UI mühendisisin. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) tasarım sistemini kuracaksın. Monorepo iskeleti (WP-01) hazır.

ÖN KOŞUL: <DASHBOARD_PATH> = "C:\Users\anil.akman\source\repos\Portal" — duyuru detay: Eroglu.HR.UI\UI\src\page\Dashboard\AnnouncementDetailPage.tsx. Bu yol erişilemezse DUR ve bana sor — soft fallback yok.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §3, §5, §6, §7, §16, §22, §23, §32 Faz 1
- docs/work-packages/WP-02-design-system.md → tam kapsam
- CLAUDE.md, .wolf/OPENWOLF.md → OpenWolf protokolü (+ .wolf/cerebrum.md Do-Not-Repeat)
- <DASHBOARD_PATH> → duyuru (announcement) detay/view ekranı (yalnız görsel/UX esinlenme; KOD KOPYALAMA YOK)

KAPSAM (yalnız bu): docs/design-reference.md; light-only token'lar (§5 renkler, AA ≥4.5:1, dark theme YOK); serif/sans/mono self-host font (SIL OFL); packages/ui framework-light çekirdek (next/link|image|font GİRMEZ) + web Next wrapper + studio Vite wrapper (§3); technical-writing bileşenleri Callout/Definition/Example/Warning/Takeaway/CodeBlock (§16, CodeBlock dil etiketi + copy button + mobil kaydırma); UI i18n apps/{web,studio}/messages/{tr,en}.json (§23) + Intl format.

YAPMA: visual-block bileşenleri (WP-04), route/sayfa (WP-04), zod/QC (WP-03), Mermaid/SVG (WP-10), dark theme.

BİTİRİNCE: pnpm -w typecheck/lint/build temiz; packages/ui içinde `next/` grep'i 0 sonuç. anatomy.md/memory.md güncelle. Commit: `feat(ui): design system + technical-writing components + i18n + design-reference`. 5 satır özet + WP-04'ün başlayabileceğini belirt.
```
