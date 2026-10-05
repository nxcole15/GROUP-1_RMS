/**
 * modules/admin/adminGradeReviewController.js
 * Principal endpoints for reviewing and approving teacher grade submissions
 */
const pool = require("../../config/db");

/**
 * Get all pending grade submissions across all teachers
 * Principal dashboard view
 */
async function getPendingSubmissions(req, res, next) {
  try {
    // Since grades are auto-approved now, show both 'submitted' (old system) and 'approved' (new system)
    const [submissions] = await pool.query(`
      SELECT 
        b.id,
        b.teacher_id,
        b.subject_id,
        b.subject_name,
        b.strand,
        b.term,
        b.status,
        b.total_students,
        b.submitted_at,
        b.notes,
        t.teacher_id as teacher_code,
        t.full_name as teacher_name,
        s.code as subject_code,
        s.name as subject_name,
        -- Use subject_name+strand if available, otherwise use old subject name
        COALESCE(b.subject_name, s.name) as display_subject_name,
        b.strand as display_strand
      FROM grade_submission_batches b
      INNER JOIN teachers t ON b.teacher_id = t.id
      LEFT JOIN subjects s ON b.subject_id = s.id
      WHERE b.status IN ('submitted', 'approved')
      ORDER BY b.submitted_at DESC
    `);

    res.json({
      submissions,
      total: submissions.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all submissions (all statuses) with filters
 */
async function getAllSubmissions(req, res, next) {
  try {
    const { status, term, teacher_id } = req.query;
    
    let query = `
      SELECT 
        b.id,
        b.teacher_id,
        b.subject_id,
        b.subject_name,
        b.strand,
        b.term,
        b.status,
        b.total_students,
        b.submitted_at,
        b.approved_by,
        b.approved_at,
        b.return_reason,
        b.notes,
        t.teacher_id as teacher_code,
        t.full_name as teacher_name,
        s.code as subject_code,
        s.name as subject_name,
        -- Use subject_name+strand if available, otherwise use old subject name
        COALESCE(b.subject_name, s.name) as display_subject_name,
        b.strand as display_strand
      FROM grade_submission_batches b
      INNER JOIN teachers t ON b.teacher_id = t.id
      LEFT JOIN subjects s ON b.subject_id = s.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ` AND b.status = ?`;
      params.push(status);
    }
    
    if (term) {
      query += ` AND b.term = ?`;
      params.push(term);
    }
    
    if (teacher_id) {
      query += ` AND t.teacher_id = ?`;
      params.push(teacher_id);
    }
    
    query += ` ORDER BY b.submitted_at DESC`;
    
    const [submissions] = await pool.query(query, params);

    res.json({
      submissions,
      total: submissions.length,
      filters: { status, term, teacher_id }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get detailed view of a submission including all student grades
 * Supports both old (subject_id) and new (subject_name + strand) systems
 */
async function getSubmissionDetails(req, res, next) {
  try {
    const { batch_id } = req.params;

    // Get batch info - support both systems
    const [batch] = await pool.query(`
      SELECT 
        b.id,
        b.teacher_id,
        b.subject_id,
        b.subject_name,
        b.strand,
        b.term,
        b.status,
        b.total_students,
        b.submitted_at,
        b.approved_by,
        b.approved_at,
        b.return_reason,
        b.notes,
        t.teacher_id as teacher_code,
        t.full_name as teacher_name,
        t.email as teacher_email,
        s.code as subject_code,
        s.name as subject_name_old,
        s.units,
        COALESCE(b.subject_name, s.name) as display_subject_name,
        b.strand as display_strand
      FROM grade_submission_batches b
      INNER JOIN teachers t ON b.teacher_id = t.id
      LEFT JOIN subjects s ON b.subject_id = s.id
      WHERE b.id = ?
    `, [batch_id]);

    if (batch.length === 0) {
      return res.status(404).json({ error: "Submission not found." });
    }

    const batchData = batch[0];
    const useNewSystem = batchData.subject_name && batchData.strand;

    // Get all grades in this submission
    let grades;
    if (useNewSystem) {
      [grades] = await pool.query(`
        SELECT 
          g.id,
          g.student_id,
          g.percentage,
          g.submission_status,
          g.submitted_at,
          s.full_name as student_name,
          s.pathway,
          s.grade_level
        FROM grades g
        INNER JOIN students s ON g.student_id = s.student_id
        WHERE g.teacher_id = ? 
          AND g.subject_name = ?
          AND g.strand = ?
          AND g.term = ?
          AND g.submission_status IN ('submitted', 'approved', 'returned')
        ORDER BY s.full_name ASC
      `, [batchData.teacher_id, batchData.subject_name, batchData.strand, batchData.term]);
    } else {
      [grades] = await pool.query(`
        SELECT 
          g.id,
          g.student_id,
          g.percentage,
          g.submission_status,
          g.submitted_at,
          s.full_name as student_name,
          s.pathway,
          s.grade_level
        FROM grades g
        INNER JOIN students s ON g.student_id = s.student_id
        WHERE g.teacher_id = ? 
          AND g.subject_id = ? 
          AND g.term = ?
          AND g.submission_status IN ('submitted', 'approved', 'returned')
        ORDER BY s.full_name ASC
      `, [batchData.teacher_id, batchData.subject_id, batchData.term]);
    }

    // Calculate statistics
    const percentages = grades.map(g => g.percentage).filter(p => p !== null);
    const average = percentages.length 
      ? percentages.reduce((a, b) => a + b, 0) / percentages.length 
      : 0;
    const highest = percentages.length ? Math.max(...percentages) : 0;
    const lowest = percentages.length ? Math.min(...percentages) : 0;
    const passing = percentages.filter(p => p >= 75).length;

    res.json({
      batch: batchData,
      grades,
      statistics: {
        total_students: grades.length,
        average: Math.round(average * 100) / 100,
        highest,
        lowest,
        passing,
        passing_rate: grades.length > 0 ? Math.round((passing / grades.length) * 100) : 0
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Approve a grade submission batch
 * Changes all grades from submitted to approved
 */
async function approveSubmission(req, res, next) {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    const { batch_id } = req.params;
    const adminId = req.admin?.admin_id;
    const { notes } = req.body;

    // Get batch info
    const [batch] = await conn.query(
      `SELECT teacher_id, subject_id, term, status, total_students 
       FROM grade_submission_batches 
       WHERE id = ?`,
      [batch_id]
    );

    if (batch.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Submission not found." });
    }

    if (batch[0].status !== 'submitted') {
      await conn.rollback();
      return res.status(400).json({ 
        error: `Cannot approve. Current status is ${batch[0].status}.` 
      });
    }

    // Update batch status
    await conn.query(
      `UPDATE grade_submission_batches 
       SET status = 'approved', 
           approved_by = ?, 
           approved_at = NOW(),
           notes = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [adminId, notes || null, batch_id]
    );

    // Update all grades in this batch
    await conn.query(
      `UPDATE grades 
       SET submission_status = 'approved',
           approved_by = ?,
           approved_at = NOW(),
           updated_at = NOW()
       WHERE teacher_id = ? 
         AND subject_id = ? 
         AND term = ?
         AND submission_status = 'submitted'`,
      [adminId, batch[0].teacher_id, batch[0].subject_id, batch[0].term]
    );

    // Get all grade IDs for audit log
    const [gradeIds] = await conn.query(
      `SELECT id, student_id, percentage 
       FROM grades 
       WHERE teacher_id = ? 
         AND subject_id = ? 
         AND term = ?`,
      [batch[0].teacher_id, batch[0].subject_id, batch[0].term]
    );

    // Log approval for each grade
    for (const grade of gradeIds) {
      await conn.query(
        `INSERT INTO grade_audit_log 
         (grade_id, student_id, subject_id, term, action, new_percentage, old_status, new_status, changed_by_type, changed_by_id, notes, created_at)
         VALUES (?, ?, ?, ?, 'approved', ?, 'submitted', 'approved', 'admin', ?, ?, NOW())`,
        [grade.id, grade.student_id, batch[0].subject_id, batch[0].term, grade.percentage, adminId, notes || null]
      );
    }

    await conn.commit();

    res.json({
      message: "Grade submission approved successfully.",
      batch_id,
      total_grades: gradeIds.length,
      approved_by: adminId,
      approved_at: new Date()
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * Return a grade submission batch to teacher for revision
 * Changes status back to 'returned' with reason
 */
async function returnSubmission(req, res, next) {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    const { batch_id } = req.params;
    const adminId = req.admin?.admin_id;
    const { return_reason } = req.body;

    if (!return_reason || return_reason.trim() === '') {
      await conn.rollback();
      return res.status(400).json({ 
        error: "return_reason is required when returning a submission." 
      });
    }

    // Get batch info
    const [batch] = await conn.query(
      `SELECT teacher_id, subject_id, term, status 
       FROM grade_submission_batches 
       WHERE id = ?`,
      [batch_id]
    );

    if (batch.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Submission not found." });
    }

    if (batch[0].status !== 'submitted') {
      await conn.rollback();
      return res.status(400).json({ 
        error: `Cannot return. Current status is ${batch[0].status}.` 
      });
    }

    // Update batch status
    await conn.query(
      `UPDATE grade_submission_batches 
       SET status = 'returned', 
           return_reason = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [return_reason, batch_id]
    );

    // Update all grades in this batch
    await conn.query(
      `UPDATE grades 
       SET submission_status = 'returned',
           return_reason = ?,
           updated_at = NOW()
       WHERE teacher_id = ? 
         AND subject_id = ? 
         AND term = ?
         AND submission_status = 'submitted'`,
      [return_reason, batch[0].teacher_id, batch[0].subject_id, batch[0].term]
    );

    // Get all grade IDs for audit log
    const [gradeIds] = await conn.query(
      `SELECT id, student_id, percentage 
       FROM grades 
       WHERE teacher_id = ? 
         AND subject_id = ? 
         AND term = ?`,
      [batch[0].teacher_id, batch[0].subject_id, batch[0].term]
    );

    // Log return for each grade
    for (const grade of gradeIds) {
      await conn.query(
        `INSERT INTO grade_audit_log 
         (grade_id, student_id, subject_id, term, action, new_percentage, old_status, new_status, changed_by_type, changed_by_id, notes, created_at)
         VALUES (?, ?, ?, ?, 'returned', ?, 'submitted', 'returned', 'admin', ?, ?, NOW())`,
        [grade.id, grade.student_id, batch[0].subject_id, batch[0].term, grade.percentage, adminId, return_reason]
      );
    }

    await conn.commit();

    res.json({
      message: "Grade submission returned to teacher for revision.",
      batch_id,
      return_reason,
      total_grades: gradeIds.length
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * Get statistics dashboard for principal
 */
async function getGradeSubmissionStats(req, res, next) {
  try {
    const { term } = req.query;

    let termFilter = '';
    const params = [];
    
    if (term) {
      termFilter = 'WHERE b.term = ?';
      params.push(term);
    }

    // Get counts by status
    const [statusCounts] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_students) as total_grades
      FROM grade_submission_batches b
      ${termFilter}
      GROUP BY status
    `, params);

    // Get recent submissions
    const [recentSubmissions] = await pool.query(`
      SELECT 
        b.id,
        b.term,
        b.status,
        b.submitted_at,
        t.full_name as teacher_name,
        s.name as subject_name,
        b.total_students
      FROM grade_submission_batches b
      INNER JOIN teachers t ON b.teacher_id = t.id
      INNER JOIN subjects s ON b.subject_id = s.id
      ${termFilter}
      ORDER BY b.submitted_at DESC
      LIMIT 10
    `, params);

    res.json({
      status_summary: statusCounts,
      recent_submissions: recentSubmissions,
      term: term || 'all'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPendingSubmissions,
  getAllSubmissions,
  getSubmissionDetails,
  approveSubmission,
  returnSubmission,
  getGradeSubmissionStats
};
