/**
 * modules/teacher/teacherDocumentController.js
 * Teacher document request handling
 */
const DocumentModel = require("../documents/documentModel");
const NotificationService = require("../notifications/notificationService");

async function getMyDocumentRequests(req, res, next) {
  try {
    const teacher_id = req.teacher.id; // Internal ID from JWT
    const docs = await DocumentModel.findAllForTeacher(teacher_id);
    const stats = await DocumentModel.getTeacherDocumentStats(teacher_id);
    res.json({ 
      documents: docs,
      stats: stats
    });
  } catch (err) {
    next(err);
  }
}

async function approveDocumentRequest(req, res, next) {
  try {
    const { id } = req.params;
    const teacher_id = req.teacher.id;
    
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document request not found." });
    }

    if (doc.status !== 'student_requested') {
      return res.status(400).json({ error: "This document has already been processed." });
    }

    await DocumentModel.teacherApprove(id, teacher_id);
    
    // Notify registrar
    const db = require("../../config/db");
    const [studentRow] = await db.query(
      `SELECT full_name FROM students WHERE student_id = ? LIMIT 1`,
      [doc.student_id]
    );
    const studentName = studentRow[0]?.full_name || doc.student_id;
    
    await NotificationService.notifyDocumentApprovedByTeacher({
      student_id: doc.student_id,
      student_name: studentName,
      document_type: doc.document_type,
      document_id: id
    });
    
    res.json({ 
      message: "Document request approved and forwarded to Registrar.",
      document: await DocumentModel.findById(id)
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyDocumentRequests,
  approveDocumentRequest
};
