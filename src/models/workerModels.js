import pool from '../config/db.js';

export async function checkWorkerStatus(userid) {
    const [results] = await pool.query('SELECT * FROM workers WHERE idUser = ?', [userid]);
    return results.length > 0 || userid === 1;
}

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

export const getProjectById = async (idProjects) => {
    const sql_query = `
        SELECT projects.*, users.Username, users.Email, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE idProjects = ?
    `;
    const [results] = await pool.query(sql_query, [idProjects]);
    return results;
};

export const updateProjectEndDate = async (EndDate, idProjects) => {
    const updateQuery = 'UPDATE projects SET EndDateProjection = ?, `Delayed` = true WHERE idProjects = ?';
    await pool.query(updateQuery, [EndDate, idProjects]);

    const selectQuery = `
        SELECT projects.*, users.Username, users.Email, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE idProjects = ?
    `;
    const [results] = await pool.query(selectQuery, [idProjects]);
    return results;
};

export const canUpdateProject = async (idProjects, newEndDate) => {
  const [[project]] = await pool.query('SELECT StartDate FROM projects WHERE idProjects = ?', [idProjects]);
  if (!project) {
    throw new Error('Project not found');
  }

  const { StartDate } = project;

  const sql_query = `
    SELECT COUNT(*) as count
    FROM projects
    WHERE idProjects != ?
      AND NOT (
        EndDateProjection <= ? OR StartDate >= ?
      )
  `;
  const [rows] = await pool.query(sql_query, [idProjects, StartDate, newEndDate]);
  return rows[0].count === 0;
};



export const updateProjectStatus = async (newStatus, idProjects) => {
    const updateQuery = `
        UPDATE projects p
        JOIN project_status s ON s.statusName = ?
        SET p.idStatus = s.idStatus
        WHERE p.idProjects = ?
    `;
    await pool.query(updateQuery, [newStatus, idProjects]);

    const selectQuery = `
        SELECT projects.*, users.Username, users.Email, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE idProjects = ?
    `;
    const [results] = await pool.query(selectQuery, [idProjects]);
    console.log(results);
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

export const getProjectsByUserId = async (idUser) => {
    const sql_query = `
        SELECT projects.*, users.Username, project_status.statusName
        FROM projects
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
        WHERE projects.idUser = ?
    `;
    const [results] = await pool.query(sql_query, [idUser]);
    return results;
};

export const getUserById = async (idUser) => {
    const user_query = 'SELECT * FROM users WHERE idUser = ?';
    const [results] = await pool.query(user_query, [idUser]);
    return results;
};
