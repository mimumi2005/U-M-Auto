export function checkSession(req, res, next) {
    if (!req.user) { // Check if the user is logged in
        // Redirect to homepage with a 'sessionEnded' query parameter
        return res.redirect('/?sessionEnded=true');
    }
    next(); // Proceed to the next middleware or route handler
}