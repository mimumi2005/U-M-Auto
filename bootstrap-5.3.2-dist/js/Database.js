import mysql2 from "mysql2";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { v4 as uuidv4 } from 'uuid';



const connection = mysql2.createConnection({
  host: "localhost",
  database: "CarRepairShop",
  user: "root",
  password: "root",
});

let isLoggedIn = false;
const app = express();
const PORT = 5001;

app.use(cookieParser());


app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Logs succesfull connections to database
app.listen(PORT, () => {
  console.log(`SERVER: http://127.0.0.1:${PORT}`);
  connection.connect((err) => {
    if (err) throw err;
    console.log("DATABASE CONNECTED");
  });
});

cron.schedule('0 0 * * *', () => {
  // Logic to update tenure for all workers
  updateTenureForAllWorkers();
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


// Function to handle login logic
function loginUser(username, password, connection, res) {
  const UUID = uuidv4();

  // Check if username or email and password match a user in the database
  const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
  connection.query(query, [username, username], (err, results) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      // No user found with the provided username or email
      return res.status(401).json({ status: '1', message: 'Invalid credentials' });
    }

    // Filter results for a match with the provided password
    const matchedUser = results.find(user => user.password === password);
    console.log(matchedUser);

    if (matchedUser) {
      // Passwords match, login successful
      const userid = matchedUser.idUser;

      // Check if user is an admin
      checkAdminStatus(userid, connection, (err, IsAdmin) => {
        if (err) {
          console.error('Error checking admin status:', err);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }

        // Check if user is a worker
        checkWorkerStatus(userid, connection, (err, IsWorker) => {
          if (err) {
            console.error('Error checking worker status:', err);
            return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
          }

          // Check if user instance already exists
          const checkInstanceQuery = 'SELECT * FROM user_instance WHERE idUser = ?';
          connection.query(checkInstanceQuery, [userid], (err, instanceResults) => {
            if (err) {
              console.error('Error checking user instance:', err);
              return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
            }

            // If instance exists, delete the previous instance
            if (instanceResults.length > 0) {
              const deleteInstanceQuery = 'DELETE FROM user_instance WHERE idUser = ?';
              connection.query(deleteInstanceQuery, [userid], (err, deleteResult) => {
                if (err) {
                  console.error('Error deleting user instance:', err);
                  return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
                }
              });
            }
            const instance_query = 'INSERT INTO user_instance (idInstance, idUser, instanceStart) VALUES (?, ?, ?)';
            connection.query(instance_query, [UUID, userid, new Date()], (err, result) => {
              if (err) {
                console.error('Error inserting data into the database:', err);
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
              }

              console.log(`\nUser-${username} \nPassword-${password} \nLogin instance-${UUID}\n Admin: ${IsAdmin}\n Worker: ${IsWorker}\n`);
              res.json({ status: 'success', message: 'Login successful!', data: { UUID, IsAdmin, IsWorker } });
            });
          });
        });
      });
    }
    else {
      // Passwords do not match
      return res.status(401).json({ status: '2', message: 'Wrong password' });
    }
  });
}


// Function for creating a new account
app.post("/signup", (req, res) => {
  const { name, email, username, password } = req.body;

  // Check if the email is already taken
  const emailCheckQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(emailCheckQuery, [email], (emailErr, emailResults) => {
    if (emailErr) {
      console.error('Error checking email in the database:', emailErr);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    if (emailResults.length > 0) {
      // Email is already taken
      return res.status(409).json({ status: 'error', message: 'Email is already taken' });
    }

    // Check if the username is already taken
    const usernameCheckQuery = 'SELECT * FROM users WHERE username = ?';
    connection.query(usernameCheckQuery, [username], (usernameErr, usernameResults) => {
      if (usernameErr) {
        console.error('Error checking username in the database:', usernameErr);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }

      if (usernameResults.length > 0) {
        // Username is already taken
        return res.status(409).json({ status: 'error', message: 'Username is already taken' });
      }

      // Continue with the signup process
      const sql_query = 'INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)';
      connection.query(sql_query, [name, email, username, password], (err, result) => {
        if (err) {
          console.error('Error inserting data into the database:', err);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
        loginUser(username, password, connection, res);
      });
    });
  });
});

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

// Post for logging in function
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  loginUser(username, password, connection, res); // Call loginUser function with parameters
});


