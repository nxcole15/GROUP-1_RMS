const express = require("express");
const router  = express.Router();
const { logout, me, universalLogin, getTeachers, forgotPassword, resetPassword } = require("./authController");
const { authenticateStudent } = require("./authMiddleware");


router.post("/logout",          logout);
router.get("/me",               authenticateStudent, me);
router.post("/universal-login", universalLogin);
router.get("/teachers",         authenticateStudent, getTeachers);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

module.exports = router;
