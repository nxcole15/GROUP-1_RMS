/**
 * modules/gradeRequests/gradeRequestController.js
 */
const db = require("../../config/db");
const GradeRequestModel = require("./gradeRequestModel");

/* ── Notification helpers ── */
async function notifyStudent(student_id, message, type = "system") {
  try {
    await db.query(
      `INSERT INTO notifications (student_id, message, type) VALUES (?, ?, ?)`,
      [student_id, message, type]
    );
  } catch (_) { /* non-fatal */ }
}

async function notifyStaff(recipient, role, title, message, type = "grade_request") {
  try {
    await db.query(
      `INSERT INTO staff_notifications (recipient, role, title, message, type) VALUES (?, ?, ?, ?, ?)`,
      [recipient, role, title, message, type]
    );
  } catch (_) { /* non-fatal */ }
}

async function notifyAllAdmins(role, title, message) {
  try {
    const [admins] = await db.query(`SELECT admin_id FROM admins WHERE role = ?`, [role]);
    for (const admin of admins) {
      await notifyStaff(admin.admin_id, role, title, message);
    }
  } catch (_) { /* non-fatal */ }
}

/* ── Student ── */
async function studentSubmitRequest(req, res, next) {
  try {
    const { student_id } = req.student;
    const { subject_id, term } = req.body;
    if (!subject_id) return res.status(400).json({ error: "subject_id is required." });
    if (!term) return res.status(400).json({ error: "term is required." });

    // Validate term value
    if (!["Term 1", "Term 2", "Term 3"].includes(term)) {
      return res.status(400).json({ error: "Invalid term. Must be Term 1, Term 2, or Term 3." });
    }

    // Check if grade requests are open for the requested term
    const [configCheck] = await db.query(
      "SELECT is_open FROM grade_request_config WHERE term = ? LIMIT 1", [term]
    );
    if (!configCheck[0]?.is_open) {
      return res.status(403).json({ error: `Grade requests are currently closed for ${term}.` });
    }

    // Get teacher for this subject
    const [subRows] = await db.query(
      "SELECT teacher_id FROM subjects WHERE id = ? LIMIT 1", [subject_id]
    );
    if (!subRows[0]) return res.status(404).json({ error: "Subject not found." });

    // Check for duplicate
    const [existing] = await db.query(
      `SELECT id FROM grade_requests WHERE student_id = ? AND subject_id = ? AND term = ?
       AND status NOT IN ('rejected', 'released_to_student') LIMIT 1`,
      [student_id, subject_id, term]
    );
    if (existing[0]) return res.status(409).json({ error: "You already have a pending request for this subject in this term." });

    const request = await GradeRequestModel.create({
      student_id, subject_id,
      teacher_id: subRows[0].teacher_id, term
    });

    // Notify the teacher
    const [teacherRow] = await db.query(`SELECT teacher_id FROM teachers WHERE id = ? LIMIT 1`, [subRows[0].teacher_id]);
    if (teacherRow[0]) {
      const [subName] = await db.query(`SELECT name FROM subjects WHERE id = ? LIMIT 1`, [subject_id]);
      await notifyStaff(
        teacherRow[0].teacher_id, "teacher",
        "New Grade Request",
        `${student_id} has requested a grade for ${subName[0]?.name || "a subject"} — ${term}.`
      );
    }

    res.status(201).json({ message: "Grade request submitted.", request });
  } catch (err) { next(err); }
}

async function studentGetRequests(req, res, next) {
  try {
    const requests = await GradeRequestModel.findByStudent(req.student.student_id);
    res.json({ requests });
  } catch (err) { next(err); }
}

/* ── Teacher ── */
async function teacherGetRequests(req, res, next) {
  try {
    const requests = await GradeRequestModel.findByTeacher(req.teacher.id);
    res.json({ requests });
  } catch (err) { next(err); }
}

