// routes/userRoutes.js
import express from 'express';
import { isAdmin } from '../middleware/isAdmin.js';
import {
    adminDashboard, adminStatistics, fetchAllWorkers, fetchAllAdmins, fetchActiveProjects, fetchAllProjects,
    fetchProjectById, fetchUserById, fetchActiveUsers, fetchTodaysProjects, fetchFinishedProjects, fetchDelayedProjects, changeEndDate, removeDelayedProject, fetchAllUsers, registerWorker, fetchProjectByUserId, fetchUserByEmail,

} from '../controllers/adminController.js';
import {validateCSRFToken} from '../middleware/CSRF.js'
import {generateCSRFToken} from '../middleware/CSRF.js'
const router = express.Router();

// Routes for pages (GET requests don’t need CSRF)
router.get('/admin-dashboard',generateCSRFToken, isAdmin, adminDashboard);
router.get('/Statistics', isAdmin, adminStatistics);

// Routes for admin panel (POST requests need CSRF)
router.post('/change-end-date', isAdmin,validateCSRFToken, changeEndDate);
router.post('/remove-delayed', isAdmin, validateCSRFToken, removeDelayedProject);
router.post('/register-worker', isAdmin, validateCSRFToken, registerWorker);

// Routes for data fetching (GET requests don’t need CSRF)
router.get('/all-projects', isAdmin, fetchAllProjects);
router.get('/active-projects', isAdmin, fetchActiveProjects);
router.get('/active-users', isAdmin, fetchActiveUsers);
router.get('/todays-projects', isAdmin, fetchTodaysProjects);
router.get('/finished-projects', isAdmin, fetchFinishedProjects);
router.get('/delayed-projects', isAdmin, fetchDelayedProjects);
router.get('/all-users', isAdmin, fetchAllUsers);
router.get('/all-workers', isAdmin, fetchAllWorkers);
router.get('/all-admins', isAdmin, fetchAllAdmins);
router.get('/project-by-ID/:id', isAdmin, fetchProjectById);
router.get('/user-by-ID/:id', isAdmin, fetchUserById);
router.get('/project-by-user-id/:userId', isAdmin, fetchProjectByUserId);
router.get('/user-by-email/:email', isAdmin, fetchUserByEmail);



export default router;