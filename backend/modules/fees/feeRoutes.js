/**
 * modules/fees/feeRoutes.js
 * Fee management routes for Accounting
 */
const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../admin/adminMiddleware");
const {
  getAllFeeItems,
  createFeeItem,
  updateFeeItem,
  archiveFeeItem,
  deleteFeeItem,
  getStudentsWithFees,
  getStudentAssessment,
  assignFees,
  bulkAssignFees,
  deleteAssessment
} = require("./feeController");

// All routes require admin authentication (accounting role)
router.use(authenticateAdmin);

// Fee Items Management
router.get("/items", getAllFeeItems);
router.post("/items", createFeeItem);
router.put("/items/:id", updateFeeItem);
router.patch("/items/:id/archive", archiveFeeItem); // Soft delete (archive)
router.delete("/items/:id", deleteFeeItem); // Hard delete (permanent)

// Student Assessments
router.get("/students", getStudentsWithFees);
router.get("/students/:student_id/assessment", getStudentAssessment);
router.post("/students/:student_id/assign", assignFees);
router.post("/bulk-assign", bulkAssignFees);
router.delete("/students/:student_id/assessment", deleteAssessment);

module.exports = router;
