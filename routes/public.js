const express = require("express");
const router = express.Router();
const { getSettings, getStats, getMenu } = require("../db/database");

router.get("/", (req, res) => {
  const settings = getSettings();
  const stats = getStats(true);
  const menu = getMenu(true);

  const groupedMenu = {};
  for (const item of menu) {
    if (!groupedMenu[item.category]) groupedMenu[item.category] = [];
    groupedMenu[item.category].push(item);
  }

  res.render("home", {
    title: settings.seo_title || settings.business_name,
    metaDescription: settings.seo_description || "",
    settings,
    stats,
    groupedMenu
  });
});

module.exports = router;
