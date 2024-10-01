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
  
  export const getCombinedWorkerInfo = (idUser, callback) => {
    const combinedQuery = 'SELECT Users.*, Workers.* FROM Users INNER JOIN Workers ON Users.idUser = Workers.idUser WHERE Users.idUser = ?';
    connection.query(combinedQuery, [idUser], callback);
  };