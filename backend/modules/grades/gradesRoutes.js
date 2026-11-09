const express = require("express");
const router  = express.Router();
const { getMyGrades, getAvailableSubjects } = require("./gradesController");
const { authenticateStudent } = require("../auth/authMiddleware");

router.use(authenticateStudent);
router.get("/", getMyGrades);
router.get("/available", getAvailableSubjects);

module.exports = router;
