# Prompt: AI-Generic Smell Cleaning

## Amaç (Purpose)
Metindeki "AI-generic" kalıpları tespit et ve doğal, birinci tekil şahıs sesine dönüştür. Okuyucu bu yazının bir AI tarafından üretildiğini hissedebilir — bu prompt o hissi giderir.

## Nedir "AI-generic koku"?
- Sıkça başlayan: "Kesinlikle", "Tabii ki", "Şüphesiz", "Kuşkusuz", "Certainly", "Absolutely"
- Gereksiz kibarlık: "Harika bir soru!", "Bu çok önemli bir konu…"
- Yapay geçişler: "Bunu anlayabilmek için önce…", "Şimdi sıra geldi…", "Bu bağlamda…"
- Clunky meta-commentary: "Bu yazıda şunu öğreneceksiniz…"
- Anlamsız hedging: "Genel olarak", "Çoğu zaman", "Bazı durumlarda" (gereksiz olanlar)
- Overused discourse markers: "Dahası", "Bununla birlikte", "Öte yandan" (her paragrafta)
- En başta boş vaatler: "Bu kılavuzda…" / "Bu makalede şunları ele alacağız…"

## Çıktı Formatı
Temizlenmiş içerik, şu formatta:
```
<!-- CLEANED: line N — "original phrase" → "replacement" -->
```
Her değişiklik için bir satır yorum ekle, sonra temiz MDX gövdesi.

## Kurallar
- Teknik içeriği (tanımlar, kod örnekleri) ASLA değiştirme
- Frontmatter (title/description/summary) DEĞİŞTİRME — SEO'ya bağlı
- Silinecek cümle varsa sil; boşluğu önceki/sonraki cümleyle kapat
- Yazarın sesini koru — robot değiştirme yapma

## Hedef Path + Schema
- Mevcut dosya: `content/series/<slug>/articles/<id>/final.<lang>.mdx`
- Schema: `FrontmatterSchema` (packages/content-core/src/schemas/frontmatter.ts)
