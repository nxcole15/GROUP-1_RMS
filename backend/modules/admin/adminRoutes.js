const express = require("express");
const router  = express.Router();

const { adminLogin, adminLogout, getAuditLog } = require("./adminAuthController");
const {
  createAdminAccount,
  listAdminAccounts,
  updateAdminAccount,
  archiveAdminAccount,
  deleteAdminAccount,
  getDashboard,
  listStudents,
  searchStudents,
  getPendingEnrollments,
  approveEnrollment,
  rejectEnrollment,
  getPendingPayments,
  verifyPayment,
  getPendingDocuments,
  approveDocument,
  rejectDocument,
  getTeachers,
  createTeacherAccount,
  updateTeacher,
  deactivateTeacher,
  reactivateTeacher,
  reactivateStudent,
  deactivateStudent,
  getGradeSubmissionConfig,
  setGradeSubmissionSchedule,
  openGradeSubmissionNow,
  closeGradeSubmissionNow,
  clearGradeSubmissionSchedule,
} = require("./adminController");
const {
  getPendingSubmissions,
  getAllSubmissions,
  getSubmissionDetails,
  approveSubmission,
  returnSubmission,
  getGradeSubmissionStats
} = require("./adminGradeReviewController");
const {
  getTeachersForScheduling,
  getTeacherSchedules,
  getTeacherScheduleDetails,
  createTeacherSchedule,
  updateTeacherSchedule,
  deleteTeacherSchedule,
  getEnrolledStudents,
  enrollStudentInSchedule,
  unenrollStudentFromSchedule,
  getScheduleStudents,
  getStudentSchedules,
  // Priority 2 Features
  getWeeklyTimetable,
  bulkEnrollStudents,
  getSchedulingStatistics
} = require("./schedulingController");
const { authenticateAdmin } = require("./adminMiddleware");

// ── Public admin auth ──────────────────────────────────────────────────────
router.post("/login",  adminLogin);
router.post("/logout", adminLogout);

// ── All routes below require a valid admin JWT ─────────────────────────────
router.use(authenticateAdmin);

router.post("/create-admin", createAdminAccount);
router.get("/admins", listAdminAccounts);
router.patch("/admins/:id", updateAdminAccount);
router.patch("/admins/:id/archive", archiveAdminAccount);
router.delete("/admins/:id", deleteAdminAccount);

// Dashboard & search
router.get("/dashboard",       getDashboard);
router.get("/students",         listStudents);
router.get("/students/search",  searchStudents);
router.patch("/students/:student_id/reactivate", reactivateStudent);
router.patch("/students/:student_id/deactivate", deactivateStudent);
router.get("/audit-log",       getAuditLog);
router.get("/teachers", getTeachers);
router.post("/teachers", createTeacherAccount);
router.patch("/teachers/:teacher_id", updateTeacher);
router.patch("/teachers/:teacher_id/deactivate", deactivateTeacher);
router.patch("/teachers/:teacher_id/reactivate", reactivateTeacher);

// Enrollments
router.get("/enrollments",               getPendingEnrollments);
router.patch("/enrollments/:id/approve", approveEnrollment);
router.patch("/enrollments/:id/reject",  rejectEnrollment);

// Payments
router.get("/payments",              getPendingPayments);
router.patch("/payments/:id/verify", verifyPayment);

// Documents
router.get("/documents",               getPendingDocuments);
router.patch("/documents/:id/approve", approveDocument);
router.patch("/documents/:id/reject",  rejectDocument);

// Grade Submission Config
router.get("/grade-submission-config", getGradeSubmissionConfig);
router.patch("/grade-submission-config/:term/schedule", setGradeSubmissionSchedule);
router.post("/grade-submission-config/:term/open", openGradeSubmissionNow);
router.post("/grade-submission-config/:term/close", closeGradeSubmissionNow);
router.delete("/grade-submission-config/:term/schedule", clearGradeSubmissionSchedule);

// Grade Submission Review (Principal)
router.get("/grade-submissions/pending", getPendingSubmissions);
router.get("/grade-submissions", getAllSubmissions);
router.get("/grade-submissions/:batch_id", getSubmissionDetails);
router.post("/grade-submissions/:batch_id/approve", approveSubmission);
router.post("/grade-submissions/:batch_id/return", returnSubmission);
router.get("/grade-submissions-stats", getGradeSubmissionStats);

// Teacher Scheduling (Registrar)
router.get("/scheduling/teachers", getTeachersForScheduling);
router.get("/scheduling/schedules", getTeacherSchedules);
router.get("/scheduling/teachers/:teacher_id/schedules", getTeacherScheduleDetails);
router.post("/scheduling/schedules", createTeacherSchedule);
router.patch("/scheduling/schedules/:schedule_id", updateTeacherSchedule);
router.delete("/scheduling/schedules/:schedule_id", deleteTeacherSchedule);

// Student Enrollment in Schedules (Registrar)
router.get("/scheduling/students", getEnrolledStudents);
router.post("/scheduling/schedules/:schedule_id/enroll", enrollStudentInSchedule);
router.delete("/scheduling/schedules/:schedule_id/students/:student_id", unenrollStudentFromSchedule);
router.get("/scheduling/schedules/:schedule_id/students", getScheduleStudents);
router.get("/scheduling/students/:student_id/schedules", getStudentSchedules);

// Priority 2 Features - Scheduling
router.get("/scheduling/timetable", getWeeklyTimetable);
router.post("/scheduling/schedules/:schedule_id/enroll-bulk", bulkEnrollStudents);
router.get("/scheduling/statistics", getSchedulingStatistics);

module.exports = router;
