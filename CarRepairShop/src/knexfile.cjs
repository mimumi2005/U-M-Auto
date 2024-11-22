// knexfile.cjs
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const config = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
  // Add staging and production configurations as needed
};

// Exporting the environment-specific configuration
module.exports = config;
