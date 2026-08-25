/**
 * modules/teacher/teacherAuthController.js
 * Teacher authentication and profile operations.
 */
const jwt          = require("jsonwebtoken");
const TeacherModel = require("./teacherModel");
require("dotenv").config();
const TEACHER_JWT_SECRET = process.env.TEACHER_JWT_SECRET || process.env.JWT_SECRET || 'teacher-secret-key-change-this';

async function login(req, res, next) {
  try {
    const { teacher_id, password } = req.body;

    if (!teacher_id || !password) {
      return res.status(400).json({ error: "Teacher ID and password are required" });
    }

    const teacher = await TeacherModel.findById(teacher_id);
    if (!teacher) {
      return res.status(401).json({ error: "Invalid Teacher ID or password" });
    }

    const isValid = await TeacherModel.verifyPassword(teacher_id, password);
    if (!isValid) {
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
        teacher: {
          teacher_id: teacher.teacher_id,
          full_name:  teacher.full_name,
          department: teacher.department,
          email:      teacher.email,
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

async function getDashboard(req, res, next) {
  try {
    const { teacher_id } = req.teacher;

    const teacher  = await TeacherModel.findById(teacher_id);
    const subjects = await TeacherModel.getAssignedSubjects(teacher_id);
    const students = await TeacherModel.getStudentsInClasses(teacher_id);
    const stats    = await TeacherModel.getClassStatistics(teacher_id);
    const activity = await TeacherModel.getRecentActivity(teacher_id, 5);

    res.json({ teacher, subjects, students, stats, activity });
  } catch (err) {
    next(err);
  }
}

async function getNotifications(req, res, next) {
  try {
    const { teacher_id } = req.teacher;
    const activity = await TeacherModel.getRecentActivity(teacher_id, 10);
    const notifs = activity.map((a, i) => ({
      id: i + 1,
      type: "grade",
      title: "Grade Submitted",
      message: `${a.student_name} — ${a.subject_name}`,
      time: new Date(a.created_at).toLocaleDateString("en-PH"),
      read: false,
    }));
    res.json({ notifications: notifs });
  } catch (err) { next(err); }
}

module.exports = { login, logout, getProfile, getDashboard, getNotifications };
