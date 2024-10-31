// seeds/seed_users.js
import knex from 'knex';
import dbConfig from '../knexfile.js';
import bcrypt from 'bcrypt';

const db = knex(dbConfig);

export const seed = async () => {
  await db('users').del();

  const users = [
    { Name: 'John Doe', Username: 'johndoe', Email: 'john@example.com', password: 'password123' },
    { Name: 'Jane Smith', Username: 'janesmith', Email: 'jane@example.com', password: 'password123' },
    { Name: 'Alice Johnson', Username: 'alicej', Email: 'alice@example.com', password: 'password123' },
    { Name: 'Bob Brown', Username: 'bobb', Email: 'bob@example.com', password: 'password123' },
    { Name: 'Charlie Green', Username: 'charlieg', Email: 'charlie@example.com', password: 'password123' },
    { Name: 'David Smith', Username: 'davids', Email: 'david@example.com', password: 'password123' },
    { Name: 'Eva Adams', Username: 'evaa', Email: 'eva@example.com', password: 'password123' },
    { Name: 'Frank Martin', Username: 'frankm', Email: 'frank@example.com', password: 'password123' },
    { Name: 'Grace Lee', Username: 'grace', Email: 'grace@example.com', password: 'password123' },
    { Name: 'Henry Chen', Username: 'henryc', Email: 'henry@example.com', password: 'password123' },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await db('users').insert({
      ...user,
      password: hashedPassword,
    });
    console.log(`Inserted user: ${user.Name}`);
  }

  await db.destroy(); // Close the database connection
};
