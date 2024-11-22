exports.up = function (knex) {
    return knex.schema.createTable('notification_settings', function (table) {
        table.increments('id').primary();
        table.integer('idUser')
        .unsigned()
        .references('idUser')
        .inTable('users')
        .onDelete('CASCADE');

        // Column for special deal notifications
        table.enu('deal_notifications', ['None', 'Offers', 'OilChange', 'ALL']).defaultTo('None');

        // Column for appointment reminders
        table.enu('appointment_reminders', ['None', 'Day', 'Hour', 'Both']).defaultTo('None');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('notification_settings');
};
