import express from 'express';
import { fetchAllUsers } from '../controllers/usersController.js';

const router = express.Router();

router.get('/users', fetchAllUsers);

export default router