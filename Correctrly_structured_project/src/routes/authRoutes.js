// routes/authRoutes.js
import express from 'express';
import {sanitizeInputProjects} from '../middleware/escapeHTMLproject.js';
import {sanitizeInputUsers} from '../middleware/escapeHTMLusers.js';
import { loginUser, handleLogout, handleSignUp, handleCreateAppointment, changePassword, profile, getUserAppointments, getUserSettings } from '../controllers/authController.js';



const router = express.Router();

// POST route for logging in
router.post('/login', (req, res) => {
    sanitizeInputUsers;
    loginUser(req, res);
});


// POST route for logging out a user
router.post('/log-out', handleLogout);

router.post('/sign-up', sanitizeInputUsers, handleSignUp);

router.post('/createAppointment', sanitizeInputProjects, handleCreateAppointment);


router.post('/change-password', sanitizeInputUsers, changePassword);


router.get('/Profile', profile);

router.get('/UserAppointment', getUserAppointments)

router.get('/Settings', getUserSettings)

export default router;
