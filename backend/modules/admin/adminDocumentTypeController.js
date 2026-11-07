/**
 * Admin Document Type Management Controller
 * Registrar can manage document types (add, edit, delete)
 */
const DocumentTypeModel = require("../documents/documentTypeModel");

async function getAllDocumentTypes(req, res, next) {
  try {
    const types = await DocumentTypeModel.findAll();
    res.json({ document_types: types });
  } catch (err) {
    next(err);
  }
}

async function createDocumentType(req, res, next) {
  try {
    const { document_name, price, processing_days, description } = req.body;
    
    // Validation
    if (!document_name || !document_name.trim()) {
      return res.status(400).json({ error: "Document name is required." });
    }
    
    if (!processing_days || processing_days.trim() === '') {
      return res.status(400).json({ error: "Processing days is required." });
    }

    // Check if document type already exists
    const existing = await DocumentTypeModel.findByName(document_name.trim());
    if (existing) {
      return res.status(400).json({ error: "A document type with this name already exists." });
    }

    const newType = await DocumentTypeModel.create({
      document_name: document_name.trim(),
      price: price || 0,
      processing_days: processing_days.trim(),
      description: description ? description.trim() : null
    });

    res.status(201).json({ 
      message: "Document type created successfully.",
      document_type: newType
    });
  } catch (err) {
    next(err);
  }
}

async function updateDocumentType(req, res, next) {
  try {
    const { id } = req.params;
    const { document_name, price, processing_days, description, is_active } = req.body;

    const existing = await DocumentTypeModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Document type not found." });
    }

    // If changing name, check for duplicates
    if (document_name && document_name !== existing.document_name) {
      const duplicate = await DocumentTypeModel.findByName(document_name.trim());
      if (duplicate && duplicate.id !== parseInt(id)) {
        return res.status(400).json({ error: "A document type with this name already exists." });
      }
    }

    const updated = await DocumentTypeModel.update(id, {
      document_name: document_name ? document_name.trim() : undefined,
      price: price !== undefined ? price : undefined,
      processing_days: processing_days ? processing_days.trim() : undefined,
      description: description !== undefined ? (description ? description.trim() : null) : undefined,
      is_active: is_active !== undefined ? is_active : undefined
    });

    res.json({ 
      message: "Document type updated successfully.",
      document_type: updated
    });
  } catch (err) {
    next(err);
  }
}

async function deleteDocumentType(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await DocumentTypeModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Document type not found." });
    }

    await DocumentTypeModel.delete(id);

    res.json({ 
      message: "Document type deleted successfully."
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllDocumentTypes,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType
};
