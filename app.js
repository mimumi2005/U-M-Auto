

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

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "https://maps.googleapis.com", "https://umautorepair.up.railway.app", "file:"],
    frameSrc: ["'self'", "https://www.google.com", "https://umautorepair.up.railway.app",  "https://www.gstatic.com", "https://www.google.com https://www.gstatic.com"],
    connectSrc: ["'self'", "https://umautorepair.up.railway.app", "https://region1.google-analytics.com",   "https://maps.googleapis.com", "https://vpic.nhtsa.dot.gov", "https://www.google.com https://www.gstatic.com"],
    imgSrc: [
      "'self'",
      "https://umautorepair.up.railway.app",
      "https://www.google.com https://www.gstatic.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
      "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/ru.svg",
      "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/gb.svg",
      "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/lv.svg",
      "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/de.svg",
      "data:"
    ],
    scriptSrc: [
      "'self'",
      "https://umautorepair.up.railway.app",
      "https://www.googletagmanager.com",
      "https://maps.googleapis.com",
      "https://www.gstatic.com",
      "https://www.google.com/recaptcha/api.js",
      "https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.11.6/umd/popper.min.js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
      "https://www.google.com https://www.gstatic.com",
      (req, res) => `'nonce-${res.locals.nonce}'`
    ],
    styleSrc: [
      "'self'",
      (req, res) => `'nonce-${res.locals.nonce}'`,
      "https://fonts.googleapis.com/css",
      "https://fonts.googleapis.com/css2",
      "https://umautorepair.up.railway.app",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
      "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/css/flag-icon.min.css",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
    ],
    fontSrc: ["'self'", "https://umautorepair.up.railway.app","https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"], 
  },
  reportOnly: false,
}));


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
app.use(attachUser);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      console.log('🌐 Language set to:', req.session.language);
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
  if (req.session && req.session.userId) {
    res.json({
      isLoggedIn: true,
      isAdmin: req.session.isAdmin,
      isWorker: req.session.isWorker
    });
  } else {
    res.json({ isLoggedIn: false, isAdmin: null, isWorker: null });
  }
});

