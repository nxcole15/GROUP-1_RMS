const express = require("express");
const router  = express.Router();
const { login, logout, me, universalLogin } = require("./authController");
const { authenticateStudent } = require("./authMiddleware");

router.post("/login",           login);
router.post("/logout",          logout);
router.get("/me",               authenticateStudent, me);
router.post("/universal-login", universalLogin);

module.exports = router;
