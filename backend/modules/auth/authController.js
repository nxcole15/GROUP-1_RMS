/**
 * modules/auth/authController.js
 */
const bcrypt       = require("bcryptjs");
const jwt          = require("jsonwebtoken");
const StudentModel = require("../student/studentModel");
const { sendPasswordResetCode } = require("../../utils/mailer");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const LOCKOUT_ATTEMPTS    = 5;
const STUDENT_LOCKOUT_MIN = 5;   // minutes
const STAFF_LOCKOUT_MIN   = 10;  // minutes (admins + teachers)

// In-memory store for reset codes: { "email:userId": { code, expiresAt, fullName } }
const resetCodes = new Map();


function logout(req, res) {
  res.clearCookie("token", { httpOnly: true, sameSite: "Strict" })
     .json({ message: "Logged out successfully." });
}

async function me(req, res, next) {
  try {
    const db = require("../../config/db");
    const studentId = req.student.student_id;
    
    // Get student info with photo from enrollment_applications
    const [rows] = await db.query(`
      SELECT 
        s.student_id,
        s.full_name,
        s.pathway,
        s.grade_level,
        s.term,
        s.email,
        ea.photo_url
      FROM students s
      LEFT JOIN enrollment_applications ea ON s.student_id = ea.generated_student_id
      WHERE s.student_id = ?
      LIMIT 1
    `, [studentId]);

    if (!rows[0]) {
      return res.status(404).json({ error: "Student not found." });
    }

    const student = rows[0];
    res.json({
      student_id:  student.student_id,
      full_name:   student.full_name,
      pathway:     student.pathway,
      grade_level: student.grade_level,
      term:        student.term,
      email:       student.email,
      photo_url:   student.photo_url,
    });
  } catch (err) { next(err); }
}

