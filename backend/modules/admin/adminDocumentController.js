/**
 * modules/admin/adminDocumentController.js
 * Registrar and Principal document request handling
 */
const DocumentModel = require("../documents/documentModel");
const NotificationService = require("../notifications/notificationService");

// ===== REGISTRAR FUNCTIONS =====

async function getRegistrarDocuments(req, res, next) {
  try {
    const docs = await DocumentModel.findPendingForRegistrar();
    res.json({ documents: docs });
  } catch (err) {
    next(err);
  }
}

async function getAllRegistrarDocuments(req, res, next) {
  try {
    const docs = await DocumentModel.findAllForRegistrar();
    const stats = await DocumentModel.getRegistrarDocumentStats();
    res.json({ 
      documents: docs,
      stats: stats
    });
  } catch (err) {
    next(err);
  }
}

async function registrarForwardToPrincipal(req, res, next) {
  try {
    const { id } = req.params;
    const registrar_id = req.admin.admin_id;
    
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document request not found." });
    }

    if (doc.status !== 'pending_registrar_review') {
      return res.status(400).json({ error: "Only pending requests can be forwarded to Principal." });
    }

    await DocumentModel.registrarForward(id, registrar_id);
    
    // Notify principal
    const NotificationService = require("../notifications/notificationService");
    await NotificationService.notifyStaff({
      recipient: 'principal',
      role: 'principal',
      message: `Document Request Forwarded: ${doc.student_name} - ${doc.document_type}`,
      type: 'document_request',
      reference_id: id,
      reference_type: 'document'
    });
    
    res.json({ 
      message: "Document request forwarded to Principal for approval.",
      document: await DocumentModel.findById(id)
    });
  } catch (err) {
    next(err);
  }
}

async function registrarSetPickup(req, res, next) {
  try {
    const { id } = req.params;
    const { pickup_date, pickup_time, pickup_location, pickup_instructions } = req.body;
    const registrar_id = req.admin.admin_id;
    
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document request not found." });
    }

    if (doc.status !== 'approved') {
      return res.status(400).json({ error: "Document must be principal-approved first." });
    }

    if (!pickup_date || !pickup_time || !pickup_location) {
      return res.status(400).json({ error: "pickup_date, pickup_time, and pickup_location are required." });
    }

    await DocumentModel.schedulePickup(id, registrar_id, pickup_date, pickup_time, pickup_location, pickup_instructions);
    
    const updatedDoc = await DocumentModel.findById(id);
    
    // Notify student about pickup schedule
    const NotificationService = require("../notifications/notificationService");
    const db = require("../../config/db");
    const [studentRow] = await db.query(
      `SELECT student_id FROM documents WHERE id = ? LIMIT 1`,
      [id]
    );
    
    if (studentRow && studentRow[0]) {
      const pickupMsg = `Your ${doc.document_type} is scheduled for pickup on ${pickup_date} at ${pickup_time}. Location: ${pickup_location}.` + 
        (pickup_instructions ? ` Instructions: ${pickup_instructions}` : '');
      
      await NotificationService.notifyStudent({
        student_id: studentRow[0].student_id,
        message: pickupMsg,
        type: 'document'
      });
    }
    
    res.json({ 
      message: updatedDoc.requires_payment 
        ? "Pickup scheduled. Student needs to complete payment before release."
        : "Pickup scheduled. Document is ready for release.",
      document: updatedDoc
    });
  } catch (err) {
    next(err);
  }
}

