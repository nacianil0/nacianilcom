# Yayın Öncesi Tam QC

## Rol
nacianilcom repo'sunda çalışıyorsun.
Makaleyi yayına almadan önce kapsamlı QC yap — editorial + teknik + SEO.
Studio'nun `runQC` aracından daha derin bir inceleme.
Çıktı: terminal raporu + otomatik fixler (blocker için).

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
4. `content/series/SERI_SLUG/articles/YAZI_ID/references.json` (varsa)
5. `content/taxonomy.json`
6. `content/series/SERI_SLUG/series.json`
7. Serideki önceki makalelerin `final.tr.mdx`'lerini oku (çakışma kontrolü)

---

## QC Kategorileri

### 1 — Schema Uyum (meta.json)
- `id`, `series`, `order`, `slugBase`, `category`, `tags` — her alan doğru format ve geçerli değer mi?
- `status: "draft"` veya `"scheduled"` (published değilse her ikisi de ok)
- `publishDate` format `YYYY-MM-DD`
- `languages` array mevcut MDX dosyalarıyla eşleşiyor mu?

### 2 — Teknik Doğruluk (TR MDX)
- Kod örnekleri TypeScript/JavaScript sözdizimi geçerli mi?
- Tanımlar ve açıklamalar teknik olarak doğru mu?
- Serideki önceki yazılarla çelişen ifade var mı?
- `InternalLink` hedefleri (`kind + id`) mevcut ve geçerli mi?
- `VisualBlock` `src` dosyaları gerçekten var mı?

### 3 — İçerik Kalitesi (TR)
- Giriş "Bu makalede..." dolgusuyla mı başlıyor? (blocker değil, warning)
- 30 kelimeden uzun cümle var mı? (satır numarasıyla listele)
- Dolgu kelimeler var mı? (Aslında, Temel olarak, Açıkça)
- Her H2 bölümünün net bir sonucu var mı?
- `brief.json`'daki `learningObjectives` karşılandı mı?

### 4 — İçerik Kalitesi (EN)
- Türkçe kelime kalmamış mı? (tam arama yap)
- Türkçe kod yorumu / string değeri kalmamış mı?
- Doğal İngilizce mi (çeviri kokusu yok)?

### 5 — SEO Hazırlığı
- TR `title` < 70, `description` < 155 karakter?
- EN `title` < 70, `description` < 155 karakter?
- `summary` mevcut (2–3 cümle)?
- `faq` var mı — varsa gerçekten anlamlı soru/cevap çifti mi?

### 6 — Erişilebilirlik / Okunabilirlik
- `CodeBlock` bileşenlerinde `lang` ve `title` var mı?
- `VisualBlock` bileşenlerinde `alt` ve `caption` dolu mu?
- Uzun (5+ cümle) paragraf var mı?

### 7 — references.json (varsa)
- Format geçerli mi? (ReferenceItemSchema)
- URL'ler makul görünüyor mu (erişilebilirlik kontrolü değil, format kontrolü)?

---

## Çıktı Format

```
=== PRE-PUBLISH QC: SERI_SLUG / YAZI_ID ===

BLOCKER (N):
  [B1] meta.json: category "programlama" geçersiz → taxonomy'de yok
  [B2] final.tr.mdx:89 — InternalLink id="08-iterator" mevcut değil

WARNING (M):
  [W1] final.tr.mdx:12 — "Bu makalede sınıfları inceleyeceğiz." → açılış dolgusu
  [W2] final.en.mdx frontmatter — description 108 karakter (120+ önerilir)
  [W3] meta.json — updatedDate yok (optional, iyi olur)

OK:
  ✓ meta.json schema tüm alanlar geçerli
  ✓ title 52/70 karakter (TR), 48/70 (EN)
  ✓ tags taxonomy'de geçerli: ["javascript", "typescript"]
  ✓ TR+EN MDX çifti tamamlanmış
  ✓ CodeBlock'larda lang belirtilmiş

BLOCKER VAR → yayına alınmadan önce düzelt.
```

**Blocker fixlerini otomatik uygula:** geçersiz InternalLink kaldır, slugBase format düzelt.
**Warning fixler** için listele — uygulama kullanıcı kararı.

---

## Kurallar

- **Blocker**: yayını engelleyen — schema hatası, geçersiz referans, TR karakter URL'de.
- **Warning**: iyileştirme — SEO uzunluğu, okunabilirlik, eksik opsiyonel alan.
- OK listesi kısa tut — geçen kritik kontrolleri göster.
- `references.json` yoksa bu kategoriyi atla.

---

## Sonra Ne Yapılır

BLOCKER = 0 → Studio Publisher ekranı:
1. Makaleyi seç (sol panel)
2. QC otomatik çalışır → "All QC checks passed" yeşil
3. Publish tarihi seç → "Publish → Commit → Revalidate"
