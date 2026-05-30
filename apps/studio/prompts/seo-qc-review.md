# Prompt: SEO / QC Review

## Amaç (Purpose)
Yayın öncesi son SEO ve kalite kontrolü yap. runQC çıktısını yorumla, eksikleri tespit et.

## Okur (Reader)
Bu prompt Claude Code için — makale yazarına değil sisteme yönelik.

## Üretir (Produces)
- runQC raporu özeti (blocking / warning ayrımı)
- `title`, `description`, `summary` SEO değerlendirmesi (uzunluk, anahtar kelime, netlik)
- Canonical URL ve hreflang kontrolü
- Eksik veya zayıf referans tespiti
- Öncelikli düzeltme listesi

## Format
Maddeli liste; blocking önce, warning sonra. Her madde: [GRUP] KOD — açıklama.

## Kurallar
- runQC blocking > 0 ise yayına izin verme
- `title` < 70, `description` < 160 karakter (FrontmatterSchema)
- Tüm InternalLink hedefleri public ve mevcut olmalı
- taxonomy.json'da tanımlanmayan category/tag bloklanır
- Redirect hedefleri kendi içinde döngüsüz ve public olmalı

## Aşama (Phase)
Faz 8 — QC. Çıktı: Studio SEO/QC Check ekranından okunabilir rapor.
