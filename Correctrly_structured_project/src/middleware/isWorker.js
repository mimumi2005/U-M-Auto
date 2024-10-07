import connection from '../config/db.js'; // Import your DB connection
import { checkWorkerStatus } from '../models/workerModels.js'; // Assuming you have this function in your model

export function isWorker(req, res, next) {
    const userId = req.user.id; // Assuming you have user info stored in req.user from session or JWT
    if (!req.user) {
        // Redirect to homepage with a 'sessionEnded' query parameter
        return res.redirect('/?sessionEnded=true');
    }

    checkWorkerStatus(userId, connection, (err, callback) => {
        if (err) {
            console.error('Error checking admin status:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (callback) {
            return next(); // User is an admin, proceed to the next middleware or route handler
        } else {
            return res.status(403).json({ message: 'Unauthorized access: Workers only' });
        }
    });
}