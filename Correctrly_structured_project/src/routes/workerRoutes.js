// routes/userRoutes.js
import express from 'express';
import { isWorker } from '../middleware/isWorker.js';
import { workerDashboard, fetchActiveProjects, fetchTodaysProjects, fetchDelayedProjects, removeDelayedProject, fetchProjectById, changeEndDate, fetchProjectByUserId,fetchUserById } from '../controllers/workerController.js';

const router = express.Router();


router.get('/WorkerPage', isWorker, workerDashboard);

// Project display
router.get('/active-projects', isWorker, fetchActiveProjects);
router.get('/todays-projects', isWorker, fetchTodaysProjects);
router.get('/delayed-projects', isWorker, fetchDelayedProjects);

//Project custom calls
router.post('/remove-delayed', isWorker, removeDelayedProject);
router.post('/project-by-ID', isWorker, fetchProjectById);
router.post('/change-end-date', isWorker, changeEndDate);
router.post('/project-by-user-id', isWorker, fetchProjectByUserId);

// User calls
router.post('/user-by-ID', isWorker, fetchUserById);
export default router;