import json

file_path = r"c:\dev\nacianilcom\content\resume\resume.json"
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# TR updates
data["tr"]["basics"]["tagline"] = ".NET ve React ile kurumsal portal, İK ve seyahat sistemleri geliştiriyorum. Mevcut projeleri analiz edip mimariden canlıya alınmasına kadar tüm süreçleri yönetiyorum."
data["tr"]["basics"]["summary"] = "Eroğlu Global Holding bünyesindeki şirketler için kurumsal portal, seyahat yönetimi ve İK/avans sistemleri geliştiriyorum. Mevcut uygulamaları sadece sürdürmek yerine; mimari, arayüz ve altyapılarını yenileyerek ortak bir yetki ve erişim modeli altında birleştiriyorum. Eş zamanlı olarak RAG ve Qdrant tabanlı bir yapay zeka e-posta asistanı projesi üzerinde çalışıyorum."

for exp in data["tr"]["experience"]:
    if exp["id"] == "egh-2026":
        exp["description"] = "Holdingin kurumsal erişim paneli, seyahat yönetimi ve İK avans modüllerini geliştiriyorum. Türkiye ve Mısır'daki operasyonlar için tek giriş (SSO) ve merkezi yetkilendirme altyapısı kuruyorum. Mevcut sistemleri analiz ederek bu yeni yapıya entegre ediyor ve tüm geliştirme süreçlerini yürütüyorum."
        exp["highlights"] = [
            "Mevcut kurumsal erişim panelini yenileyerek; rol bazlı uygulama kataloğu, hedefli duyuru akışı, yemek menüsü ve bildirim merkezini tek giriş üzerinden hizmet veren merkezi bir arayüzde topladım.",
            "Bağımsız çalışan seyahat yönetim sistemini ana panele entegre ettim. İkinci login gereksinimini kaldırarak SSO altyapısına geçirdim, veri ve yetki modelini holdingin ortak yapısına uyumlu hale getirdim.",
            "İK avans modülüne Datalab ve OpenAI OCR entegrasyonu ekledim. Fiş ve faturalardan tutar/tarih çıkarımı, güven skoru hesaplama ve görsel doğrulama özellikleriyle manuel veri girişini büyük ölçüde azalttım.",
            "Avans sürecini dijitalleştirerek modelledim: talep, onay, taksitlendirme ve geri ödeme. Sisteme çoklu şirket desteği ve şirket bazlı yetkilendirme özellikleri kazandırdım."
        ]
    elif exp["id"] == "kansuk-2025":
        exp["description"] = "Şirket içi İK portalı ve yönetim paneli projelerini ASP.NET MVC ile geliştirdim. Access veritabanları ve masaüstü uygulamalarına dağılmış olan İK verilerini merkezileştirerek web tabanlı tek bir sisteme (SQL Server) taşıdım."
        exp["highlights"] = [
            "Performans değerlendirme, izin takibi ve çalışan yönetimi modüllerini iyileştirdim. Excel ile yürütülen operasyonları web ortamına aktardım.",
            "Farklı sistemlerdeki dağınık kayıtları ilişkisel bir veri modeline dönüştürerek SQL Server üzerinde birleştirdim.",
            "Yöneticiler için rol bazlı raporlama ekranları tasarlayarak manuel raporlama iş yükünü hafiflettim."
        ]
    elif exp["id"] == "digitallica":
        exp["description"] = "Kurumsal müşterilere özel web uygulamaları geliştirdim. Temel odak noktam, çok kiracılı (multi-tenant) bir işe alıştırma ve eğitim platformu olan Oriento'nun .NET ve React kullanılarak geliştirilmesiydi."
        exp["highlights"] = [
            "Oriento platformunda onboarding/offboarding, interaktif eğitim, görev yönetimi ve raporlama modüllerini oluşturduk. Ürün; ING Bank, Kibar Holding, FNSS ve SoftTech gibi firmalar tarafından kullanıldı.",
            "FNSS için mevcut on-prem platformun bulut versiyonunu hazırladık. Rol bazlı yönetim, oryantasyon akışları ve 'buddy' eşleştirmesi ile görev takibi özelliklerini ekledik.",
            "Veri katmanını REST API ve Entity Framework ile inşa ederek, modülleri farklı müşterilerin ihtiyaçlarına kolayca uyarlanabilecek şekilde tasarladık.",
            "Turkcell iş birliğinde yürütülen çocuklara yönelik internet güvenliği oyunu (Galaksel) gibi projelerde görev aldım.",
            "Awarder AI ve LunaBuddy gibi yapay zeka ürün prototiplerinde çalıştım. Temel metin işleme yöntemlerinin yetersiz kaldığı senaryoları analiz ederek RAG ve vektör tabanlı arama çözümleri üzerine yoğunlaştım."
        ]

