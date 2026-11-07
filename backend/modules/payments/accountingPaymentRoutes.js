/**
 * modules/payments/accountingPaymentRoutes.js
 * Routes for accounting payment management
 */
const express = require("express");
const router = express.Router();
const { authenticateAdmin } = require("../admin/adminMiddleware");
const {
  recordTuitionPayment,
  getAllPayments,
  getPaymentDetails,
  searchStudents,
  getStudentBalance,
  getStudentsWithBalance
} = require("./accountingPaymentController");

// All routes require admin authentication
router.use(authenticateAdmin);

// Payment management
router.post("/payments/record", recordTuitionPayment);
router.get("/payments", getAllPayments);
router.get("/payments/:id", getPaymentDetails);

// Student search and balance
router.get("/students/search", searchStudents);
router.get("/students/:student_id/balance", getStudentBalance);
router.get("/students-with-balance", getStudentsWithBalance);

module.exports = router;
