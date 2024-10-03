// routes/userRoutes.js
import express from 'express';
import { getUserProfile, handlegetUserAppointments, fetchAllProjectDATES } from '../controllers/userController.js';

const router = express.Router();

// GET route for user profile
router.get('/profile', getUserProfile);

router.get('/appointment', handlegetUserAppointments)

router.post('/all-project-dates', fetchAllProjectDATES );

export default router;