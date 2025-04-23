exports.up = function(knex) {
  return knex.schema.createTable('administrators', function(table) {
    table.increments('idUser').primary();
    table.integer('AdminTenure').defaultTo(null);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('administrators');
};
