const Admin = require('../models/Admin');

// ─── Register ──────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      const isApi = req.originalUrl.startsWith('/api/');
      if (isApi) {
        return res.status(409).json({
          success: false,
          message: 'Validation failed',
          errors: { email: 'Email address is already registered' },
        });
      }
      return res.render('register', {
        errors: { email: 'Email address is already registered' },
        formData: { name, email },
        title: 'Register',
      });
    }

    const admin = await Admin.create({ name: name.trim(), email: email.trim().toLowerCase(), password });

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        admin,
      });
    }

    req.session.successMessage = 'Registration successful! Please login.';
    res.redirect('/login');
  } catch (error) {
    next(error);
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!admin) {
      const isApi = req.originalUrl.startsWith('/api/');
      if (isApi) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      return res.render('login', {
        errors: { general: 'Invalid email or password' },
        formData: { email },
        title: 'Login',
      });
    }

    // bcrypt comparison using the model method
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      const isApi = req.originalUrl.startsWith('/api/');
      if (isApi) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      return res.render('login', {
        errors: { general: 'Invalid email or password' },
        formData: { email },
        title: 'Login',
      });
    }

    // Create session
    req.session.adminId = admin._id.toString();
    req.session.admin = { id: admin._id, name: admin.name, email: admin.email };

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        admin: { name: admin.name, email: admin.email },
      });
    }

    const returnTo = req.session.returnTo || '/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (error) {
    next(error);
  }
};

// ─── Logout ────────────────────────────────────────────────────────────────────
const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
    res.redirect('/login');
  });
};

module.exports = { register, login, logout };