async function registrarMarkScheduledAsReady(req, res, next) {
  try {
    const { id } = req.params;
    const registrar_id = req.admin.admin_id;
    
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document request not found." });
    }

    if (doc.status !== 'pickup_scheduled') {
      return res.status(400).json({ error: "Only scheduled documents can be manually marked as ready." });
    }

    // Manually mark as ready (bypass time check)
    await DocumentModel.setReadyForPickup(id, registrar_id);
    
    // Notify student
    const NotificationService = require("../notifications/notificationService");
    const db = require("../../config/db");
    const [studentRow] = await db.query(
      `SELECT student_id FROM documents WHERE id = ? LIMIT 1`,
      [id]
    );
    
    if (studentRow && studentRow[0]) {
      await NotificationService.notifyStudent({
        student_id: studentRow[0].student_id,
        message: `Good news! Your ${doc.document_type} is now ready for pickup at ${doc.pickup_location}.`,
        type: 'document'
      });
    }
    
    res.json({ 
      message: "Document marked as ready for pickup.",
      document: await DocumentModel.findById(id)
    });
  } catch (err) {
    next(err);
  }
}

async function registrarMarkAsReleased(req, res, next) {
  try {
    const { id } = req.params;
    const released_by = req.admin.admin_id;
    
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document request not found." });
    }

    if (doc.status !== 'ready_for_release') {
      return res.status(400).json({ error: "Document must be ready for release. Ensure approval and payment (if required) are complete." });
    }

    // Mark as released
    await DocumentModel.markAsReleased(id, released_by);
    
    // Notify student
    const NotificationService = require("../notifications/notificationService");
    const db = require("../../config/db");
    const [studentRow] = await db.query(
      `SELECT student_id FROM documents WHERE id = ? LIMIT 1`,
      [id]
    );
    
    if (studentRow && studentRow[0]) {
      await NotificationService.notifyStudent({
        student_id: studentRow[0].student_id,
        message: `Your ${doc.document_type} has been released. You may now pick it up.`,
        type: 'document'
      });
    }
    
    res.json({ 
      message: "Document marked as released.",
      document: await DocumentModel.findById(id)
    });
  } catch (err) {
    next(err);
  }
}

async function registrarConfirmPickedUp(req, res, next) {
  try {
    const { id } = req.params;
    const released_by = req.admin.admin_id;
    
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document request not found." });
    }

    if (doc.status !== 'ready_for_release') {
      return res.status(400).json({ error: "Document must be ready for release." });
    }

    // Mark as picked up (released)
    await DocumentModel.markAsReleased(id, released_by);
    
    // Notify student
    const NotificationService = require("../notifications/notificationService");
    const db = require("../../config/db");
    const [studentRow] = await db.query(
      `SELECT student_id FROM documents WHERE id = ? LIMIT 1`,
      [id]
    );
    
    if (studentRow && studentRow[0]) {
      await NotificationService.notifyStudent({
        student_id: studentRow[0].student_id,
        message: `Your ${doc.document_type} has been released. Thank you!`,
        type: 'document'
      });
    }
    
    res.json({ 
      message: "Document marked as picked up by student.",
      document: await DocumentModel.findById(id)
    });
  } catch (err) {
    next(err);
  }
}

// ===== PRINCIPAL FUNCTIONS =====

async function getPrincipalDocuments(req, res, next) {
  try {
    const docs = await DocumentModel.findPendingForPrincipal();
    res.json({ documents: docs });
  } catch (err) {
    next(err);
  }
}

async function getAllPrincipalDocuments(req, res, next) {
  try {
    const docs = await DocumentModel.findAllForPrincipal();
    const stats = await DocumentModel.getPrincipalDocumentStats();
    res.json({ 
      documents: docs,
      stats: stats
    });
  } catch (err) {
    next(err);
  }
}

// ===== ACCOUNTING FUNCTIONS =====

async function getAccountingDocuments(req, res, next) {
  try {
    const docs = await DocumentModel.findPendingForAccounting();
    res.json({ documents: docs });
  } catch (err) {
    next(err);
  }
}

async function getAllAccountingDocuments(req, res, next) {
  try {
    const docs = await DocumentModel.findAllForAccounting();
    const stats = await DocumentModel.getAccountingDocumentStats();
    res.json({ 
      documents: docs,
      stats: stats
    });
  } catch (err) {
    next(err);
  }
}

