/**
 * routes/teacherRoutes.js
 */
const express = require("express");
const router  = express.Router();

const { login, logout, getProfile, getDashboard } = require("../controllers/teacherAuthController");
const { getSubjectGrades, submitGrade, getClassGradeStats } = require("../controllers/teacherGradesController");
const { getSubjectAttendance, updateAttendance, getClassAttendanceStats } = require("../controllers/teacherAttendanceController");
const { authenticateTeacher } = require("../middleware/teacherMiddleware");

// ── Public ──────────────────────────────────────────────────────────────────
router.post("/login",  login);
router.post("/logout", logout);

// ── All routes below require a valid teacher JWT ─────────────────────────────
router.use(authenticateTeacher);

router.get("/me",        getProfile);
router.get("/dashboard", getDashboard);

// Grades
router.get("/grades/:subject_id",       getSubjectGrades);
router.get("/grades/stats/:subject_id", getClassGradeStats);
router.post("/grades",                  submitGrade);

// Attendance
router.get("/attendance/:subject_id",       getSubjectAttendance);
router.get("/attendance/stats/:subject_id", getClassAttendanceStats);
router.post("/attendance",                  updateAttendance);

module.exports = router;
