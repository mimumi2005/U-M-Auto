export const getHomePage = (req, res) => {
    res.sendFile('home.html', { root: '../public' });
};

export const getEstimatorPage = (req, res) => {
    res.sendFile('Estimator.html', { root: '../public' });
};

export const getAboutUsPage = (req, res) => {
    res.sendFile('AboutUs.html', { root: '../public' });
};

export const getLoginPage = (req, res) => {
    res.sendFile('Login.html', { root: '../public' });
};
