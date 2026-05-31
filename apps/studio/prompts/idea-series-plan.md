# Fikir → Seri Planı (series.json)

## Rol
nacianilcom repo'sunda çalışıyorsun.
Bir fikir veya konu alanından tam içerik serisi planla, `series.json` oluştur.
Çıktı: `content/series/SERI_SLUG/series.json` + her makale için `meta.json` stub

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_KONUSU="JavaScript'te Asenkron Programlama"
SERI_SLUG=javascript-asenkron-programlama   # lowercase, sadece harf-rakam-tire
HEDEF_YAZI_SAYISI=5                          # 3–8 arası önerilir
ZORLUK=intermediate                           # beginner|intermediate|advanced
```

---

## Oku

1. `content/taxonomy.json` — geçerli category + tag slug'ları
2. `content/series/` — mevcut seriler (kapsam çakışması + order değeri için)
3. `packages/content-core/src/schemas/series.ts` — SeriesSchema
4. `packages/content-core/src/schemas/meta.ts` — MetaSchema (stub dosyalar için)

---

## Adımlar

### 1 — Kapsam Analizi
- SERI_KONUSU zaten bir seride ele alınmış mı? → Çakışma varsa not et.
- Hedef okuyucu: ZORLUK'a göre ne biliyor, ne öğrenecek?
- Bu serinin sona erdiğinde okuyucuya ne kazandıracağını tek cümlede tanımla.

### 2 — Makale Listesi Tasarla
HEDEF_YAZI_SAYISI kadar makale planla:
- Sıra mantıklı: temel → uygulama → derinlik
- Her makale bağımsız okunabilmeli; seriyi takip etmek avantaj sağlamalı
- Her makale ID'si: `NN-slug` formatı (ör: `01-callback-nedir`)
- `slugBase`: Türkçe karaktersiz, tire-ayrılmış, max 60 karakter

### 3 — Series Order
Mevcut serilerin `order` değerlerine bak; bu seri için bir sonraki boş değeri al.

### 4 — series.json Yaz

### 5 — meta.json Stub'ları Oluştur
Her makale için `content/series/SERI_SLUG/articles/NN-slug/meta.json`:
- Tüm alanlar mevcut, `status: "draft"`, `publishDate` bugünün tarihi
- `slugBase`, `category`, `tags` en iyi tahmini yap (taxonomy.json'dan)

---

## Schema

```typescript
// SeriesSchema — packages/content-core/src/schemas/series.ts
interface BilingualText { tr: string; en: string; }

interface Series {
  slug: string;               // SERI_SLUG
  title: BilingualText;       // { tr: "...", en: "..." }
  description: BilingualText; // 2–3 cümle { tr: "...", en: "..." }
  order: number;              // sıra (mevcut serilerin ardından)
  cover?: string;             // optional
  articleOrder: string[];     // ["01-slug", "02-slug", ...]
}

// MetaSchema (stub — packages/content-core/src/schemas/meta.ts)
interface Meta {
  id: string;                 // "NN-slug"
  series: string;             // SERI_SLUG
  order: number;              // 1, 2, 3...
  slugBase: string;           // TR karaktersiz, harf-rakam-tire
  category: string;           // taxonomy.json'dan geçerli slug
  tags: string[];             // max 5, taxonomy.json'dan geçerli
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "draft";
  publishDate: string;        // "YYYY-MM-DD"
  schemaType: "TechArticle" | "Article" | "BlogPosting";
  contentType: "research" | "explainer" | "architecture" | "essay";
  languages: ["tr", "en"];
  assets: { diagrams: [] };
}
```

---

## Çıktı

**Dosya 1:** `content/series/SERI_SLUG/series.json`
```json
{
  "slug": "SERI_SLUG",
  "title": { "tr": "...", "en": "..." },
  "description": { "tr": "...", "en": "..." },
  "order": 2,
  "articleOrder": ["01-callback-nedir", "02-promise", "03-async-await", ...]
}
```

**Dosya 2–N:** Her makale için `content/series/SERI_SLUG/articles/NN-slug/meta.json`

---

## Kurallar

- `slug` tamamen lowercase, sadece `[a-z0-9-]`.
- `articleOrder` henüz yazılmamış makaleleri de içerir.
- `description` Türkçe versiyonu "Bu seride..." ile başlama.
- `category` taxonomy.json'dan geçerli bir slug olmalı.
- `series.order` mevcut serilerin en büyük order değerinin bir fazlası.
- Dizinleri oluştur: `mkdir -p content/series/SERI_SLUG/articles/NN-slug/`

---

## Sonra Ne Yapılır

Seri planı oluşturulduktan sonra her makale için → `article-brief.md` promptu.
Monthly Plan'a seriyi ekle → ilk makaleleri sırayla seç.
