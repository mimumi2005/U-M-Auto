import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';
import * as authModel from '../models/authModels.js';
import * as notificationModel from '../models/notificationModels.js';
import i18n from 'i18n';

// Page Rendering
export const getProfilePage = (req, res) => {
  const csrfTokenValue = req.csrfToken;
  res.render('pages/Profile', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n, language: req.session.language || 'en' });
};

// Get user profile info
export const getUserProfileInfo = async (req, res) => {
  const UUID = req.user.UUID;
  try {
    const [userInstanceResults] = await pool.query('SELECT idUser FROM user_instance WHERE idInstance = ?', [UUID]);
    if (userInstanceResults.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const User = userInstanceResults[0].idUser;
    const [userResults] = await pool.query('SELECT * FROM users WHERE idUser = ?', [User]);
    if (userResults.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const userInformation = userResults[0];
    res.json({ status: 'success', user: userInformation });
  } catch (err) {
    console.error('Error fetching user information:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// loginUser
export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const UUID = uuidv4();

  try {
    const [userResults] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    if (userResults.length === 0) {
      return res.status(401).json({ status: '1', message: 'Invalid credentials' });
    }

    const user = userResults[0];
    const isMatch = await authModel.verifyPassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ status: '2', message: 'Wrong password' });
    }

    const userId = user.idUser;

    // Reset existing instance
    await pool.query('DELETE FROM user_instance WHERE idUser = ?', [userId]);

    // Insert new instance
    await pool.query(
      'INSERT INTO user_instance (idInstance, idUser, instanceStart) VALUES (?, ?, ?)',
      [UUID, userId, new Date()]
    );

    req.session.userId = userId;
    req.session.UUID = UUID;

    res.json({
      status: 'success',
      message: 'Login successful!',
      data: {
        userId,
        username: user.username,
        UUID
      }
    });
  } catch (err) {
    console.error('Error during login process:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// handleSignUp
export const handleSignUp = async (req, res) => {
  const { name, email, username, password } = req.body;
  try {
    await authModel.signupUser(name, email, username, password);
    await loginUser(req, res);
  } catch (error) {
    if (error.message === 'Email is already taken') {
      return res.status(409).json({ status: 'error', message: 'Email is already taken' });
    }
    if (error.message === 'Username is already taken') {
      return res.status(409).json({ status: 'error', message: 'Username is already taken' });
    }
    console.error('Error during signup process:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// handleLogout
export const handleLogout = (req, res) => {
  const UUID = req.user.UUID;
  req.session.destroy(async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    try {
      await authModel.logoutUser(UUID);
      res.clearCookie('userData', { path: '/' });
      res.json({ status: 'success', message: 'Logout successful!' });
    } catch (error) {
      console.error('Error logging out user:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  });
};

// handleCreateAppointment
export const handleCreateAppointment = async (req, res) => {
  const { idUser, StartDate, EndDateProjection, ProjectInfo } = req.body;
  try {
    await authModel.createAppointment(idUser, StartDate, EndDateProjection, ProjectInfo);
    res.status(201).json({ status: 'success', message: "Project registered successfully!" });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// changePassword
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const UUID = req.user.UUID;
  try {
    const userResults = await authModel.getUserByUUID(UUID);
    if (userResults.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid UUID' });
    }
    const loggedInUser = userResults[0].idUser;
    const passwordResults = await authModel.getPasswordByIdUser(loggedInUser);
    if (passwordResults.length === 0) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }

    const hashedPassword = passwordResults[0].password;
    const isMatch = await authModel.verifyPassword(currentPassword, hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Incorrect current password' });
    }

    const hashedNewPassword = await authModel.hashPassword(newPassword);
    await authModel.updatePassword(loggedInUser, hashedNewPassword);

    res.json({ status: 'success', message: 'Password updated successfully!' });
  } catch (error) {
    console.error('Error during password change process:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// getUserAppointmentsPage
export const getUserAppointments = async (req, res) => {
  const csrfTokenValue = req.csrfToken;
  const UUID = req.user.UUID;
  try {
    const projects = await authModel.getProjectsByUserUUID(UUID);
    res.render('pages/UserAppointment', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n, projects, language: req.session.language || 'en' });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// getUserSettings
export const getUserSettingsPage = (req, res) => {
  const csrfTokenValue = req.csrfToken;
  res.render('pages/Notif_settings', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n, language: req.session.language || 'en' });
};

// handleGetUserByUUID
export const handleGetUserByUUID = async (req, res) => {
  const UUID = req.user.UUID;
  try {
    const idUser = await authModel.getUserByUUID(UUID);
    res.json({ status: 'success', idUser: idUser[0].idUser });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// updateUsername
export const updateUsername = async (req, res) => {
  try {
    const userId = req.user.id;
    const newUsername = req.body.username;
    await authModel.updateUsername(userId, newUsername);
    res.json({ success: true, message: 'Username updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update username.' });
  }
};

// updateName
export const updateName = async (req, res) => {
  try {
    const userId = req.user.id;
    const newName = req.body.name;
    await authModel.updateName(userId, newName);
    res.json({ success: true, message: 'Name updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update name.' });
  }
};

// Notification settings
export const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await notificationModel.getNotificationSettings(userId);
    res.json({ status: 'success', settings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dealNotifications, appointmentReminders } = req.body;
    await notificationModel.updateNotificationSettings(userId, dealNotifications, appointmentReminders);
    res.json({ status: 'success', message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const cancelAppointment = async (req, res) => {
  const { idProject } = req.params;

  try {
    const result = await authModel.cancelAppointment(idProject);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.json({ success: true, message: 'Appointment successfully cancelled.' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