async function universalLogin(req, res, next) {
  try {
    const db     = require("../../config/db");
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ error: "ID and password are required." });
    }

    const AdminModel   = require("../admin/adminModel");
    const normalizedId = String(id).trim().toUpperCase();
    const idStr        = String(id).trim();

    // ── Helper: format lockout time remaining ─────────────────
    function minutesLeft(lockedUntil) {
      const ms = new Date(lockedUntil) - new Date();
      return Math.max(1, Math.ceil(ms / 60000));
    }

    // ── Try Admin / Super Admin ───────────────────────────────
    const adminById = await AdminModel.findByAdminId(normalizedId);
    if (adminById) {
      // Check lockout
      if (adminById.locked_until && new Date() < new Date(adminById.locked_until)) {
        return res.status(403).json({
          error: `Account locked. Try again in ${minutesLeft(adminById.locked_until)} minute(s).`,
          locked: true,
        });
      }

      if (await bcrypt.compare(password, adminById.password)) {
        // Success — reset attempts
        await db.query(
          "UPDATE admins SET failed_attempts = 0, locked_until = NULL WHERE id = ?",
          [adminById.id]
        );
        const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'admin-secret-key-change-this';
        const token = jwt.sign(
          { id: adminById.id, admin_id: adminById.admin_id, full_name: adminById.full_name, role: adminById.role },
          ADMIN_JWT_SECRET, { expiresIn: "30m" }
        );
        return res.cookie("admin_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict", maxAge: 30 * 60 * 1000 })
          .json({ message: "Login successful.", role: adminById.role, full_name: adminById.full_name, token });
      }

      // Wrong password — increment attempts
      const attempts = (adminById.failed_attempts || 0) + 1;
      const remaining = LOCKOUT_ATTEMPTS - attempts;
      if (attempts >= LOCKOUT_ATTEMPTS) {
        const lockedUntil = new Date(Date.now() + STAFF_LOCKOUT_MIN * 60 * 1000);
        await db.query(
          "UPDATE admins SET failed_attempts = ?, locked_until = ? WHERE id = ?",
          [attempts, lockedUntil.toISOString().slice(0, 19).replace("T", " "), adminById.id]
        );
        return res.status(403).json({
          error: `Too many failed attempts. Account locked for ${STAFF_LOCKOUT_MIN} minutes.`,
          locked: true,
        });
      }
      await db.query(
        "UPDATE admins SET failed_attempts = ?, locked_until = NULL WHERE id = ?",
        [attempts, adminById.id]
      );
      return res.status(401).json({
        error: `Invalid ID or password. ${remaining} attempt(s) remaining.`,
        remaining,
      });
    }

    // ── Try Teacher ───────────────────────────────────────────
    if (normalizedId.startsWith("T")) {
      const TEACHER_JWT_SECRET = process.env.TEACHER_JWT_SECRET || process.env.JWT_SECRET || 'teacher-secret-key-change-this';
      const [rows] = await db.query(
        "SELECT * FROM teachers WHERE teacher_id = ? LIMIT 1",
        [normalizedId]
      );
      const teacher = rows[0];

      if (teacher) {
        // Check lockout
        if (teacher.locked_until && new Date() < new Date(teacher.locked_until)) {
          return res.status(403).json({
            error: `Account locked. Try again in ${minutesLeft(teacher.locked_until)} minute(s).`,
            locked: true,
          });
        }

        if (await bcrypt.compare(password, teacher.password)) {
          // Success — reset attempts
          await db.query(
            "UPDATE teachers SET failed_attempts = 0, locked_until = NULL WHERE id = ?",
            [teacher.id]
          );
          const token = jwt.sign(
            { id: teacher.id, teacher_id: teacher.teacher_id, full_name: teacher.full_name, role: "teacher" },
            TEACHER_JWT_SECRET, { expiresIn: "30m" }
          );
          return res.cookie("teacher_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict", maxAge: 30 * 60 * 1000 })
            .json({ message: "Login successful.", role: "teacher", full_name: teacher.full_name, token });
        }

        // Wrong password — increment attempts
        const attempts = (teacher.failed_attempts || 0) + 1;
        const remaining = LOCKOUT_ATTEMPTS - attempts;
        if (attempts >= LOCKOUT_ATTEMPTS) {
          const lockedUntil = new Date(Date.now() + STAFF_LOCKOUT_MIN * 60 * 1000);
          await db.query(
            "UPDATE teachers SET failed_attempts = ?, locked_until = ? WHERE id = ?",
            [attempts, lockedUntil.toISOString().slice(0, 19).replace("T", " "), teacher.id]
          );
          return res.status(403).json({
            error: `Too many failed attempts. Account locked for ${STAFF_LOCKOUT_MIN} minutes.`,
            locked: true,
          });
        }
        await db.query(
          "UPDATE teachers SET failed_attempts = ?, locked_until = NULL WHERE id = ?",
          [attempts, teacher.id]
        );
        return res.status(401).json({
          error: `Invalid ID or password. ${remaining} attempt(s) remaining.`,
          remaining,
        });
      }
    }

    // ── Try Student ───────────────────────────────────────────
    if (/^\d+$/.test(idStr)) {
      const student = await StudentModel.findByStudentId(idStr);

      if (student) {
        // Check lockout
        if (student.locked_until && new Date() < new Date(student.locked_until)) {
          return res.status(403).json({
            error: `Account locked. Try again in ${minutesLeft(student.locked_until)} minute(s).`,
            locked: true,
          });
        }

        if (await bcrypt.compare(password, student.password)) {
          if (student.account_status !== "active") {
            return res.status(403).json({
              error: "Your account is not active yet. Please wait for Principal approval.",
            });
          }
          await StudentModel.resetFailedAttempts(idStr);
          const token = jwt.sign(
            { id: student.id, student_id: student.student_id, full_name: student.full_name, role: "student" },
            JWT_SECRET, { expiresIn: JWT_EXPIRES_IN }
          );
          return res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict", maxAge: 30 * 60 * 1000 })
            .json({ message: "Login successful.", role: "student", full_name: student.full_name, token });
        }

        // Wrong password — increment attempts
        const attempts = (student.failed_attempts || 0) + 1;
        const remaining = LOCKOUT_ATTEMPTS - attempts;
        if (attempts >= LOCKOUT_ATTEMPTS) {
          const lockedUntil = new Date(Date.now() + STUDENT_LOCKOUT_MIN * 60 * 1000);
          await StudentModel.updateFailedAttempts(idStr, attempts, lockedUntil.toISOString().slice(0, 19).replace("T", " "));
          return res.status(403).json({
            error: `Too many failed attempts. Account locked for ${STUDENT_LOCKOUT_MIN} minutes.`,
            locked: true,
          });
        }
        await StudentModel.updateFailedAttempts(idStr, attempts);
        return res.status(401).json({
          error: `Invalid ID or password. ${remaining} attempt(s) remaining.`,
          remaining,
        });
      }
    }

    return res.status(401).json({ error: "Invalid ID or password." });

  } catch (err) { next(err); }
}

