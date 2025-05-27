import { checkWorkerStatus } from '../models/workerModels.js';

// Function to check if the user is a worker
export async function isWorker(req, res, next) {
    // Check if the user is logged in
    if (!req.user) {
        return res.redirect('/?sessionEnded=true');
    }
    const userId = req.user.id;
    try {
        // Calls the model function to check if the user is a worker
        const isWorker = await checkWorkerStatus(userId);
        // If the user is a worker, proceed to the next middleware or route handler
        if (isWorker) {
            return next();
        } else {
            // If the user is not a worker, redirect to the home page with an unauthorized access message
            return res.redirect('/?unauthorizedAccess=true');
        }
    } catch (err) {
        console.error('Error checking worker status:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
