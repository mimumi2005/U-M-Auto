import connection from '../config/db.js';
import bcrypt from "bcrypt"


// Function to compare input password with hashed
export async function verifyPassword(password, hashedPassword) {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
}


  // Function to log out the user based on UUID
export function logoutUser(UUID) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM user_instance WHERE idInstance = ?';
      connection.query(query, [UUID], (err, result) => {
        if (err) {
          console.error('Error logging out user:', err);
          return reject(err);
        }
        console.log('User logged out successfully');
        resolve(result); // You can resolve the result if needed
      });
    });
  }


export const signupUser = async (name, email, username, password) => {
    // Hash the password
    const hashedPassword = await hashPassword(password);
  
    return new Promise((resolve, reject) => {
      // Check if the email is already taken
      const emailCheckQuery = 'SELECT * FROM users WHERE email = ?';
      connection.query(emailCheckQuery, [email], (emailErr, emailResults) => {
        if (emailErr) {
          console.error('Error checking email in the database:', emailErr);
          return reject(emailErr);
        }
  
        if (emailResults.length > 0) {
          return reject(new Error('Email is already taken'));
        }
  
        // Check if the username is already taken
        const usernameCheckQuery = 'SELECT * FROM users WHERE username = ?';
        connection.query(usernameCheckQuery, [username], (usernameErr, usernameResults) => {
          if (usernameErr) {
            console.error('Error checking username in the database:', usernameErr);
            return reject(usernameErr);
          }
  
          if (usernameResults.length > 0) {
            return reject(new Error('Username is already taken'));
          }
  
          // Insert new user into the database
          const sql_query = 'INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)';
          connection.query(sql_query, [name, email, username, hashedPassword], (insertErr, result) => {
            if (insertErr) {
              console.error('Error inserting data into the database:', insertErr);
              return reject(insertErr);
            }
  
            resolve(result); // Successfully signed up
          });
        });
      });
    });
  };

// Function to create a new appointment
export const createAppointment = (idUser, StartDate, EndDateProjection, ProjectInfo) => {
    return new Promise((resolve, reject) => {
      const sql_query = 'INSERT INTO projects (idUser, StartDate, EndDateProjection, ProjectInfo) VALUES (?, ?, ?, ? )';
      connection.query(sql_query, [idUser, StartDate, EndDateProjection, ProjectInfo], (err, result) => {
        if (err) {
          console.error('Error inserting data into the database:', err);
          reject(err); // Reject the promise if there's an error
        } else {
          resolve(result); // Resolve the promise with the result
        }
      });
    });
  };


  // Function to hash password
export async function hashPassword(password) {
    const saltRounds = 10; //Security value, the higher the safer, but slower
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }
  


// Check user based on UUID
export function getUserByUUID(UUID) {
  return new Promise((resolve, reject) => {
      const query = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
      connection.query(query, [UUID], (err, results) => {
          if (err) return reject(err);
          resolve(results);
      });
  });
}

// Get current hashed password for a user
export function getPasswordByIdUser(idUser) {
  return new Promise((resolve, reject) => {
      const query = 'SELECT password FROM users WHERE idUser = ?';
      connection.query(query, [idUser], (err, results) => {
          if (err) return reject(err);
          resolve(results);
      });
  });
}

// Update the user's password
export function updatePassword(idUser, hashedNewPassword) {
  return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET password = ? WHERE idUser = ?';
      connection.query(query, [hashedNewPassword, idUser], (err, result) => {
          if (err) return reject(err);
          resolve(result);
      });
  });
}

// Fetch all projects related to a specific user by ID
export const getProjectsByUserId = (idUser) => {
  return new Promise((resolve, reject) => {
    const sql_query = 'SELECT projects.*, users.UserName FROM projects JOIN users ON projects.idUser = users.idUser WHERE projects.idUser = ?';
    
    connection.query(sql_query, [idUser], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Function to check worker status
export function checkWorkerStatus(userid, connection, callback) {
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

export function checkAdminStatus(userid, connection, callback) {
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

// Function to update the username
export const updateUsername = (userId, newUsername) => {
  return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET username = ? WHERE idUser = ?';
      connection.query(query, [newUsername, userId], (error, results) => {
          if (error) {
              return reject(error);
          }
          resolve(results);
      });
  });
};

// Function to update the name
export const updateName = (userId, newName) => {
  return new Promise((resolve, reject) => {
      const query = 'UPDATE users SET name = ? WHERE idUser = ?';
      connection.query(query, [newName, userId], (error, results) => {
          if (error) {
              return reject(error);
          }
          resolve(results);
      });
  });
};