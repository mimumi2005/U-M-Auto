// routes/authRoutes.js
import express from 'express';
import { loginUser, handleLogout, handleSignUp, handleCreateAppointment, makeAppointment, changePassword, profile, getUserAppointments, getUserSettings } from '../controllers/authController.js';



const router = express.Router();

// POST route for logging in
router.post('/login', (req, res) => {
    loginUser(req, res);
});


// POST route for logging out a user
router.post('/log-out', handleLogout);

router.post('/sign-up', handleSignUp);

router.post('/createAppointment', handleCreateAppointment);

// POST route for making a new appointment
router.post('/make-appointment', makeAppointment);

router.post('/change-password', changePassword);


router.get('/Profile', profile);

router.get('/UserAppointment', getUserAppointments)

router.get('/Settings', getUserSettings)

export default router;