for proj in data["tr"]["projects"]:
    if proj["id"] == "kurumsal-dashboard":
        proj["summary"] = "Holding çalışanları için geliştirilen tek girişli kurumsal erişim paneli. Duyuru, yemek menüsü ve uygulama kataloğunu rol bazlı yetkilendirmeyle tek ekranda sunarak Türkiye ve Mısır'daki şirket operasyonlarını birleştirir."
    elif proj["id"] == "seyahat-projesi":
        proj["summary"] = "Holding genelindeki seyahat talep, onay ve bütçe süreçlerini yöneten sistem. Merkezi erişim paneline entegre edilerek SSO ve ortak yetki modeliyle Türkiye ve Mısır operasyonlarında kullanıma sunulmuştur."
    elif proj["id"] == "mail-agent":
        proj["summary"] = "Kişisel proje olarak geliştirdiğim yapay zeka tabanlı e-posta asistanı. Geçmiş iletişimleri ve kurum içi yanıt örüntülerini vektör veri tabanında (Qdrant) indeksleyerek semantik arama yapar. RAG mimarisiyle eski e-postaları referans göstererek otomatik yanıt taslakları oluşturur. Tüm işlemler manuel onay aşamasından geçecek şekilde tasarlanmıştır."
    elif proj["id"] == "oriento":
        proj["summary"] = "Çok kiracılı (multi-tenant) işe alıştırma ve eğitim platformu. .NET ve React kullanılarak geliştirildi; ING Bank, Kibar Holding ve SoftTech gibi firmalarda kullanıldı. Rol bazlı yönetim, oryantasyon akışları ve görev takibi özelliklerini barındırır."

for skill_group in data["tr"]["skills"]:
    if skill_group["group"] == "Mimari & Ürün Sahipliği":
        skill_group["items"] = ["Authentication & yetki yönetimi", "SSO", "Multi-tenant mimari", "Migration", "Raporlama / dashboard", "Uygulama yaşam döngüsü"]

# EN updates
data["en"]["basics"]["tagline"] = "I build enterprise portal, HR, and travel systems with .NET and React. I analyze existing projects and manage all processes from architecture to deployment."
data["en"]["basics"]["summary"] = "I build enterprise portal, travel management, and HR/advance systems for Eroğlu Global Holding companies. Instead of merely maintaining existing apps, I modernize their architecture, UI, and infrastructure, unifying them under a shared access and authorization model. Concurrently, I am developing an AI email assistant using RAG and Qdrant."

for exp in data["en"]["experience"]:
    if exp["id"] == "egh-2026":
        exp["description"] = "I develop the holding's internal enterprise access panel, travel management, and HR advance modules. I am establishing a single sign-on (SSO) and centralized authorization infrastructure for operations in Turkey and Egypt. I analyze existing systems, integrate them into this unified structure, and manage all development processes."
        exp["highlights"] = [
            "Modernized the enterprise access panel; consolidated the role-based application catalog, targeted announcements, meal menu, and notification center into a centralized interface behind a single login.",
            "Integrated the standalone travel management system into the main panel. Removed the need for a second login by migrating to the SSO infrastructure, and aligned the data and permission model with the holding's shared structure.",
            "Integrated Datalab and OpenAI OCR into the HR advance module. Significantly reduced manual data entry with features like amount/date extraction from receipts, confidence scoring, and visual validation.",
            "Digitalized the advance process end-to-end: request, approval, installments, and repayment. Added multi-company support and company-based authorization features."
        ]
    elif exp["id"] == "kansuk-2025":
        exp["description"] = "I developed the internal HR portal and management panel using ASP.NET MVC. I centralized HR data scattered across Access databases and desktop applications, migrating it to a single web-based system (SQL Server)."
        exp["highlights"] = [
            "Improved performance review, leave tracking, and employee management modules. Moved operations previously handled via Excel to the web environment.",
            "Consolidated scattered records from different systems into a relational data model on SQL Server.",
            "Designed role-based reporting screens for managers, alleviating the workload of manual reporting."
        ]
    elif exp["id"] == "digitallica":
        exp["description"] = "I developed custom web applications for enterprise clients. My primary focus was building Oriento, a multi-tenant onboarding and training platform, using .NET and React."
        exp["highlights"] = [
            "Built the onboarding/offboarding, interactive training, task management, and reporting modules for Oriento. The platform was used by companies like ING Bank, Kibar Holding, FNSS, and SoftTech.",
            "Adapted the existing on-prem platform into a cloud version for FNSS. Added features such as role-based management, orientation workflows, and task tracking with buddy pairing.",
            "Built the data layer with REST APIs and Entity Framework, designing the modules to be easily adaptable to different client needs.",
            "Took part in collaborative projects with Turkcell, such as an internet safety game for kids (Galaksel).",
            "Worked on AI product prototypes like Awarder AI and LunaBuddy. Analyzed scenarios where basic text processing methods fell short, focusing on RAG and vector-based search solutions."
        ]

for proj in data["en"]["projects"]:
    if proj["id"] == "kurumsal-dashboard":
        proj["summary"] = "A single-login enterprise access panel developed for holding employees. Unifies company operations in Turkey and Egypt by offering announcements, meal menus, and an application catalog on a single screen with role-based authorization."
    elif proj["id"] == "seyahat-projesi":
        proj["summary"] = "A system managing travel requests, approvals, and budget processes across the holding. Integrated into the central access panel with SSO and a shared permission model for operations in Turkey and Egypt."
    elif proj["id"] == "mail-agent":
        proj["summary"] = "An AI-based email assistant I am developing as a personal project. It performs semantic searches by indexing past communications and internal response patterns in a vector database (Qdrant). Generates automated reply drafts using the RAG architecture to reference older emails. Designed so all operations pass through a manual approval stage."
    elif proj["id"] == "oriento":
        proj["summary"] = "A multi-tenant onboarding and training platform. Developed using .NET and React; utilized by companies like ING Bank, Kibar Holding, and SoftTech. Features role-based management, orientation workflows, and task tracking."

for skill_group in data["en"]["skills"]:
    if skill_group["group"] == "Architecture & Product Ownership":
        skill_group["items"] = ["Authentication & permissions", "SSO", "Multi-tenant architecture", "Migration", "Reporting / dashboards", "Application lifecycle"]

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Updated successfully")
