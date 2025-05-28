import pool from '../config/db.js';
import bcrypt from "bcrypt";

// Helper function for verifying passwords
export async function verifyPassword(password, hashedPassword) {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
}

// Helper function for verifying reset token
export async function verifyResetToken(resetToken) {
    const query = 'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpires > NOW()';
    const [result] = await pool.query(query, [resetToken]);
    return result;
}

// Function to log out a user
export async function logoutUser(UUID) {
    const query = 'DELETE FROM user_instance WHERE idInstance = ?';
    await pool.query(query, [UUID]);
}

// Function to sign up a new user
export const signupUser = async (name, email, username, password) => {
    const hashedPassword = await hashPassword(password);

    // Queruy to check if email or username already exists
    const [emailResults] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (emailResults.length > 0) {
        throw new Error('Email is already taken');
    }

    const [usernameResults] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (usernameResults.length > 0) {
        throw new Error('Username is already taken');
    }
    // Insert the new user into the database
    const sql_query = 'INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)';
    await pool.query(sql_query, [name, email, username, hashedPassword]);
};

// Function to create an appointment
export const createAppointment = async (idUser, StartDate, EndDateProjection, ProjectInfo) => {
    const sql_query = 'INSERT INTO projects (idUser, StartDate, EndDateProjection, ProjectInfo) VALUES (?, ?, ?, ?)';
    await pool.query(sql_query, [idUser, StartDate, EndDateProjection, ProjectInfo]);
};

// Hashing function for passwords
export async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

// Query to get user by their UUID
export async function getUserByUUID(UUID) {
    const [results] = await pool.query('SELECT idUser FROM user_instance WHERE idInstance = ?', [UUID]);
    return results;
}

// Query to get user password hash by Id
export async function getPasswordByIdUser(idUser) {
    const [results] = await pool.query('SELECT password FROM users WHERE idUser = ?', [idUser]);
    return results;
}

// Query to get user by their email
export async function getUserByEmail(email) {
    const [results] = await pool.query('SELECT * FROM users WHERE Email = ?', [email]);
    return results;
}

// Function to update the users password
export async function updatePassword(idUser, hashedNewPassword) {
    const query = 'UPDATE users SET password = ? WHERE idUser = ?';
    await pool.query(query, [hashedNewPassword, idUser]);
}

// Function to update the users password and reset the reset token
export async function updatePasswordWithToken(idUser, hashedNewPassword) {
    const query = 'UPDATE users SET password = ?, resetToken = NULL, resetTokenExpires = NULL WHERE idUser = ?';
    await pool.query(query, [hashedNewPassword, idUser]);
}
// Query to retrieve all projects for a user by user Id
export const getProjectsByUserId = async (idUser) => {
    const sql_query = 'SELECT projects.*, users.Username FROM projects JOIN users ON projects.idUser = users.idUser WHERE projects.idUser = ?';
    const [results] = await pool.query(sql_query, [idUser]);
    return results;
};

// Query to retrieve all projects for a user by user UUID
export const getProjectsByUserUUID = async (UUID) => {
    // Gets the user ID from the UUID
    const getUserIDQuery = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
    const [userResults] = await pool.query(getUserIDQuery, [UUID]);
    // Checks if there is a user with that UUID
    if (userResults.length === 0) {
        throw new Error('User not found');
    }
    const idUser = userResults[0].idUser;

    // Retrieves the projects for that user
    const getProjectsQuery = `
        SELECT projects.*, users.Username, project_status.statusName
        FROM projects 
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE projects.idUser = ?
    `;
    const [projects] = await pool.query(getProjectsQuery, [idUser]);
    return projects;
};

// Query to check if a user is a worker
export async function checkWorkerStatus(userid) {
    const [results] = await pool.query('SELECT * FROM workers WHERE idUser = ?', [userid]);
    return results.length > 0 || userid === 1;
}

// Query to check if a user is an admin
export async function checkAdminStatus(userid) {
    const [results] = await pool.query('SELECT * FROM administrators WHERE idUser = ?', [userid]);
    return results.length > 0 || userid === 1;
}

// Functiion to update the users username
export const updateUsername = async (userId, newUsername) => {
    const query = 'UPDATE users SET username = ? WHERE idUser = ?';
    await pool.query(query, [newUsername, userId]);
};

// Function to update the users name
export const updateName = async (userId, newName) => {
    const query = 'UPDATE users SET name = ? WHERE idUser = ?';
    await pool.query(query, [newName, userId]);
};

// Function to cancel own appointment
export const cancelAppointment = async (idProjects) => {
    const [result] = await pool.query(
        `UPDATE projects 
       SET idStatus = (SELECT idStatus FROM project_status WHERE statusName = 'Cancelled' LIMIT 1) 
       WHERE idProjects = ?`,
        [idProjects]
    );
    return result;
};

// Function to generate new password reset token
export const SetNewResetToken = async (email, expires, resetToken) => {
    const [result] = await pool.query('UPDATE users SET resetToken = ?, resetTokenExpires = ? WHERE email = ?', [
        resetToken,
        expires,
        email,
    ]);
    return result;
};

export const deleteUserById = async (idUser) => {
  try {
    // Remove user from user_instance (active sessions)
    await pool.query('DELETE FROM user_instance WHERE idUser = ?', [idUser]);

    // Remove from workers if present
    await pool.query('DELETE FROM workers WHERE idUser = ?', [idUser]);

    // Remove from administrators if present
    await pool.query('DELETE FROM administrators WHERE idUser = ?', [idUser]);

    // Remove all notifications saved for the user if present
    await pool.query('DELETE FROM notification_settings WHERE idUser = ?', [idUser]);

    // Finally, delete user
    await pool.query('DELETE FROM users WHERE idUser = ?', [idUser]);
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
};
