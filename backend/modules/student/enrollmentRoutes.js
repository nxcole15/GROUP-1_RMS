const express = require("express");
const router  = express.Router();
const { getMyEnrollment, getAvailableSubjects, submitEnrollment, getMySchedule } = require("./enrollmentController");
const { authenticateStudent } = require("../auth/authMiddleware");

router.use(authenticateStudent);

router.get("/subjects", getAvailableSubjects); // list subjects with capacity
router.get("/",         getMyEnrollment);       // current term enrollment
router.post("/",        submitEnrollment);       // submit new enrollment
router.get("/schedule", getMySchedule);

module.exports = router;