async function accountingVerifyPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { payment_reference } = req.body;
    const accounting_id = req.admin.admin_id;
    
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document request not found." });
    }

    if (doc.status !== 'pending_payment_verification') {
      return res.status(400).json({ error: "Document must be pending payment verification." });
    }

    if (!payment_reference || payment_reference.trim().length < 3) {
      return res.status(400).json({ error: "payment_reference is required (min 3 characters)." });
    }

    await DocumentModel.accountingVerifyPayment(id, accounting_id, payment_reference.trim());
    
    // Notify registrar that payment is verified
    const NotificationService = require("../notifications/notificationService");
    await NotificationService.notifyStaff({
      recipient: 'registrar',
      role: 'registrar',
      message: `Payment Verified: ${doc.student_name} - ${doc.document_type} (Ready for release)`,
      type: 'payment_verified',
      reference_id: id,
      reference_type: 'document'
    });
    
    res.json({ 
      message: "Payment verified. Document is now ready for release.",
      document: await DocumentModel.findById(id)
    });
  } catch (err) {
    next(err);
  }
}

// ===== PRINCIPAL FUNCTIONS (CONTINUED) =====

async function principalApprove(req, res, next) {
  try {
    const { id } = req.params;
    const principal_id = req.admin.admin_id;
    
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document request not found." });
    }

    if (doc.status !== 'pending_principal_approval') {
      return res.status(400).json({ error: "Document must be forwarded by Registrar first." });
    }

    await DocumentModel.principalApprove(id, principal_id);
    
    // Notify registrar to proceed with scheduling
    const NotificationService = require("../notifications/notificationService");
    await NotificationService.notifyStaff({
      recipient: 'registrar',
      role: 'registrar',
      message: `Document Approved: ${doc.student_name} - ${doc.document_type} (Ready for pickup scheduling)`,
      type: 'document_approved',
      reference_id: id,
      reference_type: 'document'
    });
    
    res.json({ 
      message: "Document request approved. Registrar can now schedule pickup.",
      document: await DocumentModel.findById(id)
    });
  } catch (err) {
    next(err);
  }
}

async function principalReject(req, res, next) {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;
    const principal_id = req.admin.admin_id;
    
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document request not found." });
    }

    if (doc.status !== 'pending_principal_approval') {
      return res.status(400).json({ error: "Document must be forwarded by Registrar first." });
    }

    if (!rejection_reason || rejection_reason.trim().length < 10) {
      return res.status(400).json({ error: "rejection_reason must be at least 10 characters." });
    }

    await DocumentModel.principalReject(id, principal_id, rejection_reason.trim());
    
    // Notify student and registrar
    const NotificationService = require("../notifications/notificationService");
    const db = require("../../config/db");
    const [studentRow] = await db.query(
      `SELECT student_id FROM documents WHERE id = ? LIMIT 1`,
      [id]
    );
    
    if (studentRow && studentRow[0]) {
      await NotificationService.notifyStudent({
        student_id: studentRow[0].student_id,
        message: `Your ${doc.document_type} request was rejected. Reason: ${rejection_reason.trim()}`,
        type: 'document'
      });
    }
    
    await NotificationService.notifyStaff({
      recipient: 'registrar',
      role: 'registrar',
      message: `Document Rejected: ${doc.student_name} - ${doc.document_type}`,
      type: 'document_rejected',
      reference_id: id,
      reference_type: 'document'
    });
    
    res.json({ 
      message: "Document request rejected.",
      document: await DocumentModel.findById(id)
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Registrar
  getRegistrarDocuments,
  getAllRegistrarDocuments,
  registrarForwardToPrincipal,
  registrarSetPickup,
  registrarMarkScheduledAsReady,
  registrarMarkAsReleased,
  registrarConfirmPickedUp,
  
  // Principal
  getPrincipalDocuments,
  getAllPrincipalDocuments,
  principalApprove,
  principalReject,
  
  // Accounting
  getAccountingDocuments,
  getAllAccountingDocuments,
  accountingVerifyPayment
};
