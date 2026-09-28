const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');
const { validateAdminRegistration, validateAdminLogin } = require('../middleware/validationMiddleware');
const { isGuest, isAuthenticated } = require('../middleware/authMiddleware');

// ─── Page Routes ───────────────────────────────────────────────────────────────
router.get('/register', isGuest, (req, res) => {
  res.render('register', { title: 'Register', errors: {}, formData: {} });
});

router.get('/login', isGuest, (req, res) => {
  const successMessage = req.session.successMessage || null;
  delete req.session.successMessage;
  res.render('login', { title: 'Login', errors: {}, formData: {}, successMessage });
});

// ─── Form Submit Routes ────────────────────────────────────────────────────────
router.post('/register', isGuest, validateAdminRegistration, register);
router.post('/login', isGuest, validateAdminLogin, login);
router.post('/logout', isAuthenticated, logout);

// ─── API Routes ────────────────────────────────────────────────────────────────
router.post('/api/auth/register', validateAdminRegistration, register);
router.post('/api/auth/login', validateAdminLogin, login);
router.post('/api/auth/logout', isAuthenticated, logout);

module.exports = router;
