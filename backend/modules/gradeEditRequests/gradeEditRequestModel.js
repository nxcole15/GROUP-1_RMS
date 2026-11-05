/**
 * modules/gradeEditRequests/gradeEditRequestModel.js
 * Model for teacher-initiated grade correction requests
 */
const db = require("../../config/db");

const GradeEditRequestModel = {

  /**
   * Get all grade edit requests with teacher and student details
   */
  async findAll(filters = {}) {
    let query = `
      SELECT 
        ger.*,
        t.teacher_id,
        t.full_name AS teacher_name,
        s.full_name AS student_name,
        s.grade_level,
        s.pathway AS track
      FROM grade_edit_requests ger
      JOIN teachers t ON ger.teacher_id = t.id
      JOIN students s ON ger.student_id = s.student_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.status) {
      query += ` AND ger.status = ?`;
      params.push(filters.status);
    }
    
    if (filters.term) {
      query += ` AND ger.term = ?`;
      params.push(filters.term);
    }
    
    if (filters.teacher_id) {
      query += ` AND ger.teacher_id = ?`;
      params.push(filters.teacher_id);
    }
    
    if (filters.subject_name) {
      query += ` AND ger.subject_name = ?`;
      params.push(filters.subject_name);
    }
    
    query += ` ORDER BY ger.created_at DESC`;
    
    const [rows] = await db.query(query, params);
    return rows;
  },

  /**
   * Get requests by teacher
   */
  async findByTeacher(teacher_id) {
    const [rows] = await db.query(
      `SELECT 
        ger.*,
        s.full_name AS student_name,
        s.grade_level,
        s.pathway AS track
      FROM grade_edit_requests ger
      JOIN students s ON ger.student_id = s.student_id
      WHERE ger.teacher_id = ?
      ORDER BY ger.created_at DESC`,
      [teacher_id]
    );
    return rows;
  },

  /**
   * Get single request by ID
   */
  async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        ger.*,
        t.id as teacher_db_id,
        t.teacher_id,
        t.full_name AS teacher_name,
        t.email AS teacher_email,
        s.full_name AS student_name,
        s.grade_level,
        s.pathway AS track,
        s.email AS student_email
      FROM grade_edit_requests ger
      JOIN teachers t ON ger.teacher_id = t.id
      JOIN students s ON ger.student_id = s.student_id
      WHERE ger.id = ?
      LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create new edit request
   */
  async create(data) {
    const {
      teacher_id,
      student_id,
      subject_name,
      strand,
      term,
      original_grade,
      proposed_grade,
      reason
    } = data;

    const [result] = await db.query(
      `INSERT INTO grade_edit_requests 
        (teacher_id, student_id, subject_name, strand, term, 
         original_grade, proposed_grade, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [teacher_id, student_id, subject_name, strand, term, 
       original_grade, proposed_grade, reason]
    );

    return this.findById(result.insertId);
  },

  /**
   * Check if teacher already has pending request for this grade
   */
  async hasPendingRequest(teacher_id, student_id, subject_name, term) {
    const [rows] = await db.query(
      `SELECT id FROM grade_edit_requests 
      WHERE teacher_id = ? 
        AND student_id = ? 
        AND subject_name = ? 
        AND term = ?
        AND status IN ('pending', 'approved')
      LIMIT 1`,
      [teacher_id, student_id, subject_name, term]
    );
    return rows.length > 0;
  },

  /**
   * Approve request
   */
  async approve(id, approved_by) {
    await db.query(
      `UPDATE grade_edit_requests 
      SET status = 'approved', 
          approved_by = ?, 
          approved_at = NOW()
      WHERE id = ?`,
      [approved_by, id]
    );
    return this.findById(id);
  },

  /**
   * Reject request
   */
  async reject(id, rejected_by, rejection_reason) {
    await db.query(
      `UPDATE grade_edit_requests 
      SET status = 'rejected', 
          rejected_by = ?, 
          rejected_at = NOW(),
          rejection_reason = ?
      WHERE id = ?`,
      [rejected_by, rejection_reason, id]
    );
    return this.findById(id);
  },

  /**
   * Mark as completed after teacher makes correction
   */
  async complete(id, corrected_grade) {
    await db.query(
      `UPDATE grade_edit_requests 
      SET status = 'completed', 
          corrected_grade = ?,
          corrected_at = NOW(),
          completed_at = NOW()
      WHERE id = ?`,
      [corrected_grade, id]
    );
    return this.findById(id);
  },

  /**
   * Check if teacher has permission to edit a specific grade
   */
  async hasEditPermission(teacher_id, student_id, subject_name, term) {
    const [rows] = await db.query(
      `SELECT id FROM grade_edit_requests 
      WHERE teacher_id = ? 
        AND student_id = ? 
        AND subject_name = ? 
        AND term = ?
        AND status = 'approved'
      LIMIT 1`,
      [teacher_id, student_id, subject_name, term]
    );
    return rows[0] || null;
  },

  /**
   * Create audit log entry
   */
  async createAuditLog(data) {
    const {
      edit_request_id,
      student_id,
      subject_name,
      strand,
      term,
      original_grade,
      new_grade,
      corrected_by,
      approved_by,
      reason,
      approved_at
    } = data;

    await db.query(
      `INSERT INTO grade_edit_audit 
        (edit_request_id, student_id, subject_name, strand, term,
         original_grade, new_grade, corrected_by, approved_by, 
         reason, approved_at, corrected_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [edit_request_id, student_id, subject_name, strand, term,
       original_grade, new_grade, corrected_by, approved_by,
       reason, approved_at]
    );
  },

  /**
   * Get audit history
   */
  async getAuditHistory(filters = {}) {
    let query = `
      SELECT 
        gea.*,
        t.teacher_id,
        t.full_name AS teacher_name,
        s.full_name AS student_name
      FROM grade_edit_audit gea
      JOIN teachers t ON gea.corrected_by = t.id
      JOIN students s ON gea.student_id = s.student_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.student_id) {
      query += ` AND gea.student_id = ?`;
      params.push(filters.student_id);
    }
    
    if (filters.term) {
      query += ` AND gea.term = ?`;
      params.push(filters.term);
    }
    
    query += ` ORDER BY gea.corrected_at DESC`;
    
    const [rows] = await db.query(query, params);
    return rows;
  }

};

module.exports = GradeEditRequestModel;
