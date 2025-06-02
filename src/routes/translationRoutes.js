import express from 'express';
import { fetchTranslation, addTranslation } from '../controllers/translationController.js';

const router = express.Router();

router.get('/get-translation/:key', fetchTranslation);
router.post('/add-dynamic-translation', addTranslation);

export default router;
