const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { db, getSettings, getStats, getMenu, setSetting, visitorStats } = require("../db/database");
const { requireAuth } = require("../middleware/auth");

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/admin");
  res.render("admin-login", { title: "Admin Giriş", error: null });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username || "");
  if (!admin || !bcrypt.compareSync(password || "", admin.password_hash)) {
    return res.status(401).render("admin-login", {
      title: "Admin Giriş",
      error: "Kullanıcı adı veya şifre hatalı."
    });
  }
  req.session.user = { id: admin.id, username: admin.username };
  res.redirect("/admin");
});

router.post("/logout", requireAuth, (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

router.get("/", requireAuth, (req, res) => {
  res.render("admin", {
    title: "Yönetim Paneli",
    settings: getSettings(),
    stats: getStats(false),
    menu: getMenu(false),
    visitors: visitorStats(),
    saved: req.query.saved === "1"
  });
});

router.post("/settings", requireAuth, (req, res) => {
  const allowed = [
    "business_name","business_subtitle","hero_title","hero_text","phone","location",
    "instagram","booking_text","about_title","about_text","menu_title","menu_text",
    "footer_text","seo_title","seo_description"
  ];
  for (const key of allowed) {
    if (key in req.body) setSetting(key, req.body[key]);
  }
  res.redirect("/admin?saved=1#settings");
});

router.post("/stats", requireAuth, (req, res) => {
  const rows = Array.isArray(req.body.id) ? req.body.id : [req.body.id];
  const tx = db.transaction(() => {
    db.prepare("DELETE FROM stats").run();
    const stmt = db.prepare("INSERT INTO stats(id,label,value,icon,sort_order,active) VALUES (?,?,?,?,?,?)");
    rows.filter(Boolean).forEach((id, i) => {
      const label = Array.isArray(req.body.label) ? req.body.label[i] : req.body.label;
      const value = Array.isArray(req.body.value) ? req.body.value[i] : req.body.value;
      const icon = Array.isArray(req.body.icon) ? req.body.icon[i] : req.body.icon;
      const active = Array.isArray(req.body.active) ? req.body.active[i] : req.body.active;
      stmt.run(Number(id) || null, label || "", value || "", icon || "✦", i + 1, active ? 1 : 0);
    });
  });
  tx();
  res.redirect("/admin?saved=1#stats");
});

router.post("/stats/add", requireAuth, (req, res) => {
  db.prepare("INSERT INTO stats(label,value,icon,sort_order) VALUES (?,?,?,?)")
    .run(req.body.label || "Yeni İstatistik", req.body.value || "0", req.body.icon || "✦", 99);
  res.redirect("/admin?saved=1#stats");
});

router.post("/menu/save", requireAuth, (req, res) => {
  const ids = Array.isArray(req.body.id) ? req.body.id : [req.body.id];
  const tx = db.transaction(() => {
    const stmt = db.prepare("UPDATE menu_items SET category=?, name=?, description=?, price=?, active=?, sort_order=? WHERE id=?");
    ids.filter(Boolean).forEach((id, i) => {
      const get = (field) => Array.isArray(req.body[field]) ? req.body[field][i] : req.body[field];
      stmt.run(get("category") || "Genel", get("name") || "", get("description") || "", get("price") || "", get("active") ? 1 : 0, i + 1, Number(id));
    });
  });
  tx();
  res.redirect("/admin?saved=1#menu");
});

router.post("/menu/add", requireAuth, (req, res) => {
  db.prepare("INSERT INTO menu_items(category,name,description,price,sort_order) VALUES (?,?,?,?,?)")
    .run(req.body.category || "Yeni Kategori", req.body.name || "Yeni Ürün", req.body.description || "", req.body.price || "0 ₺", 99);
  res.redirect("/admin?saved=1#menu");
});

router.post("/menu/delete/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM menu_items WHERE id=?").run(Number(req.params.id));
  res.redirect("/admin?saved=1#menu");
});

router.post("/password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE id=?").get(req.session.user.id);
  if (!admin || !bcrypt.compareSync(currentPassword || "", admin.password_hash) || !newPassword || newPassword.length < 8) {
    return res.status(400).render("admin", {
      title: "Yönetim Paneli",
      settings: getSettings(),
      stats: getStats(false),
      menu: getMenu(false),
      visitors: visitorStats(),
      saved: false,
      passwordError: "Mevcut şifre yanlış veya yeni şifre en az 8 karakter olmalı."
    });
  }
  const hash = bcrypt.hashSync(newPassword, 12);
  db.prepare("UPDATE admins SET password_hash=? WHERE id=?").run(hash, admin.id);
  res.redirect("/admin?saved=1#security");
});

module.exports = router;
