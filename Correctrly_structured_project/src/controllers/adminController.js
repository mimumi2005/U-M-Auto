import connection from '../config/db.js'; // Importing connection
import path from 'path'; // Add this line to import the path module
import * as adminModel from '../models/adminModels.js'

export const adminDashboard = (req, res) => {
    // Render the admin dashboard or serve a file
    res.render('Admin', { nonce: res.locals.nonce }); // Pass nonce to EJS template
};
export const adminStatistics = (req, res) => {
    // Render the admin dashboard or serve a file
    res.render('Statistics', { nonce: res.locals.nonce }); // Pass nonce to EJS template
};