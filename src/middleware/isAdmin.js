import { checkAdminStatus } from '../models/adminModels.js';

// Function to check if the user is an admin
export async function isAdmin(req, res, next) {
    // Check if the user is logged in
    if (!req.user) {
        return res.redirect('/?sessionEnded=true');
    }
    // Gets the user ID from the sessions
    const userId = req.user.id;
    try {
        // Calls the model function to check if the user is an admin
        const isAdmin = await checkAdminStatus(userId);
        // If the user is an admin, proceed to the next middleware or route handler
        if (isAdmin) {
            return next();
        } else {
            // If the user is not an admin, redirect to the home page with an unauthorized access message
            return res.redirect('/?unauthorizedAccess=true');
        }
    } catch (err) {
        console.error('Error checking admin status:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
