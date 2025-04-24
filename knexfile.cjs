const dotenv = require('dotenv');
const path = require('path');
const { URL } = require('url');

dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in .env file!");
}

const dbUrl = new URL(process.env.DATABASE_URL);

module.exports = {
  client: 'mysql2',
  connection: {
    host: dbUrl.hostname,
    port: dbUrl.port || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.replace('/', ''),
    charset: 'utf8mb4',
  },
  migrations: {
    directory: './src/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './src/seeds',
  },
};
