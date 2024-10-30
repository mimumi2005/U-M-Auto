import crypto from 'crypto';
// generate CSRF token middleware
export const generateCSRFToken = (req, res, next) => {
  const csrfToken = crypto.randomBytes(16).toString('hex');
  console.log(csrfToken)
  res.cookie('_csrf', csrfToken);
  req.csrfToken = csrfToken;
  next();
}

// validate CSRF token middleware
export const validateCSRFToken = (req, res, next) => {
  const csrfToken = req.cookies._csrf;
  console.log('CSRF Token in cookies:', csrfToken);
  console.log('\nCSRF Token in body:', req.headers['csrf-token']);
  if (req.headers['csrf-token'] === csrfToken) {
    next();
  }
   else {
    res.status(403).send('Invalid CSRF token');
  }
}