/**
 * @param {import('knex')} knex
 */
exports.seed = async function (knex) {
  await knex('administrators').del();

  const administrators = [
    { idUser: 1, AdminTenure: 3 },
    { idUser: 2, AdminTenure: 5 },
    { idUser: 3, AdminTenure: 2 },
    { idUser: 4, AdminTenure: 1 },
  ];

  for (const admin of administrators) {
    await knex('administrators').insert(admin);
  }

  console.log(`✅ Inserted ${administrators.length} administrators into the database.`);
};
