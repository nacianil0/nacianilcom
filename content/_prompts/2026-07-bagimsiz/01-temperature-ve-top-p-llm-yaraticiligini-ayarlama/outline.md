# Makale Taslak Planı (Outline) Üret

## Rol
nacianilcom repo'sunda çalışıyorsun.
Onaylı brief'ten detaylı makale iskelet (outline) üret.
Çıktı: `content/series/SERI_SLUG/articles/YAZI_ID/outline.json`

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_SLUG=2026-07-bagimsiz
YAZI_ID=01-temperature-ve-top-p-llm-yaraticiligini-ayarlama
```

---

## Oku

1. `content/series/SERI_SLUG/articles/YAZI_ID/brief.json`
2. `content/series/SERI_SLUG/articles/YAZI_ID/meta.json`
3. `content/series/SERI_SLUG/series.json`
4. Serideki önceki makalelerin `final.tr.mdx`'lerini oku — hangi kavramlar
   zaten açıklanmış? (tekrar önleme)

---

## Adımlar

### 1 — Bölüm Yapısı
Brief'teki `draftStructure` (H2 listesi) üzerinden her bölümü genişlet:
- Bölüm başlığı (H2, Türkçe)
- Alt başlıklar (H3, gerekirse)
- Kapsanacak anahtar noktalar (3–5 madde)
- Kelime tahmini (bölüm başına ~)
- Kod örneği var mı? Varsa: dil + ne göstereceği
- Görsel önerisi: hangi diyagram tipi (flowchart / stateDiagram-v2 / graph / timeline)

### 2 — Giriş + Sonuç
- Giriş: okuyucunun ne bileceğini + ne kazanacağını anlatan 2–3 cümle taslak
- Sonuç: makalenin bırakacağı "bir sonraki adım" yönü

### 3 — Toplam Tahmin
`totalEstimatedWords` = tüm bölüm toplamı + giriş + sonuç
Hedef: `estimatedReadingTime × 200` kelime (brief'ten al)

### 4 — Dosyayı Yaz

---

## Schema

```typescript
interface OutlineSection {
  heading: string;              // H2 başlığı (Türkçe)
  subheadings?: string[];       // H3 başlıkları
  keyPoints: string[];          // 3–5 kapsanacak nokta
  estimatedWords: number;
  codeExample?: {
    lang: string;               // "typescript" | "javascript" | "bash"
    description: string;        // kod ne gösteriyor
  };
  visualHint?: string;          // "flowchart" | "stateDiagram-v2" | "graph" | null
}

