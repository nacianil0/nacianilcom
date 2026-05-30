# Prompt: EN Adaptation (İngilizce Uyarlama)

## Amaç (Purpose)
Tamamlanmış TR Final MDX'ten İngilizce uyarlama yaz. Çeviri değil, doğrudan İngilizce okur için yazılmış metin.

## Okur (Reader)
İngilizce konuşan, Türk kültürel bağlamına aşina olmayan teknik okur.

## Üretir (Produces)
`content/series/<slug>/articles/<id>/final.en.mdx` — tam MDX dosyası.

## Format
TR Final MDX ile aynı yapı: frontmatter + MDX bileşenleri.

## Kurallar
- Türkçe özel deyimler / kültürel referansları evrensel karşılıklarıyla değiştir
- Örnekler ihtiyaç halinde İngilizce bağlama uyarlanabilir
- `title` / `description` / `summary` İngilizce olarak yeniden yaz — doğrudan çevirme
- Bileşenler ve InternalLink kullanımı TR ile aynı kalmalı
- `meta.json`'da `"languages": ["tr", "en"]` olduğundan emin ol

## Aşama (Phase)
Faz 6 — EN Adaptation. Çıktı: `final.en.mdx`.

## Hedef Path + Schema
- `content/series/<slug>/articles/<id>/final.en.mdx` → `FrontmatterSchema`
