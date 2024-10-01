import express from 'express';
import { getHomePage, getEstimatorPage, getAboutUsPage, getLoginPage, getSignUpPage } from '../controllers/pageController.js';

// routes/index.js
import authRoutes from './authRoutes.js';
import defaultRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import workerRoutes from './workerRoutes.js';



const router = express.Router();

// Route for basic pages
router.get('/', getHomePage);
router.get('/Estimator', getEstimatorPage);
router.get('/AboutUs', getAboutUsPage);
router.get('/Login', getLoginPage);
router.get('/SignUp', getSignUpPage);

// Use the route files
router.use('/auth', authRoutes);
router.use('/user', defaultRoutes);
router.use('/admin', adminRoutes);
router.use('/worker', workerRoutes);



export default router;