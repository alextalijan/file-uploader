// Middleware for protecting routes from logged out users
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = isLoggedIn;
