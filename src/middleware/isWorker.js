import { checkWorkerStatus } from '../models/workerModels.js';

export async function isWorker(req, res, next) {
    if (!req.user) {
        return res.redirect('/?sessionEnded=true');
    }

    const userId = req.user.id;

    try {
        const isWorker = await checkWorkerStatus(userId);

        if (isWorker) {
            return next();
        } else {
            return res.redirect('/?unauthorizedAccess=true');
        }
    } catch (err) {
        console.error('Error checking worker status:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
