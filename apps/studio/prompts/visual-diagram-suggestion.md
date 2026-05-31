# Görsel / Diyagram Önerisi ve Üretimi

## Rol
nacianilcom repo'sunda çalışıyorsun.
Makale içeriğini analiz edip uygun diyagramları öner ve Mermaid `.mmd` dosyaları üret.
Çıktı: `content/series/SERI_SLUG/diagrams/*.mmd` + MDX snippet'leri

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_SLUG=yazilimda-temel-kavramlar
YAZI_ID=04-sinif-ve-nesne
```

---

## Oku

1. `content/series/SERI_SLUG/articles/YAZI_ID/final.tr.mdx`
2. `content/series/SERI_SLUG/articles/YAZI_ID/outline.json` (varsa)
3. `content/series/SERI_SLUG/diagrams/` — mevcut diyagramlar (varsa)
4. `packages/ui/src/components/VisualBlock.tsx` — bileşen prop'ları

---

## Desteklenen Diyagram Tipleri

### Mermaid (Studio'da .mmd → .svg pipeline var)

| Tip | Ne zaman kullan | Örnek |
|---|---|---|
| `flowchart TD/LR` | Karar akışı, proses adımları | "X nasıl çalışır?" |
| `stateDiagram-v2` | Nesne/sistem yaşam döngüsü | "Promise durumları" |
| `graph TD` | Kavram haritası, ilişki ağı | "Inheritance zinciri" |
| `timeline` | Tarihsel gelişim | "JS'in evrimi" |

### packages/ui Bileşenleri (MDX içinde doğrudan kullan)
- `Comparison` — iki yaklaşım yan yana karşılaştırma
- `LayeredModel` — katmanlı mimari/soyutlama
- `Pyramid` — önem/sıklık piramidi

---

## Adımlar

### 1 — İçerik Analizi
Makaleyi oku; diyagram eklenebilecek yerleri belirle (max 4 diyagram):
- Karar akışı anlatan paragraf → flowchart
- Sıralı adımlar (3+) → flowchart top-down
- Kavramlar arası ilişki → graph TD
- Nesne/sistem yaşam döngüsü → stateDiagram-v2
- Tarihsel veya sıralı gelişim → timeline
- İki yaklaşım karşılaştırması → Comparison bileşeni (MDX içi, .mmd gerekmez)

### 2 — Öneri Raporu
Her öneri için:
```
Bölüm: [H2 başlık]
Tip: [mermaid flowchart|stateDiagram-v2|graph|timeline veya Comparison|LayeredModel|Pyramid]
Dosya adı: sinif-nesne-iliskisi   (uzantısız)
Gerekçe: hangi paragraf/kavramı görselleştiriyor
```

### 3 — .mmd Dosyaları Üret
Her Mermaid diyagramı için `content/series/SERI_SLUG/diagrams/DOSYA_ADI.mmd` oluştur.

### 4 — MDX Snippet Üret
Her diyagram için `final.tr.mdx`'e eklenecek snippet:
```mdx
<VisualBlock
  src="/series/SERI_SLUG/diagrams/DOSYA_ADI.svg"
  alt="..."
  caption="..."
  source="Yazar"
/>
```
Bu snippet'i nereye ekleyeceğini belirt (hangi H2 bölümünün altına).

---

## Mermaid Kuralları

```
# Geçerli örnek
flowchart TD
  A[Sınıf Tanımı] --> B["new Operatörü"]
  B --> C[Nesne Oluşur]
  C --> D[constructor Çağrılır]

# KAÇIN — sanitizer kaldırır
- onclick, onload gibi event attribute
- javascript: scheme
- <script> veya <foreignObject> bloğu
- External http:// URL (src, href, xlink:href)
```

---

## Çıktı

1. `.mmd` dosyaları: `content/series/SERI_SLUG/diagrams/`
2. MDX snippet'ler: terminale yaz — kullanıcı ilgili yere yapıştırır
3. Özet rapor:
   ```
   Oluşturulan diyagramlar:
   ✓ sinif-nesne-iliskisi.mmd — flowchart — "Sınıf Nedir?" bölümü
   ✓ inheritance-zinciri.mmd — graph TD — "Kalıtım" bölümü

   Sonraki adım:
   Studio → Visual Studio → seri seç → .mmd dosyasını seç → Render → Preview → Commit
   ```

---

## Kurallar

- Max 4 diyagram/makale (§15).
- Mermaid diyagramları Studio'nun Visual Studio ekranından render edilecek — sadece .mmd oluştur, .svg oluşturma.
- `VisualBlock src` `/series/SERI_SLUG/diagrams/DOSYA_ADI.svg` formatında (SVG'ye referans).
- `alt` ve `caption` Türkçe (TR MDX için), İngilizce snippet ayrıca üret (EN MDX için).
- Comparison/LayeredModel/Pyramid bileşenleri için .mmd gerekmez; MDX'e doğrudan yaz.
- Diyagram sayısını minimize et: 1 iyi görsel > 3 sıradan görsel.

---

## Sonra Ne Yapılır

.mmd dosyaları oluşturulduktan sonra:
Studio → **Visual Studio** ekranı:
1. Seri seç (sol panel)
2. `.mmd` dosyasına tıkla → editörde açılır
3. "Render →" tıkla → SVG önizle
4. "Commit" → sanitized SVG `content/series/.../diagrams/`'a kaydedilir
5. `final.tr.mdx`'e snippet yapıştır + `meta.json assets.diagrams` güncelle
