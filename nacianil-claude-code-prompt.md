# nacianil.com — Claude Code Master Prompt (v6 — cleanup)

> Bu dosyanın tamamını Claude Code'a tek seferde ver. Çalışma dizini olarak boş bir `nacianil/` klasörü aç.
> **`<DASHBOARD_PATH>` (bu workspace):** `C:\Users\anil.akman\source\repos\Portal` — zorunlu UX referansı (§5). Duyuru detay ekranı: `Eroglu.HR.UI/UI/src/page/Dashboard/AnnouncementDetailPage.tsx` (repo köküne göre). Başka makinede çalışıyorsan yolu güncelle; erişilemezse Faz 1 başlamadan dur.
> Voice & tone guide bu dosyada YOK. Yazar sesi ayrıca `content/STYLE.md` olarak sağlanacak; bu dosya **opsiyoneldir** (§19).

---

Sen kıdemli bir full-stack engineer'sın. `nacianil.com` için iki yarımdan oluşan bir sistem kuracaksın: (1) public bir kişisel yayın + CV/portfolio sitesi, (2) sadece localde çalışan bir authoring "studio". Bu brief'i baştan sona uygula.

# İÇİNDEKİLER

A. Proje & Kararlar — §0–§4
B. Tasarım — §5–§7
C. İçerik Modeli & Kontratlar — §8–§11
D. İçerik Standartları — §12–§18
E. Prompt Library — §19
F. Public Site — §20–§23
G. Studio — §24–§26
H. Publish & Güvenlik — §27–§29
I. Resume/Portfolio — §30
J. Teslim — §31–§34

---

# A. PROJE & KARARLAR

## §0. Çalışma biçimi (önce bunu oku)

- Otonom çalış. **Execution Plan**'i (§32) faz faz uygula. Her fazın sonunda `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w build` çalıştır; hepsi geçerse fazı commit et (Conventional Commits).
- Fazlar arasında onay bekleme. Sadece gerçek bir blocker olursa dur ve tek net soru sor (eksik secret/key veya `<DASHBOARD_PATH>` bulunamıyorsa).
- Her faz sonunda en fazla 5 satır durum özeti.
- Asla taslak/scheduled içeriği build çıktısına veya herhangi bir public response'a sızdırma.
- İçerikte ve UI metinlerinde emoji, klişe AI girişleri/sonuçları, pazarlama/motivasyon dili KULLANMA.

## §1. Ne kuruyoruz — ilkeler

- Blog değil, **1–10 bölümlük seri** yapısında akademik/essay tarzı yazılar. Her yazı tek başına okunur ama önceki/sonraki yazıya bağlanır.
- Diller: **TR + EN** (varsayılan TR). Teknik terim ilk geçtiği yerde sade açıklanır. Ton: akademik, sakin, güçlü.
- Public site: SEO + GEO/AEO, JSON-LD, sitemap, robots, RSS, canonical, hreflang, OG image, scheduled publish.
- Studio: localde çalışır, **public siteye dahil değildir**, dosyaları yönetir, preview + QC yapar, publish'i orkestre eder.
- Tasarım: premium, editorial, sakin, **light-only**. Neon, aşırı gradient, robot görseli, generic SaaS YASAK.

## §2. Teknoloji ve dağıtım kararları (sabit)

- **Monorepo**: `pnpm` workspaces, TypeScript, Node 20+.
- `apps/web` — **Next.js (App Router)**. Public'e deploy edilen tek şey. Host: **Vercel (Hobby)**.
- `apps/studio` — **Fastify + Vite + React**. Sadece local, `127.0.0.1` bind, asla deploy edilmez.
- `packages/content-core` — zod şemaları, parser, türetilen alanlar, QC, slug/URL/redirect/taxonomy/internal-link/isPublic yardımcıları. Web + Studio ortak.
- `packages/ui` — paylaşılan tasarım token'ları + MDX/visual-block/technical-writing bileşenlerinin **framework-light çekirdeği** (§3).
- İçerik = **MDX + JSON, Git'te versiyonlanır.** İçerik için DB YOK. Firebase/Firestore KULLANMA.
- Styling: **Tailwind CSS** (paylaşılan preset) + CSS variables. MDX: `next-mdx-remote/rsc` + `gray-matter` + zod.
- Mermaid: **Studio'da local `.mmd → .svg` render + sanitize + commit** (§15). Web statik SVG okur; Vercel build'inde headless browser yok.

## §3. Platform Constraints Resolution

Uygulama sırasında çelişki yaratmaması için netleştirilmiş teknik kararlar:

- **Studio preview "web ile birebir render" iddiası taşımaz; "fonksiyonel olarak eşdeğer preview" sunar.** Aynı design token'larını ve aynı MDX/visual-block/technical-writing bileşenlerinin **framework-light çekirdeğini** kullanır; ama Next RSC runtime ile birebir aynı pipeline olmak zorunda değildir.
- **`packages/ui` framework-light olur.** `next/link`, `next/image`, `next/font` gibi Next'e özel bağımlılıklar `packages/ui` içine GİRMEZ.
- **Web tarafı** Next adapter/wrapper kullanabilir (örn. `next/link`/`next/image`'i ui çekirdeğine saran ince web-only wrapper'lar).
- **Studio tarafı** Vite-compatible adapter/wrapper kullanabilir (örn. düz `<a>`/`<img>` saran ince studio-only wrapper'lar).
- Bu sayede aynı görsel/yapısal çekirdek iki ortamda da çalışır; runtime farkları wrapper katmanında izole edilir.

## §4. Non-goals / Scope Control (kapsam dışı)

İlk MVP'de **olmayacak**: database, kullanıcı üyeliği, yorum sistemi, newsletter (zorunlu değil), ödeme/premium, full CMS, public admin panel. AI metin/görsel üretim API entegrasyonu **zorunlu değil** (Monthly Plan'ın opsiyonel API modu hariç, §25). Studio **deploy edilmeyecek**. İçerik üretimi spam makinesi gibi çalışmayacak. **Branch stratejisi kapsam dışı.**

- **`content/standalone/` MVP'den çıkarılır → "reserved for future".** MVP **seri-first** çalışır; seriye girmeyen tekil essay için **public route YAPILMAZ**. (İleride eklenirse route + URL standardı ayrıca tanımlanır.)

**Öncelik:** (1) content model + file contracts, (2) public reading experience, (3) SEO/GEO + scheduled publish, (4) studio preview/QC + publish orchestration, (5) CV/portfolio.

