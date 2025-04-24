/**
 * @param {import('knex')} knex
 */

exports.seed = async function (knex) {
    // Clear all tables in the correct order to avoid foreign key conflicts
    await knex('administrators').del();
    await knex('projects').del();
    await knex('user_instance').del();
    await knex('users').del();
    await knex('workers').del();
    await knex('project_status').del();
    await knex('notification_settings').del();
  
    // Reset AUTO_INCREMENT values
    await knex.raw('ALTER TABLE projects AUTO_INCREMENT = 0');
    await knex.raw('ALTER TABLE user_instance AUTO_INCREMENT = 0');
    await knex.raw('ALTER TABLE users AUTO_INCREMENT = 0');
    await knex.raw('ALTER TABLE project_status AUTO_INCREMENT = 0');
  
    console.log("✅ Database cleared");
  };
  