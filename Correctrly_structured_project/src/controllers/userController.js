import connection from '../config/db.js'; // Importing connection
import * as userModel from '../models/userModel.js'
// Function to check user information

export const handlegetUserAppointments = async (req, res) => {
  const UUID = req.params.UUID;
  try {
    // Get projects for the user UUID
    const projects = await userModel.getUserAppointments(UUID);

    // Return the projects to the client
    res.json(projects);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    console.error('Error fetching projects:', error);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Fetch all projects
export const fetchAllProjectDATES = (req, res) => {
  const MonthSelected = req.params.month;
  const YearSelected = req.params.year;

  userModel.getProjectDates(MonthSelected, YearSelected, (err, result) => {
    if (err) {
      console.error("Error fetching project dates:", err);
      return res.status(500).send("An error occurred while fetching project dates.");
    }
    
    // Send the result after the query is complete
    res.send(result);
  });
};