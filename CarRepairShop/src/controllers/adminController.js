import connection from '../config/db.js'; // Importing connection
import path from 'path'; // Add this line to import the path module
import * as adminModel from '../models/adminModels.js'
import {generateCSRFToken} from '../middleware/CSRF.js'
import i18n from 'i18n';
export const adminDashboard = (req, res) => {
  const csrfTokenValue = req.csrfToken;
  // Render the admin dashboard or serve a file
  res.render('pages/Admin', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n: i18n,  language: req.session.language || 'en'}); // Pass nonce to EJS template
};
export const adminStatistics = (req, res) => {
  const csrfTokenValue = req.csrfToken;
  // Render the admin dashboard or serve a file
  res.render('pages/Statistics', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n: i18n,  language: req.session.language || 'en'}); // Pass nonce to EJS template
};

// Controller function to get active projects
export const fetchActiveProjects = (req, res) => {
  const curdate = new Date().toISOString();

  // Call the model function
  adminModel.getActiveProjects(curdate, (err, result) => {
    if (err) {
      console.error("Error fetching active projects:", err);
      return res.status(500).send("An error occurred while fetching active projects.");
    }
    res.send(result);
  });
};

export const fetchUserById = (req, res) => {
  const idUser = req.params.id;

  // Call the model function
  adminModel.getUserById(idUser, (err, result) => {
    if (err) {
      console.error("Error fetching user by ID:", err);
      return res.status(500).send("An error occurred while fetching the user.");
    }
    res.send(result);
  });
};

export const fetchProjectById = (req, res) => {
  const idProjects = req.params.id;

  // Call the model function
  adminModel.getProjectById(idProjects, (err, result) => {
    if (err) {
      console.error("Error fetching project by ID:", err);
      return res.status(500).send("An error occurred while fetching the project.");
    }
    res.send(result);
  });
};

// Controller function to fetch today's projects
export const fetchTodaysProjects = (req, res) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-based in JavaScript
  const currentDay = currentDate.getDate();


  adminModel.getTodaysProjects(currentYear, currentMonth, currentDay, (err, result) => {
    if (err) {
      console.error('Error fetching today\'s projects:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    res.send(result);
  });
};

export const fetchDelayedProjects = (req, res) => {
  adminModel.getDelayedProjects((err, result) => {
    if (err) {
      console.error('Error fetching delayed projects:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    res.send(result);
  });
};

// Controller function to change the end date of a project
export const changeEndDate = (req, res) => {
  const { EndDate, idProjects } = req.body;

  adminModel.updateProjectEndDate(EndDate, idProjects, (err, result) => {
    if (err) {
      console.error('Error updating end date:', err);
      return res.status(500).json({ status: 'error', message: 'Error updating end date', error: err.message });
    }

    res.json(result);
  });
};


// Controller function to give admin perms to worker
export const giveAdmin = async (req, res) => {
  const { idUser } = req.body;

  try {
    const checkResult = await adminModel.isUserAlreadyAdmin(idUser);
    if (checkResult.length) {
      return res.status(409).json({ status: 'error', type: '2', message: 'User already has administrator perms' });
    }

    // Proceed to remove
    await adminModel.insertAdmin(idUser);

    res.json({
      status: 'Success',
      message: 'Admin perms given successfully',
      idUser: idUser,
    });
  } catch (err) {
    console.error('Error giving admin:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};


// Controller function to remove admin perms
export const removeAdmin = async (req, res) => {
  const { idUser } = req.body;

  try {
    const checkResult = await adminModel.isUserAlreadyAdmin(idUser);
    if (!checkResult.length) {
      return res.status(409).json({ status: 'error', type: '2', message: 'User does not have administrator perms' });
    }

    // Proceed to remove
    await adminModel.removeAdmin(idUser);

    res.json({
      status: 'Success',
      message: 'Admin perms removed successfully',
      idUser: idUser,
    });
  } catch (err) {
    console.error('Error removing admin:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};



// Controller function to remove the delayed status from a project
export const finishProject = (req, res) => {

  const { idProjects } = req.body;

  adminModel.updateProjectDelayedStatus(idProjects, (err, result) => {
    if (err) {
      console.error('Error updating project status:', err);
      return res.status(500).json({ status: 'error', message: 'Error updating project status', error: err.message });
    }

    res.json(result);
  });
};

// Controller function to retrieve all projects
export const fetchAllProjects = (req, res) => {

  adminModel.getAllProjects((err, result) => {
    if (err) {
      console.error('Error retrieving the projects:', err);
      return res.status(500).json({ status: 'error', message: 'Error retrieving the projects', error: err.message });
    }

    res.json(result);
  });
};

// Controller function to retrieve all users
export const fetchAllUsers = (req, res) => {

  adminModel.getAllUsers((err, result) => {
    if (err) {
      console.error('Error retrieving the users:', err);
      return res.status(500).json({ status: 'error', message: 'Error retrieving the users', error: err.message });
    }

    res.json(result);
  });
};


// Main function to register a worker
export const registerWorker = async (req, res) => {

  const { email, workerType, administrator } = req.body;
  console.log("Making user:", email, "as worker");

  try {
    const userResult = await adminModel.getUserIdByEmail(email);
    if (userResult.length === 0) {
      return res.status(404).json({ type: '1', message: 'User not found' });
    }

    const idUser = userResult[0].idUser;

    const checkResult = await adminModel.isUserAlreadyWorker(idUser);
    if (checkResult.length > 0) {
      return res.status(409).json({ type: '2', message: 'User already registered as a worker' });
    }

    const currentDate = new Date().toISOString().slice(0, 10);
    const startWorkDate = new Date(currentDate);
    const tenure = new Date().getFullYear() - startWorkDate.getFullYear();

    await adminModel.insertWorker(idUser, workerType, currentDate, tenure);

    if (administrator) {
      await adminModel.insertAdmin(idUser);
      console.log('User added to Administrators table');
    }

    res.json({
      status: 'Success',
      message: 'Worker registered successfully',
      idUser: idUser,
      workerType: workerType,
      StartWorkDate: currentDate,
      tenure: tenure
    });

  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function to remove the delayed status from a project
export const fetchProjectByUserId = (req, res) => {
  const idUser = req.params.userId;

  adminModel.getProjectsByUserId(idUser, (err, result) => {
    if (err) {
      console.error('Error updating project status:', err);
      return res.status(500).json({ status: 'error', message: 'Error updating project status', error: err.message });
    }

    res.json(result);
  });
};
