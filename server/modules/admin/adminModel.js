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

  async findByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE email = ? LIMIT 1", [email]
    );
    return rows[0] || null;
  },

  async createAdmin({ admin_id, password, full_name, role, email }) {
    const [result] = await db.query(
      `INSERT INTO admins (admin_id, password, full_name, role, email)
       VALUES (?, ?, ?, ?, ?)`,
      [admin_id, password, full_name, role, email]
    );

    return {
      id: result.insertId,
      admin_id,
      full_name,
      role,
      email,
    };
  },

  async getAll() {
    const [rows] = await db.query(
      `SELECT id, admin_id, full_name, role, email, is_archived, created_at, updated_at
       FROM admins
       ORDER BY is_archived ASC, role, full_name`
    );
    return rows;
  },

  async findByEmailExcludingId(email, excludeId) {
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE email = ? AND id != ? LIMIT 1",
      [email, excludeId]
    );
    return rows[0] || null;
  },

  async updateAdmin(id, { full_name, email, role }) {
    const [result] = await db.query(
      `UPDATE admins
       SET full_name = ?, email = ?, role = ?, updated_at = NOW()
       WHERE id = ?`,
      [full_name, email, role, id]
    );
    return result.affectedRows > 0;
  },

  async archiveAdmin(id, is_archived) {
    const [result] = await db.query(
      `UPDATE admins
       SET is_archived = ?, updated_at = NOW()
       WHERE id = ?`,
      [is_archived ? 1 : 0, id]
    );
    return result.affectedRows > 0;
  },

  async deleteAdmin(id) {
    const [result] = await db.query(
      "DELETE FROM admins WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = AdminModel;
