import connection from '../config/db.js'; // Importing connection
import path from 'path'; // Add this line to import the path module

export const adminDashboard = (req, res) => {
    // Render the admin dashboard or serve a file
    res.sendFile(path.resolve('../public/admin.html'));
};