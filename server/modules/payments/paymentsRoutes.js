const express = require("express");
const router  = express.Router();
const { getMyPayments, submitPayment } = require("./paymentsController");
const { authenticateStudent } = require("../auth/authMiddleware");

router.use(authenticateStudent);

router.get("/",  getMyPayments);
router.post("/", submitPayment);

module.exports = router;
