import connection from '../config/db.js'; // Importing connection
import path from 'path'; // Add this line to import the path module
import * as adminModel from '../models/adminModels.js'

export const adminDashboard = (req, res) => {
    // Render the admin dashboard or serve a file
    res.render('Admin', { nonce: res.locals.nonce }); // Pass nonce to EJS template
};
export const adminStatistics = (req, res) => {
    // Render the admin dashboard or serve a file
    res.render('Statistics', { nonce: res.locals.nonce }); // Pass nonce to EJS template
};


export const fetchAllWorkers = (req, res) => {
    adminModel.getAllWorkerIds((err, workerResults) => {
      if (err) {
        console.error('Error querying Workers table:', err);
        return res.status(500).json({ message: 'Error fetching worker data' });
      }
  
      const combinedData = [];
  
      workerResults.forEach((worker, index) => {
        const idUser = worker.idUser;
  
        adminModel.getCombinedWorkerInfo(idUser, (err, combinedResult) => {
          if (err) {
            console.error(`Error querying combined information for idUser ${idUser}:`, err);
            return;
          }
  
          combinedData.push(...combinedResult);
  
          // Send the response only after all data is fetched
          if (combinedData.length === workerResults.length) {
            res.json(combinedData);
          }
        });
      });
    });
  };

  
export const fetchAllAdmins = (req, res) => {
  adminModel.getAllAdminIds((err, adminResults) => {
    if (err) {
      console.error('Error querying Workers table:', err);
      return res.status(500).json({ message: 'Error fetching worker data' });
    }

    const combinedData = [];
    
    adminResults.forEach((admin, index) => {
      const idUser = admin.idUser;

      adminModel.getCombinedAdminInfo(idUser, (err, combinedResult) => {
        if (err) {
          console.error(`Error querying combined information for idUser ${idUser}:`, err);
          return;
        }

        combinedData.push(...combinedResult);
        // Send the response only after all data is fetched
        if (combinedData.length === adminResults.length) {
          res.json(combinedData);
        }
      });
    });
  });
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


export const fetchProjectById = (req, res) => {
  const { idProjects } = req.body;

  // Call the model function
  adminModel.getProjectById(idProjects, (err, result) => {
    if (err) {
      console.error("Error fetching project by ID:", err);
      return res.status(500).send("An error occurred while fetching the project.");
    }
    res.send(result);
  });
};

export const fetchUserById = (req, res) => {
  const { idUser } = req.body;

  // Call the model function
  adminModel.getUserById(idUser, (err, result) => {
    if (err) {
      console.error("Error fetching user by ID:", err);
      return res.status(500).send("An error occurred while fetching the user.");
    }
    res.send(result);
  });
};

export const fetchActiveUsers = (req, res) => {
  adminModel.getActiveInstances((err, instances) => {
    if (err) {
      console.error('Error fetching active instances:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    const usersInfo = [];
    let count = 0;

    // Iterate over each instance and fetch the user info based on the userId
    instances.forEach((instance) => {
      const userId = instance.idUser;

      adminModel.getUserById(userId, (err, userResult) => {
        if (err) {
          console.error('Error fetching user info:', err);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }

        usersInfo.push(userResult[0]);
        count++;

        // Send response after all user information is collected
        if (count === instances.length) {
          res.json(usersInfo);
        }
      });
    });
  });
};

// Controller function to fetch today's projects
export const fetchTodaysProjects = (req, res) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-based in JavaScript
  const currentDay = currentDate.getDate();

  console.log("Current date:", currentDate);

  adminModel.getTodaysProjects(currentYear, currentMonth, currentDay, (err, result) => {
    if (err) {
      console.error('Error fetching today\'s projects:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    res.send(result);
  });
};


// Controller function to fetch finished projects
export const fetchFinishedProjects = (req, res) => {
  const currentDate = new Date().toISOString(); // Get current ISO date string

  adminModel.getFinishedProjects(currentDate, (err, result) => {
    if (err) {
      console.error('Error fetching finished projects:', err);
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

// Controller function to remove the delayed status from a project
export const removeDelayedProject = (req, res) => {
  const { idProjects } = req.body;

  adminModel.updateProjectDelayedStatus(idProjects, (err, result) => {
    if (err) {
      console.error('Error updating project status:', err);
      return res.status(500).json({ status: 'error', message: 'Error updating project status', error: err.message });
    }

    res.json(result);
  });
};

// Controller function to remove the delayed status from a project
export const fetchAllUsers= (req, res) => {

  adminModel.getAllUsers((err, result) => {
    if (err) {
      console.error('Error updating project status:', err);
      return res.status(500).json({ status: 'error', message: 'Error updating project status', error: err.message });
    }

    res.json(result);
  });
};


// Main function to register a worker
export const registerWorker = async (req, res) => {
  const { email, workerType, isAdmin } = req.body;
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

    if (isAdmin) {
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