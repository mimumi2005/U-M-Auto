
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";
import csrf from "csurf";
import path from "path";
import { fileURLToPath } from 'url';
import db from './config/db.js';  // Import MySQL configuration
import dotenv from "dotenv";
import connection from './config/db.js'; // Importing connection

import routes from './routes/index.js';  // Import your routes
dotenv.config();


// Replicating __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5001;

let isLoggedIn = false;
const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(express.static(path.join(__dirname, '../public')));// Middleware to serve static files from 'public'


app.use(cookieParser());


// Use the routes
app.use('/', routes);  // This will now include all your defined routes


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Example route that connects to MySQL
app.get('/api/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
      if (err) {
          console.error(err.message);
          return res.status(500).send('Server error');
      }
      res.json(results);
  });
});


cron.schedule('0 0 * * *', () => {
  // Logic to update tenure for all workers
  updateTenureForAllWorkers();
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the home route to serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/home.html'));
});


// Function for updating tenure automatically
function updateTenureForAllWorkers() {
  // Query all workers from the database
  const getAllWorkersQuery = 'SELECT * FROM workers';
  connection.query(getAllWorkersQuery, (err, workers) => {
    if (err) {
      console.error('Error fetching workers:', err);
      return;
    }
    // Iterate through each worker
    workers.forEach(worker => {
      // Calculate tenure based on StartWorkDate
      const startWorkDate = new Date(worker.StartWorkDate);
      const currentDate = new Date();
      const tenure = currentDate.getFullYear() - startWorkDate.getFullYear();
      // Update tenure in the database
      const updateTenureQuery = 'UPDATE workers SET tenure = ? WHERE idUser = ?';
      connection.query(updateTenureQuery, [tenure, worker.idUser], (updateErr, updateResult) => {
        if (updateErr) {
          console.error('Error updating tenure:', updateErr);
          return;
        }
        console.log(`Tenure updated for worker with idUser ${worker.idUser}`);
      });
    });
  });
}