interface Outline {
  id: string;                   // YAZI_ID
  title: string;                // Türkçe makale başlığı
  intro: string;                // açılış taslağı (2–3 cümle)
  sections: OutlineSection[];
  conclusion: string;           // kapanış yönü
  totalEstimatedWords: number;
}
```

---

## Çıktı Format

```json
{
  "id": "04-sinif-ve-nesne",
  "title": "Sınıf ve Nesne Nedir?",
  "intro": "JavaScript ve TypeScript'te sınıflar, nesne oluşturmak için şablon görevi görür...",
  "sections": [
    {
      "heading": "Sınıf Nedir?",
      "keyPoints": [
        "Sınıf, nesne oluşturmak için şablon tanımlar",
        "class syntax ES6 ile geldi",
        "prototype tabanlı kalıtımın sözdizimsel şekeri"
      ],
      "estimatedWords": 300,
      "codeExample": { "lang": "typescript", "description": "temel class tanımı + constructor" },
      "visualHint": "flowchart"
    }
  ],
  "conclusion": "Sınıf ve nesne ilişkisini kavradıktan sonra inheritance...",
  "totalEstimatedWords": 1400
}
```

**Dosyaya yaz:** `content/series/SERI_SLUG/articles/YAZI_ID/outline.json`

---

## Kurallar

- Outline sadece plan — nihai metin bu aşamada yazılmaz.
- Her H2 bölümü 150–400 kelime arası.
- Toplam: `estimatedReadingTime × 200` kelime (brief'ten al).
- Önceki yazılarda açıklanan kavramlar için yalnızca "bkz. 01-degisken" referansı yeterli.
- `visualHint` sadece gerçekten diyagrama ihtiyaç olan bölümlere ekle (max 2–3).

---

## Sonra Ne Yapılır

Outline onaylandıktan sonra → `tr-draft.md` promptu ile TR ilk taslak yaz.

---
## Studio — otomatik doldurulmuş bağlam

`SERI_SLUG=2026-07-bagimsiz`
`YAZI_ID=01-temperature-ve-top-p-llm-yaraticiligini-ayarlama`

Bu blok Studio tarafından eklendi. Yukarıdaki prompt talimatlarını uygula; dosyaları repoya yaz.

### series.json
```json
{
  "slug": "2026-07-bagimsiz",
  "title": {
    "tr": "Bağımsız Yazılar",
    "en": "Standalone Articles"
  },
  "description": {
    "tr": "2026-07 editoryal planındaki seriye bağlı olmayan konular.",
    "en": "Topics from the 2026-07 editorial plan that are not part of a named series."
  },
  "order": 2,
  "articleOrder": [
    "01-temperature-ve-top-p-llm-yaraticiligini-ayarlama",
    "02-rlhf-chatgpt-yi-yardimsever-yapan-sey",
    "03-llm-ler-neden-halusinasyon-gorur",
    "04-context-window-ve-kv-cache-llm-neden-unutur-ve-n",
    "05-rag-llm-e-kendi-verinizi-nasil-okutursunuz"
  ]
}
```

### meta.json
```json
{
  "id": "01-temperature-ve-top-p-llm-yaraticiligini-ayarlama",
  "series": "2026-07-bagimsiz",
  "order": 1,
  "slugBase": "temperature-ve-top-p-llm-yaraticiligini-ayarlamak",
  "category": "programlama-temelleri",
  "tags": [
    "temel-kavramlar"
  ],
  "difficulty": "beginner",
  "status": "draft",
  "publishDate": "2026-07-01",
  "schemaType": "TechArticle",
  "contentType": "explainer",
  "languages": [
    "tr",
    "en"
  ],
  "assets": {
    "diagrams": []
  }
}
```

### brief.json
```json
{
  "topic": "Temperature ve Top-p: LLM Yaratıcılığını Ayarlamak",
  "seriesContext": "2026-07 planındaki bağımsız yazı — Pratik ve hemen uygulanabilir; 1. haftanın temel üçlüsünü tamamlar",
  "targetAudience": "API ile LLM kullanan geliştiriciler",
  "learningObjectives": [
    "Sampling parametrelerinin çıktıyı nasıl değiştirdiğini elle örneklerle göstermek",
    "Kaynak temeli: Holtzman et al. 2020 'The Curious Case of Neural Text Degeneration' (nucleus/top-p); OpenAI API dokümantasyonu"
  ],
  "readerQuestions": [
    "Temperature ve Top-p: LLM Yaratıcılığını Ayarlamak ne demek?",
    "Bu kavram neden önemli?",
    "Pratikte nerede karşıma çıkar?"
  ],
  "outOfScope": [
    "Düşük"
  ],
  "suggestedExamples": [
    "Yüksek — aynı prompt'un farklı temperature'larda çıktı karşılaştırması",
    "Greedy/temperature/top-p/top-k örnek çıktılar"
  ],
  "draftStructure": [
    "Temperature ve Top: Giriş",
    "Sampling parametrelerinin çıktıyı nasıl değiştirdiğini elle örneklerle göstermek",
    "Somut örnek",
    "Pratikte ne anlama geliyor?",
    "Özet ve sonraki adım"
  ],
  "estimatedReadingTime": 8,
  "planRef": {
    "whyNow": "Pratik ve hemen uygulanabilir; 1. haftanın temel üçlüsünü tamamlar",
    "sourceBasis": "Holtzman et al. 2020 'The Curious Case of Neural Text Degeneration' (nucleus/top-p); OpenAI API dokümantasyonu",
    "nextAction": "article-brief üret",
    "suggestedPublishWeek": 1
  }
}
```

### Hedef dosyalar
- outline → `content/series/2026-07-bagimsiz/articles/01-temperature-ve-top-p-llm-yaraticiligini-ayarlama/outline.json`
- tr-draft → `content/series/2026-07-bagimsiz/articles/01-temperature-ve-top-p-llm-yaraticiligini-ayarlama/final.tr.mdx` (frontmatter yok)
- tr-final-mdx → aynı `final.tr.mdx` (frontmatter + MDX bileşenleri)