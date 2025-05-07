/**
 * @param {import('knex')} knex
 */
exports.seed = async function (knex) {
  await knex('workers').del();

  const workers = [
    { idUser: 1, tenure: 3, StartWorkDate: '2024-01-01', WorkerType: 'Main admin' },
    { idUser: 2, tenure: 2, StartWorkDate: '2024-02-01', WorkerType: 'Mechanic' },
    { idUser: 3, tenure: 1, StartWorkDate: '2024-03-01', WorkerType: 'Electrician' }
  ];

  for (const worker of workers) {
    await knex('workers').insert(worker);
  }

  console.log(`✅ Inserted ${workers.length} workers into the database.`);
};
