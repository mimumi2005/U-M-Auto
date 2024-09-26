// routes/userRoutes.js
import express from 'express';
import { getUserProfile, handlegetUserAppointments } from '../controllers/userController.js';

const router = express.Router();

// GET route for user profile
router.get('/profile', getUserProfile);

router.get('/appointment', handlegetUserAppointments)


export default router;