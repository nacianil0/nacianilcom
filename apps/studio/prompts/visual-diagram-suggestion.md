# Prompt: Visual / Diagram Suggestion

## Amaç (Purpose)
Makale içeriğini analiz ederek hangi kavramların görsel açıklamaya ihtiyaç duyduğunu belirle; uygun diyagram türü ve içerik öner.

## Okur (Reader)
Görsel öğreniciyi destekle; ancak görsel metin olmadan da eksiksiz olmalı.

## Üretir (Produces)
- Görsel gereken bölümler + gerekçe
- Her görsel için: tür (LayeredModel | Pyramid | Comparison | flowchart | sequence | VisualBlock), başlık, kısa içerik açıklaması
- Mermaid (.mmd) dosyası için taslak kodu (flowchart/sequence durumunda)

## Format
Her öneri için:
```
Bölüm: [H2 başlık]
Tür: [bileşen adı veya mermaid türü]
Başlık: "..."
Açıklama: ...
Taslak kod (opsiyonel): ...
```

## Kurallar
- packages/ui bileşenlerini önce dene: Comparison, LayeredModel, Pyramid, VisualBlock
- Karmaşık akış için Mermaid flowchart/sequence → WP-10'da .mmd→.svg pipeline'ı var
- Görsel sayısını minimize et; 1 iyi görsel > 3 kötü görsel
- `assets.diagrams` alanına eklenecek svg path'i öneri olarak ver

## Aşama (Phase)
Faz 7 (opsiyonel) — Visual. Çıktı: görsel öneri belgesi; SVG oluşturma WP-10 kapsamında.
