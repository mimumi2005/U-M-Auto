// seeds/seed_administrators.cjs
const knex = require('knex');
const dbConfig = require('../knexfile.cjs');

// Pass the development configuration to knex
const db = knex(dbConfig.development);

exports.seed = async function () {
    await db('project_status').del();  // Delete all existing records in project_status
  
    const projectStatuses = [
      { statusName: 'Pending'},
      { statusName: 'In Progress'},
      { statusName: 'No arrival'},
      { statusName: 'Cancelled'},
      { statusName: 'Completed'},
    ];
  
    for (const status of projectStatuses) {
      await db('project_status').insert(status);  // Insert each status into the table
    }
  
    await db.destroy();  // Close the database connection
  };