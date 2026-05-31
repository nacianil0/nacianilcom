# Taslak Revizyon + Editing

## Rol
nacianilcom repo'sunda editoryal düzeltme yapıyorsun.
Mevcut taslağı incele; akış, netlik, uzunluk ve ton açısından revize et.
Çıktı: aynı dosyaya revize edilmiş içerik yaz.

---

## Değişkenler — ÖNCE DOLDUR

```
SERI_SLUG=yazilimda-temel-kavramlar
YAZI_ID=04-sinif-ve-nesne
LANG=tr          # tr veya en
```

---

## Oku

1. `content/series/SERI_SLUG/articles/YAZI_ID/final.LANG.mdx`
2. `content/series/SERI_SLUG/articles/YAZI_ID/brief.json` — öğrenme hedefleri
3. `content/series/SERI_SLUG/articles/YAZI_ID/outline.json` — bölüm yapısı

---

## Analiz Kontrol Listesi

Her madde için "OK" veya "FIX" yaz:

- [ ] Her H2 bölümü brief'teki `learningObjectives`'ten en az birini karşılıyor mu?
- [ ] Başlangıç "Bu makalede X'i ele alacağız" gibi dolgu ile mi açılıyor?
- [ ] 30 kelimeden uzun cümleler var mı? (sayı ve satır numarası ile listele)
- [ ] Pasif çatı var mı? ("X yapılır" → "X yap") — örnekleri listele
- [ ] Teknik terimler ilk kullanımda parantez içi açıklamalı mı?
- [ ] Kod örnekleri self-contained ve çalışıyor görünüyor mu?
- [ ] Serideki önceki yazılarla çakışan tekrar açıklama var mı?
- [ ] Her bölüm mantıklı geçişle biribirine bağlı mı?

---

## Revizyon Adımları

### 1 — Analiz Raporu
Terminale yaz: hangi madde OK, hangi madde FIX + örnek.

### 2 — Revizyonları Uygula
Açıkla (kısa):
- Silinen: neden silindi
- Eklenen: neden eklendi
- Değiştirilen: ne değişti ve neden

### 3 — Revize Metni Yaz

---

## Çıktı

**Dosyaya yaz:** `content/series/SERI_SLUG/articles/YAZI_ID/final.LANG.mdx`

---

## Kurallar

- Frontmatter varsa (---...--- bloğu) kesinlikle değiştirme.
- MDX bileşenleri (Callout, CodeBlock vb.) varsa koru.
- İçerik anlamını değiştirme; ton ve akışı iyileştir.
- Kısaltma iyidir: 200 kelime kısalırsa daha güçlü metin için tercih et.
- "Neden bu bölüm burada?" sorusuna cevap vermeyenler → taşı veya kaldır.

---

## Sonra Ne Yapılır

Revizyon sonrası → `ai-smell-cleaning.md` ile AI kalıplarını temizle.
