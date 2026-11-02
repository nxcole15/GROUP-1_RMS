/**
 * modules/notifications/staffNotificationRoutes.js
 * Routes for staff notifications
 */
const express = require("express");
const router  = express.Router();
const { getMyNotifications, markAllRead, markOneRead, deleteNotification } = require("./staffNotificationController");
const { authenticateAdmin } = require("../admin/adminMiddleware");
const { authenticateTeacher } = require("../teacher/teacherMiddleware");

/**
 * Middleware to authenticate staff (admin OR teacher)
 * This allows both admin and teacher roles to access these routes
 */
async function authenticateStaff(req, res, next) {
  // Try admin auth first (includes registrar, principal, accounting)
  try {
    await new Promise((resolve, reject) => {
      authenticateAdmin(req, res, (err) => {
        if (err) reject(err);
        else if (req.admin) resolve();
        else reject(new Error('No admin in request'));
      });
    });
    return next(); // Admin auth succeeded
  } catch (adminErr) {
    // Admin auth failed, try teacher
    try {
      await new Promise((resolve, reject) => {
        authenticateTeacher(req, res, (err) => {
          if (err) reject(err);
          else if (req.teacher) resolve();
          else reject(new Error('No teacher in request'));
        });
      });
      return next(); // Teacher auth succeeded
    } catch (teacherErr) {
      return res.status(401).json({ error: "Unauthorized: Staff authentication required" });
    }
  }
}

// All routes require staff authentication
router.use(authenticateStaff);

// Get my notifications
router.get("/", getMyNotifications);

// Mark all as read
router.post("/read", markAllRead);
router.patch("/read", markAllRead);

// Mark one as read
router.patch("/:id/read", markOneRead);

// Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
