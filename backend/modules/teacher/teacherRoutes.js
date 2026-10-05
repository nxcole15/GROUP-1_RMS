const express = require("express");
const router  = express.Router();


const { login, logout, getProfile, getDashboard, getNotifications }           = require("./teacherAuthController");
const { getSubjectGrades, submitGrade, getClassGradeStats }                   = require("./teacherGradesController");
const { getSubjectAttendance, updateAttendance, getClassAttendanceStats }      = require("./teacherAttendanceController");
const { getSubjectStudentsWithGrades, getStudentsWithGradesForClass, saveDraftGrade, submitGradesBatch, getSubmissionStatus, getTeacherSubjectsWithStatus, getTeacherSubjectsForGrades } = require("./teacherGradeSubmissionController");
const { getTeacherSchedules, getScheduleStudents }                             = require("./teacherScheduleController");
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

// Grade Submission (Batch workflow)
// OLD routes (for backward compatibility with old subjects system)
router.get("/grade-submission/subjects",                getTeacherSubjectsWithStatus);
router.get("/grade-submission/:subject_id/students",    getSubjectStudentsWithGrades);
router.get("/grade-submission/:subject_id/status",      getSubmissionStatus);

// ✨ NEW routes (for new teacher_schedules system)
router.get("/grade-submission/subjects-new",            getTeacherSubjectsForGrades);
router.get("/grade-submission/students-for-class",      getStudentsWithGradesForClass);

// Universal routes (work with both old and new systems)
router.post("/grade-submission/save-draft",             saveDraftGrade);
router.post("/grade-submission/submit-batch",           submitGradesBatch);

// Attendance
router.get("/attendance/:subject_id",        getSubjectAttendance);
router.post("/attendance",                   updateAttendance);
router.get("/attendance/class/:subject_id",  getClassAttendanceStats);

// Teacher Schedules
router.get("/schedules",                     getTeacherSchedules);
router.get("/schedules/:schedule_id/students", getScheduleStudents);


module.exports = router;
