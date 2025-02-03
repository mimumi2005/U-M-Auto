import express from 'express';
import { getHomePage, getEstimatorPage, getAboutUsPage, getLoginPage, getSignUpPage, getAppointmentPage,getServicesPage, getRecoverPage  } from '../controllers/pageController.js';
import {generateCSRFToken} from '../middleware/CSRF.js'
import {checkSession} from '../middleware/checkSession.js';
// routes/index.js
import authRoutes from './authRoutes.js';
import defaultRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import workerRoutes from './workerRoutes.js';



const router = express.Router();

// Route for basic pages
router.get('/', getHomePage);

// Logged user only pages
router.get('/Appointments',generateCSRFToken, checkSession, getAppointmentPage);
router.get('/Estimator',checkSession, getEstimatorPage);

router.get('/AboutUs', getAboutUsPage);
router.get('/Services', getServicesPage);
router.get('/RecoverPassword', getRecoverPage);
router.get('/Login',generateCSRFToken, getLoginPage);
router.get('/SignUp',generateCSRFToken, getSignUpPage);


// Use the route files
router.use('/auth', authRoutes);
router.use('/user', defaultRoutes);
router.use('/admin', adminRoutes);
router.use('/worker', workerRoutes);



export default router;