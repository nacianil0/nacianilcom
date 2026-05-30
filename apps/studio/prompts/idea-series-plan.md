# Prompt: Idea → Series Plan

## Amaç (Purpose)
Ham bir fikri, tutarlı bir seri yapısına dönüştür. Seri başlığı, kapsam, makale sırası ve her makalenin odak noktası çıkar.

## Okur (Reader)
Teknik bilgiye sahip, merakına öncelik veren okur. Kavramsal derinlik + pratik uygulama dengesi arar.

## Üretir (Produces)
- Seri slug'u ve başlık (TR + EN)
- Seri açıklaması (TR + EN, max 160 karakter)
- Makale listesi: `id`, `slugBase`, `başlık (TR)`, odak cümle
- Önerilen `category` + ilk `tags`

## Format
Önce `series.json` şemasına uygun JSON, ardından her makale için bir satır özet.

## Kurallar
- Slug: sadece küçük harf, tire, latin karakterler (ş→s, ö→o, vb.)
- Makale sayısı: 3–8 arası öner
- Her makale öncekinin üzerine inşa etmeli (seri yolculuğu §14)
- İçerik DB'siz, MDX+JSON Git'te; format değişmesin

## Aşama (Phase)
Faz 1 — İçerik Planlama. Çıktı: `content/series/<slug>/series.json` + madde listesi.

## Hedef Path + Schema
- `content/series/<slug>/series.json` → `SeriesSchema` (packages/content-core/src/schemas/series.ts)
- Makale klasörleri henüz oluşturulmaz; yalnızca `series.json` taslağı
