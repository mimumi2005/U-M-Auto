/**
 * @param {import('knex')} knex
 */
exports.seed = async function (knex) {
  await knex('project_status').del();

  const projectStatuses = [
    { statusName: 'Pending' },
    { statusName: 'In Progress' },
    { statusName: 'No arrival' },
    { statusName: 'Cancelled' },
    { statusName: 'Completed' },
  ];

  for (const status of projectStatuses) {
    await knex('project_status').insert(status);
  }

  console.log(`✅ Inserted ${projectStatuses.length} statuses into the project_status table.`);
};
