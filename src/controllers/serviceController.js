import { sendEmail } from '../models/emailService.js';

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
