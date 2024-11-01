// seeds/seed_users.js
const knex = require('knex');
const dbConfig = require('../knexfile.cjs');
const bcrypt = require('bcrypt');
const db = knex(dbConfig.development);

// Function to generate a unique username and email
const generateUserDetails = (index) => {
  const baseName = `User${index}`;
  const username = `user${index}`;
  const email = `user${index}@example.com`;
  return { Name: baseName, Username: username, Email: email };
};

// Function to create a specified number of users
const createUsers = async (count) => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = [];

  for (let i = 1; i <= count; i++) {
    const { Name, Username, Email } = generateUserDetails(i);
    users.push({
      Name,
      Username,
      Email,
      password: hashedPassword,
    });
  }

  return users;
};

exports.seed = async function () {
  await db('users').del();

  const userCount = 149; // Specify the number of users to create
  const users = await createUsers(userCount);

  // Create the admin user
  const adminHashedPassword = await bcrypt.hash('abols123', 10);
  const adminUser = {
    Name: 'Janis',
    Username: 'Mim05',
    Email: 'janiskrisjanis.g@gmail.com',
    password: adminHashedPassword,
  };

  // Combine admin user with the regular users
  await db('users').insert([adminUser, ...users]);
  console.log(`Inserted ${userCount + 1} users into the database (including admin).`);

  await db.destroy(); // Close the database connection
};
