/**
 * modules/admin/adminModel.js
 */
const db = require("../../config/db");

const AdminModel = {
  async findByAdminId(admin_id) {
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE admin_id = ? LIMIT 1", [admin_id]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE id = ? LIMIT 1", [id]
    );
    return rows[0] || null;
  },
};

module.exports = AdminModel;
