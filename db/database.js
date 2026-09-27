const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "..", "data.sqlite"));
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT DEFAULT '✦',
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

function getSetting(key, fallback = "") {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  db.prepare(`
    INSERT INTO settings(key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value ?? ""));
}

function getSettings() {
  return Object.fromEntries(db.prepare("SELECT key, value FROM settings").all().map(r => [r.key, r.value]));
}

function getStats(activeOnly = false) {
  return db.prepare(`SELECT * FROM stats ${activeOnly ? "WHERE active = 1" : ""} ORDER BY sort_order ASC, id ASC`).all();
}

function getMenu(activeOnly = false) {
  return db.prepare(`
    SELECT * FROM menu_items
    ${activeOnly ? "WHERE active = 1" : ""}
    ORDER BY category ASC, sort_order ASC, id ASC
  `).all();
}

function recordVisit(ip, userAgent) {
  db.prepare("INSERT INTO visits(ip, user_agent) VALUES (?, ?)").run(ip, userAgent);
}

function visitorStats() {
  const total = db.prepare("SELECT COUNT(*) AS count FROM visits").get().count;
  const today = db.prepare(`
    SELECT COUNT(*) AS count FROM visits
    WHERE date(created_at, 'localtime') = date('now', 'localtime')
  `).get().count;
  const last7 = db.prepare(`
    SELECT COUNT(*) AS count FROM visits
    WHERE datetime(created_at) >= datetime('now', '-7 days')
  `).get().count;

  const daily = db.prepare(`
    SELECT date(created_at, 'localtime') AS day, COUNT(*) AS count
    FROM visits
    WHERE datetime(created_at) >= datetime('now', '-14 days')
    GROUP BY day
    ORDER BY day ASC
  `).all();

  return { total, today, last7, daily };
}

module.exports = {
  db,
  getSetting,
  setSetting,
  getSettings,
  getStats,
  getMenu,
  recordVisit,
  visitorStats
};
