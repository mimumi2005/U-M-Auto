// Middleware to attach user information to req.user
export function attachUser(req, res, next) {
    if (req.session && req.session.userId) {
      req.user = {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role,
        UUID: req.session.UUID
      };
    }
    next();
  }