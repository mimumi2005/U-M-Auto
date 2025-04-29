/**
 * @param {import('knex')} knex
 */
exports.seed = async function (knex) {
  await knex('administrators').del();

  const administrators = [
    { idUser: 1, AdminTenure: 3 },
  ];

  for (const admin of administrators) {
    await knex('administrators').insert(admin);
  }

  console.log(`✅ Inserted ${administrators.length} administrators into the database.`);
};
