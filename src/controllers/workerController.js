import * as workerModel from '../models/workerModels.js';
import i18n from 'i18n';
import { sendAppointmentDateUpdateAlert,sendAppointmentStatusUpdateAlert  } from '../helpers/emailService.js';

export const workerDashboard = (req, res) => {
  const csrfTokenValue = req.csrfToken;
  res.render('pages/WorkerPage', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n, language: req.session.language || 'en' });
};

// Fetch today's projects
export const fetchTodaysProjects = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const projects = await workerModel.getTodaysProjects(currentYear, currentMonth, currentDay);
    res.json(projects);
  } catch (err) {
    console.error('Error fetching today\'s projects:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Fetch delayed projects
export const fetchDelayedProjects = async (req, res) => {
  try {
    const projects = await workerModel.getDelayedProjects();
    res.json(projects);
  } catch (err) {
    console.error('Error fetching delayed projects:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Fetch active projects
export const fetchActiveProjects = async (req, res) => {
  try {
    const curdate = new Date().toISOString();
    const projects = await workerModel.getActiveProjects(curdate);
    res.json(projects);
  } catch (err) {
    console.error("Error fetching active projects:", err);
    res.status(500).send("An error occurred while fetching active projects.");
  }
};

// Fetch project by ID
export const fetchProjectById = async (req, res) => {
  try {
    const idProjects = req.params.id;
    const project = await workerModel.getProjectById(idProjects);
    res.json(project);
  } catch (err) {
    console.error("Error fetching project by ID:", err);
    res.status(500).send("An error occurred while fetching the project.");
  }
};

// Change end date of a project
export const changeEndDate = async (req, res) => {
  try {
    const { EndDate, idProjects } = req.body;
    const appointment = await workerModel.updateProjectEndDate(EndDate, idProjects);
    const date = new Date(EndDate);
    const readableDate = date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    await sendAppointmentDateUpdateAlert(appointment[0], readableDate);
    res.json(appointment);
  } catch (err) {
    console.error('Error updating end date:', err);
    res.status(500).json({ status: 'error', message: 'Error updating end date', error: err.message });
  }
};

// Change status of a project
export const changeStatus = async (req, res) => {
  try {
    const { newStatus, idProjects } = req.body;
    const appointment = await workerModel.updateProjectStatus(newStatus, idProjects);

    await sendAppointmentStatusUpdateAlert(appointment[0], newStatus);
    res.json(appointment);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ status: 'error', message: 'Error updating status', error: err.message });
  }
};

// Remove delayed status from a project
export const removeDelayedProject = async (req, res) => {
  try {
    const { idProjects } = req.body;
    const result = await workerModel.updateProjectDelayedStatus(idProjects);
    const appointment = await workerModel.updateProjectStatus("Completed", idProjects);
    await sendAppointmentStatusUpdateAlert(appointment[0], "Completed");
    res.json(appointment);
  } catch (err) {
    console.error('Error updating project status:', err);
    res.status(500).json({ status: 'error', message: 'Error updating project status', error: err.message });
  }
};

// Fetch projects by user ID
export const fetchProjectByUserId = async (req, res) => {
  try {
    const idUser = req.params.userId;
    const projects = await workerModel.getProjectsByUserId(idUser);
    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects by user ID:', err);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Fetch user by ID
export const fetchUserById = async (req, res) => {
  try {
    const idUser = req.params.id;
    const user = await workerModel.getUserById(idUser);
    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).send("An error occurred while fetching the user.");
  }
};
