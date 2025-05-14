import express from 'express';
import { handleContactForm } from '../controllers/serviceController.js';

const router = express.Router();

router.post('/sendEmail', handleContactForm);

export default router;
