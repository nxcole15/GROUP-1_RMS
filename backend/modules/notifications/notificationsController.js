/**
 * modules/notifications/notificationsController.js
 */
const NotificationModel = require("./notificationModel");
const StudentModel      = require("../student/studentModel");

async function getMyNotifications(req, res, next) {
  try {
    const { student_id } = req.student;
    const notifications  = await NotificationModel.findByStudent(student_id);
    const unread_count   = await NotificationModel.countUnread(student_id);
    res.json({ notifications, unread_count });
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    await NotificationModel.markAllRead(req.student.student_id);
    res.json({ message: "All notifications marked as read.", unread_count: 0 });
  } catch (err) { next(err); }
}

async function registerDeviceToken(req, res, next) {
  try {
    const { student_id }   = req.student;
    const { device_token } = req.body;

    if (!device_token || typeof device_token !== "string" || device_token.trim().length === 0) {
      return res.status(400).json({ error: "device_token is required." });
    }
    await StudentModel.updateDeviceToken(student_id, device_token.trim());
    res.json({ message: "Device token registered successfully." });
  } catch (err) { next(err); }
}

module.exports = { getMyNotifications, markAllRead, registerDeviceToken };
