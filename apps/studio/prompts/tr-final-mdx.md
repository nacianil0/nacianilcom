# Prompt: TR Final MDX

## Amaç (Purpose)
Düzeltilmiş Türkçe taslaktan tam MDX dosyasını oluştur. Frontmatter + bileşenler dahil.

## Okur (Reader)
Brief'teki okur profili (son okuyucu = web sitesi ziyaretçisi).

## Üretir (Produces)
`content/series/<slug>/articles/<id>/final.tr.mdx` — tam MDX dosyası.

## Format
```mdx
---
title: "..."
description: "..."
summary: "..."
---

# Başlık
...MDX içerik...
```

## Kurallar
- `title`: max 70 karakter (FrontmatterSchema)
- `description`: SEO için, max 155 karakter
- `summary`: Makale altı özet, 2–3 cümle
- Bileşenler: yalnız packages/ui'dan export edilenler (Callout, Definition, Example, Warning, Takeaway, CodeBlock, VisualBlock, Comparison, LayeredModel, Pyramid)
- InternalLink: `<InternalLink kind="article" id="<article-id>">metin</InternalLink>` — kind: article|series|case
- FAQ varsa: `faq:` frontmatter dizisi (FaqItemSchema) + sayfada `<FAQPage>` JSON-LD otomatik eklenir
- Görsel blok: mevcut SVG varsa `<VisualBlock src="/diagrams/...svg" alt="..." caption="..." />`
- CC'nin son gövdesini bozma; yalnız izinli alanlara dokun

## Aşama (Phase)
Faz 5 — TR Final MDX. Çıktı: yayına hazır `final.tr.mdx`.

## Hedef Path + Schema
- `content/series/<slug>/articles/<id>/final.tr.mdx` → `FrontmatterSchema` (packages/content-core/src/schemas/frontmatter.ts)
