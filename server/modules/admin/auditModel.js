/**
 * modules/admin/auditModel.js
 */
const db = require("../../config/db");

const AuditModel = {
  async log({ admin_id, action, target_request_id }) {
    const [result] = await db.query(
      `INSERT INTO audit_log (admin_id, action, target_request_id, created_at)
       VALUES (?, ?, ?, NOW())`,
      [admin_id, action, target_request_id]
    );
    const [rows] = await db.query(
      "SELECT * FROM audit_log WHERE id = ? LIMIT 1", [result.insertId]
    );
    return rows[0];
  },

  async getAll() {
    const [rows] = await db.query(
      "SELECT * FROM audit_log ORDER BY created_at DESC"
    );
    return rows;
  },
};

module.exports = AuditModel;
