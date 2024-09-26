import { v4 as uuidv4 } from 'uuid';
import connection from '../config/db.js'; // Importing connection
import * as secureModel from '../models/secureModels.js'; // Importing model



// controllers/authController.js
export const loginUser = (username, password, res) => {
    // Your login logic here
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
        const isMatch = await secureModel.verifyPassword(password, user.password);
  
        if (!isMatch) {
          // Passwords do not match
          return res.status(401).json({ status: '2', message: 'Wrong password' });
        }
  
        // Passwords match, login successful
        const userid = user.idUser;
  
        // Check if user is an admin
        secureModel.checkAdminStatus(userid, connection, (err, IsAdmin) => {
          if (err) {
            console.error('Error checking admin status:', err);
            return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
          }
  
          // Check if user is a worker
          secureModel.checkWorkerStatus(userid, connection, (err, IsWorker) => {
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
    await secureModel.signupUser(name, email, username, password);

    // Login the user after successful signup
    loginUser(username, password, res); // Adjusted to use the response object directly
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
export const handleLogout = async (req, res) => {
  const { UUID } = req.body; // Extract the UUID from the request body

  try {
    await logoutUser(UUID); // Call the model function
    res.json({ status: 'success', message: 'Logout successful!' });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Function for making new appointments
export const handleCreateAppointment = async (req, res) => {
  const { idUser, StartDate, EndDateProjection, ProjectInfo } = req.body;
  console.log(req.body);

  try {
    // Call the model function to create an appointment
    await secureModel.createAppointment(idUser, StartDate, EndDateProjection, ProjectInfo);
    res.status(201).json({ status: 'success', message: "Project registered successfully!" });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};