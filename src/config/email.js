import mysql2 from 'mysql2/promise';

// Create a MySQL connection
// db.js

const connection = await mysql2.createConnection({
    host: 'localhost',
    database: 'CarRepairShop',
    user: 'root',
    password: 'root',
});



// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL database.');
});

// Export the connection object
export default connection;
