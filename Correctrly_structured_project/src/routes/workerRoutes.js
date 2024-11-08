// routes/userRoutes.js
import express from 'express';
import { isWorker } from '../middleware/isWorker.js';
import { workerDashboard, fetchActiveProjects, fetchTodaysProjects, fetchDelayedProjects, removeDelayedProject, fetchProjectById, changeEndDate, fetchProjectByUserId,fetchUserById, changeStatus } from '../controllers/workerController.js';
import {generateCSRFToken} from '../middleware/CSRF.js'
import {validateCSRFToken} from '../middleware/CSRF.js'
const router = express.Router();


router.get('/WorkerPage',generateCSRFToken, isWorker, workerDashboard);

// Project display
router.get('/active-projects', isWorker, fetchActiveProjects);
router.get('/todays-projects', isWorker, fetchTodaysProjects);
router.get('/delayed-projects', isWorker, fetchDelayedProjects);

//Project custom calls
router.post('/change-status',validateCSRFToken, isWorker, changeStatus);

router.post('/remove-delayed',validateCSRFToken, isWorker, removeDelayedProject);
router.post('/change-end-date',validateCSRFToken, isWorker, changeEndDate);

router.get('/project-by-ID/:id', isWorker, fetchProjectById);
router.get('/project-by-user-id/:userId', isWorker, fetchProjectByUserId);
router.get('/user-by-ID/:id', isWorker, fetchUserById);
export default router;