import connection from '../config/db.js';

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

export const getAllWorkerIds = (callback) => {
  const workerQuery = `SELECT idUser FROM workers;
  `;  
    connection.query(workerQuery, callback);
  };

  export const getAllAdminIds = (callback) => {
    const workerQuery = 'SELECT idUser FROM administrators';
    connection.query(workerQuery, callback);
  };
  

  export const getActiveProjects = (curdate, callback) => {
    const sql_query = `SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus
      WHERE ? < projects.StartDate OR projects.Delayed = true
    `;
  
    // Execute the query
    connection.query(sql_query, [curdate], callback);
  };


  export const getProjectById = (idProjects, callback) => {
    const sql_query = `SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus
      WHERE idProjects = ?
    `;
  
    // Execute the query
    connection.query(sql_query, [idProjects], callback);
  };

  export const getAllUsers = (callback) => {
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
    connection.query(sql_query, callback);
  };
  

  export const getAllProjects = (callback) => {
    const sql_query =`SELECT projects.*, users.UserName, project_status.statusName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    JOIN project_status ON projects.idStatus = project_status.idStatus
  `;
    // Execute the query
    connection.query(sql_query, callback);
  };

// Model function to fetch user information by user ID
export const getUserById = (idUser, callback) => {
  const user_query = 'SELECT * FROM users WHERE idUser = ?';
  connection.query(user_query, [idUser], callback);
};

export const getTodaysProjects = (year, month, day, callback) => {
  const sql_query = `SELECT projects.*, users.UserName, project_status.statusName
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
  const sql_query = 'SELECT projects.*, users.UserName, project_status.statusName FROM projects JOIN users ON projects.idUser = users.idUser JOIN project_status ON projects.idStatus = project_status.idStatus WHERE projects.Delayed = true';

  connection.query(sql_query, callback);
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


// Function to get user ID by email
export const getUserIdByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT idUser FROM users WHERE email = ?';
    connection.query(query, [email], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// Function to check if user is already a worker
export const isUserAlreadyWorker = (idUser) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM workers WHERE idUser = ?';
    connection.query(query, [idUser], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// Function to check if user is already a worker
export const isUserAlreadyAdmin = (idUser) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM administrators WHERE idUser = ?';
    connection.query(query, [idUser], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// Function to insert a new worker
export const insertWorker = (idUser, workerType, startWorkDate, tenure) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO workers (idUser, workerType, StartWorkDate, tenure) VALUES (?, ?, ?, ?)';
    connection.query(query, [idUser, workerType, startWorkDate, tenure], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// Function to insert an admin
export const insertAdmin = (idUser) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO administrators (idUser, AdminTenure) VALUES (?, 0)';
    connection.query(query, [idUser], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

// Function to remove an admin
export const removeAdmin = (idUser) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM administrators WHERE idUser = ?';
    connection.query(query, [idUser], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};


export const getProjectsByUserId = (idUser, callback) => {
  const sql_query = `
    SELECT projects.*, users.UserName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    WHERE projects.idUser = ?
  `;

  // Execute the query
  connection.query(sql_query, [idUser], callback);
};
