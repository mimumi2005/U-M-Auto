import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env!');
}

const dbUrl = new URL(process.env.DATABASE_URL);

// Create a connection pool (instead of a single connection)
const pool = mysql2.createPool({
  host: dbUrl.hostname,
  port: dbUrl.port || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
  waitForConnections: true,
  connectionLimit: 10,     // up to 10 connections
  queueLimit: 0            // unlimited queue
});

export default pool;
