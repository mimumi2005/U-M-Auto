// routes/userRoutes.js
import express from 'express';
import { isAdmin } from '../middleware/isAdmin.js';
import { adminDashboard } from '../controllers/adminController.js';

const router = express.Router();


router.get('/admin-dashboard', isAdmin, adminDashboard);



export default router;