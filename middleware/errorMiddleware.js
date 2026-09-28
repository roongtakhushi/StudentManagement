// Centralized error handling middleware

const errorHandler = (err, req, res, next) => {
  // Log error details server-side only
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = 'An unexpected error occurred';

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(statusCode).json({ success: false, message: 'Validation failed', errors });
    }
    message = Object.values(errors).join(', ');
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(statusCode).json({ success: false, message, errors: { [field]: message } });
    }
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(statusCode).json({ success: false, message });
    }
  }

  // API error response
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      message: err.message || message,
    });
  }

  // Page error response - render a simple error page
  res.status(statusCode).render('error', {
    title: 'Error',
    statusCode,
    message: statusCode === 500 ? 'Something went wrong on the server. Please try again.' : err.message || message,
    admin: req.session ? req.session.admin : null,
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
