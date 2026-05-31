# Aylık İçerik Planı Üret

## Rol
Sen nacianilcom repo'sunda çalışan Claude Code'sun.
Mevcut içerik yapısını analiz edip belirtilen ay için editoryal plan üreteceksin.
Çıktı: `content/plans/HEDEF_AY.json` — MonthlyPlanSchema uyumlu.

---

## Değişkenler — ÖNCE DOLDUR

```
HEDEF_AY=2026-07          # YYYY-MM formatında
KULLANICI_NOTLARI=""      # isteğe bağlı trend/odak notları (satır satır)
```

---

## Oku (Bu sırayla)

1. `content/taxonomy.json` — geçerli category + tag slug'ları
2. `content/series/` — `ls content/series/` ile tüm seri dizinlerini listele
3. Her seri için `content/series/<slug>/series.json` + her makale için `meta.json`
4. `content/_ideas/` — onaylı fikir dosyaları (varsa)
5. `content/plans/` — önceki plan dosyaları (tekrar riski için, varsa)
6. `packages/content-core/src/schemas/plans.ts` — MonthlyPlanSchema, TopicSchema, ScoresSchema

---

## Adımlar

### 1 — Mevcut Durum Analizi
- Tüm series + makale listesi + her makale için `status` (draft/scheduled/published)
- Hangi serinin kaçıncı yazısı eksik? (sıra boşluğu)
- Zaten yayınlanmış/zamanlanmış konular → tekrar listesi

### 2 — Candidate Pool (25–40 başlık)
Her başlık için TopicSchema doldur:
- **Çeşitlilik**: beginner + intermediate + advanced karışık
- **Seri dengesi**: birden fazla seride veya standalone
- **Sezonsal**: KULLANICI_NOTLARI'ndaki trendleri dahil et
- Seri devamı → `seriesFit = "<series-slug>"`, standalone → `"standalone"`

### 3 — Scoring (her topic için ScoresSchema, 0.0–10.0 float)
- `relevance` — konunun bloğa uygunluğu
- `seriesFit` — seri devamı uyumu (standalone için 5.0)
- `novelty` — daha önce yazılmadı (10) / benzeri var (5) / zaten var (0)
- `riskOfRepetition` — tekrar riski (yüksek = kötü, ≥7 → seçme)
- `seoPotential` — TR arama hacmi potansiyeli
- `geoPotential` — EN versiyonunun uluslararası hacmi
- `difficulty` — yazım zorluğu / research yoğunluğu
- `estimatedEffort` — araştırma gerekliliği
- `visualPotential` — diyagram/görsel eklenebilirlik

### 4 — Selected (2–4 başlık seç)
- En yüksek `(relevance + novelty) / 2 - riskOfRepetition * 0.3` skoru
- `riskOfRepetition ≥ 7` → seçme
- Seri sırası boz: 03. yazıyı ancak 02. yazı published ise seç
- 4 haftaya dağıt: her haftaya max 2 başlık
- En az 1 beginner başlık zorunlu

### 5 — Dosyayı Yaz
`content/plans/HEDEF_AY.json`

---

## Schema

```typescript
// ScoresSchema — 0.0–10.0 float değerler
interface Scores {
  relevance: number;        seriesFit: number;       novelty: number;
  riskOfRepetition: number; seoPotential: number;    geoPotential: number;
  difficulty: number;       estimatedEffort: number; visualPotential: number;
}

// TopicSchema
interface Topic {
  title: string;                                  // Türkçe, max 80 kar
  angle: string;                                  // 1–2 cümle, hangi açıdan
  whyNow: string;                                 // neden bu ay
  targetAudience: string;                         // okuyucu profili
  seriesFit: string;                              // "<series-slug>" | "standalone"
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedReadingTime: number;                   // dakika, tam sayı
  suggestedPublishWeek: 1 | 2 | 3 | 4;
  contentType: "research" | "explainer" | "architecture" | "essay" | "cv" | "case-study";
  seoPotential: string;                           // hedef anahtar kelimeler
  geoPotential: string;                           // EN hedef kitle
  visualPotential: string;                        // diyagram önerisi
  riskOfRepetition: string;                       // tekrar riski açıklaması
  requiredResearch: string;                       // hangi kaynaklar gerekli
  sourceBasis: string;                            // "existing-series"|"ideas"|"original"
  nextAction: string;                             // "brief" (hep bu)
  scores: Scores;
}

// MonthlyPlanSchema
interface MonthlyPlan {
  month: string;            // "YYYY-MM"
  targetCount: number;      // 10
  editorialTheme?: string;  // optional ay teması
  candidatePool: Topic[];   // 25–40 başlık
  selected: Topic[];        // 2–4 başlık
  status: "draft";          // her zaman draft başlar
  userDecisions: [];
}
```

---

## Çıktı

```json
{
  "month": "2026-07",
  "targetCount": 10,
  "editorialTheme": "...",
  "candidatePool": [ ...25-40 Topic... ],
  "selected": [ ...2-4 Topic... ],
  "status": "draft",
  "userDecisions": []
}
```

**Dosyaya yaz:** `content/plans/HEDEF_AY.json`

---

## Kurallar

- `title`'lar Türkçe. İngilizce teknik terimler parantez içi kabul: `async/await`.
- Published olan konuları candidate'e alma.
- `status` her zaman `"draft"` ile başlar — onay Studio'da.
- Önceki planlar varsa o ayların selected listelerini tekrar seçme.
- `targetCount: 10` sabittir; selected 2–4 arasında.
- Seri içi sıra: 03. yazıyı, 02. yazı `published` değilse seçme.

---

## Sonra Ne Yapılır

Plan üretildikten sonra Studio'da Monthly Plan ekranını aç:
1. Ay seç → planı yükle → konuları incele
2. **Onayla + Codex promptları** — Studio otomatik yapar:
   - `seriesFit` gruplarına göre seri + `meta.json` + `brief.json`
   - Her makale için doldurulmuş Codex promptları → `content/_prompts/`
3. Promptu kopyala → Codex'e yapıştır → çıktı repoya (outline → tr-draft → tr-final-mdx)
4. Draft Review → önizle → QC → Publisher
