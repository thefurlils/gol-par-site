const bcrypt = require("bcryptjs");
const { db, setSetting } = require("./database");

const adminUser = process.env.ADMIN_USERNAME || "admin";
const adminPass = process.env.ADMIN_PASSWORD || "golpark";

const settings = {
  business_name: "GOL PARK",
  business_subtitle: "HALI SAHA & PARKTA MOLA",
  hero_title: "MAÇIN HEYECANI,<br><span>KEYFİN EN GÜZEL HALİ.</span>",
  hero_text: "Modern halı saha deneyimi, güçlü aydınlatma, dinlenme alanları ve Parkta Mola ile maç öncesi ve sonrası keyif.",
  phone: "0533 087 16 13",
  location: "Karacabey / Bursa",
  instagram: "gglpark_karacabey",
  booking_text: "Sahanı ayırt, takımını kur.",
  about_title: "Sadece maç değil, komple deneyim.",
  about_text: "GOL PARK; kaliteli saha, güçlü ışıklandırma, duş alanları, dinlenme alanları ve kafe hizmetini tek noktada buluşturur.",
  menu_title: "Parkta Mola",
  menu_text: "Maçtan önce kahveni, maçtan sonra atıştırmalığını seç.",
  footer_text: "Arkadaşlarınla gel, en güzel anlar burada.",
  seo_title: "Gol Park Karacabey | Halı Saha & Parkta Mola",
  seo_description: "Karacabey'in modern halı saha ve kafe deneyimi. Rezervasyon, menü ve iletişim."
};

for (const [k, v] of Object.entries(settings)) setSetting(k, v);

const stats = [
  ["+900", "Memnun Müşteri", "◎", 1],
  ["10+", "Yıllık Deneyim", "◷", 2],
  ["3", "Modern Saha", "▦", 3],
  ["24/7", "Rezervasyon Talebi", "↗", 4]
];

db.prepare("DELETE FROM stats").run();
const statStmt = db.prepare("INSERT INTO stats(value,label,icon,sort_order) VALUES (?,?,?,?)");
for (const s of stats) statStmt.run(...s);

const menu = [
  ["Soğuk İçecekler", "Iced Americano", "", "80 ₺", 1],
  ["Soğuk İçecekler", "Iced Latte", "", "95 ₺", 2],
  ["Soğuk İçecekler", "Iced Karamel Latte", "", "105 ₺", 3],
  ["Soğuk İçecekler", "Iced Vanilya Latte", "", "105 ₺", 4],
  ["Soğuk İçecekler", "Su", "", "20 ₺", 5],
  ["Soğuk İçecekler", "Sade Soda", "", "30 ₺", 6],
  ["Soğuk İçecekler", "Meyveli Soda", "", "35 ₺", 7],
  ["Soğuk İçecekler", "Kola", "", "45 ₺", 8],
  ["Soğuk İçecekler", "Fanta", "", "45 ₺", 9],
  ["Soğuk İçecekler", "Sprite", "", "45 ₺", 10],
  ["Soğuk İçecekler", "Meyve Suyu", "", "45 ₺", 11],
  ["Soğuk İçecekler", "Churchill", "", "55 ₺", 12],
  ["Soğuk İçecekler", "Limonata", "", "55 ₺", 13],
  ["Soğuk İçecekler", "Karadut", "", "60 ₺", 14],
  ["Sıcak İçecekler", "Espresso", "", "70 ₺", 1],
  ["Sıcak İçecekler", "Americano", "", "75 ₺", 2],
  ["Sıcak İçecekler", "Latte", "", "90 ₺", 3],
  ["Sıcak İçecekler", "Karamel Latte", "", "100 ₺", 4],
  ["Sıcak İçecekler", "Vanilya Latte", "", "100 ₺", 5],
  ["Sıcak İçecekler", "Flat White", "", "95 ₺", 6],
  ["Sıcak İçecekler", "Türk Kahvesi", "", "65 ₺", 7],
  ["Sıcak İçecekler", "Özel Dem Çay", "", "35 ₺", 8],
  ["Sıcak İçecekler", "Meyve Aromalı İçecek", "Portakal · Kuşburnu", "55 ₺", 9],
  ["Atıştırmalıklar", "Kahvaltı Tabağı", "Çay dahil", "220 ₺", 1],
  ["Atıştırmalıklar", "Özel Çift Peynirli Tost", "", "120 ₺", 2],
  ["Atıştırmalıklar", "Sucuklu Tost", "", "130 ₺", 3],
  ["Atıştırmalıklar", "Karışık Tost", "", "145 ₺", 4],
  ["Pizza", "Karışık Pizza", "", "240 ₺", 1]
];

db.prepare("DELETE FROM menu_items").run();
const menuStmt = db.prepare("INSERT INTO menu_items(category,name,description,price,sort_order) VALUES (?,?,?,?,?)");
for (const item of menu) menuStmt.run(...item);

const hash = bcrypt.hashSync(adminPass, 12);
db.prepare(`
  INSERT INTO admins(username,password_hash)
  VALUES (?, ?)
  ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash
`).run(adminUser, hash);

console.log("Seed tamamlandı.");
console.log(`Admin kullanıcı: ${adminUser}`);
console.log("Admin şifre: .env içindeki ADMIN_PASSWORD değeri");
db.close();
