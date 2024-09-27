import express from 'express';
import { getHomePage, getEstimatorPage, getAboutUsPage, getLoginPage } from '../controllers/pageController.js';

// routes/index.js
import secureRoutes from './secureRoutes.js';
import defaultRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';



const router = express.Router();

// Route for basic pages
router.get('/', getHomePage);
router.get('/Estimator', getEstimatorPage);
router.get('/AboutUs', getAboutUsPage);
router.get('/Login', getLoginPage);

// Use the route files
router.use('/auth', secureRoutes);
router.use('/user', defaultRoutes);
router.use('/admin', adminRoutes);



export default router;