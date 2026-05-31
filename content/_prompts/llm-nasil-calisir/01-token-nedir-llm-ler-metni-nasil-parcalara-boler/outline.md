# Makale Taslak Planı (Outline) Üret

## Rol
nacianilcom repo'sunda çalışıyorsun.
Onaylı brief'ten detaylı makale iskelet (outline) üret.
Çıktı: `content/series/SERI_SLUG/articles/YAZI_ID/outline.json`

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_SLUG=llm-nasil-calisir
YAZI_ID=01-token-nedir-llm-ler-metni-nasil-parcalara-boler
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

`SERI_SLUG=llm-nasil-calisir`
`YAZI_ID=01-token-nedir-llm-ler-metni-nasil-parcalara-boler`

Bu blok Studio tarafından eklendi. Yukarıdaki prompt talimatlarını uygula; dosyaları repoya yaz.

### series.json
```json
{
  "slug": "llm-nasil-calisir",
  "title": {
    "tr": "LLM'ler Nasıl Çalışır",
    "en": "How LLMs Work"
  },
  "description": {
    "tr": "Token'dan transformer'a: büyük dil modellerinin nasıl çalıştığını adım adım inceliyoruz.",
    "en": "From tokens to transformers: a step-by-step look at how large language models work."
  },
  "order": 1,
  "articleOrder": [
    "01-token-nedir-llm-ler-metni-nasil-parcalara-boler",
    "02-bir-sonraki-token-i-tahmin-etmek-llm-lerin-tek-i",
    "03-embedding-ler-kelimeleri-sayilara-cevirmenin-sih",
    "04-attention-mekanizmasi-llm-in-neye-odaklandigini",
    "05-transformer-mimarisi-parca-parca-bir-llm-in-anat"
  ]
}
```

### meta.json
```json
{
  "id": "01-token-nedir-llm-ler-metni-nasil-parcalara-boler",
  "series": "llm-nasil-calisir",
  "order": 1,
  "slugBase": "token-nedir-llm-ler-metni-nasil-parcalara-boler",
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
  "topic": "Token Nedir? LLM'ler Metni Nasıl Parçalara Böler",
  "seriesContext": "LLM'ler Nasıl Çalışır serisinin 1. yazısı — Seri bir temel taşıyla başlamalı; 'how llms work' yolculuğunun ilk adımı",
  "targetAudience": "LLM'leri ilk kez merak eden geliştiriciler ve teknik meraklılar",
  "learningObjectives": [
    "Tokenization (BPE) mantığını sıfırdan, somut örneklerle anlatan giriş",
    "Kaynak temeli: Sennrich et al. 2016 'Neural Machine Translation of Rare Words with Subword Units' (BPE); OpenAI tiktoken dokümantasyonu"
  ],
  "readerQuestions": [
    "Token Nedir? LLM'ler Metni Nasıl Parçalara Böler ne demek?",
    "Bu kavram neden önemli?",
    "Pratikte nerede karşıma çıkar?"
  ],
  "outOfScope": [
    "Düşük — henüz hiç içerik yok"
  ],
  "suggestedExamples": [
    "Yüksek — cümlenin token'lara bölünüşü gösteren renkli diyagram",
    "Tiktoken/BPE örnekleri, Türkçe tokenization maliyeti örneği"
  ],
  "draftStructure": [
    "Token Nedir: Giriş",
    "Tokenization (BPE) mantığını sıfırdan, somut örneklerle anlatan giriş",
    "Somut örnek",
    "Pratikte ne anlama geliyor?",
    "Özet ve sonraki adım"
  ],
  "estimatedReadingTime": 8,
  "planRef": {
    "whyNow": "Seri bir temel taşıyla başlamalı; 'how llms work' yolculuğunun ilk adımı",
    "sourceBasis": "Sennrich et al. 2016 'Neural Machine Translation of Rare Words with Subword Units' (BPE); OpenAI tiktoken dokümantasyonu",
    "nextAction": "article-brief üret → outline",
    "suggestedPublishWeek": 1
  }
}
```

### Hedef dosyalar
- outline → `content/series/llm-nasil-calisir/articles/01-token-nedir-llm-ler-metni-nasil-parcalara-boler/outline.json`
- tr-draft → `content/series/llm-nasil-calisir/articles/01-token-nedir-llm-ler-metni-nasil-parcalara-boler/final.tr.mdx` (frontmatter yok)
- tr-final-mdx → aynı `final.tr.mdx` (frontmatter + MDX bileşenleri)