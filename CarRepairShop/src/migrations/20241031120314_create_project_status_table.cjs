exports.up = function(knex) {
    return knex.schema.createTable('project_status', function(table) {
      table.increments('idStatus').primary();  // Auto-increment primary key
      table.string('statusName').notNullable();  // Column for the name/description of the status
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('project_status');
  };
  