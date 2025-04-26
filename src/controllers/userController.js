import * as userModel from '../models/userModel.js';

// Fetch user appointments by UUID
export const handlegetUserAppointments = async (req, res) => {
  const UUID = req.params.UUID;
  try {
    const projects = await userModel.getUserAppointments(UUID);
    res.json(projects);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    console.error('Error fetching projects:', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};

// Fetch all project dates for selected month/year
export const fetchAllProjectDATES = async (req, res) => {
  const MonthSelected = req.params.month;
  const YearSelected = req.params.year;

  try {
    const dates = await userModel.getProjectDates(MonthSelected, YearSelected);
    res.json(dates);
  } catch (error) {
    console.error("Error fetching project dates:", error);
    res.status(500).send("An error occurred while fetching project dates.");
  }
};
