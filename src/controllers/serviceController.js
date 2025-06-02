import { sendEmail } from '../helpers/emailService.js';
import i18n from 'i18n';
import * as serviceModel from '../models/serviceModels.js';

// Send contact form email
export const handleContactForm = async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const subject = `New Contact Form Message from ${name}`;
    const text = `
        You received a new message from your website contact form:

        Name: ${name}
        Email: ${email}

        Message:
        ${message}
        `;
    try {
        await sendEmail('umautodarbnica+customers@inbox.lv', subject, text);
        res.json({ message: 'Message sent successfully.' });
    } catch (err) {
        console.error('Error sending contact form email:', err);
        res.status(500).json({ message: 'Failed to send message.' });
    }
};

// Add missing key
export const addMissingKey = (req, res) => {
  const { key } = req.body;
  i18n.__({ phrase: key, locale: req.session.language });
  res.sendStatus(200);
};

// Get user session info
export const getUserSession = (req, res) => {
  if (req.user) {
    res.json({
      isLoggedIn: true,
      userId: req.user.id,
      username: req.user.username,
      UUID: req.user.UUID,
      isAdmin: req.user.isAdmin,
      isWorker: req.user.isWorker
    });
  } else {
    res.json({ isLoggedIn: false });
  }
};

// Get all project dates
export const getAllProjectDates = async (req, res) => {
  const { month, year } = req.params;

  try {
    const results = await serviceModel.getProjectDates(month, year);
    res.json(results);
  } catch (error) {
    console.error("Error fetching project dates:", error);
    res.status(500).send("An error occurred while fetching project dates.");
  }
};