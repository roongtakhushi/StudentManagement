const Student = require('../models/Student');

const VALID_COURSES = Student.schema.path('course').enumValues;

// ─── Admin Registration Validation ────────────────────────────────────────────
const validateAdminRegistration = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = {};

  // Name
  if (!name || name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.trim().length > 50) {
    errors.name = 'Name must not exceed 50 characters';
  } else if (/\d/.test(name)) {
    errors.name = 'Name must not contain numbers';
  }

  // Email
  if (!email || email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  // Password
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  // Confirm Password
  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    // Check if it's an API request
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    return res.render('register', {
      errors,
      formData: { name, email },
      title: 'Register',
    });
  }

  next();
};

// ─── Admin Login Validation ────────────────────────────────────────────────────
const validateAdminLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    return res.render('login', { errors, formData: { email }, title: 'Login' });
  }

  next();
};

// ─── Student Validation ────────────────────────────────────────────────────────
const validateStudent = async (req, res, next) => {
  const {
    studentId,
    fullName,
    email,
    mobile,
    age,
    gender,
    course,
    year,
    address,
    dateOfBirth,
    enrollmentDate,
  } = req.body;

  const errors = {};
  const isUpdate = req.method === 'PUT';
  const currentStudentId = req.params.id; // MongoDB _id for updates

  // Student ID
  if (!studentId || studentId.trim().length === 0) {
    errors.studentId = 'Student ID is required';
  } else {
    // Check uniqueness (skip own record on update)
    try {
      const Student = require('../models/Student');
      const query = { studentId: studentId.trim().toUpperCase() };
      if (isUpdate) query._id = { $ne: currentStudentId };
      const existing = await Student.findOne(query);
      if (existing) errors.studentId = 'Student ID already exists';
    } catch (e) {
      errors.studentId = 'Unable to verify Student ID uniqueness';
    }
  }

  // Full Name
  if (!fullName || fullName.trim().length === 0) {
    errors.fullName = 'Full name is required';
  } else if (fullName.trim().length < 2) {
    errors.fullName = 'Name must be at least 2 characters';
  } else if (fullName.trim().length > 50) {
    errors.fullName = 'Name must not exceed 50 characters';
  } else if (/\d/.test(fullName)) {
    errors.fullName = 'Name must not contain numbers';
  }

  // Email
  if (!email || email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  } else {
    try {
      const Student = require('../models/Student');
      const query = { email: email.trim().toLowerCase() };
      if (isUpdate) query._id = { $ne: currentStudentId };
      const existing = await Student.findOne(query);
      if (existing) errors.email = 'Email address already in use';
    } catch (e) {
      errors.email = 'Unable to verify email uniqueness';
    }
  }

  // Mobile
  if (!mobile || mobile.trim().length === 0) {
    errors.mobile = 'Mobile number is required';
  } else if (!/^\d{10}$/.test(mobile.trim())) {
    errors.mobile = 'Mobile number must be exactly 10 digits';
  }

  // Age
  const ageNum = parseInt(age, 10);
  if (!age && age !== 0) {
    errors.age = 'Age is required';
  } else if (isNaN(ageNum)) {
    errors.age = 'Age must be a number';
  } else if (ageNum < 15 || ageNum > 100) {
    errors.age = 'Age must be between 15 and 100';
  }

  // Gender
  if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
    errors.gender = 'Please select a valid gender';
  }

  // Course
  if (!course || !VALID_COURSES.includes(course)) {
    errors.course = 'Please select a valid course';
  }

  // Year
  const yearNum = parseInt(year, 10);
  if (!year) {
    errors.year = 'Year is required';
  } else if (isNaN(yearNum) || yearNum < 1 || yearNum > 5) {
    errors.year = 'Year must be between 1 and 5';
  }

  // Address
  if (!address || address.trim().length === 0) {
    errors.address = 'Address is required';
  } else if (address.trim().length > 200) {
    errors.address = 'Address must not exceed 200 characters';
  }

  // Date of Birth
  if (!dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else if (isNaN(new Date(dateOfBirth).getTime())) {
    errors.dateOfBirth = 'Please enter a valid date of birth';
  }

  // Enrollment Date
  if (!enrollmentDate) {
    errors.enrollmentDate = 'Enrollment date is required';
  } else if (isNaN(new Date(enrollmentDate).getTime())) {
    errors.enrollmentDate = 'Please enter a valid enrollment date';
  }

  if (Object.keys(errors).length > 0) {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }

    // For page requests, re-render the form with errors
    const view = isUpdate ? 'edit-student' : 'add-student';
    const renderData = {
      errors,
      formData: req.body,
      courses: VALID_COURSES,
      title: isUpdate ? 'Edit Student' : 'Add Student',
      admin: req.session.admin,
    };

    if (isUpdate) {
      renderData.student = { ...req.body, _id: currentStudentId };
    }

    return res.render(view, renderData);
  }

  next();
};

module.exports = { validateAdminRegistration, validateAdminLogin, validateStudent };