// Post for logging out function
app.post("/log-out", async (req, res) => {
  const { UUID } = req.body;

  try {
    // Log out the user using the UUID
    await logoutUser(UUID);

    console.log(`Instance: ${UUID} stopped`);
    res.json({ status: 'success', message: 'Log out successful!' });
  } catch (error) {
    console.error('Error logging out user:', error);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
});


// Function for users to change their password
app.post("/change-password", (req, res) => {
  const { currentPassword, newPassword, UUID } = req.body;

  // Check user based on UUID
  const checkUserQuery = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
  connection.query(checkUserQuery, [UUID], (err, results) => {
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

    // Check if the current password matches the user's current password
    const checkCurrentPasswordQuery = 'SELECT * FROM users WHERE idUser = ? AND password = ?';
    connection.query(checkCurrentPasswordQuery, [loggedInUser, currentPassword], (err, results) => {
      if (err) {
        console.error('Error checking current password in the database:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        // Incorrect current password
        return res.status(401).json({ status: 'error', message: 'Incorrect current password' });
      }

      // Update the user's password with the new one
      const updatePasswordQuery = 'UPDATE users SET password = ? WHERE idUser = ?';
      connection.query(updatePasswordQuery, [newPassword, loggedInUser], (updateErr) => {
        if (updateErr) {
          console.error('Error updating password in the database:', updateErr);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }

        res.json({ status: 'success', message: 'Password updated successfully!' });
      });
    });
  });
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

// Fetch projects by user UUID
app.post("/project-by-user-UUID", (req, res) => {
  const UUID = req.body.UUID;
  console.log(UUID);

  // Query to get the user ID from the UUID
  const getUserIDQuery = 'SELECT idUser FROM user_instance WHERE idInstance = ?';

  connection.query(getUserIDQuery, [UUID], (err, results) => {
    if (err) {
      console.error('Error fetching user ID from UUID:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      // No user found for the given UUID
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Get the idUser from the query result
    const idUser = results[0].idUser;
    console.log(`User ID for UUID ${UUID}: ${idUser}`);

    // Now query the projects table with the idUser
    const getProjectsQuery = 'SELECT projects.*, users.UserName FROM projects JOIN users ON projects.idUser = users.idUser WHERE idUser = ?';

    connection.query(getProjectsQuery, [idUser], (err, projects) => {
      if (err) {
        console.error('Error fetching projects for user:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }

      // Return the projects to the client
      res.json(projects);
    });
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


// Function to check user information
app.post("/user-info", (req, res) => {
  // Fetch user information based on the logged-in user
  const { UUID } = req.body;
  console.log(UUID);
  const query = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
  connection.query(query, [UUID], (err, results) => {
    if (err) {
      console.error('Error fetching user information from the database:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      // No user found
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const User = results[0].idUser;
    console.log(User);
    const query = 'SELECT * FROM users WHERE idUser = ?';
    connection.query(query, [User], (err, results) => {
      if (err) {
        console.error('Error fetching user information from the database:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        // No user found
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
      const userInformation = results[0];
      res.json({ status: 'success', user: userInformation });
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


// Function to log out the user based on UUID
function logoutUser(UUID) {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM user_instance WHERE idInstance = ?';
    connection.query(query, [UUID], (err, result) => {
      if (err) {
        console.error('Error logging out user:', err);
        reject(err);
      } else {
        console.log('User logged out successfully');
        resolve();
      }
    });
  });
}

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

app.delete('/delete-old-projects', (req, res) => {
  // Calculate the date for "7 days ago"
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 7);

  // Format the date to match MySQL's date format (YYYY-MM-DD)
  const formattedDate = oneDayAgo.toISOString().slice(0, 19).replace('T', ' ');

  // SQL query to delete projects where EndDateProjection is more than 1 day ago
  const sqlQuery = `DELETE FROM projects WHERE EndDateProjection < ? AND \`Delayed\` = false `;

  // Execute the SQL query
  connection.query(sqlQuery, [formattedDate], (err, result) => {
    if (err) {
      console.error('Error deleting old projects:', err);
      res.status(500).send('Error deleting old projects.');
      return;
    }

    console.log('Number of projects deleted:', result.affectedRows);
    res.send(`Deleted ${result.affectedRows} projects with EndDateProjection more than 1 day ago.`);
  });
});


function checkAdminStatus(userid, connection, callback) {
  const query = 'SELECT * FROM administrators WHERE idUser = ?';
  connection.query(query, [userid], (err, results) => {
    if (err) {
      console.error('Error querying admin table:', err);
      return callback(err, false);
    }

    // If user is in admin table or has idUser = 1, treat as admin
    if (results.length > 0 || userid === 1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  });
}

// Function to check worker status
function checkWorkerStatus(userid, connection, callback) {
  const query = 'SELECT * FROM workers WHERE idUser = ?';
  connection.query(query, [userid], (err, results) => {
    if (err) {
      console.error('Error querying workers table:', err);
      return callback(err, false);
    }

    // If user is in workers table, treat as worker
    if (results.length > 0 || userid === 1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  });
}

// Disconnect from the database
app.get("/disconnect", (req, res) => {
  connection.end((err) => {
    if (err) throw err;
    console.log("DATABASE DISCONNECTED");
    res.send("Database disconnected");
  });
});
