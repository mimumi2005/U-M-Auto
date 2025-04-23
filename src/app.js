

import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import expressLayouts from "express-ejs-layouts";
import i18n from "i18n";

// Middleware
import { cacheControlMiddleware } from "./middleware/preventCaching.js";
import { attachUser } from "./middleware/attachUser.js";
import { generateNonce } from "./middleware/nonceGen.js";

// Database & Routes
import connection from "./config/db.js";
import routes from "./routes/index.js";

import "./models/cronJob.js";

// Replicating __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// Security Middleware
app.use(generateNonce);
app.use(helmet({ hidePoweredBy: true }));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "https://maps.googleapis.com", "https://umautorepair.up.railway.app", "file:"],
    frameSrc: ["'self'", "https://www.google.com", "https://umautorepair.up.railway.app",  "https://www.gstatic.com"],
    connectSrc: ["'self'", "https://umautorepair.up.railway.app",   "https://maps.googleapis.com", "https://vpic.nhtsa.dot.gov"],
    imgSrc: [
      "'self'",
      "https://umautorepair.up.railway.app",
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
      "https://maps.googleapis.com",
      "https://www.gstatic.com",
      "https://www.google.com/recaptcha/api.js",
      "https://cdnjs.cloudflare.com/ajax/libs/popper.js/2.11.6/umd/popper.min.js",
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
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
app.use(express.static(path.join(__dirname, "../public")));

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 60 * 1000 // 30 minutes
  }
}));

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
app.set("views", path.join(__dirname, "views"));
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

// Redirect for language changes
app.get("*", (req, res, next) => {
  if (req.query.lang) {
    res.redirect(req.originalUrl.split("?")[0]);
  } else {
    next();
  }
});

