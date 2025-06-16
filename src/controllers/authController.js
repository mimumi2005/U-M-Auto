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
    // Gets all existing users with the provided username or email
    const [userResults] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );
    // If no user found, return error
    if (userResults.length === 0) {
      return res.status(401).json({ status: '1', message: 'Invalid credentials' });
    }
    // If user found, verify the password
    const user = userResults[0];
    const isMatch = await authModel.verifyPassword(password, user.password);
    // If password does not match, return error
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
    // Set session variables
    req.session.userId = userId;
    req.session.UUID = UUID;
    // Return json with user data
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
    // Calls the model to sign up a new user
    await authModel.signupUser(name, email, username, password);
    // Automatically logs in user after successful signup
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
      // Calls the model to log out the user
      await authModel.logoutUser(UUID);
      // Clear the cookie
      res.clearCookie('userData', { path: '/' });
      // Sends success response
      res.json({ status: 'success', message: 'Logout successful!' });
    } catch (error) {
      console.error('Error logging out user:', error);
      res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  });
};

// handleCreateAppointment
export const handleCreateAppointment = async (req, res) => {
  const idUser = req.user.userId;
  const { StartDate, EndDateProjection, ProjectInfo } = req.body;
  try {
    isDateRangeAvailable = await authModel.isDateRangeAvailable(StartDate, EndDateProjection);
    // Checks if the date range is available
    if (!isDateRangeAvailable) {
      return res.status(401).json({ status: 'error', message: 'The selected date range is not available.' });
    }

    // Calls the model to create an appointment
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
    // Validates the logged in user by UUID
    const userResults = await authModel.getUserByUUID(UUID);
    if (userResults.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid UUID' });
    }
    // Checks if password exists for this user
    const loggedInUser = userResults[0].idUser;
    const passwordResults = await authModel.getPasswordByIdUser(loggedInUser);
    if (passwordResults.length === 0) {
      return res.status(401).json({ status: 'error', message: 'User not found' });
    }
    // Verifies the passwords match
    const hashedPassword = passwordResults[0].password;
    const isMatch = await authModel.verifyPassword(currentPassword, hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Incorrect current password' });
    }
    // Hashes and updates the password
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
    // Calls the model to get the projects by user UUID
    const projects = await authModel.getProjectsByUserUUID(UUID);
    // Renders the UserAppointment page with the fetched projects
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
    // Calls the model to get the user by UUID
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
    // Calls the model for updating the user's username
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
    // Calls the model for updating the user's name
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
    // Calls the model for getting the notification settings
    const settings = await notificationModel.getNotificationSettings(userId);
    // Sends the data with success status
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
    // Calls the model for updating the notification settings
    await notificationModel.updateNotificationSettings(userId, dealNotifications, appointmentReminders);
    // Sends a success response
    res.json({ status: 'success', message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const cancelAppointment = async (req, res) => {
  const { idProject } = req.params;

  try {
    // Calls the model for cancelling the appointment
    const result = await authModel.cancelAppointment(idProject);

    // Checks if the appointment was found and cancelled
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Sends a success response
    res.json({ success: true, message: 'Appointment successfully cancelled.' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};



export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    await authModel.deleteUserById(userId);

    // Destroy the session and clear the cookie
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // express-session cookie cleanup
      return res.status(200).json({
        status: 'success',
        message: 'Your account has been deleted successfully.',
      });
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};