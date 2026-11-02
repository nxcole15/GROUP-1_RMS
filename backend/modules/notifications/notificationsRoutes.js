const express = require("express");
const router  = express.Router();
const { getMyNotifications, markAllRead, markOneRead, deleteNotification, registerDeviceToken } = require("./notificationsController");
const { authenticateStudent } = require("../auth/authMiddleware");

router.use(authenticateStudent);

router.get("/",                getMyNotifications);
router.post("/read",           markAllRead);
router.patch("/read",          markAllRead);
router.patch("/:id/read",      markOneRead);
router.delete("/:id",          deleteNotification);
router.post("/register-token", registerDeviceToken);

module.exports = router;
