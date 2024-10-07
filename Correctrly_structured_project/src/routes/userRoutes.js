// routes/userRoutes.js
import express from 'express';
import { handlegetUserAppointments, fetchAllProjectDATES } from '../controllers/userController.js';

const router = express.Router();



router.get('/appointment', handlegetUserAppointments)

router.post('/all-project-dates', fetchAllProjectDATES );

export default router;