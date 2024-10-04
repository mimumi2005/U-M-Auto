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
    const workerQuery = 'SELECT idUser FROM Workers';
    connection.query(workerQuery, callback);
  };

  export const getAllAdminIds = (callback) => {
    const workerQuery = 'SELECT idUser FROM administrators';
    connection.query(workerQuery, callback);
  };
  
  export const getCombinedWorkerInfo = (idUser, callback) => {
    const combinedQuery = 'SELECT Users.*, Workers.* FROM Users INNER JOIN Workers ON Users.idUser = Workers.idUser WHERE Users.idUser = ?';
    connection.query(combinedQuery, [idUser], callback);
  };


  export const getCombinedAdminInfo = (idUser, callback) => {
    const combinedQuery = 'SELECT Users.*, Workers.*, administrators.* FROM Users INNER JOIN Workers ON Users.idUser = Workers.idUser INNER JOIN administrators ON Users.idUser = administrators.idUser WHERE Users.idUser = ? ';
    connection.query(combinedQuery, [idUser], callback);
  };


  export const getActiveProjects = (curdate, callback) => {
    const sql_query = `
      SELECT projects.*, users.UserName
      FROM projects
      JOIN users ON projects.idUser = users.idUser
      WHERE ? < projects.StartDate OR projects.Delayed = true
    `;
  
    // Execute the query
    connection.query(sql_query, [curdate], callback);
  };


  export const getProjectById = (idProjects, callback) => {
    const sql_query = `
      SELECT projects.*, users.UserName
      FROM projects
      JOIN users ON projects.idUser = users.idUser
      WHERE idProjects = ?
    `;
  
    // Execute the query
    connection.query(sql_query, [idProjects], callback);
  };

  export const getAllUsers = (callback) => {
    const sql_query = `
      SELECT * FROM users`;
    // Execute the query
    connection.query(sql_query, callback);
  };

  // Model function to fetch active user instances
export const getActiveInstances = (callback) => {
  const instance_query = 'SELECT * FROM user_instance';
  connection.query(instance_query, callback);
};

// Model function to fetch user information by user ID
export const getUserById = (idUser, callback) => {
  const user_query = 'SELECT * FROM users WHERE idUser = ?';
  connection.query(user_query, [idUser], callback);
};

// Model function to fetch user information by user ID
export const getUserByEmail = (email, callback) => {
  const user_query = 'SELECT * FROM users WHERE Email = ?';
  connection.query(user_query, [email], callback);
};

export const getTodaysProjects = (year, month, day, callback) => {
  const sql_query = `
    SELECT projects.*, users.UserName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    WHERE 
      YEAR(StartDate) = ? AND MONTH(StartDate) = ? AND DAY(StartDate) <= ?
      AND 
      YEAR(EndDateProjection) = ? AND MONTH(EndDateProjection) = ? AND DAY(EndDateProjection) = ?
  `;
  connection.query(sql_query, [year, month, day, year, month, day], callback);
};


// Model function to fetch finished projects
export const getFinishedProjects = (isoCurrentDate, callback) => {
  const sql_query = `
    SELECT projects.*, users.UserName
    FROM projects
    JOIN users ON projects.idUser = users.idUser
    WHERE projects.Delayed = false AND ? > projects.EndDateProjection
  `;

  connection.query(sql_query, [isoCurrentDate], callback);
};

// Model function to fetch delayed projects
export const getDelayedProjects = (callback) => {
  const sql_query = `
    SELECT projects.*, users.UserName 
    FROM projects 
    JOIN users ON projects.idUser = users.idUser 
    WHERE projects.Delayed = true
  `;

  connection.query(sql_query, callback);
};

// Model function to update the end date and set delayed status
export const updateProjectEndDate = (EndDate, idProjects, callback) => {
  const updateQuery = 'UPDATE projects SET EndDateProjection = ?, `Delayed` = true WHERE idProjects = ?';
  connection.query(updateQuery, [EndDate, idProjects], (err, result) => {
    if (err) return callback(err);

    // Retrieve the updated project information
    const selectQuery = 'SELECT projects.*, users.UserName FROM projects JOIN users ON projects.idUser = users.idUser WHERE idProjects = ?';
    connection.query(selectQuery, [idProjects], callback);
  });
};

// Model function to update the delayed status of a project
export const updateProjectDelayedStatus = (idProjects, callback) => {
  const updateQuery = 'UPDATE projects SET `Delayed` = false WHERE idProjects = ?';
  connection.query(updateQuery, [idProjects], (err, result) => {
    if (err) return callback(err);

    // Retrieve the updated project information
    const selectQuery = 'SELECT projects.*, users.UserName FROM projects JOIN users ON projects.idUser = users.idUser WHERE idProjects = ?';
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
    const query = 'INSERT INTO administrators (idUser) VALUES (?)';
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
