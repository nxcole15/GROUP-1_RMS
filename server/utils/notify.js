/**
 * utils/notify.js
 * Non-blocking notification helper.
 * Failures are logged but never bubble up to the caller.
 */
const NotificationModel = require("../modules/notifications/notificationModel");

function sendNotification({ student_id, message, type }) {
  NotificationModel.create({ student_id, message, type }).catch((err) => {
    console.error("[Notification] Failed to deliver notification:", err.message);
  });
  // TODO: add Firebase Cloud Messaging push here when device_token is available
}

module.exports = { sendNotification };