async function getTeachers(req, res, next) {
  try {
    const db = require("../../config/db");
    
    // Get all teachers (no account_status column in teachers table)
    const [rows] = await db.query(`
      SELECT 
        id,
        teacher_id,
        full_name
      FROM teachers
      ORDER BY full_name ASC
    `);

    res.json({ teachers: rows });
  } catch (err) { 
    next(err); 
  }
}

/**
 * POST /api/auth/forgot-password
 * Body: { email, userId }
 * Verifies that the email+userId combo exists across students, teachers, admins.
 * Generates a 6-digit code, stores it in memory (15 min TTL), and emails it.
 */
async function forgotPassword(req, res, next) {
  try {
    const db = require("../../config/db");
    const AdminModel = require("../admin/adminModel");

    const { email, userId } = req.body;
    if (!email || !userId) {
      return res.status(400).json({ error: "Email and User ID are required." });
    }

    const normalizedId = String(userId).trim().toUpperCase();
    let found = null;
    let fullName = "";
    let table = "";

    // Check students
    if (/^\d+$/.test(normalizedId)) {
      const [rows] = await db.query(
        "SELECT student_id, full_name, email FROM students WHERE student_id = ? AND email = ? LIMIT 1",
        [normalizedId, email.trim()]
      );
      if (rows[0]) { found = rows[0]; fullName = rows[0].full_name; table = "students"; }
    }

    // Check teachers
    if (!found && /^T/i.test(normalizedId)) {
      const [rows] = await db.query(
        "SELECT teacher_id, full_name, email FROM teachers WHERE teacher_id = ? AND email = ? LIMIT 1",
        [normalizedId, email.trim()]
      );
      if (rows[0]) { found = rows[0]; fullName = rows[0].full_name; table = "teachers"; }
    }

    // Check admins (all other roles)
    if (!found) {
      const admin = await AdminModel.findByAdminId(normalizedId);
      if (admin && admin.email === email.trim()) {
        found = admin; fullName = admin.full_name; table = "admins";
      }
    }

    // Always respond with the same message to prevent user enumeration
    if (!found) {
      return res.json({ message: "If that account exists, a verification code has been sent." });
    }

    // Generate code and store with 15-min expiry
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `${email.trim().toLowerCase()}:${normalizedId}`;
    resetCodes.set(key, {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000,
      fullName,
      table,
      userId: normalizedId,
    });

    await sendPasswordResetCode({ to: email.trim(), fullName, code });

    return res.json({ message: "If that account exists, a verification code has been sent." });
  } catch (err) { next(err); }
}

/**
 * POST /api/auth/reset-password
 * Body: { email, userId, code, newPassword }
 * Verifies the code and updates the password in the database.
 */
async function resetPassword(req, res, next) {
  try {
    const db = require("../../config/db");

    const { email, userId, code, newPassword } = req.body;
    if (!email || !userId || !code || !newPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const normalizedId = String(userId).trim().toUpperCase();
    const key = `${email.trim().toLowerCase()}:${normalizedId}`;
    const entry = resetCodes.get(key);

    if (!entry) {
      return res.status(400).json({ error: "No reset request found. Please request a new code." });
    }
    if (Date.now() > entry.expiresAt) {
      resetCodes.delete(key);
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }
    if (entry.code !== code.trim()) {
      return res.status(400).json({ error: "Invalid verification code." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    if (entry.table === "students") {
      await db.query("UPDATE students SET password = ? WHERE student_id = ?", [hashed, normalizedId]);
    } else if (entry.table === "teachers") {
      await db.query("UPDATE teachers SET password = ? WHERE teacher_id = ?", [hashed, normalizedId]);
    } else if (entry.table === "admins") {
      await db.query("UPDATE admins SET password = ? WHERE admin_id = ?", [hashed, normalizedId]);
    }

    resetCodes.delete(key);
    return res.json({ message: "Password has been reset successfully." });
  } catch (err) { next(err); }
}

module.exports = { logout, me, universalLogin, getTeachers, forgotPassword, resetPassword };
