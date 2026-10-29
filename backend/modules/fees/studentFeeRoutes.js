/**
 * modules/fees/studentFeeRoutes.js
 * Student-facing fee routes (read-only access to their own assessment)
 */
const express = require("express");
const router = express.Router();
const { authenticateStudent } = require("../auth/authMiddleware");
const { getMyAssessment } = require("./feeController");

// All routes require student authentication
router.use(authenticateStudent);

// Get my own assessment
router.get("/my-assessment", getMyAssessment);

module.exports = router;
