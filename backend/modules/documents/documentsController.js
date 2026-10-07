/**
 * modules/documents/documentsController.js
 * Student-facing document-request operations.
 */
const DocumentModel = require("./documentModel");

async function getMyDocuments(req, res, next) {
  try {
    const docs = await DocumentModel.findByStudent(req.student.student_id);
    res.json({ documents: docs });
  } catch (err) { next(err); }
}

function getDocumentTypes(req, res) {
  res.json({ document_types: DocumentModel.SUPPORTED_TYPES });
}

async function submitDocumentRequest(req, res, next) {
  try {
    const { student_id }                     = req.student;
    const { document_type, purpose, copies } = req.body;

    const errors = [];
    if (!document_type || !DocumentModel.SUPPORTED_TYPES.includes(document_type)) {
      errors.push(`document_type must be one of: ${DocumentModel.SUPPORTED_TYPES.join(", ")}.`);
    }
    if (!purpose || typeof purpose !== "string" || purpose.trim().length < 10 || purpose.trim().length > 500) {
      errors.push("purpose must be between 10 and 500 characters.");
    }
    const parsedCopies = parseInt(copies, 10);
    if (isNaN(parsedCopies) || parsedCopies < 1 || parsedCopies > 10) {
      errors.push("copies must be an integer between 1 and 10.");
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed.", details: errors });
    }

    if (await DocumentModel.hasPendingDuplicate(student_id, document_type)) {
      return res.status(409).json({
        error: "You already have a pending request for this document type.",
      });
    }

    const doc = await DocumentModel.create({
      student_id,
      document_type,
      purpose: purpose.trim(),
      copies:  parsedCopies,
    });

    res.status(201).json({
      message:          "Document request submitted successfully.",
      reference_number: doc.reference_number,
      document:         doc,
    });
  } catch (err) { next(err); }
}

module.exports = { getMyDocuments, getDocumentTypes, submitDocumentRequest };
