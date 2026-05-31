# EN Uyarlama (İngilizce Versiyon)

## Rol
nacianilcom repo'sunda çalışıyorsun.
Türkçe final MDX'ten İngilizce uyarlama üret.
**Bu bir çeviri değil** — İngilizce okuyucuya yönelik bağımsız uyarlama.
Çıktı: `content/series/SERI_SLUG/articles/YAZI_ID/final.en.mdx`

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_SLUG=yazilimda-temel-kavramlar
YAZI_ID=04-sinif-ve-nesne
```

---

## Oku

1. `content/series/SERI_SLUG/articles/YAZI_ID/final.tr.mdx` — TR final (kaynak)
2. `content/series/SERI_SLUG/articles/YAZI_ID/meta.json`
3. `packages/content-core/src/schemas/frontmatter.ts` — FrontmatterSchema
4. Serideki diğer `final.en.mdx` dosyalarını oku (ton + terminoloji tutarlılığı)

---

## Uyarlama Farkları

| TR | EN |
|---|---|
| Türkçe ton | Slightly more direct, fewer hedging phrases |
| `terim (İngilizce)` parantezleri | Kaldır — EN okuyucu zaten biliyor |
| Türkçe kültürel analoji | Global/nötr analojiye çevir |
| Türkçe başlık/description/summary | EN olarak yeniden yaz |
| Türkçe kod yorumları | İngilizce yorum |
| Türkçe bileşen metinleri (alt, caption, title) | İngilizce çevir |

---

## Adımlar

### 1 — Frontmatter (EN)
```typescript
{
  title: string;       // EN başlık, max 70 kar — EN okuyucunun arayacağı terimler
  description: string; // EN SEO açıklaması, max 155 kar
  summary: string;     // EN özet, 2–3 cümle
  faq?: Array<{ q: string; a: string; }>;  // TR'de varsa EN'e çevir
}
```

### 2 — İçerik Uyarlama
- TR'ye özgü kültürel referanslar → global örneklerle değiştir
- `terim (Türkçe)` parantezlerini kaldır
- Kod yorumlarını İngilizce yap
- Kod örnekleri genellikle dil-nötr — aynı kalabilir (değişken isimleri ve string değerleri EN yap)
- MDX bileşenleri koru; içeriklerini EN'e çevir
- `InternalLink` bileşenleri koru

### 3 — Dosyayı Yaz

---

## Çıktı Format

```mdx
---
title: "Classes and Objects: OOP Fundamentals in JavaScript"
description: "JavaScript classes and objects explained: how to define them, create instances, and understand the prototype chain with practical examples."
summary: "Classes are templates for creating objects. This article covers class syntax, constructors, methods, and inheritance basics with hands-on TypeScript examples."
faq:
  - q: "What is the difference between a class and a constructor function?"
    a: "Classes are ES6 syntax sugar; both use the same prototype-based inheritance under the hood."
---

# What Are Classes and Objects?

...content...
```

**Dosyaya yaz:** `content/series/SERI_SLUG/articles/YAZI_ID/final.en.mdx`

---

## Kurallar

- Kelimesi kelimesi çeviri yapma. EN okuyucuya doğal aktaran metni yaz.
- `title` ve `description` EN okuyucunun aradığı arama terimlerini içersin.
- Türkçe karakter (ş, ç, ö, ü, ğ, ı) kesinlikle kalmamalı.
- Kod örnekleri: Türkçe yorum satırları + değişken/string değerleri İngilizce yap.
- `alt`, `caption`, `title` prop'ları İngilizce.
- Bileşen tiplerini değiştirme (Callout → Callout, vb.).
- `meta.json`'da `languages: ["tr", "en"]` olduğunu kontrol et.

---

## Sonra Ne Yapılır

Her iki MDX hazır → `pre-publish-qc.md` ile tam QC yap, ardından Publisher ekranından yayınla.