// Fetch all users
app.get("/all-users", async (req, res) => {
  try {
    const [result] = await pool.query('SELECT * FROM users');
    res.json(result);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Give admin to a user
app.post("/give-admin", async (req, res) => {
  const { idUser } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO administrators (idUser) VALUES (?)', [idUser]);
    res.json(result);
  } catch (err) {
    console.error('Error giving admin:', err);
    res.status(500).json({ message: 'Error giving admin' });
  }
});

// Remove admin from a user
app.post("/remove-admin", async (req, res) => {
  const { idUser } = req.body;
  try {
    const [result] = await pool.query('DELETE FROM administrators WHERE idUser = ?', [idUser]);
    res.json(result);
  } catch (err) {
    console.error('Error removing admin:', err);
    res.status(500).json({ message: 'Error removing admin' });
  }
});

// Remove worker status from a user
app.post("/remove-worker", async (req, res) => {
  const { idUser } = req.body;
  try {
    const [result] = await pool.query('DELETE FROM workers WHERE idUser = ?', [idUser]);
    res.json(result);
  } catch (err) {
    console.error('Error removing worker:', err);
    res.status(500).json({ message: 'Error removing worker' });
  }
});

// Function to add a new worker
app.post("/register-worker", async (req, res) => {
  const { email, workerType, isAdmin } = req.body;
  try {
    const [userResult] = await pool.query('SELECT idUser FROM users WHERE email = ?', [email]);
    if (userResult.length === 0) {
      return res.status(404).json({ type: '1', message: 'User not found' });
    }
    const idUser = userResult[0].idUser;

    const [checkResult] = await pool.query('SELECT * FROM workers WHERE idUser = ?', [idUser]);
    if (checkResult.length > 0) {
      return res.status(409).json({ type: '2', message: 'User already registered as a worker' });
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const tenure = 0;

    await pool.query('INSERT INTO workers (idUser, workerType, StartWorkDate, tenure) VALUES (?, ?, ?, ?)', [idUser, workerType, currentDate, tenure]);

    if (isAdmin) {
      await pool.query('INSERT INTO administrators (idUser) VALUES (?)', [idUser]);
    }

    res.json({
      status: 'Success',
      message: 'Worker registered successfully',
      idUser,
      workerType,
      StartWorkDate: currentDate,
      tenure
    });
  } catch (err) {
    console.error('Error registering worker:', err);
    res.status(500).json({ message: 'Error registering worker' });
  }
});

// Project statistics
app.get("/project-statistics", async (req, res) => {
  const sql_query = `
    SELECT 
      CASE
        WHEN TIMESTAMPDIFF(HOUR, StartDate, EndDateProjection) <= 1 THEN 'Oil change/project discussion'
        WHEN TIMESTAMPDIFF(HOUR, StartDate, EndDateProjection) <= 4 THEN 'Overall checkup/tuning'
        WHEN TIMESTAMPDIFF(DAY, StartDate, EndDateProjection) >= 5 THEN 'Paint job'
        ELSE 'Projects'
      END AS TimeRange,
      COUNT(*) AS ProjectsCount
    FROM projects
    GROUP BY TimeRange
  `;
  try {
    const [result] = await pool.query(sql_query);
    res.json(result);
  } catch (err) {
    console.error("Error retrieving project statistics:", err);
    res.status(500).json({ message: "Error retrieving project statistics" });
  }
});

app.get("/project-status-statistics", async (req, res) => {
  const sql_query = `
    SELECT 
      project_status.statusName AS StatusName,
      COUNT(*) AS ProjectsCount
    FROM projects
    JOIN project_status ON projects.idStatus = project_status.idStatus
    GROUP BY project_status.statusName
    ORDER BY project_status.statusName ASC
  `;
  try {
    const [result] = await pool.query(sql_query);
    res.json(result);
  } catch (err) {
    console.error("Error retrieving project status statistics:", err);
    res.status(500).json({ message: "Error retrieving project status statistics" });
  }
});


// User statistics
app.get("/user-statistics", async (req, res) => {
  const sql_query = `
    SELECT 
      ProjectsCount,
      COUNT(*) AS UsersCount
    FROM (
      SELECT 
        idUser,
        COUNT(*) AS ProjectsCount
      FROM projects
      GROUP BY idUser
    ) AS UserProjects
    GROUP BY ProjectsCount
  `;
  try {
    const [result] = await pool.query(sql_query);
    res.json(result);
  } catch (err) {
    console.error("Error retrieving user statistics:", err);
    res.status(500).json({ message: "Error retrieving user statistics" });
  }
});

// Find similar users
app.post("/similar-users", async (req, res) => {
  const { emailPattern } = req.body;
  try {
    const [results] = await pool.query('SELECT * FROM users WHERE Email LIKE ?', [emailPattern]);
    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No similar users found' });
    }
    res.json(results);
  } catch (err) {
    console.error('Error fetching similar users:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});

// Delete all projects for a user
async function deleteProjects(userID) {
  await pool.query('DELETE FROM projects WHERE idUser = ?', [userID]);
}

// Delete user and associated data
app.delete('/user-delete/:UUID', async (req, res) => {
  const UUID = req.params.UUID;

  try {
    const [uuidResult] = await pool.query('SELECT idInstance FROM user_instance WHERE idInstance = ?', [UUID]);
    if (uuidResult.length > 0) {
      await logoutUser(uuidResult[0].idInstance);
    }
    const userID = uuidResult[0].idUser

    await pool.query('DELETE FROM workers WHERE idUser = ?', [userID]);
    await pool.query('DELETE FROM administrators WHERE idUser = ?', [userID]);
    await deleteProjects(userID);
    await pool.query('DELETE FROM users WHERE idUser = ?', [userID]);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

// Delete a project
app.delete('/project-delete/:ProjectID', async (req, res) => {
  const ProjectID = req.params.ProjectID;
  try {
    await pool.query('DELETE FROM projects WHERE idProjects = ?', [ProjectID]);
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});