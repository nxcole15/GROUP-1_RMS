/**
 * modules/gradeEditRequests/gradeEditRequestRoutes.js
 * Routes for teacher-initiated grade correction requests
 */
const express = require("express");
const router = express.Router();

const {
  teacherSubmitRequest,
  teacherGetRequests,
  teacherApplyCorrection,
  principalGetRequests,
  principalApprove,
  principalReject,
  getAuditHistory
} = require("./gradeEditRequestController");

const { authenticateTeacher } = require("../teacher/teacherMiddleware");
const { authenticateAdmin } = require("../admin/adminMiddleware");

/* ── Teacher Routes ── */
router.post(
  "/teacher/requests",
  authenticateTeacher,
  teacherSubmitRequest
);

router.get(
  "/teacher/requests",
  authenticateTeacher,
  teacherGetRequests
);

router.post(
  "/teacher/requests/:id/apply",
  authenticateTeacher,
  teacherApplyCorrection
);

/* ── Principal Routes ── */
router.get(
  "/principal/requests",
  authenticateAdmin,
  principalGetRequests
);

router.post(
  "/principal/requests/:id/approve",
  authenticateAdmin,
  principalApprove
);

router.post(
  "/principal/requests/:id/reject",
  authenticateAdmin,
  principalReject
);

router.get(
  "/principal/audit",
  authenticateAdmin,
  getAuditHistory
);

module.exports = router;
