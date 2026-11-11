/**
 * modules/student/applicationRoutes.js
 *
 * Public:
 *   POST   /api/applications          — student submits enrollment form
 *
 * Admin (registrar / principal):
 *   GET    /api/applications          — list all applications
 *   GET    /api/applications/principal — list for principal
 *   PATCH  /api/applications/:id/forward  — registrar forwards to principal
 *   PATCH  /api/applications/:id/approve  — principal approves + creates account + sends email
 *   PATCH  /api/applications/:id/reject   — reject application
 */
const express = require("express");
const router  = express.Router();
const {
  submitApplication,
  listApplications,
  getApplicationDetail,
  forwardToPrincipal,
  listForPrincipal,
  approveApplication,
  confirmStudentId,
  rejectApplication,
  checkEnrollmentStatus,
  markAsPending,
} = require("./applicationController");
const { authenticateAdmin } = require("../admin/adminMiddleware");
const { upload } = require("../../config/cloudinary");

// ── Public ────────────────────────────────────────────────────
router.get("/enrollment/status", checkEnrollmentStatus); // ✅ Check enrollment status (no auth required)
router.post("/", upload.single("idPhoto"), submitApplication);

// ── Admin-protected ───────────────────────────────────────────
router.use(authenticateAdmin);

router.get("/",                         listApplications);
router.get("/principal",                listForPrincipal);
router.get("/:id",                      getApplicationDetail);
router.patch("/:id/forward",            forwardToPrincipal);
router.patch("/:id/approve",            approveApplication);
router.patch("/:id/pending",            markAsPending);
router.patch("/:id/confirm-student-id", confirmStudentId);
router.patch("/:id/reject",             rejectApplication);

module.exports = router;
