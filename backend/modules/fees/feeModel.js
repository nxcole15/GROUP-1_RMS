/**
 * modules/fees/feeModel.js
 * Fee management data access layer
 */
const db = require("../../config/db");

const FeeModel = {
  // ==================== FEE ITEMS MANAGEMENT ====================
  
  /**
   * Get all active fee items
   */
  async getAllFeeItems() {
    const [rows] = await db.query(
      `SELECT * FROM fee_items WHERE is_active = 1 ORDER BY item_name ASC`
    );
    return rows;
  },

  /**
   * Get fee item by ID
   */
  async getFeeItemById(id) {
    const [rows] = await db.query(
      `SELECT * FROM fee_items WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create new fee item
   */
  async createFeeItem({ item_name, description, default_amount, created_by }) {
    const [result] = await db.query(
      `INSERT INTO fee_items (item_name, description, default_amount, created_by)
       VALUES (?, ?, ?, ?)`,
      [item_name, description || null, default_amount || 0, created_by]
    );
    return this.getFeeItemById(result.insertId);
  },

  /**
   * Update fee item
   */
  async updateFeeItem(id, { item_name, description, default_amount }) {
    await db.query(
      `UPDATE fee_items 
       SET item_name = ?, description = ?, default_amount = ?
       WHERE id = ?`,
      [item_name, description || null, default_amount || 0, id]
    );
    return this.getFeeItemById(id);
  },

  /**
   * Archive fee item (soft delete - mark as inactive)
   */
  async archiveFeeItem(id) {
    // First, get all assessments that have this fee item
    const [affectedAssessments] = await db.query(
      `SELECT DISTINCT assessment_id 
       FROM assessment_line_items 
       WHERE fee_item_id = ?`,
      [id]
    );

    // Delete the line items containing this fee item
    await db.query(
      `DELETE FROM assessment_line_items WHERE fee_item_id = ?`,
      [id]
    );

    // Recalculate total_assessment for each affected assessment
    for (const row of affectedAssessments) {
      const assessment_id = row.assessment_id;
      
      // Get remaining line items for this assessment
      const [lineItems] = await db.query(
        `SELECT SUM(amount) as new_total 
         FROM assessment_line_items 
         WHERE assessment_id = ?`,
        [assessment_id]
      );
      
      const newTotal = lineItems[0]?.new_total || 0;
      
      // Update the assessment total
      await db.query(
        `UPDATE student_assessments 
         SET total_assessment = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [newTotal, assessment_id]
      );
    }

    // Mark the fee item as inactive (soft delete)
    await db.query(
      `UPDATE fee_items SET is_active = 0 WHERE id = ?`,
      [id]
    );

    return affectedAssessments.length; // Return number of assessments updated
  },

  /**
   * Hard delete fee item (permanently remove from database)
   */
  async deleteFeeItem(id) {
    // First, get all assessments that have this fee item
    const [affectedAssessments] = await db.query(
      `SELECT DISTINCT assessment_id 
       FROM assessment_line_items 
       WHERE fee_item_id = ?`,
      [id]
    );

    // Delete the line items containing this fee item
    await db.query(
      `DELETE FROM assessment_line_items WHERE fee_item_id = ?`,
      [id]
    );

    // Recalculate total_assessment for each affected assessment
    for (const row of affectedAssessments) {
      const assessment_id = row.assessment_id;
      
      // Get remaining line items for this assessment
      const [lineItems] = await db.query(
        `SELECT SUM(amount) as new_total 
         FROM assessment_line_items 
         WHERE assessment_id = ?`,
        [assessment_id]
      );
      
      const newTotal = lineItems[0]?.new_total || 0;
      
      // Update the assessment total
      await db.query(
        `UPDATE student_assessments 
         SET total_assessment = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [newTotal, assessment_id]
      );
    }

    // Permanently delete the fee item from database
    await db.query(
      `DELETE FROM fee_items WHERE id = ?`,
      [id]
    );

    return affectedAssessments.length; // Return number of assessments updated
  },

  // ==================== STUDENT ASSESSMENTS ====================

  /**
   * Get student assessment for a specific term
   */
  async getStudentAssessment(student_id, school_year, term) {
    const [rows] = await db.query(
      `SELECT sa.*, 
              a.full_name as assessed_by_name
       FROM student_assessments sa
       LEFT JOIN admins a ON sa.assessed_by = a.admin_id
       WHERE sa.student_id = ? AND sa.school_year = ? AND sa.term = ?
       LIMIT 1`,
      [student_id, school_year, term]
    );
    return rows[0] || null;
  },

  /**
   * Get assessment line items (fee breakdown)
   */
  async getAssessmentLineItems(assessment_id) {
    const [rows] = await db.query(
      `SELECT ali.*, fi.item_name, fi.description
       FROM assessment_line_items ali
       JOIN fee_items fi ON ali.fee_item_id = fi.id
       WHERE ali.assessment_id = ?
       ORDER BY fi.item_name ASC`,
      [assessment_id]
    );
    return rows;
  },

  /**
   * Get complete assessment with line items
   */
  async getCompleteAssessment(student_id, school_year, term) {
    const assessment = await this.getStudentAssessment(student_id, school_year, term);
    if (!assessment) return null;

    const lineItems = await this.getAssessmentLineItems(assessment.id);
    
    return {
      ...assessment,
      line_items: lineItems
    };
  },

  /**
   * Create or update student assessment
   */
  async upsertStudentAssessment({
    student_id,
    school_year,
    term,
    line_items, // Array of { fee_item_id, amount }
    discount_amount = 0,
    discount_reason = null,
    assessed_by,
    notes = null
  }) {
    // Calculate total from line items
    const total_assessment = line_items.reduce((sum, item) => sum + parseFloat(item.amount), 0);

    // Check if assessment already exists
    const existing = await this.getStudentAssessment(student_id, school_year, term);

    let assessment_id;

    if (existing) {
      // Update existing assessment
      await db.query(
        `UPDATE student_assessments 
         SET total_assessment = ?, 
             discount_amount = ?, 
             discount_reason = ?,
             assessed_by = ?,
             notes = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [total_assessment, discount_amount, discount_reason, assessed_by, notes, existing.id]
      );
      assessment_id = existing.id;

      // Delete old line items
      await db.query(
        `DELETE FROM assessment_line_items WHERE assessment_id = ?`,
        [assessment_id]
      );
    } else {
      // Create new assessment
      const [result] = await db.query(
        `INSERT INTO student_assessments 
         (student_id, school_year, term, total_assessment, discount_amount, discount_reason, assessed_by, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [student_id, school_year, term, total_assessment, discount_amount, discount_reason, assessed_by, notes]
      );
      assessment_id = result.insertId;
    }

    // Insert new line items
    for (const item of line_items) {
      await db.query(
        `INSERT INTO assessment_line_items (assessment_id, fee_item_id, amount)
         VALUES (?, ?, ?)`,
        [assessment_id, item.fee_item_id, item.amount]
      );
    }

    return this.getCompleteAssessment(student_id, school_year, term);
  },

  /**
   * Delete student assessment
   */
  async deleteStudentAssessment(student_id, school_year, term) {
    await db.query(
      `DELETE FROM student_assessments 
       WHERE student_id = ? AND school_year = ? AND term = ?`,
      [student_id, school_year, term]
    );
  },

  /**
   * Get all students with their assessment status
   */
  async getStudentsWithAssessmentStatus(school_year, term) {
    const [rows] = await db.query(
      `SELECT 
         s.student_id,
         s.full_name,
         s.grade_level,
         s.pathway,
         s.email,
         sa.id as assessment_id,
         sa.total_assessment,
         sa.discount_amount,
         sa.net_assessment,
         sa.assessed_at,
         COALESCE(
           (SELECT SUM(amount) 
            FROM payments 
            WHERE student_id = s.student_id AND status = 'verified'),
           0
         ) as total_paid,
         (sa.net_assessment - COALESCE(
           (SELECT SUM(amount) 
            FROM payments 
            WHERE student_id = s.student_id AND status = 'verified'),
           0
         )) as balance
       FROM students s
       LEFT JOIN student_assessments sa 
         ON s.student_id = sa.student_id 
         AND sa.school_year = ? 
         AND sa.term = ?
       WHERE s.account_status = 'active'
       ORDER BY s.full_name ASC`,
      [school_year, term]
    );
    return rows;
  },

  /**
   * Get assessment statistics
   */
  async getAssessmentStats(school_year, term) {
    const [rows] = await db.query(
      `SELECT 
         COUNT(DISTINCT s.student_id) as total_students,
         COUNT(DISTINCT sa.id) as with_assessment,
         (COUNT(DISTINCT s.student_id) - COUNT(DISTINCT sa.id)) as pending_assessment,
         COALESCE(SUM(sa.total_assessment), 0) as total_assessed_amount,
         COALESCE(SUM(sa.discount_amount), 0) as total_discounts,
         COALESCE(SUM(sa.net_assessment), 0) as total_net_assessment
       FROM students s
       LEFT JOIN student_assessments sa 
         ON s.student_id = sa.student_id 
         AND sa.school_year = ? 
         AND sa.term = ?
       WHERE s.account_status = 'active'`,
      [school_year, term]
    );
    return rows[0];
  }
};

module.exports = FeeModel;
