// routes/authRoutes.js
import express from 'express';
import {sanitizeInputProjects} from '../middleware/escapeHTMLproject.js';
import {sanitizeInputUsers} from '../middleware/escapeHTMLusers.js';
import {checkSession} from '../middleware/checkSession.js';
import {verifyRecaptcha} from '../middleware/verifyRecaptcha.js';
import { 
    loginUser, updateNotificationSettings, handleLogout, handleSignUp, handleCreateAppointment, changePassword, updateUsername, updateName, cancelAppointment,
    getProfilePage, getUserSettingsPage,
    getNotificationSettings, handleGetUserByUUID, getUserAppointments, getUserProfileInfo
} from '../controllers/authController.js';
import {generateCSRFToken} from '../middleware/CSRF.js'
import {validateCSRFToken} from '../middleware/CSRF.js'

const router = express.Router();

// POST route for logging in
router.post('/login', (req, res) => {
    sanitizeInputUsers;
    validateCSRFToken;
    loginUser(req, res);
});

router.post('/update-notification-settings', checkSession, validateCSRFToken, updateNotificationSettings);
router.post('/sign-up', verifyRecaptcha, validateCSRFToken, sanitizeInputUsers, handleSignUp);
router.post('/createAppointment',checkSession,validateCSRFToken, sanitizeInputProjects, handleCreateAppointment);
router.post('/change-password',checkSession,validateCSRFToken, sanitizeInputUsers, changePassword);
router.post('/update-username',checkSession,validateCSRFToken, sanitizeInputUsers, updateUsername);
router.post('/update-name',checkSession,validateCSRFToken, sanitizeInputUsers,updateName);

router.patch('/cancel-appointment/:idProject', checkSession, validateCSRFToken, cancelAppointment);

router.get('/userID',checkSession, handleGetUserByUUID);
router.get('/log-out',checkSession,generateCSRFToken, handleLogout);
router.get('/ProfilePage',checkSession,generateCSRFToken, getProfilePage);
router.get('/ProfileInfo',checkSession, getUserProfileInfo)
router.get('/UserAppointment',checkSession, generateCSRFToken, getUserAppointments)

router.get('/Settings',checkSession, generateCSRFToken, getUserSettingsPage)
router.get('/notification-settings', checkSession, getNotificationSettings);

export default router;
