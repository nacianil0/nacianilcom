# TR Taslak (İlk Draft) Yaz

## Rol
nacianilcom repo'sunda çalışıyorsun.
Onaylı outline'dan Türkçe makale ilk taslağını yaz.
**Bu aşamada frontmatter veya MDX bileşenleri YOK — düz Markdown yeterli.**
Çıktı: `content/series/SERI_SLUG/articles/YAZI_ID/final.tr.mdx`

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_SLUG=yazilimda-temel-kavramlar
YAZI_ID=04-sinif-ve-nesne
```

---

## Oku

1. `content/series/SERI_SLUG/articles/YAZI_ID/outline.json`
2. `content/series/SERI_SLUG/articles/YAZI_ID/brief.json`
3. `content/series/SERI_SLUG/articles/YAZI_ID/meta.json`
4. Serideki önceki `final.tr.mdx` dosyalarını oku (ton + terminoloji tutarlılığı)

---

## Adımlar

1. Outline'daki her `section`'ı sırayla yaz.
2. Teknik terimler ilk kullanımda parantez içi Türkçe veya açıklama: `sınıf (class)`, `örnek (instance)`.
3. Kod örnekleri: triple-backtick, dil belirt, kısa Türkçe yorum satırı ekle.
4. Her bölüm sonuna kısa geçiş cümlesi (akış için).
5. Kendi kendine revizyon:
   - Her paragraf max 25–30 kelime mi?
   - Pasif çatı var mı? → Aktife çevir.
   - "Aslında", "Açıkça", "Temel olarak" dolgu var mı? → Kaldır.

---

## Yazı Kuralları

- **Cümle uzunluğu:** max 25–30 kelime. Uzunsa böl.
- **Paragraf:** 3–5 cümle, bir fikir.
- **Aktif çatı** tercih: "değişken değeri tutar" > "değer değişken tarafından tutulur".
- **Teknik terim:** ilk kullanımda `terim (İngilizce)` formatı.
- **Kod örnekleri:** minimal, self-contained, Türkçe kısa yorum.
- **Kaçın:** "Bu makalede...", "Şimdi bakacağız...", "Sonuç olarak öğrendik ki..."
- **Kaçın:** "Açıkça", "Temel olarak", "Aslında", "Önemle belirtmek gerekir" dolgu kalıpları.
- **Kaçın:** Serideki önceki yazılarda zaten açıklanan kavramları yeniden açıklama.

---

## Çıktı Format

```markdown
# Sınıf ve Nesne Nedir?

JavaScript ve TypeScript'te sınıflar (class), nesne oluşturmak için şablon görevi görür.

## Sınıf Nedir?

Bir sınıf, benzer özelliklere sahip nesneler için ortak davranış tanımlar.

```typescript
class Hayvan {
  isim: string;

  constructor(isim: string) {
    this.isim = isim;
  }

  sesCikar(): string {
    return `${this.isim} ses çıkarıyor`;
  }
}
```

...
```

**Dosyaya yaz:** `content/series/SERI_SLUG/articles/YAZI_ID/final.tr.mdx`
Dosya mevcutsa üzerine yaz — içerik versiyonlanmış Git'te.

---

## Kurallar

- Frontmatter YOK (---...--- bloğu). Sadece `# Başlık` ve Markdown gövde.
- MDX bileşeni ekleme — bu aşamada düz metin yeterli.
- `outline.json`'daki `totalEstimatedWords` hedefine ±%20 yaklaş.
- Seri içindeki diğer yazıları `[01-degisken](...)` gibi bağlama — link path sonra eklenecek.

---

## Sonra Ne Yapılır

Taslak tamamlanınca sırasıyla:
1. `revision.md` — yapısal + dil revizyonu
2. `ai-smell-cleaning.md` — AI kalıplarını temizle
3. `tr-final-mdx.md` — frontmatter + MDX bileşenleri ekle
