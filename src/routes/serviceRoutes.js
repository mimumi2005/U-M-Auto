import express from 'express';
import {
  addMissingKey,
  getUserSession,
  getAllProjectDates,
  handleContactForm
} from '../controllers/serviceController.js';

const router = express.Router();

router.post('/sendEmail', handleContactForm);
router.post('/add-missing-key', addMissingKey);
router.get('/getUserSession', getUserSession);
router.get('/all-project-dates/:month/:year', getAllProjectDates);

export default router;
