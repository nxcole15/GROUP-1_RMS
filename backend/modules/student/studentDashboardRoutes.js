/**
 * modules/student/studentDashboardRoutes.js
 */
const express = require("express");
const router = express.Router();
const { getDashboardData, getProfileData } = require("./studentDashboardController");
const { authenticateStudent } = require("../auth/authMiddleware");

router.get("/dashboard", authenticateStudent, getDashboardData);
router.get("/profile", authenticateStudent, getProfileData);

module.exports = router;
