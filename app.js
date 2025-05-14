

import express from "express";
import session from "express-session";
import expressMySQLSession from 'express-mysql-session';
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import expressLayouts from "express-ejs-layouts";
import i18n from "i18n";

// Middleware
import { cacheControlMiddleware } from "./src/middleware/preventCaching.js";
import { attachUser } from "./src/middleware/attachUser.js";
import { generateNonce } from "./src/middleware/nonceGen.js";

// Database & Routes
import pool from './src/config/db.js';
import routes from "./src/routes/index.js";

import "./src/models/cronJob.js";

// Replicating __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MySQLStore = expressMySQLSession(session);

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env!');
}

const dbUrl = new URL(process.env.DATABASE_URL);

const sessionStore = new MySQLStore({
  host: dbUrl.hostname,
  port: dbUrl.port || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', '')
});

const app = express();

// Security Middleware
app.set('trust proxy', 1);
app.use(generateNonce);
app.use(helmet({ hidePoweredBy: true }));

const commonCDNs = [
  "https://umautorepair.up.railway.app",
  "https://www.google.com",
  "https://www.gstatic.com",
  "https://www.googletagmanager.com",
  "https://maps.googleapis.com"
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", ...commonCDNs],
      frameSrc: ["'self'", ...commonCDNs],
      connectSrc: [
        "'self'",
        ...commonCDNs,
        "https://region1.google-analytics.com",
        "https://vpic.nhtsa.dot.gov"
      ],
      imgSrc: ["'self'", ...commonCDNs, "https://maps.gstatic.com https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/", "data:"],
      scriptSrc: [
        "'self'",
        ...commonCDNs,
        "https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.11.6/umd/popper.min.js https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
        (req, res) => `'nonce-${res.locals.nonce}'`
      ],
      styleSrc: [
        "'self'",
        (req, res) => `'nonce-${res.locals.nonce}'`,
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/ https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
      ],
      fontSrc: ["'self'", ...commonCDNs, "https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"]
    },
    reportOnly: false
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cookieParser());
app.use(cacheControlMiddleware);
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachUser);
// Initialize i18n
i18n.configure({
  locales: ["en", "lv", "de", "ru"],
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  autoReload: true,
  syncFiles: true
});

// View Engine
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'src', 'views'));
app.use(expressLayouts);

// Language Middleware
app.use((req, res, next) => {
  i18n.init(req, res);
  const lang = req.query.lang || req.session.language || "en";
  req.session.language = lang;
  i18n.setLocale(req, lang);

  res.locals.language = lang;
  res.locals.__ = res.__;

  next();
});

// Language session middleware
app.get('*', (req, res, next) => {
  const lang = req.query.lang;

  if (lang && ['en', 'lv', 'de', 'ru'].includes(lang)) {
    req.session.language = lang;
    req.session.save(() => {
      res.redirect(req.originalUrl.split('?')[0]);
    });
  } else {
    next();
  }
});

// Routes
app.use("/", routes);

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

app.post("/add-missing-key", (req, res) => {
  const { key } = req.body;
  i18n.__({ phrase: key, locale: req.session.language });
  res.sendStatus(200);
});

// Saving session info
app.get('/api/getUserSession', (req, res) => {
  if (req.user) {
    res.json({
      isLoggedIn: true,
      userId: req.user.id,
      username: req.user.username,
      UUID: req.user.UUID,
      isAdmin: req.user.isAdmin,
      isWorker: req.user.isWorker
    });
  } else {
    res.json({ isLoggedIn: false });
  }
});


// Getting all project dates for calendar
app.get('/api/all-project-dates/:month/:year', async (req, res) => {
  const MonthSelected = req.params.month;
  const YearSelected = req.params.year;

  try {
    const sql_query = `
        SELECT StartDate, EndDateProjection 
        FROM projects 
        WHERE 
          (YEAR(StartDate) = ? AND MONTH(StartDate) = ?) OR 
          (YEAR(EndDateProjection) = ? AND MONTH(EndDateProjection) = ?) OR
          (StartDate < LAST_DAY(CONCAT(?, '-', ?, '-01')) AND EndDateProjection > LAST_DAY(CONCAT(?, '-', ?, '-01')))
    `;
    const [results] = await pool.query(sql_query, [
        YearSelected, MonthSelected,
        YearSelected, MonthSelected,
        YearSelected, MonthSelected,
        YearSelected, MonthSelected
    ]);

    res.json(results);
  } catch (error) {
    console.error("Error fetching project dates:", error);
    res.status(500).send("An error occurred while fetching project dates.");
  }
});