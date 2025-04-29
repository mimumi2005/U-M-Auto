// routes/authRoutes.js
import express from 'express';
import {sanitizeInputProjects} from '../middleware/escapeHTMLproject.js';
import {sanitizeInputUsers} from '../middleware/escapeHTMLusers.js';
import {checkSession} from '../middleware/checkSession.js';
import {verifyRecaptcha} from '../middleware/verifyRecaptcha.js';
import { updateNotificationSettings, getNotificationSettings, handleGetUserByUUID, loginUser, handleLogout, handleSignUp, handleCreateAppointment, changePassword, getProfilePage, getUserAppointments, getUserSettings, getUserProfileInfo, updateUsername, updateName } from '../controllers/authController.js';
import {generateCSRFToken} from '../middleware/CSRF.js'
import {validateCSRFToken} from '../middleware/CSRF.js'

const router = express.Router();

// POST route for logging in
router.post('/login', (req, res) => {
    sanitizeInputUsers;
    validateCSRFToken;
    loginUser(req, res);
});

router.get('/notification-settings', checkSession, getNotificationSettings);

router.post('/update-notification-settings', checkSession, validateCSRFToken, updateNotificationSettings);
router.post('/sign-up', verifyRecaptcha,validateCSRFToken, sanitizeInputUsers, handleSignUp);
router.post('/createAppointment',checkSession,validateCSRFToken, sanitizeInputProjects, handleCreateAppointment);
router.post('/change-password',checkSession,validateCSRFToken, sanitizeInputUsers, changePassword);
router.post('/update-username',checkSession,validateCSRFToken, sanitizeInputUsers, updateUsername);
router.post('/update-name',checkSession,validateCSRFToken, sanitizeInputUsers,updateName);

router.get('/userID/:UUID',checkSession, handleGetUserByUUID);
router.get('/log-out',checkSession,generateCSRFToken, handleLogout);
router.get('/ProfilePage',checkSession,generateCSRFToken, getProfilePage);
router.get('/ProfileInfo',checkSession, getUserProfileInfo)
router.get('/UserAppointment',checkSession, generateCSRFToken, getUserAppointments)

router.get('/Settings',checkSession, generateCSRFToken, getUserSettings)

export default router;
