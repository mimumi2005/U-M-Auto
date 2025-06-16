

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
import fs from 'fs';

// Middleware
import { cacheControlMiddleware } from "./src/middleware/preventCaching.js";
import { attachUser } from "./src/middleware/attachUser.js";
import { generateNonce } from "./src/middleware/nonceGen.js";

// Database & Routes
import routes from "./src/routes/index.js";

import "./src/helpers/cronJob.js";

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
  "https://maps.googleapis.com",
  "https://api.mymemory.translated.net"
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
const staticLocalesPath = path.join('locales', 'static');
const dynamicLocalesPath = path.join('locales', 'dynamic');
i18n.configure({
  locales: ["en", "lv", "de", "ru"],
  directory: staticLocalesPath,
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
  const lang = req.query.lang || req.session.language || 'en';

  // Load static translations
  const staticFile = path.join(staticLocalesPath, `${lang}.json`);
  const staticTranslations = fs.existsSync(staticFile)
    ? JSON.parse(fs.readFileSync(staticFile, 'utf-8'))
    : {};

  // Load dynamic translations
  const dynamicFile = path.join(dynamicLocalesPath, `${lang}.json`);
  const dynamicTranslations = fs.existsSync(dynamicFile)
    ? JSON.parse(fs.readFileSync(dynamicFile, 'utf-8'))
    : {};

  // Merge them (dynamic overrides static if same key)
  const mergedTranslations = {
    ...staticTranslations,
    ...dynamicTranslations
  };

  // Initialize i18n for this request
  i18n.init(req, res);

  req.session.language = lang;
  i18n.setLocale(req, lang);

  // Provide custom __ function using merged translations
  res.locals.__ = (key) => mergedTranslations[key] || key;
  res.locals.language = lang;

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