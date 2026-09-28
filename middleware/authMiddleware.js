// Authentication Middleware
// Protects routes that require an authenticated admin session

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return next();
  }

  // API requests get JSON 401
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please login to access this resource.',
    });
  }

  // Page requests get redirected to login
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login');
};

// Redirect authenticated users away from login/register pages
const isGuest = (req, res, next) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = { isAuthenticated, isGuest };
