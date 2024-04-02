SET FOREIGN_KEY_CHECKS = 0; -- Disable foreign key checks temporarily

-- Reset autoincrements to 1 for all tables
ALTER TABLE carrepairshop.administrators AUTO_INCREMENT = 1;
ALTER TABLE carrepairshop.projects AUTO_INCREMENT = 1;
ALTER TABLE carrepairshop.time_table AUTO_INCREMENT = 1;
ALTER TABLE carrepairshop.user_instance AUTO_INCREMENT = 1;
ALTER TABLE carrepairshop.users AUTO_INCREMENT = 1;
ALTER TABLE carrepairshop.workers AUTO_INCREMENT = 1;

-- Truncate all tables to remove all data
TRUNCATE TABLE carrepairshop.administrators;
TRUNCATE TABLE carrepairshop.projects;
TRUNCATE TABLE carrepairshop.time_table;
TRUNCATE TABLE carrepairshop.user_instance;
TRUNCATE TABLE carrepairshop.users;
TRUNCATE TABLE carrepairshop.workers;

SET FOREIGN_KEY_CHECKS = 1; -- Re-enable foreign key checks