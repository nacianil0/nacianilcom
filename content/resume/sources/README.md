# CV kaynak notları

> **Canonical veri değildir.** Bu klasör WP-12 (Resume/Portfolio) girdisidir: PDF/ notlar → Studio parse → `../resume.json` ({tr,en}).
> `sources/` içeriği otomatik güncel kabul edilmez; belirsiz alanlar `needsReview` ile işaretlenir (§30).

## Doğrulanmış kariyer güncellemeleri

| Tarih | Olay |
|--------|------|
| **2026-02** | Kansuk İlaç — ayrılış |
| **2026-03 → günümüz** | Eroğlu Global Holding — Full Stack Developer |

### Aktif projeler (Eroğlu Global Holding)

- **Kurumsal Dashboard (Portal)** — holding çalışanları için ortak giriş / uygulama merkezi (tek oturum, tek deploy).
- **Seyahat (Travel)** — Dashboard altında `/dashboard/travel/*`; holding genelinde kullanım; TR + Mısır.
- **İK (HR) projesi** — aynı coğrafi/kurumsal kapsam (TR + Mısır şirketleri + holding).

### Kritik katkılar (Portal — `C:\Users\anil.akman\source\repos\Portal`)

Kaynak: `Portal/memory/`, `dashboard-ortak-erisim-platformu-handoff-claude-v2.md`, `Eroglu.HR.UI/UI/src/modules/travel/README.md`, `.wolf/memory.md`.

**Dashboard modülü (ana sahiplik)**  
Portal içinde sıfırdan kurulan modül: ayrı proje/DB/auth yok; mevcut `Eroglu.HR` + `Eroglu.HR.UI` içinde `Controllers/Dashboard/*`, `src/dashboard/**`, `src/page/Dashboard/**`. Login sonrası kullanıcıyı merkeze alan hub; Swiss Industrial görsel dil (`dsh-*` token’lar, sıfır gradient/gölge, editorial layout). Kritik parçalar: ana sayfa ve uygulama kataloğu, hedefli **duyuru** yayını + okuma/detay deneyimi (nacianil.com tasarım referansı), **yemek menüsü** (Excel/OCR/AI import + onay), bildirim merkezi, feature flag, hava/döviz widget’ları, birleşik yönetici/yetki atamaları, `DashboardDatePicker` gibi paylaşılan bileşenler. Handoff ve uygulama belleği bu modülün uçtan uca sende olduğunu kaydediyor.

**Seyahat — Dashboard altına taşıma**  
Travel artık bağımsız shell değil; `modules/travel/` runtime kaynağı, route’lar **`/dashboard/travel/*`**, `DashboardLayout` sidebar + izin modeli (`DashboardPermissionContext` / `hasTravelPermission`). Modül kendi auth/router/topbar’ını taşımıyor; Dashboard chrome ve `dsh-*` diliyle hizalandı (WP-03.5 UI harmonizasyonu). Kapsam: talep/oluşturma, onay ve yönetici akışları, teklif/iptal/değişiklik, raporlama, sistem (migration, budget, health), TR/EN mail şablonları — holding + TR + Mısır operasyonları için tek platformda.

**Özet cümleler (CV / case-study için)**  
- Holding genelinde ortak erişim platformunu (Dashboard) uçtan uca tasarlayıp geliştirdim; duyuru, yemek, katalog ve yetki katmanlarını aynı ürün dilinde topladım.  
- Seyahat modülünü bu platformun altına çekerek tek oturum, tek navigasyon ve ortak yetkilendirme ile ölçeklenebilir hale getirdim.  
- Amaç: TR ve Mısır’daki grup şirketlerinde (EMS, DNM, EG) aynı kurumsal deneyimi sunmak.

### Kurumsal / coğrafi kapsam

- **Holding:** Eroğlu Global Holding (merkez rol).
- **Mısır fabrikaları:** EMS, DNM, EG (Eroğlu Garment).
- **Türkiye:** grup şirketleri dahil.
- **Hedef:** projelerin Mısır ve Türkiye şirketlerinde kullanılması + holding genelinde standartlaşma.

### Master plan ile uyumlu düzeltmeler (WP-12’de uygula)

- Digitallica deneyimi **“present” olarak işaretlenmemeli** (bitmiş rol).
- Kansuk: Şubat 2026 sonu; Eroğlu Global Holding: Mart 2026 başlangıç.
- Yıl veya süre net değilse **uydurma yok** → `needsReview`.

## Kaynak dosyalar

| Dosya / klasör | Tür | WP-12'de kullanım | Önerilen visibility |
|----------------|-----|-------------------|---------------------|
| `my-photo.jpg` | Profil fotoğrafı | `basics.photo` → `/[lang]/cv` | **public** |
| `naci-anil-akman-27V0.pdf` | Özgeçmiş PDF (eski) | `sources/` parse → ön-doldurma; güncel sayılmaz | — (kaynak) |
| `7-diploma/diploma.pdf` | Diploma | `education[]` + isteğe `credentials[]` | **public** (metin); PDF indirme **pdf** veya link yok |
| `8-sertifikalar/20480-microsoft-web.pdf` | Microsoft sertifika | `credentials[]` / `education[]` | **public** |
| `8-sertifikalar/20483-microsoft-csharp.pdf` | Microsoft sertifika | aynı | **public** |
| `8-sertifikalar/20486-microsoft-aspnet.pdf` | Microsoft sertifika | aynı | **public** |
| `8-sertifikalar/bilgeadam-katilim.pdf` | BilgeAdam katılım | aynı | **public** |
| `8-sertifikalar/bilgeadam-proje-bitirme.pdf` | BilgeAdam proje bitirme | aynı | **public** |
| `9-ehliyet-ve-kan-grubu/ehliyet.pdf` | Ehliyet | `credentials[]` veya `contact`/not | **private** (varsayılan) veya yalnız **pdf** |
| `11-askerlik/askerlik.pdf` | Askerlik belgesi | `credentials[]` | **private** — public web/PDF'e basılmaz |

> **Not:** Kan grubu dosyası klasör adında geçiyor; henüz ayrı dosya yok. Eklenirse **private**.
> **Not:** `sources/` ham dosyalar Git'te kalır; public site ham PDF sunmaz — yalnız `resume.json` + visibility filtresi (§30).

### Klasör yapısı (mevcut)

```
sources/
├── my-photo.jpg
├── naci-anil-akman-27V0.pdf
├── 7-diploma/diploma.pdf
├── 8-sertifikalar/          (Microsoft 20480/20483/20486 + BilgeAdam x2)
├── 9-ehliyet-ve-kan-grubu/ehliyet.pdf
└── 11-askerlik/askerlik.pdf
```

## Case-study adayları (WP-12 → `../portfolio/<slug>/case.json`)

| Slug (öneri) | Konu | Vurgu |
|----------------|------|--------|
| `kurumsal-dashboard` | Portal Dashboard modülü | Swiss Industrial UX, duyuru/yemek/katalog/yetki, post-login hub |
| `seyahat-projesi` | Travel @ `/dashboard/travel` | Dashboard entegrasyonu, çok şirket/çok ülke, uçtan uca seyahat akışları |
| `ik-projesi` | İK/HR (aktif) | Holding + TR + Mısır kapsamı — detaylar WP-12’de netleştirilecek |

Public sitede `/[lang]/work/<slug>`; CV özeti `resume.json` → `projects[]`.
