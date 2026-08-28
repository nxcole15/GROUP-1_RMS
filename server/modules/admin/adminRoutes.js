const express = require("express");
const router  = express.Router();

const { adminLogin, adminLogout, getAuditLog } = require("./adminAuthController");
const {
  getDashboard,
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
  reactivateStudent,
} = require("./adminController");
const { authenticateAdmin } = require("./adminMiddleware");

// ── Public admin auth ──────────────────────────────────────────────────────
router.post("/login",  adminLogin);
router.post("/logout", adminLogout);

// ── All routes below require a valid admin JWT ─────────────────────────────
router.use(authenticateAdmin);

// Dashboard & search
router.get("/dashboard",       getDashboard);
router.get("/students/search", searchStudents);
router.patch("/students/:student_id/reactivate",reactivateStudent);
router.get("/audit-log",       getAuditLog);
router.get("/teachers", getTeachers);

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

module.exports = router;
