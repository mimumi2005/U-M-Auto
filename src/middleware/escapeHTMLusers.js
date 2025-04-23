
import { escapeHtml } from '../utils/escapeHTML.js'; // Adjust the path as necessary

// Middleware to escape HTML
export const sanitizeInputUsers = (req, res, next) => {
    if (req.body.name) {
        req.body.name = escapeHtml(req.body.name);
    }
    if (req.body.username) {
        req.body.username = escapeHtml(req.body.username);
    }
    if (req.body.email) {
        req.body.email = escapeHtml(req.body.email);
    }
    // Add more fields to sanitize if needed
    next();
};
