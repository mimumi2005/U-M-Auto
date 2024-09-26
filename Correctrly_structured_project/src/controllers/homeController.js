export const getHomePage = (req, res) => {
    res.sendFile('home.html', { root: './public' });
};