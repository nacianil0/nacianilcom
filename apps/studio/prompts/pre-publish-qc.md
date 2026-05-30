# Prompt: Pre-Publish QC Report

## Amaç (Purpose)
Bir yazı yayınlanmadan önce tam kalite kontrol raporu üret. Blocking sorunlar varsa yayını engeller; uyarılar iyileştirme önerir.

## Girdi (Input)
- `content/series/<slug>/articles/<id>/meta.json`
- `content/series/<slug>/articles/<id>/final.tr.mdx` (ve/veya `.en.mdx`)
- `content/series/<slug>/series.json`
- `content/taxonomy.json`

## Üretir (Produces)
QC raporu — JSON formatında (aşağıdaki schema) + insan-okunur özet.

```json
{
  "articleId": "...",
  "seriesSlug": "...",
  "generatedAt": "ISO timestamp",
  "blocking": [
    { "code": "MISSING_DESCRIPTION", "field": "description", "message": "..." }
  ],
  "warnings": [
    { "code": "SHORT_CONTENT", "field": "body", "message": "..." }
  ],
  "passed": true
}
```

## Kontrol Listesi

### Blocking (yayını engeller)
- [ ] `title` mevcut ve ≤70 karakter
- [ ] `description` mevcut ve ≤155 karakter
- [ ] `publishDate` geçerli ISO date (YYYY-MM-DD)
- [ ] `status` ∈ {published, scheduled}
- [ ] `slugBase` mevcut, lowercase, URL-safe
- [ ] MDX frontmatter geçerli (FrontmatterSchema)
- [ ] Tüm `<InternalLink>` referansları geçerli (mevcut article/series ID'si)
- [ ] SVG varsa sanitize edilmiş (WP-10 — el ile kontrol)
- [ ] Hiç `NEXT_PUBLIC_` dışı secret MDX gövdesinde yok

### Uyarılar
- [ ] `summary` mevcut (2–3 cümle)
- [ ] `tags` listesi boş değil
- [ ] `difficulty` belirtilmiş
- [ ] Okuma süresi >2dk (çok kısa içerik)
- [ ] `updatedDate` mevcut (revision varsa)
- [ ] EN uyarlaması mevcut (çift dil)
- [ ] Tüm referanslar (references.json) geçerli URL

## Hedef Path + Schema
- Çıktı: `content/series/<slug>/articles/<id>/seo-qc.json`
- Inbox kind: `seoQc` ile route edilir
