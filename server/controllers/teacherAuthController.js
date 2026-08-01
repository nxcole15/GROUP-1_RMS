/**
 * controllers/teacherAuthController.js
 */
const jwt          = require("jsonwebtoken");
const TeacherModel = require("../models/teacherModel");
const ConfigModel  = require("../models/configModel");
const { TEACHER_JWT_SECRET } = require("../config/env");

/**
 * POST /api/teacher/login
 */
async function login(req, res, next) {
  try {
    const { teacher_id, password } = req.body;
    if (!teacher_id || !password) {
      return res.status(400).json({ error: "Teacher ID and password are required." });
    }

    const teacher = await TeacherModel.findByTeacherId(teacher_id);
    if (!teacher) {
      return res.status(401).json({ error: "Invalid Teacher ID or password." });
    }

    const valid = await TeacherModel.verifyPassword(teacher_id, password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid Teacher ID or password." });
    }

    const payload = {
      id:         teacher.id,
      teacher_id: teacher.teacher_id,
      full_name:  teacher.full_name,
      department: teacher.department,
      role:       "teacher",
    };
    const token = jwt.sign(payload, TEACHER_JWT_SECRET, { expiresIn: "8h" });

    res
      .cookie("teacher_token", token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge:   8 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful.",
        teacher: { teacher_id: teacher.teacher_id, full_name: teacher.full_name, department: teacher.department },
        token,
      });
  } catch (err) { next(err); }
}

/**
 * POST /api/teacher/logout
 */
function logout(req, res) {
  res.clearCookie("teacher_token", { httpOnly: true, sameSite: "Strict" })
     .json({ message: "Logged out successfully." });
}

/**
 * GET /api/teacher/me
 */
async function getProfile(req, res, next) {
  try {
    const teacher = await TeacherModel.findByTeacherId(req.teacher.teacher_id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found." });
    res.json({ teacher });
  } catch (err) { next(err); }
}

/**
 * GET /api/teacher/dashboard
 */
async function getDashboard(req, res, next) {
  try {
    const { teacher_id } = req.teacher;
    const config   = await ConfigModel.getEnrollmentConfig();
    const teacher  = await TeacherModel.findByTeacherId(teacher_id);
    const subjects = await TeacherModel.getAssignedSubjects(teacher_id);
    const students = await TeacherModel.getStudentsInClasses(teacher_id);
    const stats    = await TeacherModel.getClassStatistics(teacher_id);
    const activity = await TeacherModel.getRecentActivity(teacher_id, 5);

    res.json({ teacher, subjects, students, stats, activity, active_term: config.active_term });
  } catch (err) { next(err); }
}

module.exports = { login, logout, getProfile, getDashboard };
