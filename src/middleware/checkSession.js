export function checkSession(req, res, next) {
  if (!req.user || req.user.instanceActive === false) {
    for (const cookieName in req.cookies) {
      res.clearCookie(cookieName);
    }
    return res.redirect('/?sessionEnded=true');
  }
  next();
}