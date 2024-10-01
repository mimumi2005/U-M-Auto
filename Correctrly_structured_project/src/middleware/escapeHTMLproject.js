
import { escapeHtml } from '../utils/escapeHTML.js'; // Adjust the path as necessary

// Middleware to escape HTML
export const sanitizeInputProjects = (req, res, next) => {
    console.log('escapingHTML1')
    if (req.body.ProjectInfo) {
        req.body.ProjectInfo = escapeHtml(req.body.ProjectInfo);
    }
    // Add more fields to sanitize if needed
    next();
};
