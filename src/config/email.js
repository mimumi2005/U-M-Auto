import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();


if (!process.env.DATABASE_URL && (!process.env.DB_HOST || !process.env.DB_USER)) {
  throw new Error(" Missing database environment variables.");
}

const connection = await mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

console.log('Connected to MySQL (promise-based).');

export default connection;
