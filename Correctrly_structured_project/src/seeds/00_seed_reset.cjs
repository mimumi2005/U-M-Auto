// seeds/00_clear_database.cjs
const knex = require('knex');
const dbConfig = require('../knexfile.cjs');

const db = knex(dbConfig.development);

exports.seed = async function () {
    
    await db('administrators').del();  // Clear administrators table
    await db('projects').del();  // Clear projects table
    await db('user_instance').del();
    await db('users').del();  // Clear users table
    await db('workers').del();  // Clear worker

    await db.raw('ALTER TABLE projects AUTO_INCREMENT = 0');
    await db.raw('ALTER TABLE user_instance AUTO_INCREMENT = 0');
    await db.raw('ALTER TABLE users AUTO_INCREMENT = 0');
    console.log("Database cleared");
    await db.destroy();
};