// Middleware
app.use(attachUser);
app.use(cacheControlMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/", routes);

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
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
app.get("/all-users", (req, res) => {
  const sql_query = 'SELECT * FROM users';
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Give admin to a user
app.post("/give-admin", (req, res) => {
  const { idUser } = req.body;
  console.log("Giving admin to: ", idUser);
  const sql_query = 'INSERT INTO administrators (idUser) VALUES (?)';
  connection.query(sql_query, [idUser], (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});


// Remove admin from a user
app.post("/remove-admin", (req, res) => {
  const { idUser } = req.body;
  console.log("Removing admin from: ", idUser);
  const sql_query = 'DELETE FROM administrators WHERE idUser = ?';
  connection.query(sql_query, [idUser], (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});


// Remove worker status from a user
app.post("/remove-worker", (req, res) => {
  const { idUser } = req.body;
  console.log("Removing worker: ", idUser);
  const sql_query = 'DELETE FROM workers WHERE idUser = ?';
  connection.query(sql_query, [idUser], (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

// Function to add a new worker
app.post("/register-worker", (req, res) => {
  const { email, workerType, isAdmin } = req.body;
  console.log("Making user:", email, "as worker");

  // Query to retrieve idUser associated with the provided email
  const getUserIdQuery = 'SELECT idUser FROM users WHERE email = ?';
  connection.query(getUserIdQuery, [email], (err, userResult) => {
    if (err) {
      console.error('Error querying users table:', err);
      return res.status(500).json({ message: 'Error fetching user data' });
    }
    if (userResult.length === 0) {
      // If no user found with the provided email
      return res.status(404).json({ type: '1', message: 'User not found' });
    }

    // Extract idUser from the query result
    const idUser = userResult[0].idUser;

    // Check if user already exists in the workers table
    const checkWorkerQuery = 'SELECT * FROM workers WHERE idUser = ?';
    connection.query(checkWorkerQuery, [idUser], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Error checking worker table:', checkErr);
        return res.status(500).json({ message: 'Error checking worker data' });
      }
      if (checkResult.length > 0) {
        // User already exists as a worker
        return res.status(409).json({ type: '2', message: 'User already registered as a worker' });
      }

      // Get the current date
      const currentDate = new Date().toISOString().slice(0, 10);

      // Calculate tenure (years between current date and StartWorkDate)
      const startWorkDate = new Date(currentDate);
      const tenure = new Date().getFullYear() - startWorkDate.getFullYear();

      // Insert into workers table
      const insertWorkerQuery = 'INSERT INTO workers (idUser, workerType, StartWorkDate, tenure) VALUES (?, ?, ?, ?)';
      connection.query(insertWorkerQuery, [idUser, workerType, currentDate, tenure], (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error inserting worker data:', insertErr);
          return res.status(500).json({ message: 'Error inserting worker data' });
        }

        // If isAdmin is true, insert the idUser into the Administrators table
        if (isAdmin) {
          const insertAdminQuery = 'INSERT INTO administrators (idUser) VALUES (?)';
          connection.query(insertAdminQuery, [idUser], (adminErr, adminResult) => {
            if (adminErr) {
              console.error('Error inserting administrator data:', adminErr);

            }
            console.log('User added to Administrators table');
          });
        }
        res.json({
          status: 'Success',
          message: 'Worker registered successfully',
          idUser: idUser,
          workerType: workerType,
          StartWorkDate: currentDate,
          tenure: tenure
        });
      });
    });
  });
});


// Function to retrieve project statistics

app.get("/project-statistics", (req, res) => {
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
    GROUP BY TimeRange;
  `;
  connection.query(sql_query, (err, result) => {
    if (err) {
      console.error("Error retrieving project statistics:", err);
      return res.status(500).json({ message: "Error retrieving project statistics", error: err.message });
    }
    console.log(result);
    res.json(result);
  });
});



// Function to retrieve statistics for users
app.get("/user-statistics", (req, res) => {
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
    GROUP BY ProjectsCount;
  `;
  connection.query(sql_query, (err, result) => {
    if (err) {
      console.error("Error retrieving user statistics:", err);
      return res.status(500).json({ message: "Error retrieving user statistics", error: err.message });
    }
    console.log(result);
    res.json(result);
  });
});







// Function to find similar users
app.post("/similar-users", (req, res) => {
  const { emailPattern } = req.body;
  console.log('emailpattern:', emailPattern);
  const query = 'SELECT * FROM users WHERE Email LIKE ?';
  connection.query(query, [emailPattern], (err, results) => {
    if (err) {
      console.error('Error fetching similar users from the database:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      // No similar users found
      return res.status(404).json({ status: 'error', message: 'No similar users found' });
    }

    res.send(results);
  });
});


// Function to delete all projects associated with a user
function deleteProjects(userID) {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM projects WHERE idUser = ?';
    connection.query(query, [userID], (err, result) => {
      if (err) {
        console.error('Error deleting projects:', err);
        reject(err);
      } else {
        console.log('Projects deleted successfully');
        resolve();
      }
    });
  });
}

// Route to delete a user and all associated projects
app.delete('/user-delete/:userID', async (req, res) => {
  const userID = req.params.userID;

  try {
    // Fetch the UUID associated with the user ID
    const uuidQuery = 'SELECT idInstance FROM user_instance WHERE idUser = ?';
    connection.query(uuidQuery, [userID], async (err, results) => {
      if (err) {
        console.error('Error fetching UUID:', err);
        return res.status(500).json({ message: 'Error deleting user', error: err.message });
      }

      // Log out the user using the UUID if it exists
      if (results.length > 0) {
        await logoutUser(results[0].idInstance);
      }

      // Delete user from worker table if exists
      const deleteWorkerQuery = 'DELETE FROM workers WHERE idUser = ?';
      connection.query(deleteWorkerQuery, [userID], async (workerError, workerResult) => {
        if (workerError) {
          console.error('Error deleting user from worker table:', workerError);
          return res.status(500).json({ message: 'Error deleting user', error: workerError.message });
        }
        console.log('User deleted from worker table successfully');

        // Delete user from administrator table if exists
        const deleteAdminQuery = 'DELETE FROM administrators WHERE idUser = ?';
        connection.query(deleteAdminQuery, [userID], async (adminError, adminResult) => {
          if (adminError) {
            console.error('Error deleting user from administrator table:', adminError);
            return res.status(500).json({ message: 'Error deleting user', error: adminError.message });
          }
          console.log('User deleted from administrator table successfully');

          // Delete all projects associated with the user
          await deleteProjects(userID);

          // Proceed to delete the user from the users table
          const deleteUserQuery = 'DELETE FROM users WHERE idUser = ?';
          connection.query(deleteUserQuery, [userID], (error, deleteResult) => {
            if (error) {
              console.error('Error deleting user:', error);
              return res.status(500).json({ message: 'Error deleting user', error: error.message });
            }
            console.log('User deleted successfully');
            res.status(200).json({ message: 'User deleted successfully' });
          });
        });
      });
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

app.delete('/project-delete/:ProjectID', async (req, res) => {
  const ProjectID = req.params.ProjectID;
  console.log(ProjectID);
  const query = `DELETE FROM projects WHERE idProjects = ?`;
  connection.query(query, [ProjectID], (error, results) => {
    if (error) {

      console.error('Error deleting project:', error);
      return res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
    console.log('Project deleted successfully');
    res.status(200).json({ message: 'Project deleted successfully' });
  });
});


// Disconnect from the database
app.get("/disconnect", (req, res) => {
  connection.end((err) => {
    if (err) throw err;
    console.log("DATABASE DISCONNECTED");
    res.send("Database disconnected");
  });
});