import { sendEmail } from '../helpers/emailService.js';
import i18n from 'i18n'; // Import i18n for internationalization
import { verifyResetToken } from '../models/authModels.js';
import * as authModel from '../models/authModels.js';
import crypto from 'crypto';

// Generate password reset token and email it
export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    // Check if user exists
    const [users] = await authModel.getUserByEmail(email);
    if (users == null) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Save the token in the database with an expiration date (e.g., 1 hour)
    const expires = new Date(Date.now() + 3600000); // 1 hour from now
    await authModel.SetNewResetToken(email, expires, resetToken);

    // Compose the reset link
    const resetLink = `${process.env.BASE_URL}/user/ResetPassword/${resetToken}`;

    const text = `Hello,

    Click this link to reset your password:
    ${resetLink}

    This link expires in 1 hour.`;

    const html = `
    <p>Hello,</p>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetLink}" style="color:#007BFF;">Reset Password</a></p>
    <p style="font-size:0.9em;color:#666;">This link expires in 1 hour.</p>
    `;
    await sendEmail(email, 'Password Reset Request', text, html);

    res.json({ message: 'Reset email sent' });

};

// Reset password using the token
export const resetPasswordWithToken = async (req, res) => {
    const { token, newPassword } = req.body;

    // Validate the token again and update the password
    const users = await verifyResetToken(token);
    if (users.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }
    // Hash new password
    const hashedPassword = await authModel.hashPassword(newPassword);
    // Update password and remove reset token
    await authModel.updatePasswordWithToken(users[0].idUser, hashedPassword);
    res.json({ message: 'Password reset successfully' });
};

// Get the reset password page
export const getResetPasswordPage = async (req, res) => {
    const token = req.params.resetToken;
    const csrfTokenValue = req.csrfToken;
    // Find the user with this token and make sure it hasn't expired
    const users = await verifyResetToken(token);
    if (users.length === 0) {
        return res.render('pages/home', { nonce: res.locals.nonce, i18n: i18n, language: req.session.language || 'en' });
    }

    res.render('pages/ChangePassword', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n: i18n, language: req.session.language || 'en', token: token });
};