// Function to hash password
async function hashPassword(password) {
  const saltRounds = 10; //Security value, the higher the safer, but slower
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

// Function to compare input password with hashed
async function verifyPassword(password, hashedPassword) {
  const match = await bcrypt.compare(password, hashedPassword);
  return match;
}




// Function for making new appointments
app.post("/make-appointment", (req, res) => {
  const { idUser, StartDate, EndDateProjection, ProjectInfo } = req.body;
  console.log(req.body);
  const sql_query = 'INSERT INTO projects (idUser, StartDate, EndDateProjection, ProjectInfo) VALUES (?, ?, ?, ?)';
  connection.query(sql_query, [idUser, StartDate, EndDateProjection, ProjectInfo], (err, result) => {
    if (err) {
      console.error('Error inserting data into the database:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
    res.status(201).json({ status: 'success', message: "Project registered successfully!" });
  })
});


// Function for users to change their password, also async for encryption function cuz its async
app.post("/change-password", async (req, res) => {
  const { currentPassword, newPassword, UUID } = req.body;

  try {
    // Check user based on UUID
    const checkUserQuery = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
    connection.query(checkUserQuery, [UUID], async (err, results) => {
      if (err) {
        console.error('Error checking user in the database:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }

      // Check if UUID corresponds to a user
      if (results.length === 0) {
        return res.status(401).json({ status: 'error', message: 'Invalid UUID' });
      }

      // Retrieve the idUser from the results
      const loggedInUser = results[0].idUser;

      // Retrieve the user's current hashed password from the database
      const checkCurrentPasswordQuery = 'SELECT password FROM users WHERE idUser = ?';
      connection.query(checkCurrentPasswordQuery, [loggedInUser], async (err, results) => {
        if (err) {
          console.error('Error retrieving current password from the database:', err);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }

        if (results.length === 0) {
          return res.status(401).json({ status: 'error', message: 'User not found' });
        }

        const hashedPassword = results[0].password;

        // Verify if the current password matches the one in the database
        const isMatch = await verifyPassword(currentPassword, hashedPassword);
        if (!isMatch) {
          return res.status(401).json({ status: 'error', message: 'Incorrect current password' });
        }

        // Hash the new password
        const hashedNewPassword = await hashPassword(newPassword);

        // Update the user's password in the database
        const updatePasswordQuery = 'UPDATE users SET password = ? WHERE idUser = ?';
        connection.query(updatePasswordQuery, [hashedNewPassword, loggedInUser], (updateErr) => {
          if (updateErr) {
            console.error('Error updating password in the database:', updateErr);
            return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
          }

          res.json({ status: 'success', message: 'Password updated successfully!' });
        });
      });
    });
  } catch (error) {
    console.error('Error during password change process:', error);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});


// Fetch all admin info
app.post("/all-admins", (req, res) => {
  // Query to fetch all idUser values from the administrators table
  const adminQuery = 'SELECT idUser FROM administrators';
  connection.query(adminQuery, (err, adminResults) => {
    if (err) {
      console.error('Error querying Workers table:', err);
      return res.status(500).json({ message: 'Error fetching worker data' });
    }

    // Array to store combined user and worker information
    const combinedData = [];

    // Loop through each workerResult to fetch combined user and worker information
    adminResults.forEach(admin => {
      const idUser = admin.idUser;
      // Query to fetch combined information for the current idUser
      const combinedQuery = 'SELECT Users.*, Workers.* FROM Users INNER JOIN Workers ON Users.idUser = Workers.idUser WHERE Users.idUser = ?';
      connection.query(combinedQuery, [idUser], (err, combinedResult) => {
        if (err) {
          console.error(`Error querying combined information for idUser ${idUser}:`, err);
          return;
        }
        // Push combined information to the combinedData array
        combinedData.push(...combinedResult);
        // If all combined data is fetched, send the response
        if (combinedData.length === adminResults.length) {
          res.json(combinedData);
        }
      });
    });
  });
});

// Fetch all worker info
app.post("/all-workers", (req, res) => {
  // Query to fetch all idUser values from the Workers table
  const workerQuery = 'SELECT idUser FROM Workers';
  connection.query(workerQuery, (err, workerResults) => {
    if (err) {
      console.error('Error querying Workers table:', err);
      return res.status(500).json({ message: 'Error fetching worker data' });
    }

    // Array to store combined user and worker information
    const combinedData = [];

    // Loop through each workerResult to fetch combined user and worker information
    workerResults.forEach(worker => {
      const idUser = worker.idUser;
      // Query to fetch combined information for the current idUser
      const combinedQuery = 'SELECT Users.*, Workers.* FROM Users INNER JOIN Workers ON Users.idUser = Workers.idUser WHERE Users.idUser = ?';
      connection.query(combinedQuery, [idUser], (err, combinedResult) => {
        if (err) {
          console.error(`Error querying combined information for idUser ${idUser}:`, err);
          return;
        }
        // Push combined information to the combinedData array
        combinedData.push(...combinedResult);
        // If all combined data is fetched, send the response
        if (combinedData.length === workerResults.length) {
          res.json(combinedData);
        }
      });
    });
  });
});

// Fetch all projects
app.post("/all-project-dates", (req, res) => {
  const MonthSelected = req.body.MonthDisplay;
  const YearSelected = req.body.YearDisplay;
  console.log("Month:", MonthSelected);
  console.log("Year:", YearSelected);
  const sql_query = 'SELECT StartDate, EndDateProjection FROM projects WHERE (month(StartDate) = ? OR month(EndDateProjection) = ?) AND (year(StartDate) = ? OR year(EndDateProjection) = ?)';
  connection.query(sql_query, [MonthSelected, MonthSelected, YearSelected, YearSelected], (err, result) => {
    console.log('Outcome', result);
    if (err) throw err;
    res.send(result);
  });
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



// Fetch all users
app.post("/user-by-ID", (req, res) => {
  const { idUser } = req.body;
  const sql_query = 'SELECT * FROM users WHERE idUser = ?';
  connection.query(sql_query, [idUser], (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});


// Fetch active users
app.get("/active-users", (req, res) => {
  // Query to fetch all active instances
  const instance_query = 'SELECT * FROM user_instance';
  connection.query(instance_query, (err, instances) => {
    if (err) {
      console.error('Error fetching active instances:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    const usersInfo = [];

    // Iterate over each active instance to fetch user information
    for (const instance of instances) {
      const userId = instance.idUser;

      // Query to fetch user information based on userId
      const user_query = 'SELECT * FROM users WHERE idUser = ?';
      connection.query(user_query, [userId], (err, userResult) => {
        if (err) {
          console.error('Error fetching user info:', err);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }

        // Add user information to the usersInfo array
        usersInfo.push(userResult[0]);

        // If all users' information has been collected, send the response
        if (usersInfo.length === instances.length) {
          res.json(usersInfo);
        }
      });
    }
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

//Function to get active projects
app.get("/active-projects", (req, res) => {
  const curdate = new Date().toISOString();
  const sql_query = `SELECT projects.*, users.UserName
                    FROM projects
                    JOIN users ON projects.idUser = users.idUser
                    WHERE '${curdate}' < projects.StartDate OR projects.Delayed = true`;
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});



// Fetch todays (has started, ends today) projects
app.get("/todays-projects", (req, res) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-based in JavaScript
  const currentDay = currentDate.getDate();

  console.log("Current date:", currentDate);

  const sql_query = `
    SELECT projects.*, users.UserName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    WHERE 
      YEAR(StartDate) = ${currentYear} AND MONTH(StartDate) = ${currentMonth} AND DAY(StartDate) <= ${currentDay}
      AND 
      YEAR(EndDateProjection) = ${currentYear} AND MONTH(EndDateProjection) = ${currentMonth} AND DAY(EndDateProjection) = ${currentDay}
  `;

  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Fetch finished projects 
app.get("/finished-projects", (req, res) => {
  const currentDate = new Date();
  const isoCurrentDate = currentDate.toISOString();
  const sql_query = `SELECT projects.*, users.UserName
    FROM projects
    JOIN users ON projects.idUser = users.idUser WHERE \`Delayed\` = false AND  '${isoCurrentDate}' > EndDateProjection`;
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});


// Fetch delayed projects 
app.get("/delayed-projects", (req, res) => {
  const sql_query = 'SELECT projects.*, users.UserName FROM projects JOIN users ON projects.idUser = users.idUser WHERE \`Delayed\` = true';
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});


// Fetch one project by ID
app.post("/project-by-ID", (req, res) => {
  const { idProjects } = req.body;
  const sql_query = 'SELECT projects.*, users.UserName FROM projects JOIN users ON projects.idUser = users.idUser WHERE idProjects = ?';
  connection.query(sql_query, [idProjects], (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});


// Fetch all projects that relate to a set user by ID
app.post("/project-by-user-ID", (req, res) => {
  const { idUser } = req.body;
  console.log(idUser);
  const sql_query = 'SELECT projects.*, users.UserName FROM projects JOIN users ON projects.idUser = users.idUser WHERE idUser = ?';
  connection.query(sql_query, [idUser], (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});


// Function to change the end date of project (also adds delayed to it)
app.post("/change-end-date", (req, res) => {
  const { EndDate, idProjects } = req.body;
  // Update the EndDate of the project in the database
  const updateQuery = 'UPDATE projects SET EndDateProjection = ?, \`Delayed\`= true WHERE idProjects = ?';
  connection.query(updateQuery, [EndDate, idProjects], (err, result) => {
    if (err) {
      console.error('Error updating end date:', err);
      return res.status(500).json({ status: 'error', message: 'Error updating end date', error: err.message });
    }
    // Retrieve the updated project information
    const selectQuery = 'SELECT projects.*, users.UserName FROM projects JOIN users ON projects.idUser = users.idUser WHERE idProjects = ?';
    connection.query(selectQuery, [idProjects], (err, result) => {
      if (err) {
        console.error('Error fetching updated project:', err);
        return res.status(500).json({ status: 'error', message: 'Error fetching updated project', error: err.message });
      }

      // Send the updated project information back to the client
      res.json(result);
    });
  });
});

// Function to remove project from being delayed (finish the project)
app.post("/remove-delayed", (req, res) => {
  const { idProjects } = req.body;
  // Update the EndDate of the project in the database
  const updateQuery = 'UPDATE projects SET  \`Delayed\`= false WHERE idProjects = ?';
  connection.query(updateQuery, [idProjects], (err, result) => {
    if (err) {
      console.error('Error updating end date:', err);
      return res.status(500).json({ status: 'error', message: 'Error updating end date', error: err.message });
    }
    // Retrieve the updated project information
    const selectQuery = 'SELECT projects.*, users.UserName FROM projects JOIN users ON projects.idUser = users.idUser WHERE idProjects = ?';
    connection.query(selectQuery, [idProjects], (err, result) => {
      if (err) {
        console.error('Error fetching updated project:', err);
        return res.status(500).json({ status: 'error', message: 'Error fetching updated project', error: err.message });
      }

      // Send the updated project information back to the client
      res.json(result);
    });
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
