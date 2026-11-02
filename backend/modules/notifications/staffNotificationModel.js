/**
 * modules/notifications/staffNotificationModel.js
 * Model for staff (admin, principal, registrar, teacher, accounting) notifications
 */
const db = require("../../config/db");

const RETENTION_DAYS = 90;

const StaffNotificationModel = {
  /**
   * Find notifications for a specific staff member by role and recipient ID
   */
  async findByStaff(role, recipient) {
    const [rows] = await db.query(
      `SELECT * FROM staff_notifications
       WHERE role = ? AND recipient = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY created_at DESC
       LIMIT 100`,
      [role, recipient, RETENTION_DAYS]
    );
    return rows;
  },

  /**
   * Find notifications for entire role (e.g., all principals)
   */
  async findByRole(role) {
    const [rows] = await db.query(
      `SELECT * FROM staff_notifications
       WHERE role = ? AND recipient = 'ALL'
         AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY created_at DESC
       LIMIT 100`,
      [role, RETENTION_DAYS]
    );
    return rows;
  },

  /**
   * Count unread notifications for a staff member
   */
  async countUnread(role, recipient) {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS cnt FROM staff_notifications WHERE role = ? AND recipient = ? AND is_read = 0",
      [role, recipient]
    );
    return rows[0].cnt;
  },

  /**
   * Mark all notifications as read for a staff member
   */
  async markAllRead(role, recipient) {
    await db.query(
      "UPDATE staff_notifications SET is_read = 1 WHERE role = ? AND recipient = ? AND is_read = 0",
      [role, recipient]
    );
  },

  /**
   * Mark a specific notification as read
   */
  async markOneRead(id) {
    await db.query(
      "UPDATE staff_notifications SET is_read = 1 WHERE id = ?",
      [id]
    );
  },

  /**
   * Delete a specific notification
   */
  async delete(id, role, recipient) {
    await db.query(
      "DELETE FROM staff_notifications WHERE id = ? AND role = ? AND (recipient = ? OR recipient = 'ALL')",
      [id, role, recipient]
    );
  },

  /**
   * Create a new staff notification
   * @param {Object} data - { recipient, role, message, type, reference_id, reference_type, link_url }
   */
  async create({ recipient, role, message, type = 'info', reference_id = null, reference_type = null, link_url = null }) {
    try {
      // Use first 50 chars of message as title if no title provided
      const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
      
      const [result] = await db.query(
        `INSERT INTO staff_notifications (recipient, role, title, message, type, reference_id, reference_type, link_url, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
        [recipient, role, title, message, type, reference_id, reference_type, link_url]
      );
      
      const [rows] = await db.query(
        "SELECT * FROM staff_notifications WHERE id = ? LIMIT 1", 
        [result.insertId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error creating staff notification:', error.message);
      throw error;
    }
  },

  /**
   * Create notification for all users of a specific role
   */
  async createForRole({ role, message, type = 'info', reference_id = null, reference_type = null, link_url = null }) {
    // Use 'ALL' as recipient to indicate it's for everyone in that role
    // Use first 50 chars of message as title if no title provided
    const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
    
    const [result] = await db.query(
      `INSERT INTO staff_notifications (recipient, role, title, message, type, reference_id, reference_type, link_url, is_read, created_at)
       VALUES ('ALL', ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      [role, title, message, type, reference_id, reference_type, link_url]
    );
    
    return result.insertId;
  },

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOld(daysOld = 90) {
    const [result] = await db.query(
      "DELETE FROM staff_notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)",
      [daysOld]
    );
    return result.affectedRows;
  }
};

module.exports = StaffNotificationModel;
