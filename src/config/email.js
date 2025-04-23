import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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
