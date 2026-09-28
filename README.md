# 🎓 Student Management System

A complete, full-stack **Online Student Management System** built with Node.js, Express, MongoDB, and EJS templates.

---

## 📋 Features

- 🔐 **Admin Authentication** – Register, Login, Logout with bcrypt + express-session
- 👨‍🎓 **Student CRUD** – Create, Read, Update, Delete students
- 🔍 **Search & Filter** – Search by name, ID, email, mobile; filter by course
- ✅ **Server-Side Validation** – Custom middleware validates all fields before database operations
- 📊 **Dashboard** – Stats cards, recent students, course breakdown
- 🛡️ **Security** – Helmet, bcrypt, session-based auth, env secrets, no plain-text passwords
- 🎨 **Modern Dark UI** – Professional dark-mode design with sidebar, cards, and modals
- 📱 **Responsive** – Works on mobile and desktop

---

## 🛠 Technologies Used

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Frontend | EJS templates + Vanilla CSS + JS |
| Database | MongoDB + Mongoose |
| Auth | bcrypt + express-session |
| Security | Helmet |
| Forms | method-override (PUT/DELETE) |
| Environment | dotenv |

---

## 📁 Project Structure

```
StudentManagement/
├── server.js              # Entry point
├── package.json
├── .env                   # Environment variables (NOT committed)
├── .env.example           # Environment template
├── .gitignore
│
├── config/
│   └── database.js        # MongoDB connection
│
├── models/
│   ├── Admin.js           # Admin model (with bcrypt)
│   └── Student.js         # Student model
│
├── controllers/
│   ├── authController.js  # Register, Login, Logout
│   └── studentController.js # Full CRUD + Dashboard
│
├── routes/
│   ├── authRoutes.js      # /login, /register, /logout + API
│   └── studentRoutes.js   # /students + /api/students
│
├── middleware/
│   ├── authMiddleware.js  # Session-based route protection
│   ├── validationMiddleware.js # Field-level validation
│   └── errorMiddleware.js # Centralized error handling
│
├── views/
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── students.ejs
│   ├── add-student.ejs
│   ├── edit-student.ejs
│   ├── student-details.ejs
│   └── error.ejs
│
└── public/
    ├── css/style.css      # Full dark-mode design system
    └── js/script.js       # Toast, modal, sidebar logic
```

---

## ⚙️ Installation

### Prerequisites
- Node.js >= 18.0
- MongoDB (local or MongoDB Atlas)

### Steps

```bash
# 1. Navigate to project folder
cd StudentManagement

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set your MONGODB_URI and SESSION_SECRET
```

---

## 🍃 MongoDB Setup

### Option A: Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/student_management
```
Make sure MongoDB is running: `mongod`

### Option B: MongoDB Atlas (Cloud)
1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Get your connection string
4. Set in `.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_management
```

---

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student_management
SESSION_SECRET=your_super_secret_session_key_here
NODE_ENV=development
```

**NEVER** commit `.env` to version control.

---

## 🚀 Running the Application

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

Open your browser and go to: **http://localhost:5000**

---

## 👤 First Time Setup

1. Start the server
2. Navigate to `http://localhost:5000/register`
3. Create your admin account
4. Login at `http://localhost:5000/login`
5. You'll be redirected to the Dashboard

---

## 📡 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register admin |
| POST | `/api/auth/login` | Login admin |
| POST | `/api/auth/logout` | Logout admin |

### Students (requires authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students (search, filter, paginate) |
| GET | `/api/students/:id` | Get student by ID |
| POST | `/api/students` | Create new student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Query Parameters for GET /api/students
- `search` – Search by name, ID, email, mobile
- `course` – Filter by course name
- `page` – Page number (default: 1)
- `limit` – Items per page (default: 10)

### Example Responses

**Success:**
```json
{
  "success": true,
  "message": "Student created successfully",
  "student": { "studentId": "CS2024001", "fullName": "John Doe" }
}
```

**Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "email": "Invalid email address" }
}
```

---

## ✅ Validation Rules

### Admin Registration
| Field | Rules |
|-------|-------|
| Name | Required, 2–50 chars, no numbers |
| Email | Required, valid format, unique |
| Password | Required, min 8 chars |
| Confirm Password | Must match password |

### Student Fields
| Field | Rules |
|-------|-------|
| Student ID | Required, unique |
| Full Name | Required, 2–50 chars, no numbers |
| Email | Required, valid format, unique |
| Mobile | Required, exactly 10 digits |
| Age | Required, 15–100 |
| Gender | Male / Female / Other |
| Course | Must be from predefined list |
| Year | 1–5 |
| Address | Required, max 200 chars |
| Date of Birth | Required, valid date |
| Enrollment Date | Required, valid date |

### Available Courses
- Computer Science
- Information Technology
- Electronics
- Mechanical
- Civil
- Artificial Intelligence
- Data Science

---

## 🔐 Authentication Flow

```
Register → bcrypt hash password → save Admin to MongoDB
Login    → find Admin by email → bcrypt.compare → create session
Request  → authMiddleware checks session → allow or redirect/401
Logout   → session.destroy() → redirect to login
```

---

## 🔒 Security Implementation

- Passwords hashed with **bcrypt** (cost factor 12)
- Sessions use **httpOnly**, **secure** (in production), 24h expiry
- **Helmet** sets security headers (CSP, XSS, etc.)
- `.env` file excluded from git
- Input sanitized (trimmed, lowercased) before DB operations
- No stack traces exposed to users in production

---

## 📸 Screenshots

_Add screenshots of your application here after running it._

---

## 🔮 Future Improvements

- Export student data to CSV/Excel
- Admin profile management
- Password reset via email
- Student attendance tracking
- Grade/marks management
- Role-based access control (Admin / Staff)
- Docker containerization
- API rate limiting
