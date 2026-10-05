/**
 * modules/student/studentDashboardRoutes.js
 */
const express = require("express");
const router = express.Router();
const { getDashboardData, getProfileData, getStudentSchedules } = require("./studentDashboardController");
const { authenticateStudent } = require("../auth/authMiddleware");

router.get("/dashboard", authenticateStudent, getDashboardData);
router.get("/profile", authenticateStudent, getProfileData);
router.get("/schedules", authenticateStudent, getStudentSchedules);

module.exports = router;
