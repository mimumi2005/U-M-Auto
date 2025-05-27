exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('idUser').primary();
    table.string('Name', 25).defaultTo(null);
    table.string('Username', 35).defaultTo(null);
    table.string('Email', 45).defaultTo(null);
    table.string('password', 255).defaultTo(null);

    // Fields for password reset functionality
    table.string('resetToken', 255).nullable().defaultTo(null);
    table.datetime('resetTokenExpires', 5).nullable().defaultTo(null);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};