const express = require("express");
const router  = express.Router();
const { getMyAttendance } = require("./attendanceController");
const { authenticateStudent } = require("../auth/authMiddleware");

router.use(authenticateStudent);
router.get("/", getMyAttendance);

module.exports = router;
