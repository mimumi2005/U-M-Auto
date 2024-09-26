import express from 'express';
import { getHomePage } from '../controllers/homeController.js';

// routes/index.js
import secureRoutes from './secureRoutes.js';
import defaultRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';



const router = express.Router();

// Route for home page
router.get('/', getHomePage);

// Use the route files
router.use('/auth', secureRoutes);
router.use('/user', defaultRoutes);
router.use('/admin', adminRoutes);



export default router;