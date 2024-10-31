// seeds/seed_projects.js
import knex from 'knex';
import dbConfig from '../knexfile.js';

const db = knex(dbConfig);

export const seed = async () => {
  await db('projects').del();

  const projects = [
    { idUser: 1, StartDate: '2024-10-01T08:00:00.000Z', EndDateProjection: '2024-10-15T17:00:00.000Z', Delayed: 0, ProjectInfo: 'Repairing BMW M3' },
    { idUser: 1, StartDate: '2024-10-10T09:00:00.000Z', EndDateProjection: '2024-10-20T18:00:00.000Z', Delayed: 0, ProjectInfo: 'Full Service on Audi A4' },
    { idUser: 2, StartDate: '2024-10-12T10:00:00.000Z', EndDateProjection: '2024-10-22T16:00:00.000Z', Delayed: 1, ProjectInfo: 'Bodywork for Ford Focus' },
    { idUser: 2, StartDate: '2024-10-15T11:00:00.000Z', EndDateProjection: '2024-10-25T19:00:00.000Z', Delayed: 0, ProjectInfo: 'Oil Change for Tesla Model S' },
    { idUser: 3, StartDate: '2024-10-20T12:00:00.000Z', EndDateProjection: '2024-10-30T20:00:00.000Z', Delayed: 0, ProjectInfo: 'Tire Replacement for Honda Civic' },
    { idUser: 3, StartDate: '2024-10-30T14:00:00.000Z', EndDateProjection: '2024-11-10T15:00:00.000Z', Delayed: 0, ProjectInfo: 'Complete Detailing for Toyota Camry' },
    { idUser: 4, StartDate: '2024-11-01T09:00:00.000Z', EndDateProjection: '2024-11-05T17:00:00.000Z', Delayed: 0, ProjectInfo: 'Transmission Repair for Subaru' },
  ];

  for (const project of projects) {
    await db('projects').insert(project);
    console.log(`Inserted project for user ID: ${project.idUser}`);
  }

  await db.destroy(); // Close the database connection
};
