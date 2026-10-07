/**
 * modules/teacher/teacherGradeSubmissionController.js
 * Handles batch grade submission workflow with status tracking
 */
const pool = require("../../config/db");
const ConfigModel = require("../shared/configModel");

/**
 * ✨ UPDATED - Get all students in a class with their grades
 * Now works with subject_name + strand + term (new scheduling system)
 * 
 * Query params: ?subject_name=Mathematics&strand=Academic Track - STEM&term=Term 1
 */
async function getStudentsWithGradesForClass(req, res, next) {
  try {
    const { subject_name, strand, term } = req.query;
    const teacherDbId = req.teacher?.id;

    // Validation
    if (!subject_name || !strand || !term) {
      return res.status(400).json({
        error: "subject_name, strand, and term are required query parameters"
      });
    }

    // Query explanation:
    // 1. Find all teacher_schedules for this teacher with matching subject+strand+term
    // 2. Find all students enrolled in those schedules
    // 3. Left join with grades table to get existing grades
    // 4. Include submission window status
    const [students] = await pool.query(`
      SELECT DISTINCT
        s.student_id,
        s.full_name,
        s.pathway,
        s.grade_level,
        s.email,
        ea.photo_url,
        g.id as grade_id,
        g.percentage,
        g.submission_status,
        g.submitted_at,
        g.return_reason,
        g.updated_at
      FROM students s
      INNER JOIN student_schedule_enrollments sse ON s.student_id = sse.student_id
      INNER JOIN teacher_schedules ts ON sse.teacher_schedule_id = ts.id
      INNER JOIN teachers t ON ts.teacher_id = t.id
      LEFT JOIN enrollment_applications ea ON s.student_id = ea.generated_student_id
      LEFT JOIN grades g ON g.student_id = s.student_id 
        AND g.subject_name = ? 
        AND g.strand = ?
        AND g.term = ?
      WHERE t.id = ?
        AND ts.subject_name = ?
        AND ts.strand = ?
        AND ts.term = ?
      ORDER BY s.full_name ASC
    `, [subject_name, strand, term, teacherDbId, subject_name, strand, term]);

    // Get submission batch status
    const [batchResult] = await pool.query(`
      SELECT 
        status,
        total_students,
        submitted_at,
        return_reason,
        notes
      FROM grade_submission_batches
      WHERE teacher_id = ? 
        AND subject_name = ?
        AND strand = ?
        AND term = ?
      LIMIT 1
    `, [teacherDbId, subject_name, strand, term]);

    // Check if submission window is open
    const [submissionConfig] = await pool.query(`
      SELECT 
        is_open,
        start_date,
        end_date,
        manual_override
      FROM grade_submission_config
      WHERE term = ?
      LIMIT 1
    `, [term]);

    const config = submissionConfig[0];
    const now = new Date();
    
    // Primary check: use is_open field (set by backend when opening/closing)
    // This is the source of truth set by admin actions
    let isOpen = config?.is_open === 1 || false;
    
    const daysRemaining = config?.end_date ? Math.ceil((new Date(config.end_date) - now) / (1000 * 60 * 60 * 24)) : 0;

    res.json({
      subject_name,
      strand,
      term,
      students,
      batch_status: batchResult[0] || null,
      total_students: students.length,
      submission_window: {
        is_open: isOpen,
        start_date: config?.start_date || null,
        end_date: config?.end_date || null,
        days_remaining: daysRemaining > 0 ? daysRemaining : 0,
        manual_override: config?.manual_override || null
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * OLD FUNCTION - Keep for backward compatibility with old subjects table
 * This is the original function that uses subject_id
 */
async function getSubjectStudentsWithGrades(req, res, next) {
  try {
    const { subject_id } = req.params;
    const teacherDbId = req.teacher?.id;
    const config = await ConfigModel.getEnrollmentConfig();
    const term = config.active_term;

    // Get all students enrolled in this subject
    const [students] = await pool.query(`
      SELECT DISTINCT
        s.student_id,
        s.full_name,
        s.pathway,
        s.grade_level,
        g.id as grade_id,
        g.percentage,
        g.submission_status,
        g.submitted_at,
        g.return_reason,
        g.updated_at
      FROM students s
      INNER JOIN enrollments e ON s.student_id = e.student_id
      INNER JOIN enrollment_subjects es ON e.id = es.enrollment_id
      LEFT JOIN grades g ON g.student_id = s.student_id 
        AND g.subject_id = ? 
        AND g.term = ?
      WHERE es.subject_id = ?
        AND e.status = 'approved'
        AND e.term = ?
      ORDER BY s.full_name ASC
    `, [subject_id, term, subject_id, term]);

    // Get submission batch status
    const [batchResult] = await pool.query(`
      SELECT 
        status,
        total_students,
        submitted_at,
        approved_by,
        approved_at,
        return_reason,
        notes
      FROM grade_submission_batches
      WHERE teacher_id = ? 
        AND subject_id = ? 
        AND term = ?
      LIMIT 1
    `, [teacherDbId, subject_id, term]);

    const batchStatus = batchResult[0] || null;

    res.json({
      subject_id,
      term,
      students,
      batch_status: batchStatus,
      total_students: students.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ✨ UPDATED - Save or update a single grade as draft
 * Now supports both old (subject_id) and new (subject_name + strand) systems
 */
async function saveDraftGrade(req, res, next) {
  try {
    const teacherDbId = req.teacher?.id;
    const { student_id, subject_id, subject_name, strand, percentage, term } = req.body;

    console.log(`[saveDraftGrade] Saving grade for student ${student_id}`);

    // Validation - need either subject_id OR (subject_name + strand)
    if (!student_id || percentage === undefined) {
      return res.status(400).json({
        error: "student_id and percentage are required."
      });
    }

    if (!subject_id && (!subject_name || !strand)) {
      return res.status(400).json({
        error: "Either subject_id OR (subject_name + strand) are required."
      });
    }

    if (!term) {
      return res.status(400).json({
        error: "term is required."
      });
    }

    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({ 
        error: "Percentage must be between 0 and 100." 
      });
    }

    // Determine which system to use
    const useNewSystem = subject_name && strand;

    // Check if grade already exists
    let existing;
    if (useNewSystem) {
      [existing] = await pool.query(
        `SELECT id, percentage, submission_status FROM grades 
         WHERE student_id = ? AND subject_name = ? AND strand = ? AND term = ?`,
        [student_id, subject_name, strand, term]
      );
    } else {
      [existing] = await pool.query(
        `SELECT id, percentage, submission_status FROM grades 
         WHERE student_id = ? AND subject_id = ? AND term = ?`,
        [student_id, subject_id, term]
      );
    }

    let gradeId;
    const oldPercentage = existing[0]?.percentage || null;
    const oldStatus = existing[0]?.submission_status || null;

    if (existing.length > 0) {
      // Check if already submitted (can't edit unless returned)
      if (existing[0].submission_status === 'submitted') {
        return res.status(400).json({
          error: "Grade already submitted. Wait for principal review."
        });
      }
      if (existing[0].submission_status === 'approved') {
        return res.status(400).json({
          error: "Grade already approved. Cannot be edited."
        });
      }

      // Update existing draft
      await pool.query(
        `UPDATE grades 
         SET percentage = ?, submission_status = 'draft', updated_at = NOW()
         WHERE id = ?`,
        [percentage, existing[0].id]
      );
      gradeId = existing[0].id;
      
      console.log(`[saveDraftGrade] Updated existing grade ID ${gradeId}`);
    } else {
      // Insert new draft grade
      if (useNewSystem) {
        const [result] = await pool.query(
          `INSERT INTO grades (student_id, subject_name, strand, teacher_id, percentage, term, submission_status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 'draft', NOW())`,
          [student_id, subject_name, strand, teacherDbId, percentage, term]
        );
        gradeId = result.insertId;
      } else {
        const [result] = await pool.query(
          `INSERT INTO grades (student_id, subject_id, teacher_id, percentage, term, submission_status, created_at)
           VALUES (?, ?, ?, ?, ?, 'draft', NOW())`,
          [student_id, subject_id, teacherDbId, percentage, term]
        );
        gradeId = result.insertId;
      }
      
      console.log(`[saveDraftGrade] Created new grade ID ${gradeId}`);
    }

    // Log the action
    if (useNewSystem) {
      await pool.query(
        `INSERT INTO grade_audit_log 
         (grade_id, student_id, subject_name, strand, term, action, old_percentage, new_percentage, old_status, new_status, changed_by_type, changed_by_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'teacher', ?, NOW())`,
        [gradeId, student_id, subject_name, strand, term, existing.length > 0 ? 'updated' : 'created', oldPercentage, percentage, oldStatus, req.teacher.teacher_id]
      );
    } else {
      await pool.query(
        `INSERT INTO grade_audit_log 
         (grade_id, student_id, subject_id, term, action, old_percentage, new_percentage, old_status, new_status, changed_by_type, changed_by_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'teacher', ?, NOW())`,
        [gradeId, student_id, subject_id, term, existing.length > 0 ? 'updated' : 'created', oldPercentage, percentage, oldStatus, req.teacher.teacher_id]
      );
    }

    res.json({
      message: "Grade saved as draft.",
      grade_id: gradeId,
      percentage,
      status: "draft",
      auto_saved: true // Flag for frontend to show "auto-saved" indicator
    });
  } catch (err) {
    console.error('[saveDraftGrade] Error:', err);
    next(err);
  }
}

/**
 * ✨ UPDATED - Submit all grades for a subject
 * NO principal approval needed - grades become final immediately!
 * Supports new scheduling system (subject_name + strand)
 */
async function submitGradesBatch(req, res, next) {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    const teacherDbId = req.teacher?.id;
    const { subject_id, subject_name, strand, term, notes } = req.body;

    console.log(`[submitGradesBatch] Teacher ${req.teacher.teacher_id} submitting grades`);

    // Validation - need either subject_id OR (subject_name + strand)
    const useNewSystem = subject_name && strand;
    
    if (!useNewSystem && !subject_id) {
      await conn.rollback();
      return res.status(400).json({ 
        error: "Either subject_id OR (subject_name + strand) required." 
      });
    }

    if (!term) {
      await conn.rollback();
      return res.status(400).json({ error: "term is required." });
    }

    // Check if grade submission is open for this term
    const [submissionConfig] = await conn.query(
      `SELECT is_open, manual_override, start_date, end_date 
       FROM grade_submission_config 
       WHERE term = ?`,
      [term]
    );

    // Primary check: use is_open field (source of truth)
    const config = submissionConfig[0];
    const isOpen = config?.is_open === 1;

    if (!isOpen) {
      await conn.rollback();
      return res.status(403).json({
        error: "Grade submission is currently closed for this term. Contact the principal to open submissions."
      });
    }

    // Get all draft/returned grades for this subject
    let grades;
    if (useNewSystem) {
      [grades] = await conn.query(
        `SELECT id, student_id, percentage 
         FROM grades 
         WHERE teacher_id = ? 
           AND subject_name = ?
           AND strand = ?
           AND term = ? 
           AND submission_status IN ('draft', 'returned')`,
        [teacherDbId, subject_name, strand, term]
      );
    } else {
      [grades] = await conn.query(
        `SELECT id, student_id, percentage 
         FROM grades 
         WHERE teacher_id = ? 
           AND subject_id = ? 
           AND term = ? 
           AND submission_status IN ('draft', 'returned')`,
        [teacherDbId, subject_id, term]
      );
    }

    if (grades.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        error: "No grades to submit. Please save grades before submitting."
      });
    }

    // Check if all enrolled students have grades
    let enrolledCount;
    if (useNewSystem) {
      // Count students in new scheduling system
      [enrolledCount] = await conn.query(
        `SELECT COUNT(DISTINCT sse.student_id) as total
         FROM student_schedule_enrollments sse
         INNER JOIN teacher_schedules ts ON sse.teacher_schedule_id = ts.id
         INNER JOIN teachers t ON ts.teacher_id = t.id
         WHERE t.id = ?
           AND ts.subject_name = ?
           AND ts.strand = ?
           AND ts.term = ?`,
        [teacherDbId, subject_name, strand, term]
      );
    } else {
      // Count students in old system
      [enrolledCount] = await conn.query(
        `SELECT COUNT(DISTINCT s.student_id) as total
         FROM students s
         INNER JOIN enrollments e ON s.student_id = e.student_id
         INNER JOIN enrollment_subjects es ON e.id = es.enrollment_id
         WHERE es.subject_id = ? 
           AND e.status = 'approved' 
           AND e.term = ?`,
        [subject_id, term]
      );
    }

    if (grades.length < enrolledCount[0].total) {
      await conn.rollback();
      return res.status(400).json({
        error: `Incomplete grades. You have ${grades.length} grades but ${enrolledCount[0].total} enrolled students.`,
        graded: grades.length,
        total: enrolledCount[0].total
      });
    }

    // ✨ NEW: No approval needed - mark as 'approved' immediately!
    if (useNewSystem) {
      await conn.query(
        `UPDATE grades 
         SET submission_status = 'approved',   -- Direct to approved!
             submitted_at = NOW(), 
             approved_at = NOW(),               -- Approved same time as submitted
             approved_by = 'auto',              -- System auto-approval
             updated_at = NOW()
         WHERE teacher_id = ? 
           AND subject_name = ?
           AND strand = ?
           AND term = ?
           AND submission_status IN ('draft', 'returned')`,
        [teacherDbId, subject_name, strand, term]
      );

      // Create submission batch record
      await conn.query(
        `INSERT INTO grade_submission_batches 
         (teacher_id, subject_name, strand, term, status, total_students, submitted_at, notes)
         VALUES (?, ?, ?, ?, 'approved', ?, NOW(), ?)
         ON DUPLICATE KEY UPDATE
           status = 'approved',
           total_students = VALUES(total_students),
           submitted_at = NOW(),
           notes = VALUES(notes),
           return_reason = NULL,
           updated_at = NOW()`,
        [teacherDbId, subject_name, strand, term, grades.length, notes || null]
      );
    } else {
      await conn.query(
        `UPDATE grades 
         SET submission_status = 'approved',
             submitted_at = NOW(),
             approved_at = NOW(),
             approved_by = 'auto',
             updated_at = NOW()
         WHERE teacher_id = ? 
           AND subject_id = ? 
           AND term = ?
           AND submission_status IN ('draft', 'returned')`,
        [teacherDbId, subject_id, term]
      );

      await conn.query(
        `INSERT INTO grade_submission_batches 
         (teacher_id, subject_id, term, status, total_students, submitted_at, notes)
         VALUES (?, ?, ?, 'approved', ?, NOW(), ?)
         ON DUPLICATE KEY UPDATE
           status = 'approved',
           total_students = VALUES(total_students),
           submitted_at = NOW(),
           notes = VALUES(notes),
           return_reason = NULL,
           updated_at = NOW()`,
        [teacherDbId, subject_id, term, grades.length, notes || null]
      );
    }

    // Log submission for each grade
    for (const grade of grades) {
      if (useNewSystem) {
        await conn.query(
          `INSERT INTO grade_audit_log 
           (grade_id, student_id, subject_name, strand, term, action, new_percentage, old_status, new_status, changed_by_type, changed_by_id, notes, created_at)
           VALUES (?, ?, ?, ?, ?, 'approved', ?, 'draft', 'approved', 'teacher', ?, ?, NOW())`,
          [grade.id, grade.student_id, subject_name, strand, term, grade.percentage, req.teacher.teacher_id, notes || null]
        );
      } else {
        await conn.query(
          `INSERT INTO grade_audit_log 
           (grade_id, student_id, subject_id, term, action, new_percentage, old_status, new_status, changed_by_type, changed_by_id, notes, created_at)
           VALUES (?, ?, ?, ?, 'approved', ?, 'draft', 'approved', 'teacher', ?, ?, NOW())`,
          [grade.id, grade.student_id, subject_id, term, grade.percentage, req.teacher.teacher_id, notes || null]
        );
      }
    }

    await conn.commit();

    console.log(`[submitGradesBatch] Successfully submitted ${grades.length} grades`);

    res.json({
      message: "Grades submitted successfully! Grades are recorded in the system and can be released through grade requests.",
      total_submitted: grades.length,
      submitted_at: new Date(),
      status: "approved",
      note: "These grades are stored internally and not visible to students. Students must submit grade requests to receive their grades."
    });
  } catch (err) {
    await conn.rollback();
    console.error('[submitGradesBatch] Error:', err);
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * Get submission status for a specific subject
 */
async function getSubmissionStatus(req, res, next) {
  try {
    const teacherDbId = req.teacher?.id;
    const { subject_id } = req.params;
    const config = await ConfigModel.getEnrollmentConfig();
    const term = config.active_term;

    // Get batch status
    const [batch] = await pool.query(
      `SELECT 
         b.status,
         b.total_students,
         b.submitted_at,
         b.approved_by,
         b.approved_at,
         b.return_reason,
         b.notes,
         sub.name as subject_name,
         sub.code as subject_code
       FROM grade_submission_batches b
       INNER JOIN subjects sub ON b.subject_id = sub.id
       WHERE b.teacher_id = ? 
         AND b.subject_id = ? 
         AND b.term = ?`,
      [teacherDbId, subject_id, term]
    );

    // Count grades by status
    const [statusCounts] = await pool.query(
      `SELECT 
         submission_status,
         COUNT(*) as count
       FROM grades
       WHERE teacher_id = ? 
         AND subject_id = ? 
         AND term = ?
       GROUP BY submission_status`,
      [teacherDbId, subject_id, term]
    );

    // Check if submission is open
    const [submissionConfig] = await pool.query(
      `SELECT is_open, start_date, end_date, manual_override 
       FROM grade_submission_config 
       WHERE term = ?`,
      [term]
    );

    res.json({
      subject_id,
      term,
      batch: batch[0] || null,
      grade_counts: statusCounts,
      submission_open: submissionConfig[0]?.is_open || false,
      submission_config: submissionConfig[0] || null
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get teacher's subjects with submission summary
 */
async function getTeacherSubjectsWithStatus(req, res, next) {
  try {
    const teacherDbId = req.teacher?.id;
    const config = await ConfigModel.getEnrollmentConfig();
    const term = config.active_term;

    const [subjects] = await pool.query(`
      SELECT 
        s.id,
        s.code,
        s.name,
        s.units,
        COALESCE(b.status, 'not_started') as submission_status,
        b.total_students,
        b.submitted_at,
        b.approved_at,
        b.return_reason,
        (SELECT COUNT(*) 
         FROM grades g 
         WHERE g.subject_id = s.id 
           AND g.teacher_id = ? 
           AND g.term = ?) as grades_count,
        (SELECT COUNT(DISTINCT st.student_id)
         FROM students st
         INNER JOIN enrollments e ON st.student_id = e.student_id
         INNER JOIN enrollment_subjects es ON e.id = es.enrollment_id
         WHERE es.subject_id = s.id 
           AND e.status = 'approved'
           AND e.term = ?) as enrolled_count
      FROM subjects s
      LEFT JOIN grade_submission_batches b ON s.id = b.subject_id 
        AND b.teacher_id = ? 
        AND b.term = ?
      WHERE s.teacher_id = ?
      ORDER BY s.name ASC
    `, [teacherDbId, term, term, teacherDbId, term, teacherDbId]);

    res.json({
      term,
      subjects,
      total_subjects: subjects.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ✨ NEW FUNCTION - Get teacher's subjects from the NEW scheduling system
 * This replaces getTeacherSubjectsWithStatus for the new teacher_schedules architecture
 * 
 * Groups by: subject_name + strand + term
 * Why? Because a teacher might teach "Mathematics" to both STEM and HUMMS students
 */
async function getTeacherSubjectsForGrades(req, res, next) {
  try {
    const teacherId = req.teacher?.teacher_id; // Username like "TEACHER001"
    
    // Try to get config, but use defaults if not available
    let currentTerm = "Term 3";
    let schoolYear = new Date().getFullYear().toString();
    
    try {
      const config = await ConfigModel.getEnrollmentConfig();
      currentTerm = config.active_term || currentTerm;
      schoolYear = config.current_school_year || schoolYear;
    } catch (configErr) {
      console.warn('[getTeacherSubjectsForGrades] No enrollment config found, using defaults:', currentTerm, schoolYear);
    }

    console.log(`[getTeacherSubjectsForGrades] Loading subjects for teacher: ${teacherId}, term: ${currentTerm}, year: ${schoolYear}`);

    // Query explanation:
    // 1. Get all teacher_schedules for this teacher
    // 2. Group by subject_name, strand, term (unique combinations)
    // 3. Count students enrolled via student_schedule_enrollments
    // 4. Count how many students have grades entered
    // 5. Join with grade_submission_batches to see submission status
    const [subjects] = await pool.query(`
      SELECT 
        ts.subject_name,
        ts.strand,
        ts.term,
        -- Count total students across all sections of this subject+strand+term
        COUNT(DISTINCT sse.student_id) as total_students,
        -- Count how many students have grades (any status)
        COUNT(DISTINCT g.student_id) as graded_count,
        -- Collect all schedule IDs for this combination (for later queries)
        GROUP_CONCAT(DISTINCT ts.id) as schedule_ids,
        -- Get submission status if exists (use MAX to satisfy GROUP BY)
        MAX(b.status) as submission_status,
        MAX(b.submitted_at) as submitted_at,
        MAX(b.return_reason) as return_reason
      FROM teacher_schedules ts
      INNER JOIN teachers t ON ts.teacher_id = t.id
      LEFT JOIN student_schedule_enrollments sse ON ts.id = sse.teacher_schedule_id
      LEFT JOIN grades g ON sse.student_id = g.student_id 
        AND g.subject_name = ts.subject_name 
        AND g.strand = ts.strand 
        AND g.term = ts.term
      LEFT JOIN grade_submission_batches b ON b.teacher_id = t.id
        AND b.subject_name = ts.subject_name
        AND b.strand = ts.strand
        AND b.term = ts.term
      WHERE t.teacher_id = ?
      GROUP BY ts.subject_name, ts.strand, ts.term
      ORDER BY ts.term, ts.subject_name, ts.strand
    `, [teacherId]);

    console.log(`[getTeacherSubjectsForGrades] Found ${subjects.length} unique subject combinations`);

    // Calculate progress percentage for each subject
    const subjectsWithProgress = subjects.map(subj => ({
      ...subj,
      progress_percentage: subj.total_students > 0 
        ? Math.round((subj.graded_count / subj.total_students) * 100) 
        : 0,
      is_complete: subj.graded_count === subj.total_students && subj.total_students > 0
    }));

    res.json({
      current_term: currentTerm,
      school_year: schoolYear,
      subjects: subjectsWithProgress,
      total_subjects: subjects.length
    });
  } catch (err) {
    console.error('[getTeacherSubjectsForGrades] Error:', err);
    next(err);
  }
}

module.exports = {
  getSubjectStudentsWithGrades,      // OLD - uses subject_id
  getStudentsWithGradesForClass,     // ✨ NEW - uses subject_name+strand  
  saveDraftGrade,                    // UPDATED - supports both systems
  submitGradesBatch,                 // UPDATED - no approval, supports both
  getSubmissionStatus,               // Keep as-is
  getTeacherSubjectsWithStatus,      // OLD - uses subjects table
  getTeacherSubjectsForGrades        // ✨ NEW - uses teacher_schedules
};
