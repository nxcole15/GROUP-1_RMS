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

  async computeSummary(student_id) {
    // Get official fee assessment from student_assessments
    const FeeModel = require("../fees/feeModel");
    const assessment = await FeeModel.getCompleteAssessment(student_id, "2026-2027", "Term 1");
    
    const total_assessment = assessment ? parseFloat(assessment.net_assessment) : 0;
    
    // Get total paid from payments
    const [rows] = await db.query(
      `SELECT
         SUM(CASE WHEN status='verified' THEN amount ELSE 0 END) AS total_paid
       FROM payments
       WHERE student_id = ?`,
      [student_id]
    );
    const total_paid = parseFloat(rows[0].total_paid || 0);
    
    return {
      total_assessment,
      total_paid,
      remaining_balance: parseFloat((total_assessment - total_paid).toFixed(2)),
      assessment_breakdown: assessment ? assessment.line_items : null
    };
  },

  // ==================== MANUAL PAYMENT RECORDING ====================

  /**
   * Record manual payment (accounting records face-to-face payment)
   * Creates payment with status='verified' immediately
   */
  async recordManualPayment({ 
    student_id, 
    fee_item, 
    amount, 
    payment_date, 
    payment_method, 
    notes, 
    recorded_by 
  }) {
    const [result] = await db.query(
      `INSERT INTO payments 
       (student_id, fee_item, amount, status, paid_at, admin_id, admin_timestamp, payment_method, notes)
       VALUES (?, ?, ?, 'verified', ?, ?, NOW(), ?, ?)`,
      [student_id, fee_item, amount, payment_date, recorded_by, payment_method, notes]
    );
    return this.findById(result.insertId);
  },

  /**
   * Get all payments with student and admin details
   */
  async getAllPaymentsWithDetails({ status = null, limit = 100, offset = 0 }) {
    let query = `
      SELECT 
        p.*,
        s.full_name as student_name,
        s.email as student_email,
        s.grade_level,
        a.full_name as recorded_by_name
      FROM payments p
      INNER JOIN students s ON p.student_id = s.student_id
      LEFT JOIN admins a ON p.admin_id = a.admin_id
    `;
    
    const params = [];
    if (status) {
      query += ` WHERE p.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY p.paid_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const [rows] = await db.query(query, params);
    return rows;
  },

  /**
   * Get payment details by ID with full information
   */
  async getPaymentDetailsById(id) {
    const [rows] = await db.query(
      `SELECT 
        p.*,
        s.full_name as student_name,
        s.email as student_email,
        s.grade_level,
        s.pathway,
        a.full_name as recorded_by_name,
        a.email as recorded_by_email
      FROM payments p
      INNER JOIN students s ON p.student_id = s.student_id
      LEFT JOIN admins a ON p.admin_id = a.admin_id
      WHERE p.id = ?
      LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Search active students by ID or name
   */
  async searchActiveStudents(query) {
    const searchTerm = `%${query}%`;
    const [rows] = await db.query(
      `SELECT 
        student_id,
        full_name,
        email,
        grade_level,
        pathway
      FROM students
      WHERE account_status = 'active'
        AND (student_id LIKE ? OR full_name LIKE ?)
      ORDER BY full_name ASC
      LIMIT 20`,
      [searchTerm, searchTerm]
    );
    return rows;
  },

  /**
   * Get student balance information (assessment and payments)
   */
  async getStudentBalanceInfo(student_id) {
    // Get latest assessment
    const [assessmentRows] = await db.query(
      `SELECT 
        sa.id as assessment_id,
        sa.total_assessment,
        sa.discount_amount,
        sa.net_assessment,
        sa.school_year,
        sa.term
      FROM student_assessments sa
      WHERE sa.student_id = ?
      ORDER BY sa.assessed_at DESC
      LIMIT 1`,
      [student_id]
    );
    
    if (!assessmentRows || assessmentRows.length === 0) {
      return null; // No assessment found
    }
    
    const assessment = assessmentRows[0];
    
    // Get total verified payments
    const [paymentRows] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total_paid
      FROM payments
      WHERE student_id = ? AND status = 'verified'`,
      [student_id]
    );
    
    const total_paid = parseFloat(paymentRows[0].total_paid || 0);
    const remaining_balance = parseFloat(assessment.net_assessment) - total_paid;
    
    return {
      student_id,
      assessment_id: assessment.assessment_id,
      total_assessment: parseFloat(assessment.total_assessment),
      discount_amount: parseFloat(assessment.discount_amount),
      net_assessment: parseFloat(assessment.net_assessment),
      total_paid,
      remaining_balance: Math.max(0, remaining_balance), // Never negative
      school_year: assessment.school_year,
      term: assessment.term
    };
  },
};

module.exports = PaymentModel;
