const express = require("express");
const router = express.Router();
const { getSettings, getStats, getMenu, visitorStats } = require("../db/database");
const { requireAuth } = require("../middleware/auth");

router.get("/public", (req, res) => {
  res.json({ settings: getSettings(), stats: getStats(true), menu: getMenu(true) });
});

router.get("/analytics", requireAuth, (req, res) => {
  res.json(visitorStats());
});

module.exports = router;
