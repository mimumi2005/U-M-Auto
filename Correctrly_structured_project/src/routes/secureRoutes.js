// routes/authRoutes.js
import express from 'express';
import { loginUser, handleLogout, handleSignUp, handleCreateAppointment } from '../controllers/secureController.js';

const router = express.Router();

// POST route for logging in
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    loginUser(username, password, res);
});


// POST route for logging out a user
router.post('/log-out', handleLogout);

router.post('/sign-up', handleSignUp);

router.post('/createAppointment', handleCreateAppointment);

export default router;
