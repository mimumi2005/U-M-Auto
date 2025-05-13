// routes/userRoutes.js
import express from 'express';
import { isAdmin } from '../middleware/isAdmin.js';
import {
    adminDashboard, adminStatistics,
    changeEndDate, finishProject, fetchAllUsers, registerWorker, giveAdmin, removeAdmin, deleteWorker,
    fetchActiveProjects, fetchAllProjects, fetchProjectById, fetchUserById, fetchTodaysProjects, fetchDelayedProjects, fetchProjectByUserId, 
    fetchProjectStatistics, fetchProjectStatusStatistics, fetchUserStatistics
} from '../controllers/adminController.js';
import {validateCSRFToken} from '../middleware/CSRF.js'
import {generateCSRFToken} from '../middleware/CSRF.js'
const router = express.Router();

// Routes for pages (GET requests don’t need CSRF)
router.get('/admin-dashboard',generateCSRFToken, isAdmin, adminDashboard);
router.get('/Statistics', isAdmin, adminStatistics);

// Routes for admin panel (POST requests need CSRF)
router.post('/change-end-date', isAdmin,validateCSRFToken, changeEndDate);
router.post('/remove-delayed', isAdmin, validateCSRFToken, finishProject);
router.post('/register-worker', isAdmin, validateCSRFToken, registerWorker);
router.post('/remove-worker', isAdmin, validateCSRFToken, deleteWorker);
router.post('/give-admin', isAdmin, validateCSRFToken, giveAdmin);
router.post('/remove-admin', isAdmin, validateCSRFToken, removeAdmin);

// Routes for data fetching (GET requests don’t need CSRF)
router.get('/all-projects', isAdmin, fetchAllProjects);
router.get('/active-projects', isAdmin, fetchActiveProjects);
router.get('/todays-projects', isAdmin, fetchTodaysProjects);
router.get('/delayed-projects', isAdmin, fetchDelayedProjects);
router.get('/all-users', isAdmin, fetchAllUsers);
router.get('/project-by-ID/:id', isAdmin, fetchProjectById);
router.get('/user-by-ID/:id', isAdmin, fetchUserById);
router.get('/project-by-user-id/:userId', isAdmin, fetchProjectByUserId);

router.get('/project-statistics', isAdmin, fetchProjectStatistics);
router.get('/project-status-statistics', isAdmin, fetchProjectStatusStatistics);
router.get('/user-statistics', isAdmin, fetchUserStatistics);




export default router;