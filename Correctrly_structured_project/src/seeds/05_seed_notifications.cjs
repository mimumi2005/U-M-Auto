const knex = require('knex');
const dbConfig = require('../knexfile.cjs');

// Pass the development configuration to knex
const db = knex(dbConfig.development);

exports.seed = async function () {
    // Clear existing records in the notification_settings table
    await db('notification_settings').del();

    // Fetch all users
    const users = await db('users').select('idUser');

    // Iterate over each user and insert default notification settings
    for (const user of users) {
        await db('notification_settings').insert({
            idUser: user.idUser,
            deal_notifications: 'None',
            appointment_reminders: 'None'
        });
    }

    await db.destroy();  // Close the database connection
};
