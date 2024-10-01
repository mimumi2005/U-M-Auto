// routes/userRoutes.js
import express from 'express';
import { isAdmin } from '../middleware/isAdmin.js';
import { adminDashboard, adminStatistics } from '../controllers/adminController.js';

const router = express.Router();


router.get('/admin-dashboard', isAdmin, adminDashboard);

router.get('/Statistics', isAdmin, adminStatistics);



export default router;