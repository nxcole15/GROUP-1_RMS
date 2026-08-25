/**
 * modules/auth/authController.js
 */
const bcrypt       = require("bcryptjs");
const jwt          = require("jsonwebtoken");
const StudentModel = require("../student/studentModel");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_MINUTES  = 15;

async function login(req, res, next) {
  try {
    const { student_id, password } = req.body;

    if (!student_id || !/^\d{8,12}$/.test(student_id)) {
      return res.status(400).json({ error: "Student ID must be an 8–12 digit numeric string." });
    }
    if (!password) {
      return res.status(400).json({ error: "Password is required." });
    }

    const student = await StudentModel.findByStudentId(student_id);

    // Lockout check
    if (student?.locked_until && new Date() < new Date(student.locked_until)) {
      const unlockTime = new Date(student.locked_until).toLocaleTimeString();
      return res.status(403).json({
        error: `Account locked. Try again after ${unlockTime}.`,
      });
    }

    const invalid = !student || !(await bcrypt.compare(password, student.password));
    if (invalid) {
      if (student) {
        const attempts = (student.failed_attempts || 0) + 1;
        if (attempts >= LOCKOUT_ATTEMPTS) {
          const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
          await StudentModel.updateFailedAttempts(student_id, attempts, lockedUntil.toISOString().slice(0, 19).replace("T", " "));
          return res.status(403).json({
            error: `Account locked for ${LOCKOUT_MINUTES} minutes due to too many failed attempts.`,
          });
        }
        await StudentModel.updateFailedAttempts(student_id, attempts);
      }
      return res.status(401).json({ error: "Invalid Student ID or password." });
    }

    await StudentModel.resetFailedAttempts(student_id);

    const payload = {
      id:         student.id,
      student_id: student.student_id,
      full_name:  student.full_name,
      course:     student.course,
      semester:   student.semester,
      role:       "student",
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge:   24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful.",
        student: {
          student_id: student.student_id,
          full_name:  student.full_name,
          course:     student.course,
          semester:   student.semester,
        },
        token,
      });
  } catch (err) { next(err); }
}

function logout(req, res) {
  res.clearCookie("token", { httpOnly: true, sameSite: "Strict" })
     .json({ message: "Logged out successfully." });
}

async function me(req, res, next) {
  try {
    const student = await StudentModel.findByStudentId(req.student.student_id);
    if (!student) return res.status(404).json({ error: "Student not found." });
    res.json({
      student_id:  student.student_id,
      full_name:   student.full_name,
      pathway:     student.pathway,
      grade_level: student.grade_level,
      term:        student.term,
      email:       student.email,
    });
  } catch (err) { next(err); }
}

async function universalLogin(req, res, next) {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ error: "ID and password are required." });
    }

    // ── Try Admin ──────────────────────────────────────────
    if (id.toUpperCase().startsWith("ADMIN")) {
      const AdminModel = require("../admin/adminModel");
      const admin = await AdminModel.findByAdminId(id.toUpperCase());
      if (admin && await bcrypt.compare(password, admin.password)) {
        const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'admin-secret-key';
        const token = jwt.sign(
          { id: admin.id, admin_id: admin.admin_id, full_name: admin.full_name, role: admin.role },
          ADMIN_JWT_SECRET, { expiresIn: "8h" }
        );
        return res.cookie("admin_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict", maxAge: 8 * 60 * 60 * 1000 })
          .json({ message: "Login successful.", role: admin.role, full_name: admin.full_name, token });
      }
    }

    // ── Try Teacher ────────────────────────────────────────
    if (id.toUpperCase().startsWith("T")) {
      const TEACHER_JWT_SECRET = process.env.TEACHER_JWT_SECRET || process.env.JWT_SECRET || 'teacher-secret-key';
      const db = require("../../config/db");

      const [rows] = await db.query(
        "SELECT * FROM teachers WHERE teacher_id = ? LIMIT 1",
        [id.toUpperCase()]
      );
      const teacher = rows[0];

      if (teacher && await bcrypt.compare(password, teacher.password)) {
        const token = jwt.sign(
          { id: teacher.id, teacher_id: teacher.teacher_id, full_name: teacher.full_name, department: teacher.department, role: "teacher" },
          TEACHER_JWT_SECRET, { expiresIn: "8h" }
        );
        return res.cookie("teacher_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict", maxAge: 8 * 60 * 60 * 1000 })
          .json({ message: "Login successful.", role: "teacher", full_name: teacher.full_name, token });
      }
    }

    // ── Try Student ────────────────────────────────────────
    if (/^\d+$/.test(id)) {
      const student = await StudentModel.findByStudentId(id);
      if (student?.locked_until && new Date() < new Date(student.locked_until)) {
        return res.status(403).json({ error: "Account locked. Please try again later." });
      }
      if (student && await bcrypt.compare(password, student.password)) {
        await StudentModel.resetFailedAttempts(id);
        const token = jwt.sign(
          { id: student.id, student_id: student.student_id, full_name: student.full_name, role: "student" },
          JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
        );
        return res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict", maxAge: 24 * 60 * 60 * 1000 })
          .json({ message: "Login successful.", role: "student", full_name: student.full_name, token });
      }
      if (student) {
        const attempts = (student.failed_attempts || 0) + 1;
        if (attempts >= 5) {
          const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
          await StudentModel.updateFailedAttempts(id, attempts, lockedUntil.toISOString().slice(0, 19).replace("T", " "));
        } else {
          await StudentModel.updateFailedAttempts(id, attempts);
        }
      }
    }

    return res.status(401).json({ error: "Invalid ID or password." });

  } catch (err) { next(err); }
}

module.exports = { login, logout, me, universalLogin };
