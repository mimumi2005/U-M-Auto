import express from 'express';
import { getHomePage, getEstimatorPage, getAboutUsPage, getLoginPage, getSignUpPage, getAppointmentPage,getServicesPage, getRecoverPage, goodbyePage  } from '../controllers/pageController.js';

import {generateCSRFToken} from '../middleware/CSRF.js'
import {checkSession} from '../middleware/checkSession.js';
// routes/index.js
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import workerRoutes from './workerRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import translationRoutes from './translationRoutes.js';

const router = express.Router();

// Route for basic pages
router.get('/', getHomePage);
router.get('/goodbye', goodbyePage);

// Logged user only pages
router.get('/Appointments',generateCSRFToken, checkSession, getAppointmentPage);
router.get('/Estimator',checkSession, getEstimatorPage);

// The rest of the pages
router.get('/AboutUs', getAboutUsPage);
router.get('/Services', getServicesPage);
router.get('/RecoverPassword', getRecoverPage);
router.get('/Login', generateCSRFToken, getLoginPage);
router.get('/SignUp', generateCSRFToken, getSignUpPage);




// Use the route files
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/worker', workerRoutes);
router.use('/translation', translationRoutes);
router.use("/api", serviceRoutes);

export default router;