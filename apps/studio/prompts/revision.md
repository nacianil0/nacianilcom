# Prompt: Revision / Editing

## Amaç (Purpose)
Mevcut bir taslağı veya final MDX'i revize et: yapısal sorunları düzelt, akışı iyileştir, gereksiz tekrarları kaldır, okuyucu için anlamı netleştir.

## Girdi (Input)
Revize edilecek dosya yolu + varsa revizyon notları (ne değişmeli, neden).

## Üretir (Produces)
Revize edilmiş MDX/Markdown içerik — aynı dosya yoluna yazılır.

## Kurallar
- Mevcut başlık/description/summary'yi değiştirme (SEO bağımlılığı var) — sadece gövdeyi revize et
- Bölüm başlıkları korunur; gerekmedikçe yeni bölüm ekleme
- Kod örnekleri dokunulmaz — yalnız çevresindeki açıklama metni revize edilir
- Bileşen kullanımı (Callout, Definition, vb.) korunur; ekleme yapılmaz
- Revize edilen kısmı açıkça belirt: `<!-- REVISED: reason -->`
- AI-generic ifadelerden kaçın (§19 AI-smell cleaning ayrı prompt)
- Çıktı: yalnız revize edilmiş MDX gövdesi (frontmatter dahil)

## Mod / Alt-modlar
- **Yapısal Revizyon**: bölüm sırası, geçişler, konu akışı
- **Dil Revizyon**: cümle açıklığı, uzunluk, sadelik
- **Kısaltma**: gereksiz tekrar, padding, filler kaldırma

## Hedef Path + Schema
- Mevcut dosya: `content/series/<slug>/articles/<id>/final.<lang>.mdx`
- Schema: `FrontmatterSchema` (packages/content-core/src/schemas/frontmatter.ts)
- Inbox kind: `finalMdx` + `status: detected` (revizyonu tekrar route etmek istersen)
