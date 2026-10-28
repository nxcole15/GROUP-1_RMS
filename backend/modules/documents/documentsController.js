/**
 * modules/documents/documentsController.js
 * Student-facing document-request operations.
 */
const DocumentModel = require("./documentModel");
const DocumentTypeModel = require("./documentTypeModel");

async function getMyDocuments(req, res, next) {
  try {
    const docs = await DocumentModel.findByStudent(req.student.student_id);
    res.json({ documents: docs });
  } catch (err) { next(err); }
}

async function getDocumentTypes(req, res, next) {
  try {
    const types = await DocumentTypeModel.findAll();
    res.json({ 
      document_types: types,
      supported_types: types.map(t => t.document_name)
    });
  } catch (err) {
    next(err);
  }
}

async function submitDocumentRequest(req, res, next) {
  try {
    const { student_id }                              = req.student;
    const { document_type, purpose, copies, teacher_id } = req.body;

    const errors = [];
    
    // Check if document type exists and is active
    const docType = await DocumentTypeModel.findByName(document_type);
    if (!docType) {
      errors.push("Invalid document_type. Please select from available document types.");
    }
    
    if (!purpose || typeof purpose !== "string" || purpose.trim().length < 10 || purpose.trim().length > 500) {
      errors.push("purpose must be between 10 and 500 characters.");
    }
    const parsedCopies = parseInt(copies, 10);
    if (isNaN(parsedCopies) || parsedCopies < 1 || parsedCopies > 10) {
      errors.push("copies must be an integer between 1 and 10.");
    }
    // Parse teacher_id to handle both string and number
    const parsedTeacherId = parseInt(teacher_id, 10);
    if (!teacher_id || isNaN(parsedTeacherId) || parsedTeacherId < 1) {
      errors.push("teacher_id is required - please select your adviser.");
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed.", details: errors });
    }

    if (await DocumentModel.hasPendingDuplicate(student_id, document_type)) {
      return res.status(409).json({
        error: "You already have a pending request for this document type.",
      });
    }

    // Get payment amount from database
    const payment_amount = parseFloat(docType.price);

    const doc = await DocumentModel.create({
      student_id,
      document_type,
      purpose: purpose.trim(),
      copies:  parsedCopies,
      teacher_id: parsedTeacherId,
      payment_amount,
    });

    res.status(201).json({
      message:          "Document request submitted successfully. Your adviser will review it.",
      reference_number: doc.reference_number,
      document:         doc,
    });
  } catch (err) { next(err); }
}

module.exports = { getMyDocuments, getDocumentTypes, submitDocumentRequest };
