
import connection from '../config/db.js';


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


export const getActiveProjects = (curdate, callback) => {
  const sql_query = `
      SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus
      WHERE ? < projects.StartDate OR projects.Delayed = true
    `;

  // Execute the query
  connection.query(sql_query, [curdate], callback);
};

export const getTodaysProjects = (year, month, day, callback) => {
  const sql_query = `
      SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus
      WHERE 
        YEAR(StartDate) = ? AND MONTH(StartDate) = ? AND DAY(StartDate) <= ?
        AND 
        YEAR(EndDateProjection) = ? AND MONTH(EndDateProjection) = ? AND DAY(EndDateProjection) = ?
    `;
  connection.query(sql_query, [year, month, day, year, month, day], callback);
};

// Model function to fetch delayed projects
export const getDelayedProjects = (callback) => {
  const sql_query = `
    SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus
    WHERE projects.Delayed = true
  `;

  connection.query(sql_query, callback);
};


export const getProjectById = (idProjects, callback) => {
  const sql_query = `
    SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus
    WHERE idProjects = ?
  `;

  // Execute the query
  connection.query(sql_query, [idProjects], callback);
};

// Model function to update the end date and set delayed status
export const updateProjectEndDate = (EndDate, idProjects, callback) => {
  const updateQuery = 'UPDATE projects SET EndDateProjection = ?, `Delayed` = true WHERE idProjects = ?';
  connection.query(updateQuery, [EndDate, idProjects], (err, result) => {
    if (err) return callback(err);

    // Retrieve the updated project information
    const selectQuery = `SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus WHERE idProjects = ?`;
    connection.query(selectQuery, [idProjects], callback);
  });
};

export const updateProjectStatus = (newStatus, idProjects, callback) => {
  const updateQuery = `
    UPDATE projects p
    JOIN project_status s ON s.statusName = ?
    SET p.idStatus = s.idStatus
    WHERE p.idProjects = ?;
  `;
  connection.query(updateQuery, [newStatus, idProjects], (err, result) => {
    if (err) return callback(err);
     // Retrieve the updated project information
     const selectQuery = `SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus WHERE idProjects = ?`;
     connection.query(selectQuery, [idProjects], callback);
  });
}


// Model function to update the delayed status of a project
export const updateProjectDelayedStatus = (idProjects, callback) => {
  const updateQuery = 'UPDATE projects SET `Delayed` = false WHERE idProjects = ?';
  connection.query(updateQuery, [idProjects], (err, result) => {
    if (err) return callback(err);

    // Retrieve the updated project information
    const selectQuery = `SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus WHERE idProjects = ?`;
    connection.query(selectQuery, [idProjects], callback);
  });
};


export const getProjectsByUserId = (idUser, callback) => {
  const sql_query = `
    SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus
    WHERE projects.idUser = ?
  `;

  // Execute the query
  connection.query(sql_query, [idUser], callback);
};


// Model function to fetch user information by user ID
export const getUserById = (idUser, callback) => {
  const user_query = 'SELECT * FROM users WHERE idUser = ?';
  connection.query(user_query, [idUser], callback);
};