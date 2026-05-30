# WP-12 — Resume / Portfolio / CV PDF

## Title
Resume / Portfolio: resume.json (visibility) + /cv + /cv/print + Playwright PDF + Case-Study (Faz 9b)

## Purpose
CV/portfolio yarımını kurmak: `resume.json` ({tr,en}) **visibility modeli** (public/pdf/private) ile; premium profil-stili `/[lang]/cv` (görünürlük-filtreli) + `/[lang]/cv/print`; Studio'da Playwright ile `/cv/print → PDF`; ve case-study (`portfolio/<case-slug>/case.json`) + `/[lang]/work` + `/[lang]/work/<caseSlug>` premium okuma deneyimiyle.

## Why this package exists
Master plan §30 (Resume/Portfolio data standardı + Resume Update & Presentation) + §4 önceliği (5). Ürün "kişisel yayın + CV/portfolio sitesi" (§1); content sitesi canlı olduktan sonra CV/portfolio bu paketle eklenir. Hassas alanların (telefon/adres) public'e sızmaması kritik (§28/§29/§30).

## Depends on
- **WP-04** (`[lang]` layout + reading experience pattern'leri — `/cv` ve `/work/<case>` premium hissi).
- **WP-03** (`resume.json` / case-study şeması, visibility, `isPublic`).
- **WP-06** (Studio — Resume Studio modülü; Playwright PDF local).
- **WP-05 önerilir** (`/cv`, `/work` route'larına metadata).

## Inputs / context to read
- `nacianil-claude-code-prompt.md` → **§30** (resume/portfolio data + visibility + Resume Update & Presentation + bilinen düzeltmeler), **§21** (reading experience — case-study detayına uygulanır), **§20** (`/cv`,`/cv/print`,`/work`,`/work/<caseSlug>` route'ları), **§28/§29** (private alan sızıntısı yok), **§22** (a11y/perf), **§32 Faz 9**.
- **`content/resume/sources/README.md`** — mevcut kaynak envanteri, kariyer notları, **visibility önerileri** (foto/sertifika/diploma/ehliyet/askerlik); `resume.json` üretiminde **tek doğruluk kaynağı** (sources dosyaları + bu README).
- OpenWolf: `.wolf/anatomy.md`, `.wolf/cerebrum.md`, `.wolf/buglog.json`, `CLAUDE.md`.

### Mevcut kaynak envanteri (repo — WP-12 başlangıcında)

`content/resume/sources/` altında hazır dosyalar:

| Dosya / klasör | WP-12'de |
|----------------|----------|
| `my-photo.jpg` | `basics.photo` (**public**) |
| `naci-anil-akman-27V0.pdf` | Parse → ön-doldurma; güncel sayılmaz |
| `7-diploma/diploma.pdf` | `education[]` / `credentials[]` (**public** metin) |
| `8-sertifikalar/*.pdf` | Microsoft 20480/20483/20486 + BilgeAdam x2 → `credentials[]` (**public**) |
| `9-ehliyet-ve-kan-grubu/ehliyet.pdf` | `credentials[]` (**private** varsayılan) |
| `11-askerlik/askerlik.pdf` | `credentials[]` (**private** — web/PDF'e basılmaz) |

README'deki kariyer düzeltmeleri, Portal/Travel katkıları ve case-study adayları da `resume.json` + `portfolio/` üretiminde kullanılır. Ham PDF'ler public route'tan **doğrudan servis edilmez** — yalnız visibility-filtreli `resume.json` çıktısı.

## Files/folders likely to touch
```
content/resume/resume.json  content/resume/sources/  content/resume/portfolio/<case-slug>/case.json
apps/web/app/[lang]/cv/page.tsx           (görünürlük-filtreli, profil-stili)
apps/web/app/[lang]/cv/print/page.tsx     (PDF kaynağı)
apps/web/app/[lang]/work/page.tsx  work/[caseSlug]/page.tsx  (case-study, premium reading)
apps/studio/.../resume/ (Resume Studio: parse sources → needsReview; düzenleme; Playwright /cv/print → PDF)
packages/content-core/ (resume/case-study şeması zaten WP-03; visibility filtre helper)
```

## Explicit non-goals (bu pakette YAPILMAYACAK)
- **DB / üyelik YOK** (§4). resume = JSON, Git'te.
- **Private alanların public/PDF'e otomatik basılması YOK** (§30: telefon/adres varsayılan `private`).
- **Bilgi uydurma YOK** (§30) — yıl net değilse `needsReview`.
- **Studio deploy YOK**; **PDF yalnız local Studio Playwright** (§30/§31).
- **Yeni SEO altyapısı YOK** → WP-05 pattern'leri kullanılır (CV/work metadata eklenir).
- Monthly Plan / Visual Studio değişikliği **YOK**.

## Implementation steps
1. **`resume.json` şeması (§30, content-core WP-03)**: `basics{name,title,summary,photo,location?}`, `contact{...}`, `experience[]`, `education[]`, `skills[]`, `projects[]`, `links[]`, **`credentials[]`** (sertifika/diploma/belge; `sourcePath?`, `visibility`) — {tr,en}.
2. **Visibility modeli (§30)**: hassas alan/`contact` öğesi `visibility: "public"|"pdf"|"private"`. `public`=web+PDF; `pdf`=yalnız PDF; `private`=hiçbir çıktıda. **Telefon/adres varsayılan `private`** (gerekirse yalnız `pdf`). Hiçbir gizli alan public'e otomatik basılmaz.
3. **Sources → `resume.json` (§30, zorunlu)**: `content/resume/sources/` + **`sources/README.md`** envanter ve visibility notlarına göre ilk `resume.json` üret. İçerik: `my-photo.jpg` → `basics.photo`; diploma + Microsoft/BilgeAdam sertifikaları → `credentials[]`/`education[]` (**public**); ehliyet + askerlik → `credentials[]` (**private**); eski CV PDF → parse/ön-doldurma only. Güncel kabul edilmez → **`needsReview`** işaretle; belirsiz tarih **uydurma**.
4. **Bilinen düzeltmeler (§30, kullanıcı doğrulamasıyla)**: Digitallica "present" değil; Kansuk Şubat bitti → Mart Eroğlu Global Holding başladı; eksikse ekle; **yıl net değilse `needsReview`, uydurma yok**.
5. **`/[lang]/cv` (§30)**: görünürlük-filtreli; salt liste değil **kişisel profil sayfası** (premium/sade/güçlü; .NET/React full-stack, kurumsal portal/dashboard, AI/API entegrasyon vurgulu). Reading experience pattern'leri (§21).
6. **`/[lang]/cv/print`**: PDF kaynağı (public+pdf görünür alanlar).
7. **PDF (§30/§31)**: Studio'da **Playwright** ile `/cv/print → PDF` (yalnız local). Aynı güncel `resume.json`'dan.
8. **Case-study (§30)**: `portfolio/<case-slug>/case.json` ↔ `projects`; alanlar `problem, context, role, stack, constraints, solution, impact, assets[]`. `/[lang]/work` + `/[lang]/work/<caseSlug>` premium reading (§21).
9. **Resume Studio modülü**: parse/needsReview/düzenleme + PDF üret.
10. **SEO**: `/cv`,`/work` route'larına WP-05 pattern'leriyle metadata (canonical/hreflang/JSON-LD Person/BreadcrumbList).
11. **Sızıntı testi**: private alan hiçbir public yüzeyde yok (response/HTML/JSON-LD/sitemap/OG). **Doğrula** + OpenWolf.

## Acceptance criteria
- `resume.json` {tr,en} §30 yapısında; **`basics.photo`** (`my-photo.jpg`); **`credentials[]`** diploma/sertifikalar (public) + ehliyet/askerlik (private, public yüzeyde yok); visibility çalışıyor; **telefon/adres varsayılan private**.
- `/[lang]/cv` görünürlük-filtreli, profil-stili premium sayfa; `/[lang]/cv/print` PDF kaynağı.
- **Private alan hiçbir public yüzeyde yok**; `pdf` yalnız PDF'te; `public` web+PDF (test ile kanıtlı).
- PDF Studio'da Playwright ile `/cv/print`'ten üretiliyor (local), güncel `resume.json`'dan.
- Case-study: `case.json` + `/[lang]/work` + `/[lang]/work/<caseSlug>` premium reading.
- `sources/` parse → `needsReview` işaretleme; bilinen düzeltmeler uygulanmış; **uydurma yok** (belirsiz yıl → needsReview).
- `/cv`,`/work` SEO metadata (Person/BreadcrumbList) WP-05 pattern'leriyle.
- `pnpm -w typecheck/lint/build/test` temiz.

## Required tests/checks
```
pnpm -w test   # visibility filtre: private hiçbir public yüzeyde yok; pdf yalnız PDF; public web+PDF
               # resume.json zod; case.json zod; needsReview işaretleme
pnpm -w build
# Studio: Playwright /cv/print → PDF üretir (local); PDF güncel resume.json'dan
# manuel: /tr/cv, /en/cv, /tr/work/<case> premium render; private alan HTML/JSON-LD/sitemap'te yok
```

## Commit message suggestion
```
feat: resume/portfolio + cv (visibility-filtered) + cv/print + playwright pdf + case-study
```

## Risks / gotchas
- **Private alan sızıntısı = kritik** (§28/§29/§30): telefon/adres varsayılan `private`; hiçbir public yüzeye otomatik basma. Sızıntı testi şart.
- **Uydurma yasak** (§30): belirsiz yıl/şirket → `needsReview`, placeholder; doldurma değil.
- **PDF yalnız local Studio Playwright** (§31) — Vercel'de PDF üretme.
- CV salt liste değil **profil sayfası** (§30) — premium his (§7/§21).
- resume/case şemasını yeniden tanımlama — content-core'dan (WP-03).
- `/cv`,`/work` route'larını WP-04/05'te değil **burada** oluştur (INDEX §6 notu).

## Handoff to next package
- **WP-13 (Deploy Docs + Smoke)** tüm sistemi belgeleyip canlıya alır ve smoke testler.
- Handoff notu: "Resume/Portfolio tamam: resume.json (visibility) + /cv + /cv/print + Playwright PDF + case-study (/work). Private alan sızmıyor; uydurma yok (needsReview). Tüm içerik domainleri hazır → WP-13 deploy + README."

## Claude Code start prompt
```
Sen kıdemli bir full-stack engineer'sın. OpenWolf-yönetimli nacianil.com repo'sunda (C:\dev\nacianilcom) Resume/Portfolio + CV PDF kuracaksın. WP-04 (reading experience), WP-03 (resume/case şeması + visibility), WP-06 (Studio), WP-05 (SEO pattern) hazır.

ÖNCE OKU:
- nacianil-claude-code-prompt.md → §30 (resume/portfolio + visibility + Resume Update & Presentation + bilinen düzeltmeler), §21 (reading experience → case-study), §20 (/cv,/cv/print,/work,/work/<caseSlug>), §28/§29 (private sızıntı yok), §22, §32 Faz 9
- docs/work-packages/WP-12-resume-portfolio.md → tam kapsam
- **content/resume/sources/README.md** → envanter + visibility + kariyer notları
- CLAUDE.md, .wolf/OPENWOLF.md (+ cerebrum, buglog); anatomy.md'ye bak

**KAYNAK → resume.json (zorunlu):** `content/resume/sources/` altında `my-photo.jpg`, diploma, Microsoft/BilgeAdam sertifikaları, ehliyet ve askerlik PDF'leri var; **`sources/README.md` envanter + visibility notlarına göre `resume.json` üret** (foto public; sertifika/diploma public metin; ehliyet/askerlik private; ham PDF public route'tan servis edilmez).

KAPSAM (yalnız bu): resume.json {tr,en} (§30 yapı + credentials[]; content-core şeması); visibility public/pdf/private (telefon/adres varsayılan private; gizli alan public'e otomatik basılmaz); sources/ + README → resume.json (parse/ön-doldurma + needsReview; güncel kabul edilmez); bilinen düzeltmeler (Digitallica present değil; Kansuk Şubat bitti → Mart Eroğlu Global Holding; belirsiz yıl → needsReview, UYDURMA YOK); /[lang]/cv (görünürlük-filtreli, profil-stili premium, .NET/React + portal/dashboard + AI/API vurgulu); /[lang]/cv/print (PDF kaynağı); Studio Playwright /cv/print → PDF (LOCAL, güncel resume.json'dan); case-study portfolio/<case-slug>/case.json (problem/context/role/stack/constraints/solution/impact/assets) + /[lang]/work + /[lang]/work/<caseSlug> premium reading; /cv,/work SEO metadata (Person/BreadcrumbList) WP-05 pattern'leriyle; sızıntı testi (private hiçbir public yüzeyde yok).

YAPMA: DB/üyelik; private alanı public/PDF'e otomatik basma; bilgi uydurma; PDF'i Vercel'de üretme (yalnız local Studio); yeni SEO altyapısı (WP-05 pattern kullan); Monthly Plan/Visual değişikliği; studio deploy; şemayı yeniden tanımlama.

BİTİRİNCE: pnpm -w test (visibility + zod + needsReview) + build temiz; Playwright PDF local üretir; private alan HTML/JSON-LD/sitemap'te yok. anatomy.md/memory.md (+buglog) güncelle. Commit: `feat: resume/portfolio + cv (visibility-filtered) + cv/print + playwright pdf + case-study`. 5 satır özet + WP-13'ün başlayabileceğini belirt.
```
