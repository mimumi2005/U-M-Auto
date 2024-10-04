// routes/userRoutes.js
import express from 'express';
import { isAdmin } from '../middleware/isAdmin.js';
import {
    adminDashboard, adminStatistics, fetchAllWorkers, fetchAllAdmins, fetchActiveProjects,
    fetchProjectById, fetchUserById, fetchActiveUsers, fetchTodaysProjects, fetchFinishedProjects, fetchDelayedProjects, changeEndDate, removeDelayedProject, fetchAllUsers, registerWorker, fetchProjectByUserId, fetchUserByEmail
} from '../controllers/adminController.js';

const router = express.Router();

// Routes for pages
router.get('/admin-dashboard', isAdmin, adminDashboard);
router.get('/Statistics', isAdmin, adminStatistics);


// Routes for admin panel
router.post('/change-end-date', isAdmin, changeEndDate);
router.post('/all-workers', isAdmin, fetchAllWorkers);
router.post('/all-admins', isAdmin, fetchAllAdmins);
router.post('/project-by-ID', isAdmin, fetchProjectById);
router.get('/active-projects', isAdmin, fetchActiveProjects);
router.post('/user-by-ID', isAdmin, fetchUserById);
router.get('/active-users', isAdmin, fetchActiveUsers);
router.get('/todays-projects', isAdmin, fetchTodaysProjects);
router.get('/finished-projects', isAdmin, fetchFinishedProjects);
router.get('/delayed-projects', isAdmin, fetchDelayedProjects);
router.post('/project-by-user-id', isAdmin, fetchProjectByUserId);
router.post('/user-by-email', isAdmin, fetchUserByEmail);

router.get('/all-users', isAdmin, fetchAllUsers);
router.post('/remove-delayed', isAdmin, removeDelayedProject);
router.post('/register-worker', isAdmin, registerWorker);


export default router;