# Prompt: Monthly Plan

## Amaç (Purpose)
Bir aylık içerik üretim planı oluştur: hangi makaleler yazılacak, ne zaman, hangi sırayla.

## Okur (Reader)
Bu prompt yazar (kullanıcı) için — sürecini planlama aracı.

## Üretir (Produces)
- `content/plans/<YYYY-MM>.json` → `MonthlyPlanSchema` şemasına uygun
- Haftalık içerik hedefleri
- Öncelik sırası (yayın durumu, bağımlılıklar)

## Format
JSON bloğu (MonthlyPlanSchema) + haftalık takvim özeti.

## Kurallar
- Takvim gerçekçi olsun; ayda 2–4 makale hedefle
- Seri bütünlüğünü koru: bir serinin makaleleri sıralı yayınlanmalı
- "scheduled" makalelerin publishDate'ini plan içinde belirt
- plans.json `ScoresSchema` alanlarını (reach, engagement, seo, difficulty) doldurmayı dene

## Aşama (Phase)
WP-11 (Monthly Plan). Çıktı: `content/plans/<YYYY-MM>.json`.

## Hedef Path + Schema
- `content/plans/<YYYY-MM>.json` → `MonthlyPlanSchema` (packages/content-core/src/schemas/plans.ts)
