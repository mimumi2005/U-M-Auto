import mysql2 from 'mysql2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env!');
}

const dbUrl = new URL(process.env.DATABASE_URL);

console.log("Connecting to DB with:", {
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', ''),
});

const connection = mysql2.createConnection({
  host: dbUrl.hostname,
  port: dbUrl.port || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace('/', '')
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database');
});

export default connection;
