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