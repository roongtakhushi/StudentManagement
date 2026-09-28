const Student = require('../models/Student');
const mongoose = require('mongoose');

const VALID_COURSES = Student.schema.path('course').enumValues;

// Helper: check valid MongoDB ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── GET all students (with search & filter) ───────────────────────────────────
const getAllStudents = async (req, res, next) => {
  try {
    const { search, course, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: regex },
        { studentId: regex },
        { email: regex },
        { mobile: regex },
      ];
    }

    if (course && VALID_COURSES.includes(course)) {
      query.course = course;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [students, total] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Student.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(200).json({
        success: true,
        data: students,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages },
      });
    }

    res.render('students', {
      title: 'Students',
      students,
      courses: VALID_COURSES,
      search: search || '',
      selectedCourse: course || '',
      pagination: { total, page: parseInt(page), totalPages },
      admin: req.session.admin,
      successMessage: req.session.successMessage || null,
      errorMessage: req.session.errorMessage || null,
    });

    delete req.session.successMessage;
    delete req.session.errorMessage;
  } catch (error) {
    next(error);
  }
};

// ─── GET student by ID ─────────────────────────────────────────────────────────
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      const err = new Error('Invalid student ID format');
      err.statusCode = 400;
      return next(err);
    }

    const student = await Student.findById(id);
    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      return next(err);
    }

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(200).json({ success: true, data: student });
    }

    res.render('student-details', {
      title: `${student.fullName} - Details`,
      student,
      admin: req.session.admin,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST create student ───────────────────────────────────────────────────────
const createStudent = async (req, res, next) => {
  try {
    const {
      studentId, fullName, email, mobile, age, gender,
      course, year, address, dateOfBirth, enrollmentDate,
    } = req.body;

    const student = await Student.create({
      studentId: studentId.trim().toUpperCase(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      age: parseInt(age, 10),
      gender,
      course,
      year: parseInt(year, 10),
      address: address.trim(),
      dateOfBirth: new Date(dateOfBirth),
      enrollmentDate: new Date(enrollmentDate),
    });

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(201).json({
        success: true,
        message: 'Student created successfully',
        student,
      });
    }

    req.session.successMessage = `Student "${student.fullName}" added successfully!`;
    res.redirect('/students');
  } catch (error) {
    next(error);
  }
};

// ─── PUT update student ────────────────────────────────────────────────────────
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      const err = new Error('Invalid student ID format');
      err.statusCode = 400;
      return next(err);
    }

    const student = await Student.findById(id);
    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      return next(err);
    }

    const {
      studentId, fullName, email, mobile, age, gender,
      course, year, address, dateOfBirth, enrollmentDate,
    } = req.body;

    student.studentId = studentId.trim().toUpperCase();
    student.fullName = fullName.trim();
    student.email = email.trim().toLowerCase();
    student.mobile = mobile.trim();
    student.age = parseInt(age, 10);
    student.gender = gender;
    student.course = course;
    student.year = parseInt(year, 10);
    student.address = address.trim();
    student.dateOfBirth = new Date(dateOfBirth);
    student.enrollmentDate = new Date(enrollmentDate);

    await student.save();

    if (req.originalUrl.startsWith('/api/')) {
      return res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        student,
      });
    }

    req.session.successMessage = `Student "${student.fullName}" updated successfully!`;
    res.redirect('/students');
  } catch (error) {
    next(error);
  }
};

// ─── DELETE student ────────────────────────────────────────────────────────────
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      const err = new Error('Invalid student ID format');
      err.statusCode = 400;
      return next(err);
    }

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      message: `Student "${student.fullName}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Dashboard stats ───────────────────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const [totalStudents, recentStudents, courseStats] = await Promise.all([
      Student.countDocuments(),
      Student.find().sort({ createdAt: -1 }).limit(5),
      Student.aggregate([{ $group: { _id: '$course', count: { $sum: 1 } } }]),
    ]);

    const totalCourses = courseStats.length;

    res.render('dashboard', {
      title: 'Dashboard',
      totalStudents,
      totalCourses,
      recentStudents,
      courseStats,
      admin: req.session.admin,
      successMessage: req.session.successMessage || null,
    });

    delete req.session.successMessage;
  } catch (error) {
    next(error);
  }
};

// ─── Add/Edit student page views ───────────────────────────────────────────────
const getAddStudentPage = (req, res) => {
  res.render('add-student', {
    title: 'Add Student',
    courses: VALID_COURSES,
    errors: {},
    formData: {},
    admin: req.session.admin,
  });
};

const getEditStudentPage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      const err = new Error('Invalid student ID');
      err.statusCode = 400;
      return next(err);
    }

    const student = await Student.findById(id);
    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      return next(err);
    }

    res.render('edit-student', {
      title: 'Edit Student',
      student,
      courses: VALID_COURSES,
      errors: {},
      formData: student,
      admin: req.session.admin,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getDashboard,
  getAddStudentPage,
  getEditStudentPage,
};
