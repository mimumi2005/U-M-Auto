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