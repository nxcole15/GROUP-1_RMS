const express = require("express");
const router  = express.Router();
const { getMyGrades } = require("./gradesController");
const { authenticateStudent } = require("../auth/authMiddleware");

router.use(authenticateStudent);
router.get("/", getMyGrades);

module.exports = router;
