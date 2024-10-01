
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