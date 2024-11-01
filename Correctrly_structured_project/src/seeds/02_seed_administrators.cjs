// seeds/seed_administrators.cjs
const knex = require('knex');
const dbConfig = require('../knexfile.cjs');

// Pass the development configuration to knex
const db = knex(dbConfig.development);

exports.seed = async function () {
  await db('administrators').del();

  const administrators = [
    { idUser: 1, AdminTenure: 3 },
    { idUser: 2, AdminTenure: 5 },
    { idUser: 3, AdminTenure: 2 },
    { idUser: 4, AdminTenure: 1 },
  ];

  for (const admin of administrators) {
    await db('administrators').insert(admin);
    console.log(`Inserted administrator for user ID: ${admin.idUser}`);
  }

  await db.destroy(); // Close the database connection
};
