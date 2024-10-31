// seeds/seed_workers.js
import knex from 'knex';
import dbConfig from '../knexfile.js';

const db = knex(dbConfig);

export const seed = async () => {
  await db('workers').del();

  const workers = [
    { idUser: 1, tenure: 3, StartWorkDate: '2024-01-01', WorkerType: 'Main admin' },
    { idUser: 2, tenure: 2, StartWorkDate: '2024-02-01', WorkerType: 'Mechanic' },
    { idUser: 3, tenure: 1, StartWorkDate: '2024-03-01', WorkerType: 'Electrician' },
    { idUser: 4, tenure: 4, StartWorkDate: '2024-04-01', WorkerType: 'Body Shop Technician' },
  ];

  for (const worker of workers) {
    await db('workers').insert(worker);
    console.log(`Inserted worker for user ID: ${worker.idUser}`);
  }

  await db.destroy(); // Close the database connection
};
