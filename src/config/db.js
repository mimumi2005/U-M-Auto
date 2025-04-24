import mysql2 from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env!');
}

const dbUrl = new URL(process.env.DATABASE_URL);

const connection = mysql2.createConnection({
  host: dbUrl.hostname,
  port: dbUrl.port || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', '')
});

connection.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to the MySQL database');
});

export default connection;
