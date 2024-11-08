exports.up = function (knex) {
  return knex.schema.createTable('user_instance', function (table) {
    table.string('idInstance', 36).primary();
    table.integer('idUser').defaultTo(null)
      .unsigned()
      .references('idUser')
      .inTable('users')
      .onDelete('CASCADE');
    table.datetime('instanceStart').defaultTo(null);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('user_instance');
};
