require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const rateLimit = require("express-rate-limit");
const db = require("./db/database");

const app = express();

// Render / Heroku gibi reverse proxy arkasında çalışan platformlar için ZORUNLUDUR.
// express-rate-limit uyarısını ve IP tespit sorunlarını çözer.
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  store: new SQLiteStore({
    db: "sessions.sqlite",
    dir: __dirname
  }),
  secret: process.env.SESSION_SECRET || "dev-only-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.user = req.session.user || null;
  next();
});

// Ziyaretçi takibi
app.use((req, res, next) => {
  const ignored = req.path.startsWith("/admin") || req.path.startsWith("/api") ||
    req.path.includes(".") || req.method !== "GET";
  if (!ignored && !req.session.visitorCounted) {
    db.recordVisit(req.ip, req.get("user-agent") || "");
    req.session.visitorCounted = true;
  }
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Çok fazla giriş denemesi. Lütfen biraz sonra tekrar deneyin."
});

app.use("/", require("./routes/public"));
app.use("/admin", loginLimiter, require("./routes/admin"));
app.use("/api", require("./routes/api"));

app.use((req, res) => res.status(404).render("404", { title: "Sayfa bulunamadı" }));
