import { checkAdminStatus } from '../models/adminModels.js';

export async function isAdmin(req, res, next) {
    if (!req.user) {
        return res.redirect('/?sessionEnded=true');
    }

    const userId = req.user.id;

    try {
        const isAdmin = await checkAdminStatus(userId);

        if (isAdmin) {
            return next();
        } else {
            return res.redirect('/?unauthorizedAccess=true');
        }
    } catch (err) {
        console.error('Error checking admin status:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
