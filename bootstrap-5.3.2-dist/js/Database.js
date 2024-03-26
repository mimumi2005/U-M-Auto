import mysql2 from "mysql2";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";

import globals from './globals.mjs';


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

        globals.LoggedInUser = username;
        res.status(201).json({ status: 'success', message: "User registered successfully!" });
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
  console.log(username, password);
  req.cookies.loggedInUser = username;
  // Check if username or email and password match a user in the database
  const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
  connection.query(query, [username, username], (err, results) => {
    if (err) {
      return res.status(500).json({ status: 'error', message:'Internal Server Error' });
    }

    if (results.length === 0) {
      // No user found with the provided username or email
      return res.status(401).json({ status: '1', message: 'Invalid credentials' });
    }

    // Filter results for a match with the provided password
    const matchedUser = results.find(user => user.password === password);

    if (matchedUser) {
      // Passwords match, login successful
        globals.LoggedInUser = username;
        res.json({ status: 'success', message: 'Login successful!' });

    } else {
      // Passwords do not match
      res.status(401).json({ status: '2', message: 'Wrong password' });
    }
  });
});


app.post("/change-password", (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const loggedInUser = globals.LoggedInUser;

  // Check if the current password matches the user's current password
  const checkCurrentPasswordQuery = 'SELECT * FROM users WHERE username = ? AND password = ?';
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
    const updatePasswordQuery = 'UPDATE users SET password = ? WHERE username = ?';
    connection.query(updatePasswordQuery, [newPassword, loggedInUser], (updateErr) => {
      if (updateErr) {
        console.error('Error updating password in the database:', updateErr);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }

      res.json({ status: 'success', message: 'Password updated successfully!' });
    });
  });
});


// Fetch all users
app.get("/all-users", (req, res) => {
  const sql_query = 'SELECT * FROM users';
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
  });
});

// Fetch all projects
app.get("/all-projects", (req, res) => {
  const sql_query = 'SELECT * FROM projects';
  connection.query(sql_query, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(result);
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


app.get("/user-info", (req, res) => {
  // Fetch user information based on the logged-in user
  const loggedInUser = globals.LoggedInUser;
  console.log(loggedInUser);
  const query = 'SELECT idUser, name, email, username FROM users WHERE username = ?';
  connection.query(query, [loggedInUser], (err, results) => {
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


app.delete('/user-delete/:userID', async (req, res) => {
  const userID = req.params.userID;
  console.log(userID);
  const query = `DELETE FROM users WHERE idUser = ?`;
  connection.query(query, [userID], (error, results) => {
    if (error) {

      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
    console.log('User deleted successfully');
    res.status(200).json({ message: 'User deleted successfully' });
  });
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