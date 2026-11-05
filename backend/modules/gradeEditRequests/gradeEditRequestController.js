/**
 * modules/gradeEditRequests/gradeEditRequestController.js
 * Controller for teacher-initiated grade correction requests
 */
const db = require("../../config/db");
const GradeEditRequestModel = require("./gradeEditRequestModel");

/* ── Teacher Actions ── */

/**
 * Teacher submits a request to edit a grade
 */
async function teacherSubmitRequest(req, res, next) {
  try {
    const teacher_id = req.teacher?.id;
    const {
      student_id,
      subject_name,
      strand,
      term,
      original_grade,
      proposed_grade,
      reason
    } = req.body;

    // Validation
    if (!student_id || !subject_name || !term || !original_grade || !reason) {
      return res.status(400).json({ 
        error: "student_id, subject_name, term, original_grade, and reason are required." 
      });
    }

    if (!['Term 1', 'Term 2', 'Term 3'].includes(term)) {
      return res.status(400).json({ error: "Invalid term." });
    }

    // Check if already has pending request for this grade
    const hasPending = await GradeEditRequestModel.hasPendingRequest(
      teacher_id, student_id, subject_name, term
    );

    if (hasPending) {
      return res.status(409).json({ 
        error: "You already have a pending or approved request for this grade." 
      });
    }

    // Verify the original grade exists
    const [gradeCheck] = await db.query(
      `SELECT id, percentage FROM grades 
       WHERE student_id = ? 
         AND subject_name = ? 
         AND term = ?
         AND submission_status IN ('submitted', 'approved')
       LIMIT 1`,
      [student_id, subject_name, term]
    );

    if (!gradeCheck[0]) {
      return res.status(404).json({ 
        error: "No submitted grade found for this student and subject." 
      });
    }

    // Create the request
    const request = await GradeEditRequestModel.create({
      teacher_id,
      student_id,
      subject_name,
      strand: strand || null,
      term,
      original_grade,
      proposed_grade: proposed_grade || null,
      reason
    });

    res.status(201).json({ 
      message: "Grade edit request submitted to Principal for approval.", 
      request 
    });
  } catch (err) {
    console.error('teacherSubmitRequest error:', err);
    next(err);
  }
}

/**
 * Teacher gets their own edit requests
 */
async function teacherGetRequests(req, res, next) {
  try {
    const teacher_id = req.teacher?.id;
    const requests = await GradeEditRequestModel.findByTeacher(teacher_id);
    res.json({ requests });
  } catch (err) {
    next(err);
  }
}

/**
 * Teacher applies approved correction
 */
async function teacherApplyCorrection(req, res, next) {
  const conn = await db.getConnection();
  
  try {
    await conn.beginTransaction();

    const teacher_id = req.teacher?.id;
    const { id } = req.params;
    const { corrected_grade } = req.body;

    if (corrected_grade === undefined || corrected_grade < 0 || corrected_grade > 100) {
      await conn.rollback();
      return res.status(400).json({ 
        error: "corrected_grade is required and must be between 0 and 100." 
      });
    }

    // Get the request
    const request = await GradeEditRequestModel.findById(id);

    if (!request) {
      await conn.rollback();
      return res.status(404).json({ error: "Request not found." });
    }

    // Verify ownership - compare numeric teacher IDs
    // request.teacher_db_id is the numeric ID from teachers.id
    // req.teacher.id is also numeric (from JWT payload)
    const requestTeacherId = request.teacher_db_id || request.teacher_id;
    
    if (requestTeacherId !== teacher_id) {
      await conn.rollback();
      return res.status(403).json({ error: "This request does not belong to you." });
    }

    // Verify it's approved
    if (request.status !== 'approved') {
      await conn.rollback();
      return res.status(409).json({ error: "This request has not been approved yet." });
    }

    // Update the grade in grades table
    const [updateResult] = await conn.query(
      `UPDATE grades 
       SET percentage = ?,
           updated_at = NOW()
       WHERE student_id = ? 
         AND subject_name = ? 
         AND term = ?`,
      [corrected_grade, request.student_id, request.subject_name, request.term]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Grade not found to update." });
    }

    // Mark request as completed
    await GradeEditRequestModel.complete(id, corrected_grade);

    // Create audit log
    await GradeEditRequestModel.createAuditLog({
      edit_request_id: id,
      student_id: request.student_id,
      subject_name: request.subject_name,
      strand: request.strand,
      term: request.term,
      original_grade: request.original_grade,
      new_grade: corrected_grade,
      corrected_by: teacher_id,
      approved_by: request.approved_by,
      reason: request.reason,
      approved_at: request.approved_at
    });

    await conn.commit();

    res.json({ 
      message: "Grade correction applied successfully.", 
      new_grade: corrected_grade 
    });
  } catch (err) {
    await conn.rollback();
    console.error('teacherApplyCorrection error:', err);
    next(err);
  } finally {
    conn.release();
  }
}

/* ── Principal Actions ── */

/**
 * Principal gets all edit requests
 */
async function principalGetRequests(req, res, next) {
  try {
    const { status, term, teacher_id, subject_name } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (term) filters.term = term;
    if (teacher_id) filters.teacher_id = parseInt(teacher_id);
    if (subject_name) filters.subject_name = subject_name;

    const requests = await GradeEditRequestModel.findAll(filters);
    res.json({ requests });
  } catch (err) {
    console.error('principalGetRequests error:', err);
    next(err);
  }
}

/**
 * Principal approves edit request
 */
async function principalApprove(req, res, next) {
  try {
    const { id } = req.params;
    const approved_by = req.admin?.admin_id;

    const request = await GradeEditRequestModel.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    if (request.status !== 'pending') {
      return res.status(409).json({ 
        error: "Request is not pending. Current status: " + request.status 
      });
    }

    const updated = await GradeEditRequestModel.approve(id, approved_by);

    res.json({ 
      message: "Grade edit request approved. Teacher can now make the correction.", 
      request: updated 
    });
  } catch (err) {
    console.error('principalApprove error:', err);
    next(err);
  }
}

/**
 * Principal rejects edit request
 */
async function principalReject(req, res, next) {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const rejected_by = req.admin?.admin_id;

    if (!rejection_reason) {
      return res.status(400).json({ error: "rejection_reason is required." });
    }

    const request = await GradeEditRequestModel.findById(id);

    if (!request) {
      return res.status(404).json({ error: "Request not found." });
    }

    if (request.status !== 'pending') {
      return res.status(409).json({ 
        error: "Request is not pending. Current status: " + request.status 
      });
    }

    const updated = await GradeEditRequestModel.reject(id, rejected_by, rejection_reason);

    res.json({ 
      message: "Grade edit request rejected.", 
      request: updated 
    });
  } catch (err) {
    console.error('principalReject error:', err);
    next(err);
  }
}

/**
 * Get audit history
 */
async function getAuditHistory(req, res, next) {
  try {
    const { student_id, term } = req.query;
    
    const filters = {};
    if (student_id) filters.student_id = student_id;
    if (term) filters.term = term;

    const history = await GradeEditRequestModel.getAuditHistory(filters);
    res.json({ history });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  teacherSubmitRequest,
  teacherGetRequests,
  teacherApplyCorrection,
  principalGetRequests,
  principalApprove,
  principalReject,
  getAuditHistory
};
