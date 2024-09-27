export function attachUser(req, res, next) {
    if (req.session && req.session.userId) {
        req.user = {
            id: req.session.userId,
            username: req.session.username,
            role: req.session.role
        };
    } else {
        req.user = null; // Or leave it undefined
    }
    next();
}