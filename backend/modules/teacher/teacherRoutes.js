const express = require("express");
const router  = express.Router();


const { login, logout, getProfile, getDashboard, getNotifications }           = require("./teacherAuthController");
const { getSubjectGrades, submitGrade, getClassGradeStats }                   = require("./teacherGradesController");
const { getSubjectAttendance, updateAttendance, getClassAttendanceStats }      = require("./teacherAttendanceController");
const { authenticateTeacher }                                                  = require("./teacherMiddleware");

// Public routes (no token needed)
router.post("/login",  login);
router.post("/logout", logout);

// All routes below require a valid teacher JWT
router.use(authenticateTeacher);

// Profile & Dashboard
router.get("/profile",   getProfile);
router.get("/notifications", getNotifications);
router.get("/dashboard", getDashboard);

// Grades
router.get("/grades/:subject_id",       getSubjectGrades);
router.post("/grades",                  submitGrade);
router.get("/grades/class/:subject_id", getClassGradeStats);

// Attendance
router.get("/attendance/:subject_id",        getSubjectAttendance);
router.post("/attendance",                   updateAttendance);
router.get("/attendance/class/:subject_id",  getClassAttendanceStats);


module.exports = router;
