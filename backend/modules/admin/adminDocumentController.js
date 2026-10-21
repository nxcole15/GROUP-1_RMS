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

    await DocumentModel.setReadyForPickup(id, registrar_id, pickup_date, pickup_time, pickup_location);
    res.json({ 
      message: "Document is ready for pickup. Student has been notified.",
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

    if (doc.status !== 'ready_for_pickup') {
      return res.status(400).json({ error: "Document must be ready for pickup first." });
    }

    await DocumentModel.markAsReleased(id, released_by);
    res.json({ 
      message: "Document marked as released to student.",
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
  registrarForwardToPrincipal,
  registrarSetPickup,
  registrarMarkAsReleased,
  
  // Principal
  getPrincipalDocuments,
  principalApprove,
  principalReject
};
