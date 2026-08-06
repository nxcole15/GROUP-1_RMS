/**
 * modules/notifications/notificationModel.js
 */
const db = require("../../config/db");

const RETENTION_DAYS = 90;

const NotificationModel = {
  async findByStudent(student_id) {
    const [rows] = await db.query(
      `SELECT * FROM notifications
       WHERE student_id = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY created_at DESC`,
      [student_id, RETENTION_DAYS]
    );
    return rows;
  },

  async countUnread(student_id) {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS cnt FROM notifications WHERE student_id = ? AND is_read = 0",
      [student_id]
    );
    return rows[0].cnt;
  },

  async markAllRead(student_id) {
    await db.query(
      "UPDATE notifications SET is_read = 1 WHERE student_id = ? AND is_read = 0",
      [student_id]
    );
  },

  async create({ student_id, message, type }) {
    const [result] = await db.query(
      `INSERT INTO notifications (student_id, message, type, is_read, created_at)
       VALUES (?, ?, ?, 0, NOW())`,
      [student_id, message, type]
    );
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE id = ? LIMIT 1", [result.insertId]
    );
    return rows[0];
  },
};

module.exports = NotificationModel;