### Future Scope Notes (MVP dışı)
- **Search** ileride static search index olarak düşünülebilir.
- **Analytics** ileride privacy-friendly (cookie-suz/anonim) olabilir.
- Aggressive tracking ve gereksiz cookie banner doğuracak çözümlerden kaçınılır.
- Monthly Plan / Auto-routing için **stateful KV/Redis** (nonce, distributed rate-limit, gerçek araştırma entegrasyonu) ileride opsiyonel (§29).

---

# B. TASARIM

## §5. Tasarım dili (design tokens) — light-only

Önce `<DASHBOARD_PATH>` altındaki referans projeyi incele; renk, tipografi, boşluk, kart/ayraç stilini ve "başlık önündeki ince dikey bordo çizgi" motifini **esinlen**. **Yapı/içerik KOPYALAMA.** Sonra şu tokenları uygula:

- **Renk (tek tema, light):** zemin `#F7F5F2`; kart yüzeyi `#FCFBF9`; hairline ayraç `#E8E3DC`; ana metin `#1B1A18`; **ikincil metin `#625D56`** (WCAG AA için koyulaştırıldı; sıcak zeminde ≥4.5:1); **aksan = derin editorial bordo `~#9B2335`**; pozitif `#3F7A52`; negatif `#A23B2E`.
- **Kontrast kuralı:** normal body/secondary metin **≥ 4.5:1**. Düşük kontrast yalnız büyük metin ve dekoratif metadata için kabul edilir; normal metinde kullanılmaz.
- **Dark theme YOK.** Tek tema; `prefers-color-scheme` dark override etmez.
- **Tipografi:** başlık/seri serif display (Newsreader / Source Serif 4 / Lora); gövde sans (Inter / Geist); kod mono (JetBrains Mono). Kategori/etiket küçük, harf aralıklı UPPERCASE.
- **Motifler:** başlık önü ince dikey bordo çizgi; hairline ayraçlar; yumuşak köşeli kartlar (~14px); bol whitespace; tablo-hizalı metadata.
- **Fontlar self-host** (`next/font/local`, web tarafında; §3 gereği `packages/ui` font bağımlılığı taşımaz); yalnız SIL OFL. Lisans README'de.
- **Mobil-first + responsive zorunlu.** Erişilebilirlik ≥ WCAG AA.

### Portal Announcement Detail Reference (zorunlu — soft fallback YOK)
- `<DASHBOARD_PATH>`'teki portal dashboard projesinde **duyurular (announcements)**, özellikle **duyuru detay/view ekranını** incele.
- Dashboard **yalnızca görsel/UX referansıdır**; kod/component/class/layout/içerik **birebir kopyalanmaz**. Amaç: premium okuma deneyimini, spacing/başlık hiyerarşisi/cover kullanımı/metadata yerleşimi/kart-ayraç dilini ve "premium ama abartısız" editorial hissi uyarlamak.
- nacianil.com **yazı detay, seri landing ve CV/case-study detayları** bu premium hissi taşır.
- Premium sadelik: gereksiz gölge, dekoratif placeholder, yapay gradient, aşırı ikon, glassmorphism, neon, generic blog görünümü YASAK.
- **`<DASHBOARD_PATH>` bulunamazsa Faz 1 BAŞLAMADAN dur ve tek soru sor.** Bu referans zorunludur.
- **Faz 1 çıktısı:** `docs/design-reference.md` — alınan prensipler, bilinçli kopyalanmayanlar, article detail'e uyarlama.

## §6. Cover Image Standard

- **OG görseli:** `next/og` `ImageResponse` ile template'ten otomatik (**1200×630**, §22). AI image API'ye bağımlı değil.
- **Kapak (in-page/card):** opsiyonel. `images/cover.*` varsa kullanılır (**16:9, min 1600×900**, §22); yoksa editorial template fallback.
- **Estetik:** sıcak açık arka plan, nötr tonlar, ince ayraç, kontrollü bordo aksan, temiz kompozisyon, bol boşluk.
- **Yasak:** çiğ/aşırı renk, neon, parlak gradient, kalabalık sahne, robot/stok-AI görseli, generic blog-thumbnail.

## §7. Product Polish & Premium UX Standard

- Public nacianil.com **çalışan demo değil, gerçek premium ürün** gibi hissettirir: bilinçli boşluk, tipografi, renk, kart, ayraç, geçiş, responsive, mikro etkileşim.
- UI asla çiğ/acele/template/generic-blog/"AI ile üretilmiş" hissi vermez.
- **Public:** güçlü, sakin, güven veren premium okuma. **Studio:** aynı görsel kalite + öncelik **user-friendly** (anlaşılır, hızlı, hataları net gösteren, pratik). Karmaşık CMS değil; preview/QC/görsel kontrol/CV/publish/plan akışını kolaylaştıran çalışma aracı.
- Bu standart her UI fazında geçerli kalite çıtasıdır.

---

# C. İÇERİK MODELİ & KONTRATLAR

## §8. Klasör yapısı

```
nacianil/
├─ apps/web/                    # Next.js — deploy edilen tek şey
├─ apps/studio/                 # Fastify + Vite/React — sadece local
│  └─ messages/{tr,en}.json     # UI string i18n (§23) — web de tüketir
├─ packages/content-core/       # zod + parser + qc + slug/url/redirect/taxonomy/links/isPublic
├─ packages/ui/                 # framework-light tokenlar + bileşen çekirdeği (§3)
├─ docs/design-reference.md     # Faz 1 çıktısı (§5)
├─ content/                     # SOURCE OF TRUTH (Git)
│  ├─ STYLE.md                  # OPSİYONEL yazar sesi
│  ├─ taxonomy.json             # category + tag sözlüğü (§17)
│  ├─ redirects.json            # permanent redirect tablosu (§20)
│  ├─ plans/YYYY-MM.json        # aylık editorial plan (§25)
│  ├─ _ideas/*.json             # fikir backlog'u
│  ├─ _inbox/                   # Auto Output Routing (§26)
│  │  └─ unresolved/            # ambiguous/failed çıktılar (Needs Review)
│  ├─ series/<series-slug>/
│  │  ├─ series.json
│  │  ├─ cover.* (ops.)
│  │  └─ articles/NN-<slug>/
│  │     ├─ meta.json
│  │     ├─ brief.md  outline.md  draft.tr.md  draft.en.md(ops.)
│  │     ├─ final.tr.mdx  final.en.mdx  references.json
│  │     ├─ diagrams/*.mmd   diagrams/*.svg   (sanitize edilmiş, §15)
│  │     └─ images/{*.prompt.md, cover.*(ops.), og.*(ops.)}
│  ├─ standalone/               # RESERVED FOR FUTURE — public route yok (§4)
│  └─ resume/{resume.json, sources/, portfolio/<case-slug>/}
├─ pnpm-workspace.yaml
└─ package.json
```

