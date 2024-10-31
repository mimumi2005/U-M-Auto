import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    client: process.env.DB_CLIENT,  // Reads the client from the environment
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  // Define staging and production configurations as needed
};