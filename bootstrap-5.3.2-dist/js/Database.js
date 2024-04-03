import mysql2 from "mysql2";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";

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

          // Insert login instance
          const instance_query = 'INSERT INTO user_instance (idInstance, idUser, instanceStart)  VALUES (?,?,?)';
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
    } else {
      // Passwords do not match
      res.status(401).json({ status: '2', message: 'Wrong password' });
    }
  });
}

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


app.post("/make-appointment",(req,res)=>{
  const {idUser, StartDate, EndDateProjection, ProjectInfo} = req.body;
  console.log(req.body);
  //all kinds of checks

  //Continue with project creation
  const sql_query = 'INSERT INTO projects (idUser, StartDate, EndDateProjection, ProjectInfo) VALUES (?, ?, ?, ?)';
  connection.query(sql_query, [idUser, StartDate, EndDateProjection, ProjectInfo], (err, result) => {
    if(err){
      console.error('Error inserting data into the database:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
    res.status(201).json({ status: 'success', message: "Project registered successfully!" });
  })
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  loginUser(username, password, connection, res); // Call loginUser function with parameters
});

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



// Fetch all users
app.get("/all-users", (req, res) => {
  const sql_query = 'SELECT * FROM users';
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Fetch all users
app.post("/user-by-ID", (req, res) => {
  const {idUser} = req.body;
  const sql_query = 'SELECT * FROM users WHERE idUser = ?';
  connection.query(sql_query,[idUser], (err, result) => {
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


// Fetch all projects
app.get("/all-projects", (req, res) => {
  const sql_query = 'SELECT * FROM projects';
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Fetch active projects (endDate time is not yet reached)
app.get("/active-projects", (req, res) => {
  const sql_query = 'SELECT * FROM projects WHERE EndDateProjection > CURRENT_TIMESTAMP() OR `Delayed` = 1';
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});
// Fetch all users
app.post("/project-by-ID", (req, res) => {
  const {idProjects} = req.body;
  const sql_query = 'SELECT * FROM projects WHERE idProjects = ?';
  connection.query(sql_query,[idProjects], (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});


// Fetch all users
app.post("/project-by-user-ID", (req, res) => {
  const {idUser} = req.body;
  const sql_query = 'SELECT * FROM projects WHERE idUser = ?';
  connection.query(sql_query,[idUser], (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});


// Fetch active projects (endDate time is not yet reached)
app.get("/delayed-projects", (req, res) => {
  const sql_query = 'SELECT * FROM projects WHERE `Delayed` = 1';
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

app.post("/change-end-date", (req, res) => {
  const { EndDate, idProjects } = req.body;
  // Update the EndDate of the project in the database
  const updateQuery = 'UPDATE projects SET EndDateProjection = ?, `Delayed`= true WHERE idProjects = ?';
  connection.query(updateQuery, [EndDate, idProjects], (err, result) => {
    if (err) {
      console.error('Error updating end date:', err);
      return res.status(500).json({ status: 'error', message: 'Error updating end date', error: err.message });
    }
      // Retrieve the updated project information
      const selectQuery = 'SELECT * FROM projects WHERE idProjects = ?';
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

app.post("/remove-delayed", (req, res) => {
  const { idProjects } = req.body;
  // Update the EndDate of the project in the database
  const updateQuery = 'UPDATE projects SET  `Delayed`= false WHERE idProjects = ?';
  connection.query(updateQuery, [idProjects], (err, result) => {
    if (err) {
      console.error('Error updating end date:', err);
      return res.status(500).json({ status: 'error', message: 'Error updating end date', error: err.message });
    }
      // Retrieve the updated project information
      const selectQuery = 'SELECT * FROM projects WHERE idProjects = ?';
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

// Disconnect from the database
app.get("/disconnect", (req, res) => {
  connection.end((err) => {
    if (err) throw err;
    console.log("DATABASE DISCONNECTED");
    res.send("Database disconnected");
  });
});


app.post("/user-info", (req, res) => {
  // Fetch user information based on the logged-in user
  const {UUID} = req.body;
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