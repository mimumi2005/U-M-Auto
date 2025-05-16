import pool from '../config/db.js';
import bcrypt from "bcrypt";

export async function verifyPassword(password, hashedPassword) {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
}

export async function logoutUser(UUID) {
    const query = 'DELETE FROM user_instance WHERE idInstance = ?';
    await pool.query(query, [UUID]);
}

export const signupUser = async (name, email, username, password) => {
    const hashedPassword = await hashPassword(password);

    const [emailResults] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (emailResults.length > 0) {
        throw new Error('Email is already taken');
    }

    const [usernameResults] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (usernameResults.length > 0) {
        throw new Error('Username is already taken');
    }

    const sql_query = 'INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)';
    await pool.query(sql_query, [name, email, username, hashedPassword]);
};

export const createAppointment = async (idUser, StartDate, EndDateProjection, ProjectInfo) => {
    const sql_query = 'INSERT INTO projects (idUser, StartDate, EndDateProjection, ProjectInfo) VALUES (?, ?, ?, ?)';
    await pool.query(sql_query, [idUser, StartDate, EndDateProjection, ProjectInfo]);
};

export async function hashPassword(password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

export async function getUserByUUID(UUID) {
    const [results] = await pool.query('SELECT idUser FROM user_instance WHERE idInstance = ?', [UUID]);
    return results;
}

export async function getPasswordByIdUser(idUser) {
    const [results] = await pool.query('SELECT password FROM users WHERE idUser = ?', [idUser]);
    return results;
}

export async function updatePassword(idUser, hashedNewPassword) {
    const query = 'UPDATE users SET password = ? WHERE idUser = ?';
    await pool.query(query, [hashedNewPassword, idUser]);
}

export const getProjectsByUserId = async (idUser) => {
    const sql_query = 'SELECT projects.*, users.Username FROM projects JOIN users ON projects.idUser = users.idUser WHERE projects.idUser = ?';
    const [results] = await pool.query(sql_query, [idUser]);
    return results;
};

export const getProjectsByUserUUID = async (UUID) => {
    const getUserIDQuery = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
    const [userResults] = await pool.query(getUserIDQuery, [UUID]);
    if (userResults.length === 0) {
        throw new Error('User not found');
    }
    const idUser = userResults[0].idUser;

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

export async function checkWorkerStatus(userid) {
    const [results] = await pool.query('SELECT * FROM workers WHERE idUser = ?', [userid]);
    return results.length > 0 || userid === 1;
}

export async function checkAdminStatus(userid) {
    const [results] = await pool.query('SELECT * FROM administrators WHERE idUser = ?', [userid]);
    return results.length > 0 || userid === 1;
}

export const updateUsername = async (userId, newUsername) => {
    const query = 'UPDATE users SET username = ? WHERE idUser = ?';
    await pool.query(query, [newUsername, userId]);
};

export const updateName = async (userId, newName) => {
    const query = 'UPDATE users SET name = ? WHERE idUser = ?';
    await pool.query(query, [newName, userId]);
};

export const cancelAppointment = async (idProjects) => {
    const [result] = await pool.query(
        `UPDATE projects 
       SET idStatus = (SELECT idStatus FROM project_status WHERE statusName = 'Cancelled' LIMIT 1) 
       WHERE idProjects = ?`,
        [idProjects]
    );
    return result;
};