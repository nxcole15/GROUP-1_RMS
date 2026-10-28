/**
 * modules/admin/adminDocumentController.js
 * Registrar and Principal document request handling
 */
const DocumentModel = require("../documents/documentModel");

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

    if (doc.status !== 'teacher_approved') {
      return res.status(400).json({ error: "Document must be teacher-approved first." });
    }

    await DocumentModel.registrarForward(id, registrar_id);
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
    const { pickup_date, pickup_time, pickup_location } = req.body;
    const registrar_id = req.admin.admin_id;
    
    const doc = await DocumentModel.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Document request not found." });
    }

    if (doc.status !== 'principal_approved') {
      return res.status(400).json({ error: "Document must be principal-approved first." });
    }

    if (!pickup_date || !pickup_time || !pickup_location) {
      return res.status(400).json({ error: "pickup_date, pickup_time, and pickup_location are required." });
    }

    await DocumentModel.setPendingPayment(id, registrar_id, pickup_date, pickup_time, pickup_location);
    res.json({ 
      message: "Pickup details set. Student needs to pay at Accounting before pickup.",
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

    if (doc.status !== 'payment_verified') {
      return res.status(400).json({ error: "Payment must be verified by Accounting first." });
    }

    // Mark as ready for pickup first
    await DocumentModel.setReadyForPickup(id, released_by);
    
    res.json({ 
      message: "Document is ready for pickup.",
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

    if (doc.status !== 'payment_verified') {
      return res.status(400).json({ error: "Payment must be verified by Accounting first." });
    }

    // Mark as picked up (released)
    await DocumentModel.markAsReleased(id, released_by);
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

    if (doc.status !== 'pending_payment') {
      return res.status(400).json({ error: "Document must be pending payment." });
    }

    if (!payment_reference || payment_reference.trim().length < 3) {
      return res.status(400).json({ error: "payment_reference is required (min 3 characters)." });
    }

    await DocumentModel.accountingVerifyPayment(id, accounting_id, payment_reference.trim());
    res.json({ 
      message: "Payment verified. Registrar can now prepare the document for pickup.",
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

    if (doc.status !== 'registrar_forwarded') {
      return res.status(400).json({ error: "Document must be forwarded by Registrar first." });
    }

    await DocumentModel.principalApprove(id, principal_id);
    res.json({ 
      message: "Document request approved. Registrar can now process it.",
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

    if (doc.status !== 'registrar_forwarded') {
      return res.status(400).json({ error: "Document must be forwarded by Registrar first." });
    }

    if (!rejection_reason || rejection_reason.trim().length < 10) {
      return res.status(400).json({ error: "rejection_reason must be at least 10 characters." });
    }

    await DocumentModel.principalReject(id, principal_id, rejection_reason.trim());
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