async function teacherSubmitGrade(req, res, next) {
  try {
    const { id } = req.params;
    const { score, remarks } = req.body;
    if (score === undefined) return res.status(400).json({ error: "score is required." });
    if (score < 0 || score > 100) return res.status(400).json({ error: "Score must be between 0 and 100." });

    const request = await GradeRequestModel.findById(id);
    if (!request) return res.status(404).json({ error: "Request not found." });
    if (request.status !== "student_requested" && request.status !== "teacher_calculating") {
      return res.status(409).json({ error: "This request cannot be updated at this stage." });
    }

    const s = Number(score);
    const updated = await GradeRequestModel.updateStatus(id, "registrar_review", {
        score: s, remarks: remarks || ""
    });

    // Notify all registrars
    await notifyAllAdmins(
      "registrar",
      "Grade Submitted for Review",
      `${request.student_name} — ${request.subject_name} (${request.term}): Score ${s}. Awaiting your review.`
    );

    res.json({ message: "Grade submitted. Sent to Registrar for review.", request: updated });
  } catch (err) { next(err); }
}

async function teacherReleaseGrade(req, res, next) {
  try {
    const { id } = req.params;
    const request = await GradeRequestModel.findById(id);
    if (!request) return res.status(404).json({ error: "Request not found." });
    if (request.status !== "registrar_released") {
      return res.status(409).json({ error: "Request is not ready for teacher release." });
    }
    const updated = await GradeRequestModel.updateStatus(id, "released_to_student");

    // Notify student that grade is released
    await notifyStudent(
      request.student_id,
      `Your ${request.term} grade for ${request.subject_name} has been released. Check your Grades panel.`,
      "grade"
    );

    res.json({ message: "Grade released to student.", request: updated });
  } catch (err) { next(err); }
}

/* ── Registrar ── */
async function registrarGetRequests(req, res, next) {
  try {
    const requests = await GradeRequestModel.findAll();
    res.json({ requests });
  } catch (err) { next(err); }
}

async function registrarSendToPrincipal(req, res, next) {
  try {
    const { id } = req.params;
    const { registrar_note } = req.body;
    const request = await GradeRequestModel.findById(id);
    if (!request) return res.status(404).json({ error: "Request not found." });
    if (request.status !== "registrar_review") {
      return res.status(409).json({ error: "Request is not in registrar review stage." });
    }
    const updated = await GradeRequestModel.updateStatus(id, "principal_review", { registrar_note });

    // Notify all principals
    await notifyAllAdmins(
      "principal",
      "Grade Request Needs Approval",
      `${request.student_name} — ${request.subject_name} (${request.term}): Score ${request.score}. Sent by Registrar for your approval.`
    );

    res.json({ message: "Sent to Principal for approval.", request: updated });
  } catch (err) { next(err); }
}

async function registrarReleaseToTeacher(req, res, next) {
  try {
    const { id } = req.params;
    const request = await GradeRequestModel.findById(id);
    if (!request) return res.status(404).json({ error: "Request not found." });
    if (request.status !== "principal_approved") {
      return res.status(409).json({ error: "Principal has not approved this request yet." });
    }
    const updated = await GradeRequestModel.updateStatus(id, "registrar_released");

    // Notify teacher to release grade to student
    const [teacherRow] = await db.query(`SELECT teacher_id FROM teachers WHERE id = ? LIMIT 1`, [request.teacher_id]);
    if (teacherRow[0]) {
      await notifyStaff(
        teacherRow[0].teacher_id, "teacher",
        "Grade Approved — Release to Student",
        `${request.student_name}'s grade for ${request.subject_name} (${request.term}) was approved. Please release it to the student.`
      );
    }

    res.json({ message: "Sent back to teacher for release.", request: updated });
  } catch (err) { next(err); }
}

/* ── Principal ── */
async function principalGetRequests(req, res, next) {
  try {
    const requests = await GradeRequestModel.findAll();
    res.json({ requests });
  } catch (err) { next(err); }
}

async function principalApprove(req, res, next) {
  try {
    const { id } = req.params;
    const { principal_note } = req.body;
    const request = await GradeRequestModel.findById(id);
    if (!request) return res.status(404).json({ error: "Request not found." });
    if (request.status !== "principal_review") {
      return res.status(409).json({ error: "Request is not in principal review stage." });
    }
    const updated = await GradeRequestModel.updateStatus(id, "principal_approved", { principal_note });

    // Notify all registrars that principal approved
    await notifyAllAdmins(
      "registrar",
      "Grade Approved by Principal",
      `${request.student_name} — ${request.subject_name} (${request.term}): Approved. Please release to teacher.`
    );

    res.json({ message: "Grade approved. Sent back to Registrar.", request: updated });
  } catch (err) { next(err); }
}

