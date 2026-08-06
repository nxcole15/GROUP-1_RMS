/**
 * modules/gradeRequests/gradeRequestRoutes.js
 */
const express = require("express");
const router  = express.Router();
const ctrl    = require("./gradeRequestController");
const { authenticateStudent } = require("../auth/authMiddleware");
const { authenticateTeacher } = require("../teacher/teacherMiddleware");
const { authenticateAdmin }   = require("../admin/adminMiddleware");

// Student routes
router.get("/student",        authenticateStudent, ctrl.studentGetRequests);
router.post("/student",       authenticateStudent, ctrl.studentSubmitRequest);

// Teacher routes
router.get("/teacher",                          authenticateTeacher, ctrl.teacherGetRequests);
router.patch("/teacher/:id/submit",             authenticateTeacher, ctrl.teacherSubmitGrade);
router.patch("/teacher/:id/release",            authenticateTeacher, ctrl.teacherReleaseGrade);

// Registrar routes
router.get("/registrar",                        authenticateAdmin, ctrl.registrarGetRequests);
router.patch("/registrar/:id/send-to-principal",authenticateAdmin, ctrl.registrarSendToPrincipal);
router.patch("/registrar/:id/release",          authenticateAdmin, ctrl.registrarReleaseToTeacher);

// Principal routes
router.get("/principal",                        authenticateAdmin, ctrl.principalGetRequests);
// Static paths MUST come before :id param routes
router.patch("/principal/open",                 authenticateAdmin, ctrl.principalOpenRequests);
router.patch("/principal/close",                authenticateAdmin, ctrl.principalCloseRequests);
router.patch("/principal/:id/approve",          authenticateAdmin, ctrl.principalApprove);
router.patch("/principal/:id/reject",           authenticateAdmin, ctrl.principalReject);

// Config routes
router.get("/config",                          ctrl.getRequestConfig);

// Staff notification routes (teacher + admin)
router.get("/staff-notifications",      authenticateTeacher, ctrl.getStaffNotifications);
router.post("/staff-notifications/read",authenticateTeacher, ctrl.markStaffNotificationsRead);
router.get("/admin-notifications",      authenticateAdmin,   ctrl.getStaffNotifications);
router.post("/admin-notifications/read",authenticateAdmin,   ctrl.markStaffNotificationsRead);

// Mark a single staff notification as read
router.post("/staff-notifications/:id/read", authenticateTeacher, async (req, res, next) => {
  try {
    const db = require("../../config/db");
    await db.query(`UPDATE staff_notifications SET is_read = 1 WHERE id = ?`, [req.params.id]);
    res.json({ message: "Marked as read." });
  } catch (err) { next(err); }
});
router.post("/admin-notifications/:id/read", authenticateAdmin, async (req, res, next) => {
  try {
    const db = require("../../config/db");
    await db.query(`UPDATE staff_notifications SET is_read = 1 WHERE id = ?`, [req.params.id]);
    res.json({ message: "Marked as read." });
  } catch (err) { next(err); }
});

module.exports = router;
