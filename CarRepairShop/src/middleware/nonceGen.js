import crypto from 'crypto';

export const generateNonce = (req, res, next) => {
  // Generate a nonce and store it in res.locals for each request
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  
  next();
};