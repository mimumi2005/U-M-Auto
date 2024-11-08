import crypto from 'crypto';
// generate CSRF token middleware
export const generateCSRFToken = (req, res, next) => {
  const csrfToken = crypto.randomBytes(16).toString('hex');
  res.cookie('_csrf', csrfToken, {
    httpOnly: true,   // The cookie cannot be accessed via JavaScript
    sameSite: 'Strict' // Set to 'Strict' or 'Lax' as per your requirement
});
  req.csrfToken = csrfToken;
  next();
}

// validate CSRF token middleware
export const validateCSRFToken = (req, res, next) => {
  const csrfToken = req.cookies._csrf;
  if (req.headers['csrf-token'] === csrfToken) {
    next();
  }
   else {
    res.status(403).send('Invalid CSRF token');
  }
}