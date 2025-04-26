import * as adminModel from '../models/adminModels.js';
import i18n from 'i18n';

export const adminDashboard = (req, res) => {
  const csrfTokenValue = req.csrfToken;
  res.render('pages/Admin', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n, language: req.session.language || 'en' });
};

export const adminStatistics = (req, res) => {
  const csrfTokenValue = req.csrfToken;
  res.render('pages/Statistics', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n, language: req.session.language || 'en' });
};

// Controller function to get active projects
export const fetchActiveProjects = async (req, res) => {
  try {
    const curdate = new Date().toISOString();
    const projects = await adminModel.getActiveProjects(curdate);
    res.json(projects);
  } catch (err) {
    console.error("Error fetching active projects:", err);
    res.status(500).send("An error occurred while fetching active projects.");
  }
};

export const fetchUserById = async (req, res) => {
  try {
    const idUser = req.params.id;
    const user = await adminModel.getUserById(idUser);
    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).send("An error occurred while fetching the user.");
  }
};

export const fetchProjectById = async (req, res) => {
  try {
    const idProjects = req.params.id;
    const project = await adminModel.getProjectById(idProjects);
    res.json(project);
  } catch (err) {
    console.error("Error fetching project by ID:", err);
    res.status(500).send("An error occurred while fetching the project.");
  }
};

export const fetchTodaysProjects = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const projects = await adminModel.getTodaysProjects(currentYear, currentMonth, currentDay);
    res.json(projects);
  } catch (err) {
    console.error('Error fetching today\'s projects:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const fetchDelayedProjects = async (req, res) => {
  try {
    const projects = await adminModel.getDelayedProjects();
    res.json(projects);
  } catch (err) {
    console.error('Error fetching delayed projects:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

export const changeEndDate = async (req, res) => {
  try {
    const { EndDate, idProjects } = req.body;
    const result = await adminModel.updateProjectEndDate(EndDate, idProjects);
    res.json(result);
  } catch (err) {
    console.error('Error updating end date:', err);
    res.status(500).json({ status: 'error', message: 'Error updating end date', error: err.message });
  }
};

export const giveAdmin = async (req, res) => {
  const { idUser } = req.body;
  try {
    const checkResult = await adminModel.isUserAlreadyAdmin(idUser);
    if (checkResult.length) {
      return res.status(409).json({ status: 'error', type: '2', message: 'User already has administrator perms' });
    }

    await adminModel.insertAdmin(idUser);

    res.json({
      status: 'Success',
      message: 'Admin perms given successfully',
      idUser,
    });
  } catch (err) {
    console.error('Error giving admin:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

export const removeAdmin = async (req, res) => {
  const { idUser } = req.body;
  try {
    const checkResult = await adminModel.isUserAlreadyAdmin(idUser);
    if (!checkResult.length) {
      return res.status(409).json({ status: 'error', type: '2', message: 'User does not have administrator perms' });
    }

    await adminModel.removeAdmin(idUser);

    res.json({
      status: 'Success',
      message: 'Admin perms removed successfully',
      idUser,
    });
  } catch (err) {
    console.error('Error removing admin:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

export const deleteWorker = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await adminModel.getUserIdByEmail(email);
    const idUser = user[0].idUser;

    const checkIfValidWorker = await adminModel.isUserAlreadyWorker(idUser);
    if (!checkIfValidWorker.length) {
      return res.status(409).json({ status: 'error', type: '2', message: 'User is not a worker' });
    }

    const checkIfWorkerIsAdmin = await adminModel.isUserAlreadyAdmin(idUser);
    if (checkIfWorkerIsAdmin.length) {
      await adminModel.removeAdmin(idUser);
    }

    await adminModel.removeWorker(idUser);

    res.json({
      status: 'Success',
      message: 'Worker removed successfully',
      idUser,
    });
  } catch (err) {
    console.error('Error removing worker:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
  }
};

export const finishProject = async (req, res) => {
  try {
    const { idProjects } = req.body;
    const result = await adminModel.updateProjectDelayedStatus(idProjects);
    res.json(result);
  } catch (err) {
    console.error('Error finishing project:', err);
    res.status(500).json({ status: 'error', message: 'Error updating project status', error: err.message });
  }
};

export const fetchAllProjects = async (req, res) => {
  try {
    const projects = await adminModel.getAllProjects();
    res.json(projects);
  } catch (err) {
    console.error('Error retrieving the projects:', err);
    res.status(500).json({ status: 'error', message: 'Error retrieving the projects', error: err.message });
  }
};

export const fetchAllUsers = async (req, res) => {
  try {
    const users = await adminModel.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Error retrieving the users:', err);
    res.status(500).json({ status: 'error', message: 'Error retrieving the users', error: err.message });
  }
};

export const registerWorker = async (req, res) => {
  const { email, workerType, administrator } = req.body;
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
    const tenure = 0; // tenure initially 0

    await adminModel.insertWorker(idUser, workerType, currentDate, tenure);

    if (administrator) {
      await adminModel.insertAdmin(idUser);
    }

    res.json({
      status: 'Success',
      message: 'Worker registered successfully',
      idUser,
      workerType,
      StartWorkDate: currentDate,
      tenure,
    });
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const fetchProjectByUserId = async (req, res) => {
  try {
    const idUser = req.params.userId;
    const projects = await adminModel.getProjectsByUserId(idUser);
    res.json(projects);
  } catch (err) {
    console.error('Error fetching project by user ID:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
