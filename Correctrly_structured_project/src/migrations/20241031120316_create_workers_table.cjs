exports.up = function(knex) {
  return knex.schema.createTable('workers', function(table) {
    table.integer('idUser').primary();
    table.integer('tenure').defaultTo(null);
    table.date('StartWorkDate').defaultTo(null);
    table.string('WorkerType', 45).defaultTo(null);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('workers');
};
