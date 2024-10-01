import connection from '../config/db.js'; // Importing connection
import path from 'path'; // Add this line to import the path module
import * as workerModel from '../models/workerModels.js'

export const workerDashboard = (req, res) => {
    // Render the admin dashboard or serve a file
    res.render('WorkerPage', { nonce: res.locals.nonce }); // Pass nonce to EJS template
};
