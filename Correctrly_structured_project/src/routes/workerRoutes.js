// routes/userRoutes.js
import express from 'express';
import { isWorker } from '../middleware/isWorker.js';
import { workerDashboard } from '../controllers/workerController.js';

const router = express.Router();


router.get('/WorkerPage', isWorker, workerDashboard);


export default router;