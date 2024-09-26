import connection from '../config/db.js';

// Example: Fetch all users
export const getAllUsers = (callback) => {
    const query = 'SELECT * FROM users';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            return callback(err, null);
        }
        callback(null, results);
    });
};