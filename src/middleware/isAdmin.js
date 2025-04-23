import connection from '../config/db.js'; // Import your DB connection
import { checkAdminStatus } from '../models/adminModels.js'; // Assuming you have this function in your model

export function isAdmin(req, res, next) {
    // Check if req.user exists before proceeding
    if (!req.user) {
        // Redirect to homepage with a 'sessionEnded' query parameter
        return res.redirect('/?sessionEnded=true');
    }

    const userId = req.user.id; // Assuming you have user info stored in req.user from session or JWT

    // Query the database to check if the user is an admin
    checkAdminStatus(userId, connection, (err, callback) => {
        if (err) {
            console.error('Error checking admin status:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (callback) {
            return next(); // User is an admin, proceed to the next middleware or route handler
        } else {
            return res.redirect('/?unauthorizedAccess=true');
        }
    });
}
