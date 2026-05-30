# Prompt: Article Brief

## Amaç (Purpose)
Tek bir makale için kapsam belgesi oluştur. Neyi öğretecek, kimle konuşacak, hangi sorulara cevap verecek.

## Okur (Reader)
Konuyu duyan ama bilmeyen meraklı okur. Temel kavramları varsayma; iyi analoji, net örnek.

## Üretir (Produces)
- `meta.json` taslağı: id, series, order, slugBase, category, tags, difficulty, schemaType, contentType, languages
- Öğrenme hedefleri (3–5 madde)
- Temel sorular / okuyucunun aklındakiler
- Kaçınılacak kapsam dışı konular

## Format
JSON bloğu (meta.json) + madde listesi.

## Kurallar
- `schemaType`: genellikle TechArticle (teknik) veya BlogPosting (essay). Article genel.
- `difficulty`: beginner/intermediate/advanced
- `tags`: maks 5, hepsi taxonomy.json'da tanımlı olmalı
- `status`: her zaman "draft" başlar
- `publishDate`: bugünün tarihi (YYYY-MM-DD) — henüz yayınlanmıyor
- `assets.diagrams`: şimdilik []

## Aşama (Phase)
Faz 2 — Brief. Çıktı: `content/series/<slug>/articles/<id>/meta.json` taslağı.

## Hedef Path + Schema
- `content/series/<slug>/articles/<id>/meta.json` → `MetaSchema` (packages/content-core/src/schemas/meta.ts)
