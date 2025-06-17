const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

/**
 * @param {import('knex')} knex
 */

// Function to generate a unique username and email
function generateUserDetails() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = faker.internet.username({ firstName });
  const email = faker.internet.email({ firstName, lastName });

  return {
    Name: firstName,
    Username: username,
    Email: email,
  };
}

// Function to create a specified number of users
const createUsers = async (count) => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = [];

  for (let i = 1; i <= count; i++) {
    const { Name, Username, Email } = generateUserDetails();
    users.push({
      Name,
      Username,
      Email,
      password: hashedPassword,
    });
  }

  return users;
};

exports.seed = async function (knex) {
  await knex('users').del();

  const userCount = 99;
  const users = await createUsers(userCount);

  const hashedPassword = await bcrypt.hash('DrosaParole#123', 10);
  const workerUser = {
    Name: 'Marcis',
    Username: 'Jaukais49',
    Email: 'Jaukais49g@inbox.lv',
    password: hashedPassword,
  };

  const normalUser = {
    Name: 'Janis',
    Username: 'JanisG',
    Email: 'janiskrisjanis.g@inbox.lv',
    password: hashedPassword,
  };

  const adminHashedPassword = await bcrypt.hash('password123', 10);
  const adminUser = {
    Name: 'Janis',
    Username: 'Mim05',
    Email: 'janiskrisjanis.g@gmail.com',
    password: adminHashedPassword,
  };

  await knex('users').insert([adminUser, normalAdmin, workerUser, normalUser, ...users]);

  console.log(`✅ Inserted ${userCount + 1} users into the database (including admin).`);
};
