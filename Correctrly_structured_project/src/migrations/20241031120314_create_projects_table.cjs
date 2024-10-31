exports.up = function (knex) {
  return knex.schema.createTable('projects', function (table) {
    table.increments('idProjects').primary();
    table.integer('idUser').notNullable()
      .unsigned()
      .references('idUser')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('StartDate', 45).defaultTo(null);
    table.string('EndDateProjection', 45).defaultTo(null);
    table.boolean('Delayed').defaultTo(0);
    table.string('ProjectInfo', 255).defaultTo(null);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('projects');
};
