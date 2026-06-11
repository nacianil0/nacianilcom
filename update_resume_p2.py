import json

file_path = r"c:\dev\nacianilcom\content\resume\resume.json"
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# TR updates
# 1. Summary
data["tr"]["basics"]["summary"] = "Eroğlu Global Holding bünyesindeki grup şirketleri ve Mısır'daki 4 fabrika (EMS, EG, DNM vb.) için kurumsal portal, seyahat yönetimi ve İK/avans sistemleri geliştiriyorum. Mısır'daki yerel operasyonlar ve uluslararası kullanıcı gruplarıyla çalışarak onlara özel çok dilli geliştirmeler yapıyor; mevcut uygulamaları mimari ve arayüz olarak yenileyip ortak bir yetki modeli altında birleştiriyorum. Geçmişte Digitallica'da çok kiracılı (multi-tenant) kurumsal oryantasyon platformu Oriento'yu geliştirme deneyimi edindim. Eş zamanlı olarak RAG ve Qdrant tabanlı bir yapay zeka e-posta asistanı projesi üzerinde çalışıyorum."

# 2. Kansuk İlaç
for exp in data["tr"]["experience"]:
    if exp["id"] == "kansuk-2025":
        exp["description"] = "Şirket içi İK portalı ve yönetim paneli projelerini ASP.NET MVC ile geliştirdim. Access veritabanları ve masaüstü uygulamalarına dağılmış olan İK verilerini merkezileştirerek web tabanlı tek bir sisteme taşıdım."
        
        # Modify specific highlights
        for i, highlight in enumerate(exp["highlights"]):
            if "SQL Server" in highlight:
                exp["highlights"][i] = "Farklı sistemlerdeki dağınık kayıtları ilişkisel bir veri modeline dönüştürerek tek bir merkezde birleştirdim."
            if "Yöneticiler için rol bazlı raporlama ekranları" in highlight:
                exp["highlights"][i] = "Personel performans değerlendirme sistemi üzerinde çalışarak yöneticiler için rol bazlı raporlama ekranları tasarladım ve manuel süreçleri azalttım."
                
    elif exp["id"] == "digitallica":
        exp["description"] = exp["description"].replace("işe alıştırma", "oryantasyon")
        for i, highlight in enumerate(exp["highlights"]):
            exp["highlights"][i] = highlight.replace("işe alıştırma", "oryantasyon")

for proj in data["tr"]["projects"]:
    if proj["id"] == "oriento":
        proj["summary"] = proj["summary"].replace("işe alıştırma", "oryantasyon")

# EN updates
data["en"]["basics"]["summary"] = "I develop enterprise portal, travel management, and HR/advance systems for Eroğlu Global Holding companies and 4 factories in Egypt (EMS, EG, DNM, etc.). Working with local operations and international user groups in Egypt, I deliver tailored and multilingual solutions, modernizing existing applications and unifying them under a shared authorization model. Previously at Digitallica, I built Oriento, a multi-tenant enterprise orientation platform. Concurrently, I am developing an AI email assistant using RAG and Qdrant."

for exp in data["en"]["experience"]:
    if exp["id"] == "kansuk-2025":
        exp["description"] = "I developed the internal HR portal and management panel using ASP.NET MVC. I centralized HR data scattered across Access databases and desktop applications, migrating it to a single web-based system."
        
        for i, highlight in enumerate(exp["highlights"]):
            if "SQL Server" in highlight:
                exp["highlights"][i] = "Consolidated scattered records from different systems into a relational data model in a single center."
            if "Designed role-based reporting screens" in highlight:
                exp["highlights"][i] = "Worked on the employee performance evaluation system, designing role-based reporting screens for managers and reducing manual processes."
                
    elif exp["id"] == "digitallica":
        exp["description"] = exp["description"].replace("onboarding", "orientation")
        for i, highlight in enumerate(exp["highlights"]):
            exp["highlights"][i] = highlight.replace("onboarding/offboarding", "orientation/offboarding").replace("onboarding", "orientation")

for proj in data["en"]["projects"]:
    if proj["id"] == "oriento":
        proj["summary"] = proj["summary"].replace("onboarding", "orientation")

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Updated content")
