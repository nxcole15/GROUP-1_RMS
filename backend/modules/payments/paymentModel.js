/**
 * modules/payments/paymentModel.js
 */
const db = require("../../config/db");

const PaymentModel = {
  async findByStudent(student_id, limit = 500) {
    const [rows] = await db.query(
      "SELECT * FROM payments WHERE student_id = ? ORDER BY paid_at DESC LIMIT ?",
      [student_id, limit]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM payments WHERE id = ? LIMIT 1", [id]
    );
    return rows[0] || null;
  },

  async findAllPending() {
    const [rows] = await db.query(
      "SELECT * FROM payments WHERE status = 'pending' ORDER BY paid_at ASC"
    );
    return rows;
  },

  async create({ student_id, fee_item, amount }) {
    const [result] = await db.query(
      `INSERT INTO payments (student_id, fee_item, amount, status, paid_at)
       VALUES (?, ?, ?, 'pending', NOW())`,
      [student_id, fee_item, amount]
    );
    return this.findById(result.insertId);
  },

  async verify(id, admin_id) {
    await db.query(
      `UPDATE payments
       SET status = 'verified', admin_id = ?, admin_timestamp = NOW()
       WHERE id = ?`,
      [admin_id, id]
    );
    return this.findById(id);
  },

  async computeSummary(student_id) {
    const [rows] = await db.query(
      `SELECT
         SUM(amount)                                              AS total_assessment,
         SUM(CASE WHEN status='verified' THEN amount ELSE 0 END) AS total_paid
       FROM payments
       WHERE student_id = ?`,
      [student_id]
    );
    const total_assessment = parseFloat(rows[0].total_assessment || 0);
    const total_paid       = parseFloat(rows[0].total_paid       || 0);
    return {
      total_assessment,
      total_paid,
      remaining_balance: parseFloat((total_assessment - total_paid).toFixed(2)),
    };
  },
};

module.exports = PaymentModel;
