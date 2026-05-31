# Resume Güncelleme / Case Study

## Rol
nacianilcom repo'sunda çalışıyorsun.
resume.json güncellemesi VEYA yeni portfolio case study dosyası üret.

---

## Görev Türü — ÖNCE SEÇ

```
GOREV=resume-update   # "resume-update" veya "case-study"
```

---

# A) resume-update — resume.json Güncelleme

## Değişkenler
```
GUNCELLEME_HEDEFI="Eroğlu Holding - Dashboard modülü"
EKLENEN_BILGI="2026-05'te AI entegrasyonu tamamlandı, 3000+ kullanıcıya dağıtıldı"
```

## Oku
1. `content/resume/resume.json`
2. `packages/content-core/src/schemas/resume.ts` — ResumeSchema, VisibilitySchema

## Visibility Kuralları
```typescript
type Visibility = "public" | "pdf" | "private";
// public:  web sitesinde görünür (/[lang]/cv)
// pdf:     sadece Playwright PDF'te görünür (CV indirme)
// private: hiçbir çıktıda görünmez (yalnız kaynak veri)
```

## Resume İçerik Kuralları

**Ton:**
- Klişe yasak: "passionate", "hard-working", "dynamic", "team player", "innovative" → YOK
- Güçlü fiil + etki: "Entegre etti", "Azalttı", "Geliştirdi", "Dağıttı", "Öncülük etti"
- Rakam yok = nitel anlatım: bilmiyorsan uydurma → `needsReview: true` ekle (özel alan)

**ATS kelimeleri (doğal kullan):**
.NET, ASP.NET Core, C#, React, TypeScript, SQL Server, Entity Framework, REST API,
dashboard, portal, authentication, permission management, reporting, data migration,
AI/API integration, product ownership, end-to-end delivery

**Pozisyon konumlandırması:**
- Eroğlu Holding: amiral uygulama (enterprise-scale, güncel)
- Kansuk: enterprise destek + otomasyon
- Digitallica: müşteri odaklı ürün / startup hızı

## Çıktı
**Sadece değişen bölümü güncelle** — diğer experience/skills/credentials dokunulmaz.

**Dosyaya yaz:** `content/resume/resume.json`

---

# B) case-study — Portfolio Case Study

## Değişkenler
```
CASE_SLUG=kurumsal-dashboard          # content/resume/portfolio/ altındaki dizin adı
PROJE_ADI="Kurumsal İK Dashboard"
SIRKET="Eroğlu Holding"
DONEM="2024-2026"
```

## Oku
1. `content/resume/portfolio/` — mevcut case study örnekleri (format tutarlılığı)
2. `packages/content-core/src/schemas/resume.ts` — CaseStudySchema
3. `content/resume/resume.json` — ilgili pozisyon detayları

## Case Study Schema
```typescript
interface BilingualText { tr: string; en: string; }

interface CaseStudy {
  title: BilingualText;                  // Kısa proje adı
  company: string;                       // Şirket adı
  period: string;                        // "2024–2026"
  role: string;                          // Pozisyon
  summary: BilingualText;                // 2–3 cümle, ne yaptı
  problem: BilingualText;                // Hangi sorunu çözdü (somut)
  solution: BilingualText;               // Nasıl çözdü (teknik seçimler + gerekçe)
  impact: BilingualText;                 // Sonuç/etki (ölçülebilirse sayısal)
  tech: string[];                        // Kullanılan teknolojiler
  visibility: "public" | "pdf" | "private";
}
```

## Case Study İçerik Kuralları
- **problem:** "X sisteminde Y sorunu vardı" — somut, ölçülebilir veya gözlemlenebilir
- **solution:** teknik seçimler + neden bu yaklaşım (alternatifler düşünüldüyse belirt)
- **impact:** sayısal ise güzel — "3.000+ kullanıcı, %40 yavaş endpoint kaldırıldı"
  Bilmiyorsan: "Aylık rapor hazırlama süresi elle işlemden otomasyona geçti" — nitel de güçlü
- Klişe yok (passion, innovative, cutting-edge, seamless)
- TR + EN her iki dil için yaz

## Çıktı
Dosya: `content/resume/portfolio/CASE_SLUG/case.json`

```json
{
  "title": { "tr": "...", "en": "..." },
  "company": "...",
  "period": "2024–2026",
  "role": "...",
  "summary": { "tr": "...", "en": "..." },
  "problem": { "tr": "...", "en": "..." },
  "solution": { "tr": "...", "en": "..." },
  "impact": { "tr": "...", "en": "..." },
  "tech": ["ASP.NET Core", "React", "TypeScript", "SQL Server"],
  "visibility": "public"
}
```

Dizini oluştur: `mkdir -p content/resume/portfolio/CASE_SLUG/`

---

## Kurallar (ikisi için ortak)

- `content/resume/resume.json`'ı okumadan güncelleme yapma.
- Mevcut `tr` ve `en` iki dil bloğunu birlikte güncelle.
- `visibility: "private"` olan alanları web çıktısına ekleme (işaretliyse öyle bırak).
- Yeni alan eklenirse `packages/content-core src/schemas/resume.ts`'de tanımlı olmalı.
- `needsReview: true` — bilmediğin/doğrulayamadığın sayısal değerler için kullan.

---

## Sonra Ne Yapılır

Resume güncellendikten sonra:
Studio → **Resume Studio** ekranı:
- "TR" / "EN" seçip önizle
- Web sunucusu çalışıyorsa "PDF Üret" → `naci-anil-akman-cv-tr.pdf`
