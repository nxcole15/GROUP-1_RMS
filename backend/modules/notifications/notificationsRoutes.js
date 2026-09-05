const express = require("express");
const router  = express.Router();
const { getMyNotifications, markAllRead, registerDeviceToken } = require("./notificationsController");
const { authenticateStudent } = require("../auth/authMiddleware");

router.use(authenticateStudent);

router.get("/",                getMyNotifications);
router.post("/read",           markAllRead);
router.post("/register-token", registerDeviceToken);

module.exports = router;
