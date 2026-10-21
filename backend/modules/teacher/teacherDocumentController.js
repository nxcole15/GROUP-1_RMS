/**
 * modules/teacher/teacherDocumentController.js
 * Teacher document request handling
 */
const DocumentModel = require("../documents/documentModel");

async function getMyDocumentRequests(req, res, next) {
  try {
    const teacher_id = req.teacher.id; // Internal ID from JWT
    const docs = await DocumentModel.findPendingForTeacher(teacher_id);
    res.json({ documents: docs });
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
