// routes/userRoutes.js
import express from 'express';
import { handlegetUserAppointments, fetchAllProjectDATES } from '../controllers/userController.js';

const router = express.Router();



router.get('/appointment:UUID', handlegetUserAppointments)

router.get('/all-project-dates/:month/:year', fetchAllProjectDATES);

export default router;