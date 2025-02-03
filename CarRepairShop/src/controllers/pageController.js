
import i18n from 'i18n'; // Import i18n for internationalization

export const getHomePage = (req, res) => {
    res.render('pages/home', { nonce: res.locals.nonce, i18n: i18n,  language: req.session.language || 'en' }); // Pass nonce to EJS template
};

export const getEstimatorPage = (req, res) => {
   
    res.render('pages/Estimator', { nonce: res.locals.nonce, i18n: i18n,  language: req.session.language || 'en'}); // Pass nonce to EJS template
};

export const getAboutUsPage = (req, res) => {
    res.render('pages/AboutUs', { apiKey: process.env.GOOGLE_MAPS_API_KEY, nonce: res.locals.nonce, i18n: i18n,  language: req.session.language || 'en' }); // Pass nonce to EJS template
};

export const getLoginPage = (req, res) => {
    const expiredMessage = req.session.expiredMessage; // Retrieve the message
    req.session.expiredMessage = null; // Clear the message after use
    const csrfTokenValue = req.csrfToken;
    res.render('pages/login', { expiredMessage, nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n: i18n,  language: req.session.language || 'en' }); // Render the login page with the message
};

export const getSignUpPage = (req, res) => {
    const csrfTokenValue = req.csrfToken;
    res.render('pages/SignUp', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n: i18n,  language: req.session.language || 'en'}); // Pass nonce to EJS template
};

export const getRecoverPage = (req, res) => {
    const csrfTokenValue = req.csrfToken;
    res.render('pages/RecoverPassword', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n: i18n,  language: req.session.language || 'en' }); // Pass nonce to EJS template
};

export const getServicesPage = (req, res) => {
    const csrfTokenValue = req.csrfToken;
    res.render('pages/Services', { nonce: res.locals.nonce, i18n: i18n,  language: req.session.language || 'en'}); // Pass nonce to EJS template
};

export const getAppointmentPage = (req, res) => {
    const csrfTokenValue = req.csrfToken;
    res.render('pages/Appointment', { nonce: res.locals.nonce, csrfToken: csrfTokenValue, i18n: i18n,  language: req.session.language || 'en'}); // Pass nonce to EJS template
};

