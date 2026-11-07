/**
 * modules/payments/accountingPaymentController.js
 * Accounting-specific payment recording and management
 */
const PaymentModel = require("./paymentModel");
const { sendNotification } = require("../../utils/notify");
const db = require("../../config/db");

/**
 * POST /api/accounting/payments/record
 * Record manual tuition payment (face-to-face)
 */
async function recordTuitionPayment(req, res, next) {
  try {
    const { student_id, amount, payment_date, payment_method, notes } = req.body;
    const recorded_by = req.admin.admin_id;

    // Validation
    if (!student_id || typeof student_id !== "string") {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 999999999.99) {
      return res.status(400).json({
        error: "Amount must be between ₱0.01 and ₱999,999,999.99"
      });
    }

    if (!payment_date) {
      return res.status(400).json({ error: "Payment date is required" });
    }

    // Check if payment date is not in the future
    const paymentDateTime = new Date(payment_date);
    const now = new Date();
    if (paymentDateTime > now) {
      return res.status(400).json({ error: "Payment date cannot be in the future" });
    }

    // Use transaction for atomicity
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Get student balance
      const balanceInfo = await PaymentModel.getStudentBalanceInfo(student_id);
      
      if (!balanceInfo) {
        await connection.rollback();
        return res.status(400).json({ 
          error: "Student has no fee assessment. Please assign fees first." 
        });
      }

      // Check if payment exceeds remaining balance (strict prevention)
      if (parsedAmount > balanceInfo.remaining_balance) {
        await connection.rollback();
        return res.status(400).json({
          error: `Payment amount (₱${parsedAmount.toLocaleString()}) exceeds remaining balance (₱${balanceInfo.remaining_balance.toLocaleString()})`,
          remaining_balance: balanceInfo.remaining_balance
        });
      }

      // Record the payment
      const payment = await PaymentModel.recordManualPayment({
        student_id,
        fee_item: "Tuition Payment", // Generic fee item for manual payments
        amount: parsedAmount,
        payment_date: paymentDateTime,
        payment_method: payment_method?.trim() || null,
        notes: notes?.trim() || null,
        recorded_by
      });

      // Calculate new balance
      const newBalance = balanceInfo.remaining_balance - parsedAmount;

      // Send notification to student
      await sendNotification({
        student_id,
        message: `Your tuition payment of ₱${parsedAmount.toLocaleString()} has been recorded and verified. Remaining balance: ₱${newBalance.toLocaleString()}`,
        type: "payment"
      });

      await connection.commit();

      res.status(201).json({
        message: "Payment recorded successfully",
        payment,
        balance: {
          previous_balance: balanceInfo.remaining_balance,
          amount_paid: parsedAmount,
          new_balance: newBalance
        }
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/accounting/payments
 * Get all payments with filters
 */
async function getAllPayments(req, res, next) {
  try {
    const status = req.query.status || null;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const payments = await PaymentModel.getAllPaymentsWithDetails({
      status,
      limit,
      offset
    });

    // Get summary statistics
    const [statsRows] = await db.query(`
      SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'verified' THEN 1 END) as verified_count,
        COALESCE(SUM(CASE WHEN status = 'verified' THEN amount ELSE 0 END), 0) as total_verified_amount
      FROM payments
    `);

    // Get count of students with unpaid or partial balances
    const [balanceRows] = await db.query(`
      SELECT COUNT(DISTINCT sa.student_id) as students_with_balance
      FROM student_assessments sa
      LEFT JOIN (
        SELECT student_id, COALESCE(SUM(amount), 0) as total_paid
        FROM payments
        WHERE status = 'verified'
        GROUP BY student_id
      ) p ON sa.student_id = p.student_id
      WHERE sa.net_assessment > COALESCE(p.total_paid, 0)
    `);

    res.json({
      payments,
      stats: {
        ...statsRows[0],
        students_with_balance: balanceRows[0]?.students_with_balance || 0
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/accounting/payments/:id
 * Get payment details
 */
async function getPaymentDetails(req, res, next) {
  try {
    const { id } = req.params;
    const payment = await PaymentModel.getPaymentDetailsById(parseInt(id));

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ payment });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/accounting/students/search
 * Search students for payment modal
 */
async function searchStudents(req, res, next) {
  try {
    const query = req.query.q || "";
    
    if (query.trim().length < 2) {
      return res.json({ students: [] });
    }

    const students = await PaymentModel.searchActiveStudents(query);
    res.json({ students });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/accounting/students/:student_id/balance
 * Get student balance information
 */
async function getStudentBalance(req, res, next) {
  try {
    const { student_id } = req.params;
    
    // Get student info
    const [studentRows] = await db.query(
      `SELECT student_id, full_name, email, grade_level, pathway
       FROM students
       WHERE student_id = ?
       LIMIT 1`,
      [student_id]
    );

    if (!studentRows || studentRows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const student = studentRows[0];
    const balanceInfo = await PaymentModel.getStudentBalanceInfo(student_id);

    if (!balanceInfo) {
      return res.status(400).json({
        error: "Student has no fee assessment",
        student
      });
    }

    res.json({
      student,
      balance: balanceInfo
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/accounting/students-with-balance
 * Get list of students with their balance status
 */
async function getStudentsWithBalance(req, res, next) {
  try {
    const [students] = await db.query(`
      SELECT 
        sa.student_id,
        s.full_name,
        s.email,
        s.grade_level,
        s.pathway,
        sa.net_assessment,
        COALESCE(p.total_paid, 0) as total_paid,
        (sa.net_assessment - COALESCE(p.total_paid, 0)) as balance
      FROM student_assessments sa
      INNER JOIN students s ON sa.student_id = s.student_id
      LEFT JOIN (
        SELECT student_id, SUM(amount) as total_paid
        FROM payments
        WHERE status = 'verified'
        GROUP BY student_id
      ) p ON sa.student_id = p.student_id
      WHERE s.account_status = 'active'
      ORDER BY balance DESC, s.full_name ASC
    `);

    res.json({ students });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  recordTuitionPayment,
  getAllPayments,
  getPaymentDetails,
  searchStudents,
  getStudentBalance,
  getStudentsWithBalance
};
