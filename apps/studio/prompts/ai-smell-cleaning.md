# AI-Generic Koku Temizleme

## Rol
nacianilcom repo'sunda içerik kalitesi kontrolü yapıyorsun.
AI ürettiği metnin bıraktığı jenerik kalıpları tespit et ve temizle.
Çıktı: aynı dosyaya temizlenmiş içerik yaz.

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_SLUG=yazilimda-temel-kavramlar
YAZI_ID=04-sinif-ve-nesne
LANG=tr
```

---

## Oku

`content/series/SERI_SLUG/articles/YAZI_ID/final.LANG.mdx`

---

## Tespit Edilecek AI Kalıpları

### Kalıp 1 — Gereksiz Meta-Açıklamalar
```
"Bu makalede X'i ele alacağız."
"Şimdi Y'ye bakacağız."
"Sonuç olarak Z öğrendik."
"Bu bölümde öğreneceklerimiz:"
"Bu kılavuzda..."
```
**Aksiyon:** Sil. Bölümün içeriği zaten ne olduğunu söylüyor.

### Kalıp 2 — Boş Güvence Kelimeleri
```
"Aslında", "Esasen", "Temel olarak", "Önemle belirtmek gerekir ki"
"Açıkça görülmektedir", "Şüphe yok ki", "Kesinlikle"
"Kolayca", "Basitçe", "Sadece" (trivializing)
```
**Aksiyon:** Kel cümle yeterince güçlüdür — bu kelimeler çoğunlukla gereksiz.

### Kalıp 3 — Yapay Coşku
```
"Harika!", "Mükemmel!", "İşte bu kadar!", "Tebrikler!"
"Bu çok güçlü bir özellik!", "Bunu seveceksiniz!"
"Oldukça etkileyici..."
```
**Aksiyon:** Sil veya nötr gerçekle değiştir.

### Kalıp 4 — Liste Dolgusu
"İlk olarak... İkinci olarak... Son olarak..." ile başlayan ama tek paragrafta daha iyi anlatılabilecek içerik.
**Aksiyon:** Liste gerçekten liste ise bırak; değilse düz yazıya çevir.

### Kalıp 5 — Vague Sonuçlar
```
"Gördüğümüz üzere, X çok önemlidir."
"Umarım bu makale faydalı olmuştur."
"Artık X konusunda güçlü bir temele sahipsiniz."
```
**Aksiyon:** Sil. Son bölüm "bir sonraki adım" ile bitiyorsa yeterli.

### Kalıp 6 — Aşırı Discourse Marker'ları
"Dahası", "Bununla birlikte", "Öte yandan" — her paragrafta kullanılıyorsa.
**Aksiyon:** Birini bırak, diğerlerini sil (bağlantı hâlâ açıksa).

---

## Adımlar

1. Metni oku; yukarıdaki kalıpları tespit et.
2. Her bulgu için terminal raporu:
   ```
   [LINE 12] "Bu makalede sınıfları ele alacağız." → SİL
   [LINE 45] "Aslında bu oldukça basit" → "Bu" yeterli
   [LINE 67] "Kesinlikle öğrenmeye değer" → SİL
   ```
3. Tüm değişiklikleri uygula.
4. Temizlenmiş metni dosyaya yaz.

---

## Çıktı

**Dosyaya yaz:** `content/series/SERI_SLUG/articles/YAZI_ID/final.LANG.mdx`

Terminal raporu:
```
Toplam bulgu: X
  Silinen: Y
  Değiştirilen: Z
Temizlik oranı: ~N karakter kaldırıldı
```

---

## Kurallar

- **Teknik içeriği değiştirme** — tanımlar, kod örnekleri, sayısal değerler dokunulmaz.
- **Frontmatter değiştirme** (title/description/summary) — SEO'ya bağlı.
- **MDX bileşenlerini koru** — Callout, CodeBlock vb.
- Bir şey eklemek zorunda değilsin — temizlik yeterli.
- Şüpheli ama ok görünen ifadeyi bırak; kesin AI kokusu olan ifadeyi temizle.

---

## Sonra Ne Yapılır

Temizleme sonrası → `tr-final-mdx.md` ile frontmatter + MDX bileşenleri ekle.
