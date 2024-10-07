// routes/authRoutes.js
import express from 'express';
import {sanitizeInputProjects} from '../middleware/escapeHTMLproject.js';
import {sanitizeInputUsers} from '../middleware/escapeHTMLusers.js';
import {checkSession} from '../middleware/checkSession.js';
import { loginUser, handleLogout, handleSignUp, handleCreateAppointment, changePassword, getProfilePage, getUserAppointments, getUserSettings, getUserProfileInfo } from '../controllers/authController.js';



const router = express.Router();

// POST route for logging in
router.post('/login', (req, res) => {
    sanitizeInputUsers;
    loginUser(req, res);
});


// POST route for logging out a user
router.post('/log-out',checkSession, handleLogout);

router.post('/sign-up',checkSession, sanitizeInputUsers, handleSignUp);

router.post('/createAppointment',checkSession, sanitizeInputProjects, handleCreateAppointment);


router.post('/change-password',checkSession, sanitizeInputUsers, changePassword);


router.get('/ProfilePage',checkSession, getProfilePage);

router.get('/ProfileInfo',checkSession, getUserProfileInfo)

router.get('/UserAppointment',checkSession, getUserAppointments)



router.get('/Settings',checkSession, getUserSettings)

export default router;
