import express from 'express';
import { requestPasswordReset, getResetPasswordPage, resetPasswordWithToken  } from '../controllers/userController.js';
import { generateCSRFToken } from '../middleware/CSRF.js'

const router = express.Router();

// Route for password reset request
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password-with-tokem/:resetToken', resetPasswordWithToken);

router.get('/ResetPassword/:resetToken', generateCSRFToken, getResetPasswordPage);

export default router;