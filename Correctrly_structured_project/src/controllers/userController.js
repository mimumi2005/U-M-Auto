import connection from '../config/db.js'; // Importing connection
import * as userModel from '../models/userModel.js'
// Function to check user information
export const getUserProfile =  (req, res) => {
    // Fetch user information based on the logged-in user
    const { UUID } = req.query; // Change from req.body to req.query
    console.log(UUID);

    const query = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
    connection.query(query, [UUID], (err, results) => {
      if (err) {
        console.error('Error fetching user information from the database:', err);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
  
      const User = results[0].idUser;
      console.log(User);
      const query = 'SELECT * FROM users WHERE idUser = ?';
      connection.query(query, [User], (err, results) => {
        if (err) {
          console.error('Error fetching user information from the database:', err);
          return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        const userInformation = results[0];
        res.json({ status: 'success', user: userInformation });
      });
    });
};

export const handlegetUserAppointments = async (req, res) => {
  const {UUID} = req.query;
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