/**
 * modules/student/studentModel.js
 */
const db = require("../../config/db");

const StudentModel = {
  async findByStudentId(student_id) {
    const [rows] = await db.query(
      "SELECT * FROM students WHERE student_id = ? LIMIT 1", [student_id]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM students WHERE id = ? LIMIT 1", [id]
    );
    return rows[0] || null;
  },

  async updateFailedAttempts(student_id, attempts, locked_until = null) {
    await db.query(
      "UPDATE students SET failed_attempts = ?, locked_until = ? WHERE student_id = ?",
      [attempts, locked_until, student_id]
    );
  },

  async resetFailedAttempts(student_id) {
    await db.query(
      "UPDATE students SET failed_attempts = 0, locked_until = NULL WHERE student_id = ?",
      [student_id]
    );
  },

  async updateDeviceToken(student_id, token) {
    await db.query(
      "UPDATE students SET device_token = ? WHERE student_id = ?",
      [token, student_id]
    );
  },
};

module.exports = StudentModel;
