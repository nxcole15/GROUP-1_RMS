/**
 * modules/shared/configModel.js
 * Reads enrollment configuration and subject data from the database.
 */
const db = require("../../config/db");

const ConfigModel = {
  async getEnrollmentConfig() {
    const [rows] = await db.query(
      "SELECT * FROM enrollment_config WHERE status = 'active' ORDER BY id DESC LIMIT 1"
    );
    if (!rows[0]) {
      throw new Error("Enrollment configuration not found in database.");
    }
    return {
      active_term: rows[0].current_term,
      deadline:    rows[0].enrollment_end_date ? new Date(rows[0].enrollment_end_date) : null,
      school_year: rows[0].school_year,
      enrollment_is_open: rows[0].enrollment_is_open,
      enrollment_start_date: rows[0].enrollment_start_date,
      enrollment_end_date: rows[0].enrollment_end_date,
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