## §9. Content schema (kontrat — kod değil, alan tanımı)

`packages/content-core` içinde zod ile uygula.

**meta.json:** `id`, `series` (slug), `order` (1–10), `slugBase` (kebab-case; §20), `category` (tek primary — `taxonomy.json`'dan; §17), `tags[]` (kebab-case, ≤5; §17), `difficulty`, `status` (draft|scheduled|published), `publishDate` (ISO), `updatedDate?`, `schemaType` (Article|BlogPosting|TechArticle, default TechArticle), `contentType` (research|explainer|architecture|essay|cv|case-study; reference minimumunu etkiler §18), `languages` (('tr'|'en')[], min 1), `assets{cover,og,diagrams[]}`.

**.mdx frontmatter (her dil):** `title` (≤70), `description` (50–160), `summary`, `faq?[{q,a}]`.

**references.json:** `[{title, url?, author?, year?}]`. **series.json:** `slug`, `title{tr,en}`, `description{tr,en}`, `order`, `cover?`, `articleOrder[]`. **taxonomy.json:** `{categories:[{slug,label{tr,en},description?}], tags:[{slug,label{tr,en}}]}`. **redirects.json:** `[{from,to,permanent:true,reason?}]`.

**plans/YYYY-MM.json (§25):** `{month, targetCount(=10), editorialTheme?, candidatePool:[Topic], selected:[Topic], status, userDecisions[]}` — `Topic` = `{title, angle, whyNow, targetAudience, seriesFit, difficulty, estimatedReadingTime, suggestedPublishWeek, contentType, seoPotential, geoPotential, visualPotential, riskOfRepetition, requiredResearch, sourceBasis, nextAction, scores{relevance,seriesFit,novelty,riskOfRepetition,seoPotential,geoPotential,difficulty,estimatedEffort,visualPotential}}`.

**_inbox item (§26, discriminated):** `{kind, target, payload, source, createdAt, status}` — `kind` ∈ {monthlyPlan, idea, seriesPlan, brief, outline, finalMdx, visual, diagram, resume, caseStudy, seoQc, redirect}; `status` ∈ {detected, routed, needsReview, failed}.

**resume.json / case-study:** §30.

Türetilen (yazılmaz): `readingTime`, `prev`/`next`, `canonical`, `hreflang`, "seride kaçıncı". URL `slugBase`+dil+seri'den (`buildUrl`, §20).

### isPublic Truth Table (tek kaynak)

| status | publishDate | public? |
|---|---|---|
| draft | geçmiş/şimdi/gelecek | hayır |
| scheduled | gelecek | hayır |
| scheduled | şimdi veya geçmiş | evet |
| published | gelecek | hayır |
| published | şimdi veya geçmiş | evet |

Kural: `isPublic(meta, now) = meta.status !== 'draft' && new Date(meta.publishDate) <= now`. **Unit testlerle korunur** (§32).

## §10. File I/O Contracts

Roller: **CC** = Claude Code, **ST** = Studio, **U** = kullanıcı, **WEB** = sadece okur.

| Dosya | SoT | Üreten | ST | WEB | Publish zorunlu? |
|---|---|---|---|---|---|
| `_ideas/*.json` | — | CC/ST | düzenler | — | hayır |
| `plans/YYYY-MM.json` | ✅ | ST/CC | üretir/düzenler | — | hayır |
| `_inbox/*` | geçici | ST/CC | router | — | hayır |
| `series.json` | ✅ | CC | sıralama | okur | seride evet |
| `meta.json` | ✅ | CC | status/publishDate | okur | **evet** |
| `brief/outline/draft.*` | ✅/ara | CC | — | — | hayır |
| `final.tr.mdx` | ✅ | CC | bozmaz | okur | 'tr' varsa evet |
| `final.en.mdx` | ✅ | CC | bozmaz | okur | 'en' varsa evet |
| `references.json` | ✅ | CC | — | okur | contentType'a göre (§18) |
| `diagrams/*.mmd` | ✅ | CC | — | — | hayır |
| `diagrams/*.svg` | türetilmiş | ST (mmd→svg+sanitize) | render/sanitize/commit | okur | referanslıysa evet |
| `images/*` | ✅ | U/araç | — | okur | hayır (fallback) |
| `taxonomy.json` | ✅ | U/ST | düzenler | okur | evet (bütünlük) |
| `redirects.json` | ✅ | ST/U | önerir | config okur | hayır |
| `resume.json` | ✅ | CC/ST | düzenler | okur | CV için evet |
| `STYLE.md` | ✅ | U | — | — | hayır (opsiyonel) |

Kurallar:
- **SoT = dosya sistemi (Git).** Web yazmaz. ST, CC'nin final gövdesini bozmaz; sadece status/publishDate, svg, redirects, taxonomy, plans, inbox gibi alanlara dokunur.
- Eksik opsiyonel dosya sessizce yok sayılır.
- published'da eksik zorunlu dosya → build **FAIL**.
- Hatalı JSON/MDX → build **FAIL**; Studio publish öncesi gösterir.
- draft/scheduled ayrımı tek `isPublic(meta, now)` ile her yerde (build, list, sitemap, rss, route guard, redirect/internal-link hedef).

## §11. Content Lifecycle

`(monthly plan →) idea → series plan → brief → outline → draft.tr → final.tr.mdx → final.en.mdx → visual/diagram → references → SEO/QC → status=scheduled|published → Studio commit/push → Vercel build → explicit revalidate (§27)`

Aşamalar §10'daki dosyaları üretir; kontroller §18 (QC) + §17 (taxonomy/link) + §20 (slug/redirect/hreflang/canonical); blocking varsa durulur.

---

# D. İÇERİK STANDARTLARI

## §12. Article Length Standard
- Varsayılan 900–1.400 kelime / ~5–8 dk. Yoğun teknik üst sınır 1.800 / 8–10 dk. 2.200+ yalnız pillar/reference.
- 1.800+ ise: böl / visual-block ile sadeleştir / tekrarları çıkar değerlendirilir. Tek ana fikir; fazlası sonraki bölümlere.
- QC: hedef aşımı **warning**; 2.200+ **split önerisi** (warning).

## §13. TR/EN Adaptation Standard
Anlamı koruyan uyarlama: aynı ana fikir; başlık birebir değil ama arama niyeti+anlam uyumlu; **aynı `slugBase`**; summary/faq/captions/metadata tutarlı; doğru EN terim karşılıkları; içerik kaybı yok; canonical/hreflang karşılıklı. İlan edilen dilin `final.*.mdx`'i yoksa → **blocking**.

## §14. Series Consistency Rules
1–10 bölüm; her yazı tek başına okunur + serideki yerine bağlanır; tekrar yok; kavramsal ilerleme; ilk=bağlam, orta=derinlik, son=kapanış/köprü; landing yolculuğu gösterir; "seride nerede" türetilebilir. QC: order tekrarı/boşluğu, kopuk prev/next, `articleOrder`-klasör uyuşmazlığı → blocking.

## §15. Visual-block Production Standard

Amaç: kavramı sade/temiz/okunabilir görsele çevirmek; infografik şovu değil. Vektörel + seçilebilir.

- **Ne zaman:** çok adımlı süreç, katman, karşılaştırma, zaman çizgisi, döngü, hiyerarşi, neden-sonuç, kavram ağı metinle ağırlaşıyorsa. **Ne zaman değil:** basit fikir, anlam katmıyorsa, süs, veri/kaynak yoksa.
- **Limit:** yazı başına ≤3–4 blok; blok başına ≤~7 node/step.
- **Mobil:** reflow + responsive `viewBox`; uzun etiket sarılır. Taşma → warning.
- Metinler seçilebilir; light token (ink + bordo aksan + nötr); gradient/gökkuşağı/AI-infografik yok.
- **`title/caption/alt/source` zorunlu** (published blocking, draft warning).

### MVP implementation scope (rework riskini azalt)
- **MVP'de custom React/SVG öncelikli:** `Comparison`, `LayeredModel`, `Pyramid` ve `Callout`/`Definition` benzeri basit editorial bloklar.
- **`Flow`, `Cycle`, `Timeline`, `ConceptMap`** öncelikle **Mermaid `.mmd → .svg`** pipeline ile çözülür.
- 9 türün tamamını custom component olarak MVP'de yapmak **zorunlu değil**. 9 tür kavramsal rehber olarak kalır.

### SVG Sanitization (zorunlu)
- Mermaid veya başka araçla üretilen SVG'ler **commit edilmeden önce sanitize edilir**.
- SVG içinde `<script>`, event handler attribute'ları (`onload`, `onclick`, vb.), external resource referansı ve `foreignObject` **yasaktır** veya whitelist/sanitize edilir.
- Inline SVG kullanılacaksa yalnız sanitize edilmiş içerik kullanılır.
- **SVG sanitization failure → published içerikte blocking QC.**
- **CSP bu katmanın yerine geçmez; SVG sanitize ayrıca zorunludur** (§29).

## §16. Technical Writing Components
`packages/ui`'da: `Callout`, `Definition`, `Example`, `Warning`, `Takeaway`, `CodeBlock`. Süs değil, netleştirme için. Aşırı kullanım → QC warning. `CodeBlock`: **dil etiketi zorunlu** (yoksa blocking); **pseudo-code açıkça işaretli**; mobil taşma bloğu kaydırır (sayfayı değil); makul satır uzunluğu; erişilebilir **copy button**. `Definition` ilk teknik terim için.

## §17. Taxonomy & Internal Linking Standard
- `content/taxonomy.json` category+tag sözlüğü. Her yazı **1 primary category + ≤5 tag**. Bilinmeyen/eksik category → blocking. Tag kebab-case değilse veya >5 → blocking.
- **Internal linking:** mümkünse seri içinden ≥1 ve ilgili başka içerikten ≥1 doğal link. Kırık link → blocking; zayıf linkleme → warning. Amaç okuyucu yolculuğu, SEO spam değil. Hedef `isPublic`'e uyar.

### Internal Link Contract
- Prose içinde **çıplak hardcoded internal URL kullanılmaz.**
- Internal linkler **article id / series slug / case slug üzerinden çözülen bir MDX bileşeniyle** yazılır. Konsept: `<InternalLink kind="article" id="..." />` (veya `<InternalLink to="article-id" />`).
- Bu bileşen **`buildUrl()`** kullanır; elle URL string birleştirme yok.
- QC kırık internal linkleri **blocking** yakalar; scheduled/draft hedefe link → published'da **blocking**.
- External linkler normal markdown olabilir ama **`target`/`rel` güvenliği** (`rel="noopener noreferrer"`) uygulanır.

## §18. Content Quality Checklist (blocking vs warning)
Tek `runQC(article, now)` (content-core); build + Studio ortak. Rapor taxonomy/internal-link/slug/redirect/hreflang/canonical grubunu ayrı gösterir.

**BLOCKING:** hatalı JSON/MDX; `meta.json` zod fail; published'da eksik zorunlu dosya; `title` eksik/>70; `description` eksik; H1 yok/çoklu; JSON-LD geçersiz; ilan edilen dil eksik; visual-block alt/title/caption/source eksik (published); referans verilen `.svg` yok; **SVG sanitize failure**; published cover/og çözülmüyor; **sızıntı** (public set `isPublic=false` içeriyor); emoji; bilinmeyen category / kebab-olmayan tag / >5 tag; **kırık internal link / scheduled-draft hedefe link**; kod bloğunda dil etiketi yok; slug geçersiz; redirect loop; redirect/internal-link hedefi public değil; open redirect.
- **References:** `contentType` research/explainer/architecture (bilgi iddiası içeren) veya `schemaType=TechArticle` ise **0 referans blocking**.

**WARNING:** description 50–160 dışı; uzunluk aşımı (2.200+ split); TR/EN heading/ana fikir uyuşmazlığı; teknik terim açıklanmamış; referans önerilen minimumun altında; **0 referans ama contentType essay/cv/case-study ise (blocking değil, warning)**; zayıf internal linkleme; aşırı Callout/kod + kod satır taşması; generic AI kokusu; aşırı liste/pazarlama/motivasyon; visual-block node/taşma; büyük asset (§22); zayıf summary. **Uydurma kaynak her durumda yasak.**

---

# E. PROMPT LIBRARY

## §19. Prompt Library
Dosya-tabanlı şablonlar. `content/STYLE.md` opsiyonel (varsa okunur, yoksa nötr akademik fallback; içeriği burada tanımlanmaz). Her prompt: **Amaç / Okur / Üretir / Format / Kurallar / Aşama.**

**Studio MVP çekirdek prompt seti** (önce bunlar implemente edilir):
- **Idea / Series Plan** (Idea Lab + Series Planner)
- **Article Brief** → `brief.md` + iskelet `meta.json` (slugBase/category/tags §17/§20)
- **Outline** → `outline.md`
- **TR Draft** → `draft.tr.md`
- **TR Final MDX** → `final.tr.mdx` (+references, category/tags, internal link §17, technical-writing §16, visual §15)
- **EN Adaptation** → `final.en.mdx` (§13, aynı slugBase)
- **Visual/Diagram Suggestion** → `<VisualBlock>` + `diagrams/*.mmd` + `images/*.prompt.md` (§15)
- **SEO/QC Review** → frontmatter + `runQC` raporu (§18/§20)
- **Resume / Case Study** → `resume.json` / `portfolio/<case>/case.json` (§30)
- **Monthly Plan Topic Suggestions** → `plans/YYYY-MM.json` (§25)

**Alt-modlar (çekirdek promptların modu olarak):** Revizyon/Editing, AI-generic Koku Temizleme, Publish-öncesi QC Raporu. Bu detaylar korunur; MVP'de ayrı UI gerektirmez, çekirdek prompt ekranlarının modu olarak sunulur.

Çıktı hedefleri ve schema'lar Auto Output Routing (§26) ile otomatik yazılır; promptlar Claude'a hedef path + schema'yı açıkça bildirir.

---

# F. PUBLIC SITE

## §20. URL, Language & Slug Standard

### Dil
- Varsayılan **TR**. `/` → `/tr` redirect **yalnızca `app/page.tsx`'te** (tek kaynak). `next.config redirects()` root redirect içermez (yalnız `redirects.json`).
- `/tr` ana, `/en` İngilizce. **Browser locale auto-redirect YOK.** Dil sadece kullanıcı aksiyonuyla.
- Canonical = her dilin kendi URL'si. Hreflang karşılıklı. `x-default → /tr`.

### URL yapısı
`/tr`·`/en`, `/{lang}/cv`, `/{lang}/cv/print`, `/{lang}/work`, `/{lang}/work/<caseSlug>`, `/{lang}/series`, `/{lang}/series/<seriesSlug>`, `/{lang}/series/<seriesSlug>/<articleSlug>`, `/{lang}/feed.xml`; root `/sitemap.xml`, `/robots.txt`. **`trailingSlash: false`** (sabit politika).

### Slug
- kebab-case; Türkçe karakter/boşluk/büyük harf/noktalama/emoji yok; `normalizeSlug()` (ç→c, ş→s, ğ→g, ü→u, ö→o, ı→i, İ→i; boşluk→`-`).
- Article slug `slugBase`'den; **TR/EN aynı slug**. Başlık değişse slug değişmez. Slug değişimi kırıcı → eski URL `redirects.json`'a **permanent redirect**.
- **Ortak `slugBase` bilinçli karardır:** TR/EN aynı URL slug'ını kullanır → hreflang ve bakım kolaylığı; EN keyword-slug avantajından bilinçli vazgeçilir.
- QC slug formatını **blocking** kontrol eder.

### Redirect (`redirects.json`)
- `[{from,to,permanent:true,reason?}]`. **Sadece site-içi relative public URL** (open redirect yok; absolute/external blocking).
- Hedef ya public article/series/work-case ya da bilinen static public route: `/tr`,`/en`,`/tr/cv`,`/en/cv`,`/tr/work`,`/en/work`,`/tr/series`,`/en/series`. Hedef draft/scheduled/future olamaz → blocking. Loop → blocking.
- Uygulama: build-time `redirects()` yalnız `redirects.json`. **Terminoloji: permanent redirect** (Next `permanent:true` kalıcı redirect üretir; exact 301 zorunlu değil). Root `/feed.xml` istenirse opsiyonel `/tr/feed.xml` permanent redirect.

### Bilingual SEO
- **Sitemap kayıtlarında hreflang alternates üret** (her URL için tr/en + x-default).
- **`og:locale` + `og:locale:alternate`** üret.
- canonical stable; sitemap/rss yalnız public; `lastmod = updatedDate ?? publishDate`.

## §21. Public site (`apps/web`) — routes, rendering & reading experience

```
app/page.tsx → redirect('/tr')           # TEK kaynak root redirect
app/[lang]/  (tr|en)  layout.tsx page.tsx cv/ cv/print/ work/ work/[caseSlug]/
             series/ series/[seriesSlug]/ series/[seriesSlug]/[articleSlug]/ feed.xml/route.ts
app/api/revalidate/route.ts              # §27/§29 korumalı
app/sitemap.ts | app/robots.ts           # root
next.config: redirects() ← yalnız content/redirects.json ; trailingSlash:false
```
- `generateMetadata`: title/description, canonical (dil-bazlı), karşılıklı hreflang + x-default, OG/Twitter + og:locale(:alternate).
- **JSON-LD:** Article/BlogPosting/TechArticle (schemaType); seri CollectionPage; layout WebSite + Person; faq → FAQPage; **article ve seri sayfalarında BreadcrumbList**.
- Tek filtre: tüm list/sitemap/rss/`generateStaticParams` `isPublic`; article route ayrıca runtime `if (!isPublic) notFound()`.
- URL tek `buildUrl(lang, kind, slugs)` (content-core).
- Scheduled: `generateStaticParams` yalnız public; `dynamicParams=true`; ISR `revalidate`.

### Reading Experience Standard
Okunabilir max-width; net hero/title; summary; metadata satırı (okuma süresi/zorluk/tarih/category); seri konumu; kaynakça; previous/next; seri landing'e dönüş. Desktop opsiyonel sticky TOC; mobil sade/kapalı TOC. Visual-block/code/kaynakça yerleşimi premium editorial. Sakin ve odaklı; gösterişli değil. Aynı his seri landing ve case-study detayına da uygulanır.

## §22. Asset, Accessibility & Performance Standard
OG **1200×630**; cover **16:9 min 1600×900** WebP/PNG; büyük asset → Studio warning. Alt/caption/source korunur. **Lighthouse SEO + Accessibility 95+.** Keyboard nav, focus states, semantic HTML, `prefers-reduced-motion`. Gereksiz client JS yok; MDX server-render öncelikli (interaktif parçalar `"use client"`).

## §23. UI String i18n Standard
TR/EN yalnız içerikle sınırlı değil; **UI chrome metinleri de çevrilebilir**.
- Küçük messages yapısı: `apps/studio/messages/{tr,en}.json` ve web tarafı için `apps/web` üzerinden tüketilen aynı/eş messages (content-core'da paylaşılan tipler).
- Çevrilecekler örn.: "Okuma süresi", "Önceki yazı", "Sonraki yazı", "Kaynakça", "Serideki konum", "Yayın tarihi", "Güncellendi", "CV", "Projeler".
- **Tarih, sayı ve reading time locale'e göre formatlanır** (`Intl`).
- Hardcoded TR/EN UI metni → QC warning / lint standardı olarak raporlanabilir.

---

# G. STUDIO

## §24. Studio (`apps/studio`) + Data Flow
Backend Fastify (`127.0.0.1`), frontend Vite/React. **`packages/ui` framework-light çekirdeğini kullanır (§3); preview fonksiyonel olarak eşdeğerdir, birebir RSC pipeline değil.** Local-first; üretimden çok kontrol/preview/publish orchestration; CC dosyalarını bozmaz. UX önceliği §7.

Modüller: **Idea Lab**, **Series Planner** (slug §20, taxonomy §17), **Brief Builder**, **Draft Review** (fonksiyonel eşdeğer preview, §21), **SEO/GEO Check** (`runQC` + ayrı taxonomy/link/slug/redirect/hreflang/canonical grubu), **Visual Studio** (`.mmd→.svg` + sanitize §15 + visual-block validate + asset boyut §22), **Resume Studio** (§30), **Monthly Plan** (§25), **Publisher**, **AI Output Inbox** (§26).

**Publisher** butonu hepsi sağlanınca aktif: `runQC` blocking=0; diller tam; görsel/diagram çözümlü; redirect/internal-link hedefleri public. Aksiyon: `meta.json` status/publishDate → `simple-git` commit/push → `/api/revalidate` imzalı çağrı (§27).

## §25. Monthly Editorial Planning System

Studio'da aylık yayın planı için ayrı **Monthly Plan** modülü. Varsayılan hedef **ayda 10 yazı**.

- **Girdi analizi:** önceki yayınlanmış yazılar, mevcut seriler, yarım konular, `_ideas` backlog, kategori/tag dağılımı, tekrar riski, okuyucu yolculuğu ve kullanıcının girdiği trend/not başlıkları.
- **Akış:** önce **25–40 aday konu havuzu**; sonra `relevance, seriesFit, novelty, riskOfRepetition, seoPotential, geoPotential, difficulty, estimatedEffort, visualPotential, suggestedPublishWeek` ile skorlanıp **önerilen 10 yazılık plan** sunulur.
- **Saklama:** `content/plans/YYYY-MM.json` (schema §9).
- **Her öneri** §9'daki `Topic` alanlarını taşır (sadece başlık değil): title, angle, whyNow, targetAudience, seriesFit, difficulty, estimatedReadingTime, suggestedPublishWeek, contentType, seoPotential, geoPotential, visualPotential, riskOfRepetition, requiredResearch, sourceBasis, nextAction.
- **Denge zorunlu:** aynı ay tüm yazılar aynı zorluk/kategori/seride yığılmaz; teknik derinlik + açıklayıcı + mimari/ürün vizyonu + kişisel/essay bilinçli dağıtılır.
- **İki mod:** (1) kullanıcı **local Studio'ya OpenAI/LLM API key** verirse Studio doğrudan önerir; (2) API yoksa Studio **Claude Code için dosya-tabanlı prompt** üretir, kullanıcı Claude'a verir, çıktı JSON/Markdown olarak **geri import** edilir (Auto Routing §26). **API key yalnız local `.env`'de**; public/client bundle'a sızmaz. **Trend uydurulmaz**; yoksa yalnız kullanıcı notları + mevcut içerik haritası + backlog baz alınır.
- **UI Standard:** ay seç → hedef sayıyı gör → aday havuzunu filtrele → 10'lu planı haftalara göre gör → onayla/aktar. Her konu: kısa başlık, seri bağlantısı, önerilen hafta, zorluk, skor, tekrar riski, "neden önerildi?". Tek tık: `regenerate`, `replace similar`, `make more technical`, `make more beginner-friendly`, `continue this series`, `avoid this topic`. **Studio karar verici değildir; önerir, gerekçelendirir, kullanıcı seçer.**
- **Seçim:** seçilen konu `_ideas/`, `series/<slug>/articles/`, `brief.md`/`outline.md` akışına dönüştürülür; seçilmeyen kaliteliler backlog'da kalır.
- **QC eklentileri:** tekrar riski, kategori/tag dengesi, seçilen 10'un ay içi dağılımı, eksik `sourceBasis`.

## §26. Automated Output Routing & Zero-Manual Import Standard

Studio ve Claude Code çıktıları **manuel import / dosya konumu arama / elle taşıma gerektirmez.** Sistem çıktıyı anlamlandırır, doğru content kontratına map eder, doğru klasöre yazar/akışa bağlar. Kapsam: monthly plan, topic suggestions, idea, series plan, brief, outline, final MDX, visual-block, diagram, resume update, case-study, SEO/QC sonucu, redirect önerisi.

- **Claude Code akışları:** Studio prompt üretirken Claude'a **hangi schema + hangi hedef** olduğunu açıkça bildirir; Claude doğrudan doğru path'e yazar. Studio otomatik algılar, parse eder, **zod doğrular**, ekranda `detected / routed / needs review / failed` gösterir. Kullanıcı path seçmez.
- **Harici LLM çıktısı:** tek **universal "AI Output Inbox"**; kullanıcı çıktıyı bırakır; Studio `kind, targetMonth, seriesSlug, articleId, language, contentType, nextAction` alanlarından otomatik sınıflandırıp yönlendirir.
- **Güvenli/kontrollü:** sessiz overwrite yok — overwrite gerekiyorsa **diff/preview**, eski içerik korunur/backup. **Idempotent** (duplicate üretmez). Anlaşılamayan çıktı kaybolmaz → `content/_inbox/unresolved/` veya "Needs Review" kuyruğu + tek net sebep.
- **Pipeline (her modül aynı):** schema validate → hedef content path hesapla → QC → ilgili ay/seri/yazı/CV akışına bağla.
- **Router map:** monthly plan → `content/plans/YYYY-MM.json`; idea → `_ideas/`; brief/outline → ilgili article klasörü; final MDX → ilgili language dosyası; visual → `diagrams/`/`images/`; resume → `resume.json`; redirect → `redirects.json`.
- **Discriminated schema (§9):** `{kind, target, payload, source, createdAt, status}`. Studio file watcher veya explicit refresh ile algılar.

---

# H. PUBLISH & GÜVENLİK

## §27. Publish & Scheduling — Cache/Invalidation Standard

- `isPublic(meta, now)` **tek kaynak** (§9 truth table). `status=draft` asla public; `scheduled & publishDate<=now` public; `published & publishDate>now` public değil. Tüm public yüzeyler (sitemap, rss, list, seri landing, article route, `generateStaticParams`, redirect/internal-link hedef) aynı kuralla.
- Scheduled içerik publishDate öncesi route tahmin edilse bile **`notFound()`**.
- **404 cache problemi:** future scheduled URL önceden ziyaret edilip 404 cache'e düşerse, publish zamanı geldiğinde **cron/revalidate bu 404 etkisini temizler** (ilgili path yeniden generate edilir).
- **Explicit revalidation (genel çağrı değil):** publish/cron şunları açıkça revalidate eder — ilgili **article path**, **series landing**, **series list**, **home/list**, **sitemap**, **per-lang feed** path/tag'leri.
- **Strateji:** içerik tag'lenir (`revalidateTag` için: `article:<id>`, `series:<slug>`, `list`, `sitemap`, `feed:<lang>`) + kritik path'ler için `revalidatePath`. Publish sonrası ve günlük cron bu tag/path'leri tetikler.
- **Ana yazma yolu:** Studio commit/push → Vercel build. Vercel runtime content repo'ya yazmaz.
- Her publish öncesi QC pass; her publish Git commit (audit); sonrası explicit revalidate.
- **Rollback:** `git revert`+push veya Vercel Instant Rollback.
- Bu davranış için unit/integration testleri §32'de.

## §28. Güvenlik modeli (temel)
Studio asla deploy edilmez (`127.0.0.1`). Secret yalnız local `.env`/Vercel server env; client bundle'a sızmaz (yalnız `NEXT_PUBLIC_*`). Read public; write/revalidate auth ister. draft/scheduled içerik ve gizli resume alanları hiçbir public yüzeyde görünmez (§30).

## §29. Production Security Standard

- **Security headers** (next.config `headers()`): **CSP mümkün olduğunca sıkı ama Next.js static rendering gerçekliği kabul edilir.** Tüm statik/ISR sayfalarda **per-request nonce zorunlu tutulmaz**; nonce yalnız **gerçekten dynamic route gerektiren** endpoint'lerde kullanılabilir. Inline script/style gerekiyorsa **kontrollü hash veya sınırlı `unsafe-inline`** kullanılabilir; nedenleri README'de açıklanır. **Dev CSP gevşekliği prod'a taşınmaz.** Ayrıca `frame-ancestors 'none'` (+`X-Frame-Options: DENY`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (kullanılmayan özellikler kapalı).
- **CSP rollout (README):** gerekirse önce `Content-Security-Policy-Report-Only`, sorun kalmayınca prod'da enforce.
- **`/api/revalidate` ve write/trigger uçları — prod zorunlu:** **HMAC signature + dar timestamp window + method whitelist + zod input validation + safe error response** (stack/iç detay sızdırma yok).
  - **Nonce ve gerçek distributed rate-limit MVP'de zorunlu DEĞİL** (kalıcı/paylaşılan state gerektirir; DB yok kararıyla uyumlu). İstenirse ileride **hafif KV/Redis benzeri stateful storage** ile opsiyonel eklenir (MVP dışı). **In-memory nonce/rate-limit production security olarak kabul edilmez.**
- **SVG sanitize ayrıca zorunlu** (§15); CSP yerine geçmez.
- **Secret yönetimi:** yalnız server env / local `.env`; `NEXT_PUBLIC_*` dışı env client'ta kullanılmaz; build loglarında secret yok; deploy preview secret exposure kontrolü; environment separation + minimal env vars.
- **Studio izolasyonu:** prod'a deploy edilmez; `127.0.0.1`; LAN/public'e açılmaz. **API key'ler (Monthly Plan) yalnız local `.env`.**
- **Veri sızıntısı:** draft/scheduled + gizli resume alanları public response/sitemap/rss/OG/JSON-LD/search index/static output'a sızmaz.
- **Redirect güvenliği:** open redirect yok; yalnız site-içi relative public URL.
- **MDX/Markdown:** raw HTML destekleniyorsa whitelist/sanitize; bilinmiyorsa raw HTML kapalı.
- **Upload/external image:** allowed domains (`remotePatterns`), dosya tipi/boyutu, path traversal kontrolü.
- **Dependency:** `pnpm audit` README/smoke test sürecinde.
- **Loglar:** secret/HMAC/token/gizli resume/kişisel iletişim loglanmaz.
- **README** "Production Security Checklist" içerir (§34).

---

# I. RESUME / PORTFOLIO

## §30. Resume / Portfolio data standardı
- `resume.json` (`{tr,en}`): `basics{name,title,summary,photo,location?}`, `contact{...}`, `experience[]`, `education[]`, `skills[]`, `projects[]`, `links[]`.
- **Visibility modeli:** hassas alan/`contact` öğesi `visibility: "public" | "pdf" | "private"` (`private:boolean` yerine/yanında). `public`=web+PDF; `pdf`=yalnız PDF; `private`=hiçbir çıktıda yok. **Telefon/adres varsayılan `private`**; gerekirse yalnız `pdf`. Hiçbir gizli alan public'e otomatik basılmaz.
- **Kaynaklar:** `sources/` PDF/foto/not → `resume.json` ön-doldurma; yoksa placeholder.
- **CV ve PDF aynı veriden:** `/[lang]/cv` (görünürlük filtreli) + `/[lang]/cv/print`. PDF = Studio'da Playwright ile `/cv/print` → PDF.
- **Case-study:** `portfolio/<case-slug>/case.json` ↔ `projects`; alanlar `problem, context, role, stack, constraints, solution, impact, assets[]`.

### Resume Update & Presentation Standard
Kullanıcı CV'si `sources/`'a kaynak alınır ama **güncel kabul edilmez**; Studio başlangıç verisi olarak parse eder, güncelleme gereken alanları **`needsReview`** ile işaretler. Bilinen düzeltmeler (kullanıcı doğrulamasıyla): **Digitallica "present" değil**; **Kansuk Şubat bitti → Mart Eroğlu Global Holding başladı**; eksikse eklenir; **yıl net değilse `needsReview`**, uydurma yok. Sunum: salt liste değil **kişisel profil sayfası** (premium/sade/güçlü); .NET/React full-stack, kurumsal portal/dashboard, AI/API entegrasyon vurgulu. PDF aynı güncel `resume.json`'dan.

---

# J. TESLİM

## §31. Implementation Risk Notes (+ çözüm)
- **App Router + MDX (RSC):** `next-mdx-remote/rsc`; interaktif parçalar `"use client"`; raw HTML güvenliği §29.
- **Mermaid build:** Vercel'de browser yok → Studio local `.svg` + sanitize + commit; web statik okur.
- **Vercel Hobby FS ephemeral:** publish = Studio commit/push; runtime repo'ya yazmaz.
- **Shared UI:** framework-light çekirdek + ince Next/Vite wrapper'lar (§3); ortak Tailwind preset + token CSS.
- **CSP/static gerçekliği:** §29 (nonce zorunlu değil; hash/sınırlı unsafe-inline + Report-Only rollout).
- **Revalidate güvenliği:** HMAC+timestamp+method+zod (nonce/distributed rate-limit MVP dışı).
- **Scheduled 404 cache:** explicit revalidatePath/Tag ile temizlenir (§27).
- **Performans:** gereksiz client JS yok; server-render öncelik (§22).
- **PDF:** yalnız Studio (local) Playwright.
- **Font lisansı:** SIL OFL, self-host; lisans README.

## §32. Execution Plan
Her faz: **Output / Done / Test / Commit / Geçiş.** Product Polish (§7) ve A11y/Perf (§22) her UI fazında geçerli çıta.

- **Faz 0 — Scaffold.** monorepo, workspaces, app iskeletleri, `packages/{content-core,ui}`, `docs/`, örnek `content/` (+ boş `taxonomy.json`, `redirects.json`, `_ideas/`, `_inbox/`, `plans/`). Test `pnpm -w build`. Commit `chore: scaffold`. 
- **Faz 1 — Design system + Announcement Reference + UI bileşenleri + messages.** `<DASHBOARD_PATH>` (announcement detail) incelemesi; light tokenlar (kontrast §5); technical-writing bileşenleri (§16); framework-light çekirdek + Next/Vite wrapper (§3); `apps/*/messages/{tr,en}.json` (§23); `docs/design-reference.md`. **`<DASHBOARD_PATH>` yoksa DUR, sor.** Commit `feat(ui): design system + components + i18n + reference`.
- **Faz 2 — content-core.** zod (meta/series/references/taxonomy/redirects/**plans**/**inbox**); parser; türetici; **`isPublic` + truth table**; `normalizeSlug`; `buildUrl`; canonical/hreflang; taxonomy doğrulayıcı; **internal-link checker + `InternalLink` resolver**; redirect loop/hedef/open-redirect çözücü; `runQC` iskeleti. **Unit tests:** `isPublic` truth-table; `normalizeSlug` TR karakter; `buildUrl` TR/EN stable; `InternalLink` target resolver; draft/scheduled hedef link blocking. Commit `feat(content-core): schema, qc, helpers + tests`.
- **Faz 3 — Public reading.** `[lang]` routing, seri landing + article + visual + technical-writing render, Reading Experience (§21), `isPublic`, `buildUrl`. 1 seri + 3 yazı (TR+EN). Commit `feat(web): reading experience`.
- **Faz 4 — SEO + sitemap + RSS + OG + JSON-LD + URL/redirect.** dynamic metadata; canonical+hreflang+x-default; **og:locale(:alternate)**; **sitemap hreflang alternates**; **BreadcrumbList**; root sitemap/robots; per-lang `feed.xml`; `next/og` 1200×630; **`/→/tr` yalnız `app/page.tsx`**; **`next.config redirects()` yalnız redirects.json**; `trailingSlash:false`. Commit `feat(web): bilingual seo + url + redirects`.
- **Faz 5 — Studio MVP.** Draft Review (fonksiyonel eşdeğer preview) + SEO/GEO Check + Publisher + `/api/revalidate` (**HMAC+timestamp+method+zod+safe error**). Çekirdek prompt seti (§19). Commit `feat(studio): review, qc, publisher`.
- **Faz 6 — Scheduled publish + cache invalidation + hardening + smoke tests.** günlük cron; **explicit `revalidatePath`/`revalidateTag`** (article/series/list/home/sitemap/feed); 404-cache temizleme; prod security headers (§29); a11y/perf 95+; asset warning. **Tests/senaryolar:** scheduled publish sonrası explicit revalidate path/tag; future article `notFound`; **scheduled publish 404-cache temizlenir**; draft/scheduled list/sitemap/rss'te yok; SVG sanitize failure blocking; redirect loop/hedef public-değil blocking; open-redirect reddi; **Lighthouse SEO+A11y 95+**; keyboard/focus/reduced-motion; secret leak yok; protected API unauthorized reddi. Commit `feat: scheduled cache + a11y + security hardening`.
- **Faz 7 — Prompt Library + generation + Auto Output Routing.** §19 çekirdek promptları; **§26 AI Output Inbox + auto-router + discriminated schema + watcher**; overwrite/duplicate/schema validation testleri. Commit `feat(studio): prompts + auto routing`.
- **Faz 8 — Visual Studio.** `.mmd→.svg` + **sanitize (§15)** + visual-block validate + asset boyut. MVP scope (§15): custom = Comparison/LayeredModel/Pyramid/editorial; Flow/Cycle/Timeline/ConceptMap = Mermaid. Commit `feat(studio): visual studio`.
- **Faz 9 — Monthly Plan + Resume/Portfolio + PDF.** **Monthly Plan modülü (§25)** + `plans/YYYY-MM.json` schema + iki mod + UI + QC (tekrar riski/denge/dağılım/sourceBasis); `resume.json` (visibility + `needsReview`, §30), profil-stili `/cv`, `/cv/print`, Playwright PDF, case-study. Commit `feat: monthly plan + resume + pdf`.
- **Faz 10 — Deploy docs + smoke tests.** README (§34, CSP rollout + Production Security Checklist), Vercel deploy, smoke script (`pnpm audit`). Commit `docs: deploy + smoke`.

## §33. Definition of Done / guardrails
Her faz typecheck+lint+build temiz. Public bundle'da secret yok; studio deploy edilebilir değil; prod security headers aktif. İçerik/UI'da emoji/klişe/pazarlama yok. En az bir canlı yazı Lighthouse SEO+A11y 95+ ve Rich Results'tan geçer. Tek `isPublic`/`runQC`/`buildUrl`/`normalizeSlug`/taxonomy-link doğrulayıcı. draft/scheduled/private veri hiçbir public yüzeye sızmaz. Public premium ürün hissi; Studio user-friendly (§7).

## §34. README / Documentation
İçermeli: kurulum; Node/pnpm; `dev:web`/`dev:studio`/`build`/`typecheck`/`lint`/`pnpm audit`; content yapısı; **taxonomy & internal linking (§17)**; **Internal Link Contract**; **technical-writing bileşenleri (§16)**; **UI i18n (§23)**; **asset/a11y/perf (§22)**; **URL/dil/slug + redirects (§20, trailingSlash:false)**; **bilingual SEO (hreflang sitemap, og:locale, BreadcrumbList)**; `STYLE.md` opsiyonel; `docs/design-reference.md`; **Monthly Plan (§25) + API key local kuralı**; **Auto Output Routing + AI Output Inbox (§26)**; yeni seri/yazı; Studio; publish + **scheduled cache/revalidate (§27)**; env (`.env.example`); Vercel deploy; `/→/tr`, per-lang RSS, scheduled publish + 404-cache testi; CV PDF + resume visibility; **CSP rollout notu (Report-Only → enforce)**; **Production Security Checklist (§29)**; Future Scope (§4); font lisansları; troubleshooting.
