import { v4 as uuidv4 } from 'uuid';
import connection from '../config/db.js'; // Importing connection
import path from 'path'; // Add this line to import the path module
import * as authModel from '../models/authModels.js'; // Importing model

export const getProfilePage = (req, res) => {
  const csrfTokenValue = req.csrfToken;
  res.render('pages/Profile', { nonce: res.locals.nonce, csrfToken: csrfTokenValue }); // Pass nonce to EJS template
};

export const getUserProfileInfo = (req, res) => {
  // Fetch user information based on the logged-in user
  const UUID = req.user.UUID; // Change from req.body to req.query

  const query = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
  connection.query(query, [UUID], (err, results) => {
    if (err) {
      console.error('Error fetching user information from the database:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const User = results[0].idUser;
    const query = 'SELECT * FROM users WHERE idUser = ?';
    connection.query(query, [User], (err, results) => {
      if (err) {
        console.error('Error fetching user information from the database:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
      const userInformation = results[0];
      res.json({ status: 'success', user: userInformation });
    });
  });
};


// controllers/authController.js
export const loginUser = (req, res) => {

  const { username, password } = req.body;
  const UUID = uuidv4();

  // Query to check if username or email matches a user in the database
  const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
  connection.query(query, [username, username], async (err, results) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      // No user found with the provided username or email
      return res.status(401).json({ status: '1', message: 'Invalid credentials' });
    }

    const user = results[0]; // Assuming only one user record matches the username/email

    try {
      // Verify the password using bcrypt (verifyPassword is async)
      const isMatch = await authModel.verifyPassword(password, user.password);

      if (!isMatch) {
        // Passwords do not match
        return res.status(401).json({ status: '2', message: 'Wrong password' });
      }

      // Passwords match, login successful
      const userid = user.idUser;

      // Check if user is an admin
      authModel.checkAdminStatus(userid, connection, (err, IsAdmin) => {
        if (err) {
          console.error('Error checking admin status:', err);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }

        // Check if user is a worker
        authModel.checkWorkerStatus(userid, connection, (err, IsWorker) => {
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
              connection.query(deleteInstanceQuery, [userid], (err) => {
                if (err) {
                  console.error('Error deleting user instance:', err);
                  return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
                }
              });
            }

            // Insert new login instance
            const instance_query = 'INSERT INTO user_instance (idInstance, idUser, instanceStart) VALUES (?, ?, ?)';
            connection.query(instance_query, [UUID, userid, new Date()], (err) => {
              if (err) {
                console.error('Error inserting data into the database:', err);
                return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
              }
              // Session info
              console.log('Role', user.role);
              req.session.userId = user.idUser;
              req.session.UUID = UUID;
              req.session.username = user.username;
              req.session.isAdmin = IsAdmin;
              req.session.isWorker = IsWorker;


              console.log(`\nUser-${username} \nPassword-verified \nLogin instance-${UUID}\n Admin: ${IsAdmin}\n Worker: ${IsWorker}\n`);
              res.json({ status: 'success', message: 'Login successful!', data: { UUID, IsAdmin, IsWorker } });
            });
          });
        });
      });

    } catch (error) {
      console.error('Error during login process:', error);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  });
};

export const handleSignUp = async (req, res) => {

  const { name, email, username, password } = req.body;

  try {
    // Call the signup model function
    await authModel.signupUser(name, email, username, password);

    // Login the user after successful signup
    loginUser(req, res); // Adjusted to use the response object directly
  } catch (error) {
    if (error.message === 'Email is already taken') {
      return res.status(409).json({ status: 'error', message: 'Email is already taken' });
    }

    if (error.message === 'Username is already taken') {
      return res.status(409).json({ status: 'error', message: 'Username is already taken' });
    }

    console.error('Error during signup process:', error);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};


// Controller function to handle the logout request
export const handleLogout = (req, res) => {
  const UUID = req.session.UUID; // Extract the UUID from the request body

  // First, destroy the session
  req.session.destroy(async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }

    console.log("Session deleted");

    try {
      await authModel.logoutUser(UUID); // Call the model function to handle any additional logout logic
      res.clearCookie('userData', { path: '/' });
      res.json({ status: 'success', message: 'Logout successful!' });
    } catch (error) {
      console.error('Error logging out user:', error);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  });
};

// Function for making new appointments
export const handleCreateAppointment = async (req, res) => {

  const { idUser, StartDate, EndDateProjection, ProjectInfo } = req.body;

  try {
    // Call the model function to create an appointment
    await authModel.createAppointment(idUser, StartDate, EndDateProjection, ProjectInfo);
    res.status(201).json({ status: 'success', message: "Project registered successfully!" });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};



export const changePassword = async (req, res) => {

  const { currentPassword, newPassword, UUID } = req.body;

  try {
    // Check user based on UUID
    const userResults = await authModel.getUserByUUID(UUID);
    if (userResults.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid UUID' });
    }
    const loggedInUser = userResults[0].idUser;
    // Retrieve the current hashed password from the database
    const passwordResults = await authModel.getPasswordByIdUser(loggedInUser);
    if (passwordResults.length === 0) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }

    const hashedPassword = passwordResults[0].password;

    // Verify if the current password matches the one in the database
    const isMatch = await authModel.verifyPassword(currentPassword, hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Incorrect current password' });
    }

    // Hash the new password
    const hashedNewPassword = await authModel.hashPassword(newPassword);

    // Update the user's password in the database
    await authModel.updatePassword(loggedInUser, hashedNewPassword);

    res.json({ status: 'success', message: 'Password updated successfully!' });

  } catch (error) {
    console.error('Error during password change process:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};



// Controller function to get projects by user ID
export const getUserAppointments = async (req, res) => {
  const { idUser } = req.body;

  try {
    const projects = await authModel.getProjectsByUserId(idUser);

    // If you need to return the HTML page
    res.render('pages/UserAppointment', { nonce: res.locals.nonce }); // Pass nonce to EJS template
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUserSettings = (req, res) => {

  res.render('pages/Settings', { nonce: res.locals.nonce }); // Pass nonce to EJS template
};


export const handleGetUserByUUID = async (req, res) => {
  const UUID = req.params.UUID;
  try {
    const idUser = await authModel.getUserByUUID(UUID);
    res.json({ status: 'success', idUser: idUser[0].idUser });
  }
  catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


