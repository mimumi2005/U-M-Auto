const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

/**
 * @param {import('knex')} knex
 */

// Function to generate a unique username and email
function generateUserDetails() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = faker.internet.username({ firstName, lastName });
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

  const userCount = 25;
  const users = await createUsers(userCount);

  const adminHashedPassword = await bcrypt.hash('password123', 10);
  const adminUser = {
    Name: 'Janis',
    Username: 'Mim05',
    Email: 'janiskrisjanis.g@gmail.com',
    password: adminHashedPassword,
  };

  await knex('users').insert([adminUser, ...users]);

  console.log(`✅ Inserted ${userCount + 1} users into the database (including admin).`);
};
