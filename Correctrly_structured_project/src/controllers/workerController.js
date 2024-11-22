import connection from '../config/db.js'; // Importing connection
import path from 'path'; // Add this line to import the path module
import * as workerModel from '../models/workerModels.js'
import i18n from 'i18n';

export const workerDashboard = (req, res) => {
    // Generate a CSRF token when rendering the page

    const csrfTokenValue = req.csrfToken;
    res.render('pages/WorkerPage', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n: i18n,  language: req.session.language || 'en'}); // Pass nonce to EJS template
};

// Controller function to fetch today's projects
export const fetchTodaysProjects = (req, res) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based in JavaScript
    const currentDay = currentDate.getDate();
  
    console.log("Current date:", currentDate);
  
    workerModel.getTodaysProjects(currentYear, currentMonth, currentDay, (err, result) => {
      if (err) {
        console.error('Error fetching today\'s projects:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }
      console.log(result);
      res.send(result);
    });
  };

  export const fetchDelayedProjects = (req, res) => {
    workerModel.getDelayedProjects((err, result) => {
      if (err) {
        console.error('Error fetching delayed projects:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }
  
      res.send(result);
    });
  };
  

  // Controller function to get active projects
export const fetchActiveProjects = (req, res) => {
    const curdate = new Date().toISOString();
    
    // Call the model function
    workerModel.getActiveProjects(curdate, (err, result) => {
      if (err) {
        console.error("Error fetching active projects:", err);
        return res.status(500).send("An error occurred while fetching active projects.");
      }
      res.send(result);
    });
  };

  export const fetchProjectById = (req, res) => {
    const idProjects  = req.params.id;
  
    // Call the model function
    workerModel.getProjectById(idProjects, (err, result) => {
      if (err) {
        console.error("Error fetching project by ID:", err);
        return res.status(500).send("An error occurred while fetching the project.");
      }
      res.send(result);
    });
  };

  
// Controller function to change the end date of a project
export const changeEndDate = (req, res) => {
 
    const { EndDate, idProjects } = req.body;
  
    workerModel.updateProjectEndDate(EndDate, idProjects, (err, result) => {
      if (err) {
        console.error('Error updating end date:', err);
        return res.status(500).json({ status: 'error', message: 'Error updating end date', error: err.message });
      }
  
      res.json(result);
    });
  };

  // Controller function to change the status of the project
export const changeStatus = (req, res) => {
 
  const  {newStatus, idProjects} = req.body;

  workerModel.updateProjectStatus(newStatus, idProjects, (err, result) => {
    if (err) {
      console.error('Error updating status:', err);
      return res.status(500).json({ status: 'error', message: 'Error updating status', error: err.message });
    }

    res.json(result);
  });
};


  // Controller function to remove the delayed status from a project
export const removeDelayedProject = (req, res) => {
 
    const { idProjects } = req.body;
  
    workerModel.updateProjectDelayedStatus(idProjects, (err, result) => {
      if (err) {
        console.error('Error updating project status:', err);
        return res.status(500).json({ status: 'error', message: 'Error updating project status', error: err.message });
      }
  
      res.json(result);
    });
  };
  
  // Controller function to remove the delayed status from a project
  export const fetchProjectByUserId = (req, res) => {
    const  idUser  = req.params.userId;
  
    workerModel.getProjectsByUserId(idUser, (err, result) => {
      if (err) {
        console.error('Error updating project status:', err);
        return res.status(500).json({ status: 'error', message: 'Error updating project status', error: err.message });
      }
  
      res.json(result);
    });
  };
  
  export const fetchUserById = (req, res) => {
    const  idUser  = req.params.id;
  
    // Call the model function
    workerModel.getUserById(idUser, (err, result) => {
      if (err) {
        console.error("Error fetching user by ID:", err);
        return res.status(500).send("An error occurred while fetching the user.");
      }
      res.send(result);
    });
  };