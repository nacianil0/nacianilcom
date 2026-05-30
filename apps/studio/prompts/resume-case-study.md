# Prompt: Resume / Case Study

## Amaç (Purpose)
CV kaynağından (content/resume/sources/) canonical resume.json ve portfolio case study MDX'i oluştur.

## Okur (Reader)
İşveren, işe alım uzmanı, teknik müdür; özlü ve kanıt odaklı anlatım bekler.

## Üretir (Produces)
- `content/resume/resume.json` taslağı (WP-12 şemasına göre)
- Case study MDX taslağı: problem → çözüm → sonuç yapısında

## Format
JSON bloğu (resume.json) + MDX case study taslağı.

## Kurallar
- Ölçülebilir sonuçlar kullan: "%" veya sayısal katkı
- Her case study: Problem / Çözüm Yaklaşımı / Teknik Detay / Sonuç
- `contentType: "case-study"` → meta.json'da
- WP-12 hazır olmadan bu çıktıyı web'e yayınlama

## Aşama (Phase)
Faz WP-12 (Resume/Portfolio). Çıktı: resume.json + case-study MDX taslağı.

## Hedef Path + Schema
- `content/resume/resume.json` → WP-12 ResumeSchema (henüz tanımlanmamış)
- `content/standalone/<id>/final.tr.mdx` veya `content/series/.../final.tr.mdx`
