const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getDashboard,
  getAddStudentPage,
  getEditStudentPage,
} = require('../controllers/studentController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { validateStudent } = require('../middleware/validationMiddleware');

// ─── Page Routes ───────────────────────────────────────────────────────────────
router.get('/dashboard', isAuthenticated, getDashboard);
router.get('/students', isAuthenticated, getAllStudents);
router.get('/students/add', isAuthenticated, getAddStudentPage);
router.get('/students/:id/edit', isAuthenticated, getEditStudentPage);
router.get('/students/:id', isAuthenticated, getStudentById);

// Form Submit Routes (use method-override for PUT)
router.post('/students', isAuthenticated, validateStudent, createStudent);
router.put('/students/:id', isAuthenticated, validateStudent, updateStudent);
router.delete('/students/:id', isAuthenticated, deleteStudent);

// ─── REST API Routes ───────────────────────────────────────────────────────────
router.get('/api/students', isAuthenticated, getAllStudents);
router.get('/api/students/:id', isAuthenticated, getStudentById);
router.post('/api/students', isAuthenticated, validateStudent, createStudent);
router.put('/api/students/:id', isAuthenticated, validateStudent, updateStudent);
router.delete('/api/students/:id', isAuthenticated, deleteStudent);

module.exports = router;
