# Makale Brief + Meta Taslağı Üret

## Rol
nacianilcom repo'sunda çalışıyorsun.
Bir fikir veya Monthly Plan konusundan makale kapsam belgesi (brief) + meta.json taslağı üret.
Çıktı: `content/series/SERI_SLUG/articles/YAZI_ID/meta.json` + `brief.json`

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_SLUG=yazilimda-temel-kavramlar   # content/series/ altındaki dizin adı
YAZI_ID=04-sinif-ve-nesne              # NN-slug formatı (ör: 04-sinif-ve-nesne)
KONU="Sınıf ve Nesne Nedir?"           # başlık / konu
DIFFICULTY=beginner                    # beginner|intermediate|advanced
ICERIK_TIPI=explainer                  # research|explainer|architecture|essay
SIRA_NO=4                              # serinin kaçıncı yazısı (1–10)
```

---

## Oku

1. `content/series/SERI_SLUG/series.json` — seri bilgisi, articleOrder
2. `content/series/SERI_SLUG/articles/` — mevcut makaleler (sıra + slug pattern)
3. `content/taxonomy.json` — **geçerli** category + tag slug'ları (başka slug uydurma)
4. `packages/content-core/src/schemas/meta.ts` — MetaSchema, AssetSchema
5. Önceki makalelerin `meta.json`'larını oku — category/tags/difficulty tutarlılığı

---

## Adımlar

### 1 — Seri Analizi
- Mevcut makale sırasını kontrol et. SIRA_NO çakışıyor mu?
- Hangi kavramlar zaten ele alındı? Yeni makale ne ekliyor?
- `slugBase` belirle: KONU'nun URL-safe hali (TR karakter yok, tire, max 60 kar)
  - ş→s, ç→c, ö→o, ü→u, ğ→g, ı→i dönüşümü

### 2 — meta.json Oluştur
MetaSchema kurallarına uy. Yeni makale her zaman `status: "draft"`.

### 3 — brief.json Oluştur
Makale kapsam belgesi — taslak aşamasında rehber.

### 4 — Dizini Oluştur ve Dosyaları Yaz

```
content/series/SERI_SLUG/articles/YAZI_ID/meta.json
content/series/SERI_SLUG/articles/YAZI_ID/brief.json
```

---

## Schema

```typescript
// MetaSchema — packages/content-core/src/schemas/meta.ts
interface Meta {
  id: string;               // YAZI_ID ("04-sinif-ve-nesne")
  series: string;           // SERI_SLUG
  order: number;            // SIRA_NO (1–10 tam sayı)
  slugBase: string;         // URL slug — TR karaktersiz, sadece harf-rakam-tire
  category: string;         // taxonomy.json'dan geçerli category slug
  tags: string[];           // max 5, taxonomy.json'dan geçerli tag slug'ları
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "draft";          // her zaman draft başlar
  publishDate: string;      // bugünün tarihi "YYYY-MM-DD" — henüz yayınlanmıyor
  schemaType: "Article" | "BlogPosting" | "TechArticle";
                            // TechArticle=teknik, BlogPosting=essay, Article=genel
  contentType: "research" | "explainer" | "architecture" | "essay" | "cv" | "case-study";
  languages: ["tr", "en"]; // her zaman iki dil
  assets: {
    diagrams: string[];    // şimdilik []
  };
}

// brief.json — serbest format, zorunlu alanlar
interface Brief {
  topic: string;
  seriesContext: string;           // serideki yeri (öncesi/sonrası)
  targetAudience: string;          // okuyucu profili (1 cümle)
  learningObjectives: string[];    // 3–5 madde: "Okuyucu X'i anlayacak"
  readerQuestions: string[];       // 3–5 soru: okuyucunun aklındaki sorular
  outOfScope: string[];            // kapsam dışı: ne yazılmayacak
  suggestedExamples: string[];     // 2–3 analoji veya gerçek hayat örneği
  draftStructure: string[];        // H2 seviyesi bölüm başlıkları (3–5)
  estimatedReadingTime: number;    // dakika
}
```

---

## Çıktı Format

**meta.json:**
```json
{
  "id": "04-sinif-ve-nesne",
  "series": "yazilimda-temel-kavramlar",
  "order": 4,
  "slugBase": "sinif-ve-nesne",
  "category": "programlama-temelleri",
  "tags": ["javascript", "typescript", "temel-kavramlar"],
  "difficulty": "beginner",
  "status": "draft",
  "publishDate": "2026-07-01",
  "schemaType": "TechArticle",
  "contentType": "explainer",
  "languages": ["tr", "en"],
  "assets": { "diagrams": [] }
}
```

**brief.json:**
```json
{
  "topic": "Sınıf ve Nesne Nedir?",
  "seriesContext": "...",
  "targetAudience": "...",
  "learningObjectives": ["..."],
  "readerQuestions": ["..."],
  "outOfScope": ["..."],
  "suggestedExamples": ["..."],
  "draftStructure": ["Sınıf Nedir?", "Nesne Nasıl Oluşturulur?", "..."],
  "estimatedReadingTime": 7
}
```

---

## Kurallar

- `tags`: **yalnız** `taxonomy.json`'daki slug'lar. Yeni slug uydurma.
- `category`: taxonomy.json'daki geçerli category slug.
- `slugBase`: TR karaktersiz, sadece `[a-z0-9-]`, max 60 karakter.
- `assets.diagrams`: başta `[]` — görseller Visual Studio'da sonra eklenir.
- `schemaType` seçimi: teknik tutorial → `TechArticle`, görüş yazısı → `BlogPosting`.
- Makale dizinini oluştur: `mkdir -p content/series/SERI_SLUG/articles/YAZI_ID/`

---

## Sonra Ne Yapılır

Brief onaylandıktan sonra → `outline.md` promptu ile outline üret.