async function principalReject(req, res, next) {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    if (!rejection_reason) return res.status(400).json({ error: "rejection_reason is required." });
    const request = await GradeRequestModel.findById(id);
    if (!request) return res.status(404).json({ error: "Request not found." });

    // Send back to teacher for correction instead of hard reject
    const updated = await GradeRequestModel.updateStatus(id, "teacher_calculating", {
      rejection_reason, rejected_by: "principal"
    });

    // Notify teacher to resubmit with corrected grade
    const [teacherRow] = await db.query(`SELECT teacher_id FROM teachers WHERE id = ? LIMIT 1`, [request.teacher_id]);
    if (teacherRow[0]) {
      await notifyStaff(
        teacherRow[0].teacher_id, "teacher",
        "Grade Returned — Correction Required",
        `Principal returned ${request.student_name}'s grade request for ${request.subject_name} (${request.term}). Reason: ${rejection_reason}. Please re-enter the grade.`
      );
    }

    // Notify registrar as well
    await notifyAllAdmins(
      "registrar",
      "Grade Returned by Principal",
      `${request.student_name} — ${request.subject_name} (${request.term}): Returned to teacher for correction. Reason: ${rejection_reason}`
    );

    res.json({ message: "Grade returned to teacher for correction.", request: updated });
  } catch (err) { next(err); }
}

async function principalOpenRequests(req, res, next) {
  try {
    const { term } = req.body;
    if (!["Term 1", "Term 2", "Term 3"].includes(term)) {
      return res.status(400).json({ error: "Invalid term. Must be Term 1, Term 2, or Term 3." });
    }
    await db.query(
      `UPDATE grade_request_config SET is_open = 1, opened_by = ?, opened_at = NOW()
       WHERE term = ?`,
      [req.admin.admin_id, term]
    );

    // Notify all enrolled students that grade request window is open
    try {
      const [students] = await db.query(`SELECT DISTINCT student_id FROM enrollments WHERE status = 'approved'`);
      for (const s of students) {
        await notifyStudent(
          s.student_id,
          `📋 Grade request window is now open for ${term}. Go to My Grades to request your grades.`,
          "system"
        );
      }
    } catch (_) { /* non-fatal */ }

    res.json({ message: `Grade requests opened for ${term}.` });
  } catch (err) { next(err); }
}

async function principalCloseRequests(req, res, next) {
  try {
    const { term } = req.body;
    if (!["Term 1", "Term 2", "Term 3"].includes(term)) {
      return res.status(400).json({ error: "Invalid term." });
    }
    await db.query(
      `UPDATE grade_request_config SET is_open = 0, closed_by = ?, closed_at = NOW()
       WHERE term = ?`,
      [req.admin.admin_id, term]
    );
    res.json({ message: `Grade requests closed for ${term}.` });
  } catch (err) { next(err); }
}

async function getRequestConfig(req, res, next) {
  try {
    const [rows] = await db.query("SELECT * FROM grade_request_config ORDER BY id");
    res.json({ config: rows });
  } catch (err) { next(err); }
}

/* ── Staff Notifications ── */
async function getStaffNotifications(req, res, next) {
  try {
    // recipient comes from either req.teacher or req.admin
    const recipient = req.teacher?.teacher_id || req.admin?.admin_id;
    if (!recipient) return res.status(401).json({ error: "Not authenticated." });
    const [rows] = await db.query(
      `SELECT * FROM staff_notifications WHERE recipient = ? ORDER BY created_at DESC LIMIT 50`,
      [recipient]
    );
    res.json({ notifications: rows });
  } catch (err) { next(err); }
}

async function markStaffNotificationsRead(req, res, next) {
  try {
    const recipient = req.teacher?.teacher_id || req.admin?.admin_id;
    if (!recipient) return res.status(401).json({ error: "Not authenticated." });
    await db.query(
      `UPDATE staff_notifications SET is_read = 1 WHERE recipient = ?`,
      [recipient]
    );
    res.json({ message: "All notifications marked as read." });
  } catch (err) { next(err); }
}


module.exports = {
  studentSubmitRequest, studentGetRequests,
  teacherGetRequests, teacherSubmitGrade, teacherReleaseGrade,
  registrarGetRequests, registrarSendToPrincipal, registrarReleaseToTeacher,
  principalGetRequests, principalApprove, principalReject,
  principalOpenRequests, principalCloseRequests, getRequestConfig,
  getStaffNotifications, markStaffNotificationsRead,
};

