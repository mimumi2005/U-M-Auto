import mysql2 from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the MySQL database');
  });
  
  export default connection;
// For local setup
// // Create a MySQL connection (using callback-style API)
// const connection = mysql2.createConnection({
//     host: 'localhost',
//     database: 'CarRepairShop',
//     user: 'root',
//     password: 'root',
// });

// // Connect to MySQL
// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err.message);
//         process.exit(1);
//     }
//     console.log('Connected to MySQL database.');
// });

// // Export the connection object
// export default connection;
