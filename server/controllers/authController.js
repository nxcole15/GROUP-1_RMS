/**
 * controllers/authController.js
 */
const bcrypt       = require("bcryptjs");
const jwt          = require("jsonwebtoken");
const StudentModel = require("../models/studentModel");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/env");

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
      id:          student.id,
      student_id:  student.student_id,
      full_name:   student.full_name,
      strand:      student.pathway,
      grade_level: student.grade_level,
      term:        student.term,
      role:        "student",
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
          student_id:  student.student_id,
          full_name:   student.full_name,
          strand:      student.pathway,
          grade_level: student.grade_level,
          term:        student.term,
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
      strand:      student.pathway,
      grade_level: student.grade_level,
      term:        student.term,
      email:       student.email,
    });
  } catch (err) { next(err); }
}

module.exports = { login, logout, me };
