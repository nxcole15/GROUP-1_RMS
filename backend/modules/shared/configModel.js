/**
 * modules/shared/configModel.js
 * Reads enrollment configuration and subject data from the database.
 */
const db = require("../../config/db");

const ConfigModel = {
  async getEnrollmentConfig() {
    const [rows] = await db.query(
      "SELECT * FROM enrollment_config ORDER BY id DESC LIMIT 1"
    );
    if (!rows[0]) {
      throw new Error("Enrollment configuration not found in database.");
    }
    return {
      active_term: rows[0].active_term,
      deadline:    new Date(rows[0].deadline),
    };
  },

  async getSubjects() {
    const [rows] = await db.query(
      `SELECT s.*, t.full_name AS teacher_name
       FROM subjects s
       JOIN teachers t ON t.id = s.teacher_id
       ORDER BY s.id`
    );
    return rows;
  },

  async getSubjectById(id) {
    const [rows] = await db.query(
      `SELECT s.*, t.full_name AS teacher_name
       FROM subjects s
       JOIN teachers t ON t.id = s.teacher_id
       WHERE s.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = ConfigModel;
