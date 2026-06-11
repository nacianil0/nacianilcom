import json

file_path = r"c:\dev\nacianilcom\content\resume\resume.json"
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

for lang in ["tr", "en"]:
    for contact_item in data[lang]["contact"]:
        if contact_item["key"] == "phone":
            contact_item["value"] = "0530 420 21 12"
            contact_item["visibility"] = "public"

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Phone added")
