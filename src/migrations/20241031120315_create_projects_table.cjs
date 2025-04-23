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
    
    // Set default to 1 (pending)
    table.integer('idStatus').notNullable()
      .unsigned()
      .defaultTo(1) // Default to the 'pending' status id (assuming 1 is 'pending')
      .references('idStatus')
      .inTable('project_status')
      .onDelete('CASCADE');
    
    table.string('ProjectInfo', 255).defaultTo(null);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('projects');
};
