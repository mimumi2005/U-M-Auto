import pool from '../config/db.js';

export async function checkAdminStatus(userid) {
    const [results] = await pool.query('SELECT * FROM administrators WHERE idUser = ?', [userid]);
    return results.length > 0 || userid === 1;
}

export const getAllWorkerIds = async () => {
    const [results] = await pool.query('SELECT idUser FROM workers');
    return results;
};

export const getAllAdminIds = async () => {
    const [results] = await pool.query('SELECT idUser FROM administrators');
    return results;
};

export const getActiveProjects = async (curdate) => {
    const sql_query = `
      SELECT projects.*, users.Username, project_status.statusName
      FROM projects
      JOIN users ON projects.idUser = users.idUser
      JOIN project_status ON projects.idStatus = project_status.idStatus
      WHERE (? < projects.StartDate OR projects.Delayed = true)
        AND project_status.statusName != 'Cancelled'
    `;
    const [results] = await pool.query(sql_query, [curdate]);
    return results;
  };
  

export const getProjectById = async (idProjects) => {
    const sql_query = `
        SELECT projects.*, users.Username, users.Email, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE idProjects = ?
    `;
    const [results] = await pool.query(sql_query, [idProjects]);
    return results[0];
};

export const getAllUsers = async () => {
    const sql_query = `
        SELECT users.*, user_instance.idInstance, workers.tenure, administrators.AdminTenure, p.idProjects, workers.WorkerType
        FROM users
        LEFT JOIN user_instance ON users.idUser = user_instance.idUser
        LEFT JOIN workers ON users.idUser = workers.idUser
        LEFT JOIN administrators ON users.idUser = administrators.idUser
        LEFT JOIN (
            SELECT idUser, MIN(idProjects) AS idProjects
            FROM projects
            GROUP BY idUser
        ) AS p ON users.idUser = p.idUser
    `;
    const [results] = await pool.query(sql_query);
    return results;
};

export const getAllProjects = async () => {
    const sql_query = `
        SELECT projects.*, users.Username, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
    `;
    const [results] = await pool.query(sql_query);
    return results;
};

export const getUserById = async (idUser) => {
    const user_query = 'SELECT * FROM users WHERE idUser = ?';
    const [results] = await pool.query(user_query, [idUser]);
    return results;
};

export const getTodaysProjects = async (year, month, day) => {
    const sql_query = `
        SELECT projects.*, users.Username, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE 
          YEAR(StartDate) = ? AND MONTH(StartDate) = ? AND DAY(StartDate) <= ?
          AND 
          YEAR(EndDateProjection) = ? AND MONTH(EndDateProjection) = ? AND DAY(EndDateProjection) = ?
    `;
    const [results] = await pool.query(sql_query, [year, month, day, year, month, day]);
    return results;
};

export const getDelayedProjects = async () => {
    const sql_query = `
        SELECT projects.*, users.Username, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE projects.Delayed = true
    `;
    const [results] = await pool.query(sql_query);
    return results;
};

export const updateProjectEndDate = async (EndDate, idProjects) => {
    const updateQuery = 'UPDATE projects SET EndDateProjection = ?, `Delayed` = true WHERE idProjects = ?';
    await pool.query(updateQuery, [EndDate, idProjects]);

    const selectQuery = `
        SELECT projects.*, users.Username, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE idProjects = ?
    `;
    const [results] = await pool.query(selectQuery, [idProjects]);
    return results;
};

export const updateProjectDelayedStatus = async (idProjects) => {
    const updateQuery = 'UPDATE projects SET `Delayed` = false WHERE idProjects = ?';
    await pool.query(updateQuery, [idProjects]);

    const selectQuery = `
        SELECT projects.*, users.Username, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE idProjects = ?
    `;
    const [results] = await pool.query(selectQuery, [idProjects]);
    return results;
};

export const getUserIdByEmail = async (email) => {
    const query = 'SELECT idUser FROM users WHERE email = ?';
    const [results] = await pool.query(query, [email]);
    return results;
};

export const isUserAlreadyWorker = async (idUser) => {
    const query = 'SELECT * FROM workers WHERE idUser = ?';
    const [results] = await pool.query(query, [idUser]);
    return results;
};

export const isUserAlreadyAdmin = async (idUser) => {
    const query = 'SELECT * FROM administrators WHERE idUser = ?';
    const [results] = await pool.query(query, [idUser]);
    return results;
};

export const insertWorker = async (idUser, workerType, startWorkDate, tenure) => {
    const query = 'INSERT INTO workers (idUser, workerType, StartWorkDate, tenure) VALUES (?, ?, ?, ?)';
    await pool.query(query, [idUser, workerType, startWorkDate, tenure]);
};

export const insertAdmin = async (idUser) => {
    const query = 'INSERT INTO administrators (idUser, AdminTenure) VALUES (?, 0)';
    await pool.query(query, [idUser]);
};

export const removeAdmin = async (idUser) => {
    const query = 'DELETE FROM administrators WHERE idUser = ?';
    await pool.query(query, [idUser]);
};

export const removeWorker = async (idUser) => {
    const query = 'DELETE FROM workers WHERE idUser = ?';
    await pool.query(query, [idUser]);
};

export const getProjectsByUserId = async (idUser) => {
    const sql_query = `
        SELECT projects.*, users.Username, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        LEFT JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE projects.idUser = ?
    `;
    const [results] = await pool.query(sql_query, [idUser]);
    return results;
};

export const getProjectStatistics = async () => {
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
    GROUP BY TimeRange
  `;
  const [results] = await pool.query(sql_query);
  return results;
};

export const getProjectStatusStatistics = async () => {
  const sql_query = `
    SELECT 
      project_status.statusName AS StatusName,
      COUNT(*) AS ProjectsCount
    FROM projects
    JOIN project_status ON projects.idStatus = project_status.idStatus
    GROUP BY project_status.statusName
    ORDER BY project_status.statusName ASC
  `;
  const [results] = await pool.query(sql_query);
  return results;
};

export const getUserStatistics = async () => {
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
    GROUP BY ProjectsCount
  `;
  const [results] = await pool.query(sql_query);
  return results;
};
