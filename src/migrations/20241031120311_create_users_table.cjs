exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('idUser').primary(); // This is an INTEGER AUTO_INCREMENT column
    table.string('Name', 20).defaultTo(null);
    table.string('Username', 25).defaultTo(null);
    table.string('Email', 45).defaultTo(null);
    table.string('password', 255).defaultTo(null);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};