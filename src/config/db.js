import mysql2 from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = new URL(process.env.DATABASE_URL);

console.log("Connecting to DB with:", {
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    name: dbUrl.pathname.replace('/', ''),
});


const connection = mysql2.createConnection({
    host: dbUrl.hostname,
    port: dbUrl.port,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', '')
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the MySQL database');
});

export default connection;
