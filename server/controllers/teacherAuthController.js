/**
 * controllers/teacherAuthController.js
 * Teacher authentication and authorization
 */
const jwt          = require("jsonwebtoken");
const TeacherModel = require("../models/teacherModel");
const { TEACHER_JWT_SECRET } = require("../config/env");

/**
 * POST /api/teacher/login
 * Authenticate teacher with ID and password
 */
async function login(req, res, next) {
  try {
    const { teacher_id, password } = req.body;

    // 1. Basic validation
    if (!teacher_id || !password) {
      return res.status(400).json({ error: "Teacher ID and password are required" });
    }

    // 2. Find the teacher in the database
    const teacher = await TeacherModel.findById(teacher_id);
    if (!teacher) {
      return res.status(401).json({ error: "Invalid Teacher ID or password" });
    }

    // 3. Check the password using bcrypt
    const isValid = await TeacherModel.verifyPassword(teacher_id, password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid Teacher ID or password." });
    }

    // 4. Build the JWT payload - what gets stored inside the token
    const payload = {
      id:         teacher.id,
      teacher_id: teacher.teacher_id,
      full_name:  teacher.full_name,
      department: teacher.department,
      role:       "teacher",
    };

    // 5. Sign the token
    const token = jwt.sign(payload, TEACHER_JWT_SECRET, { expiresIn: "8h" });

    // 6. Send it back as an HTTP-only cookie AND in the response body
    res
    .cookie("teacher_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    })
    .json({
      message: "Login successful.",
      teacher: {
        teacher_id:   teacher.teacher_id,
        full_name:    teacher.full_name,
        department:   teacher.department,
        email:        teacher.email,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie("teacher_token", { httpOnly: true, sameSite: "Strict" })
     .json({ message: "Logged out successfully." });
}

/**
 * GET /api/teacher/profile
 * Get teacher profile information
 */
async function getProfile(req, res, next) {
  try {
    const { teacher_id } = req.teacher;
    const teacher = await TeacherModel.findById(teacher_id);

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found." });
    }

    res.json({ teacher });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/teacher/dashboard
 * Get teacher dashboard data
 */
async function getDashboard(req, res, next) {
  try {
    const { teacher_id } = req.teacher;

    const teacher = await TeacherModel.findById(teacher_id);
    const subjects = await TeacherModel.getAssignedSubjects(teacher_id);
    const students = await TeacherModel.getStudentsInClasses(teacher_id);
    const stats = await TeacherModel.getClassStatistics(teacher_id);
    const activity = await TeacherModel.getRecentActivity(teacher_id, 5);

    res.json({
      teacher,
      subjects,
      students,
      stats,
      activity,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, getProfile, getDashboard };
