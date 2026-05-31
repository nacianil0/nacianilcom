# SEO / QC İnceleme Raporu

## Rol
nacianilcom repo'sunda çalışıyorsun.
Yayın öncesi makale SEO + kalite kontrolü yap; kritik sorunları listele.
Çıktı: terminal raporu + mümkünse otomatik fix.

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_SLUG=yazilimda-temel-kavramlar
YAZI_ID=04-sinif-ve-nesne
```

---

## Oku

1. `content/series/SERI_SLUG/articles/YAZI_ID/meta.json`
2. `content/series/SERI_SLUG/articles/YAZI_ID/final.tr.mdx`
3. `content/series/SERI_SLUG/articles/YAZI_ID/final.en.mdx`
4. `content/taxonomy.json` — geçerli category + tag slug'ları
5. `content/series/SERI_SLUG/series.json`
6. `packages/content-core/src/schemas/meta.ts`
7. `packages/content-core/src/schemas/frontmatter.ts`

---

## Kontrol Listeleri

### A — meta.json
- [ ] `id` format: `NN-slug` (ör: `04-sinif-ve-nesne`)
- [ ] `series` = SERI_SLUG ile eşleşiyor mu?
- [ ] `order` değeri serideki başka bir makaleyle çakışmıyor mu?
- [ ] `slugBase` sadece `[a-z0-9-]` karakterleri (TR karakter yok)?
- [ ] `category` → taxonomy.json'da geçerli bir slug mu?
- [ ] `tags` max 5, hepsi taxonomy.json'da geçerli slug mu?
- [ ] `status` → şu an "draft" mu? (yayında değilse beklenen)
- [ ] `publishDate` format `YYYY-MM-DD` mi?
- [ ] `schemaType` içeriğe uygun? (TechArticle=teknik, BlogPosting=essay, Article=genel)
- [ ] `languages: ["tr","en"]` → her iki MDX de mevcut mu?
- [ ] `assets.diagrams` listesindeki SVG dosyaları gerçekten `content/series/.../diagrams/`'da var mı?

### B — TR MDX
- [ ] Frontmatter `title` max 70 karakter?
- [ ] Frontmatter `description` max 155 karakter?
- [ ] Frontmatter `summary` mevcut (2–3 cümle)?
- [ ] `InternalLink` bileşenleri: hedef article/series id'si gerçekten var mı?
- [ ] `VisualBlock` bileşenleri: `src` dosyası `diagrams/` altında mevcut mu?
- [ ] `CodeBlock` bileşenlerinde `lang` prop belirtilmiş mi?
- [ ] Türkçe karakter sorunsuz mu (ş, ç, ö, ü, ğ, ı)?

### C — EN MDX
- [ ] Frontmatter `title` max 70 karakter (TR'den farklı EN başlık)?
- [ ] `description` EN SEO için optimize?
- [ ] Türkçe karakter kalmamış mı (title, description, summary, gövde)?
- [ ] Kod yorumları İngilizce mi?
- [ ] `VisualBlock` alt/caption İngilizce mi?

### D — SEO Analizi
- [ ] `title` arama sorgusunu içeriyor mu?
- [ ] `description` 120–155 karakter arasında mı?
- [ ] H2 başlıklar arama sorgusuyla ilgili kelimeler kullanıyor mu?
- [ ] Makale uzunluğu meta'daki `estimatedReadingTime × 200` kelimeye yakın mı?

---

## Çıktı Format

```
=== SEO/QC RAPORU: SERI_SLUG / YAZI_ID ===

BLOCKER (X):
  [B1] meta.json: slugBase "sinif_nesne" — alt tire URL-unsafe → tire kullan
  [B2] final.tr.mdx: InternalLink id="05-dongu" mevcut değil

WARNING (Y):
  [W1] final.en.mdx: description 108 karakter — 120+ önerilir
  [W2] meta.json: assets.diagrams boş ama VisualBlock var

OK:
  ✓ meta.json schema geçerli
  ✓ category "programlama-temelleri" geçerli
  ✓ TR/EN MDX çifti tamamlanmış
  ✓ title 52/70 karakter

SONUÇ: BLOCKER VAR — yayına alınmadan önce düzelt.
```

Blocker tespit edilirse düzeltmeyi otomatik uygula (meta.json slug fix, geçersiz InternalLink kaldırma gibi basit fixler).

---

## Kurallar

- **Blocker**: publish'i engelleyen sorun — schema hatası, geçersiz referans, URL-unsafe slug.
- **Warning**: iyileştirme önerisi — SEO uzunluğu, eksik opsiyonel alan.
- "OK" listesi geçen kontrolleri göster — güven için.
- `runQC` çağrısı Studio'dan yapılabilir; bu prompt daha derin editorial + meta kontrolü yapar.

---

## Sonra Ne Yapılır

BLOCKER = 0 → Publisher ekranında makaleyi seç → "Publish → Commit → Revalidate".
