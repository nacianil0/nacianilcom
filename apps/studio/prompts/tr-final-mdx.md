# TR Final MDX — Frontmatter + Bileşenler

## Rol
nacianilcom repo'sunda çalışıyorsun.
Revize + temizlenmiş TR taslağını production-ready MDX formatına dönüştür.
Frontmatter ekle, uygun MDX bileşenlerini yerleştir.
Çıktı: `content/series/SERI_SLUG/articles/YAZI_ID/final.tr.mdx`

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_SLUG=yazilimda-temel-kavramlar
YAZI_ID=04-sinif-ve-nesne
```

---

## Oku

1. `content/series/SERI_SLUG/articles/YAZI_ID/final.tr.mdx` — mevcut taslak
2. `content/series/SERI_SLUG/articles/YAZI_ID/meta.json` — meta bilgisi
3. `packages/content-core/src/schemas/frontmatter.ts` — FrontmatterSchema
4. `packages/ui/src/index.ts` — export edilen bileşenler listesi
5. Önceki makalelerin frontmatter'larını oku — başlık/açıklama tonu tutarlılığı

---

## Adımlar

### 1 — Frontmatter Yaz

FrontmatterSchema:
```typescript
interface Frontmatter {
  title: string;      // max 70 karakter — SEO başlığı (Türkçe)
  description: string; // max 155 karakter — anahtar kelime içersin, doğal cümle
  summary: string;    // 2–3 cümle makale özeti, okuyucuya hitap
  faq?: Array<{ q: string; a: string; }>;  // optional; 3–5 madde
}
```

`faq` ekle şartı: makale "X nedir?" sorusuna net cevap veriyorsa ekle (SEO FAQ zengin snippet).

### 2 — MDX Bileşenlerini Yerleştir

Mevcut düz markdown içeriğini tara; uygun yerlere bileşen ekle:

**Callout** — önemli not, uyarı veya ipucu:
```mdx
<Callout type="info">Not metni buraya.</Callout>
<Callout type="warning">Dikkat edilecek nokta.</Callout>
<Callout type="tip">Pratik ipucu.</Callout>
```

**Definition** — teknik terim tanımı (ilk kullanım):
```mdx
<Definition term="Polimorfizm">
  Farklı türlerin aynı arayüzü farklı biçimde uygulaması.
</Definition>
```

**Example** — kod dışı örnek veya senaryo:
```mdx
<Example title="Gerçek hayat analojisi">
  Bir Hayvan sınıfı, gerçek dünyadaki hayvan kavramının dijital şablonudur.
</Example>
```

**Warning** — kritik teknik uyarı:
```mdx
<Warning>Bu davranış strict mode'da farklılaşır.</Warning>
```

**Takeaway** — bölüm sonu tek cümle özet (isteğe bağlı):
```mdx
<Takeaway>Sınıflar şablon; her `new` çağrısı bağımsız bir instance üretir.</Takeaway>
```

**CodeBlock** — kod örneği (lang + title zorunlu):
```mdx
<CodeBlock lang="typescript" title="Temel Sınıf Tanımı">
{`class Hayvan {
  constructor(public isim: string) {}

  sesCikar(): string {
    return \`\${this.isim} ses çıkarıyor\`;
  }
}`}
</CodeBlock>
```

**VisualBlock** — SVG diyagram (ancak `content/series/SERI_SLUG/diagrams/DOSYA.svg` varsa):
```mdx
<VisualBlock
  src="/series/SERI_SLUG/diagrams/sinif-uml.svg"
  alt="Sınıf-nesne ilişki diyagramı"
  caption="Hayvan sınıfından iki farklı instance"
  source="Yazar"
/>
```

**InternalLink** — serideki başka makalelere link:
```mdx
<InternalLink kind="article" id="01-degisken-ve-tip">değişkenlere</InternalLink>
<InternalLink kind="series" id="yazilimda-temel-kavramlar">seriye</InternalLink>
```

### 3 — Dosyayı Yaz

---

## Çıktı Format

```mdx
---
title: "Sınıf ve Nesne: JavaScript'te OOP Temelleri"
description: "JavaScript sınıfları (class) ve nesneler: nasıl tanımlanır, nasıl örneklenir, prototype zinciri nedir."
summary: "Sınıflar, nesne oluşturmak için şablon tanımlar. Bu makalede class syntax, constructor ve inheritance temellerini örneklerle inceliyoruz."
faq:
  - q: "Sınıf ile constructor function farkı nedir?"
    a: "Sınıflar ES6 sözdizimi sunar; her ikisi de aynı prototype tabanlı kalıtımı kullanır."
---

# Sınıf ve Nesne Nedir?

...içerik...
```

**Dosyaya yaz:** `content/series/SERI_SLUG/articles/YAZI_ID/final.tr.mdx`

---

## Kurallar

- `title` max 70 karakter — aşarsa kısalt, anlamı koru.
- `description` 120–155 karakter arası, doğal cümle + anahtar kelime.
- Bileşenler yalnızca `packages/ui`'dan export edilenler:
  `Callout`, `Definition`, `Example`, `Warning`, `Takeaway`, `CodeBlock`,
  `VisualBlock`, `Comparison`, `LayeredModel`, `Pyramid`.
- `InternalLink kind`: `"article"` | `"series"` | `"case"`.
- SVG henüz yoksa VisualBlock ekleme.
- Her bölüme Takeaway zorunlu değil — özetlenecek net çıktı varsa ekle.
- Markdown `code` blokları → CodeBlock bileşenine dönüştür.
- İçeriği kısaltma; mevcut yazıyı bileşenlerle zenginleştir.

---

## Sonra Ne Yapılır

TR final MDX hazır → `en-adaptation.md` ile İngilizce versiyon üret.
