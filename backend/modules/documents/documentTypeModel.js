/**
 * modules/documents/documentTypeModel.js
 * Manages document types and their prices
 */
const db = require("../../config/db");

const DocumentTypeModel = {
  async findAll() {
    const [rows] = await db.query(
      `SELECT * FROM document_types 
       WHERE is_active = 1 
       ORDER BY document_name ASC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM document_types WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async findByName(document_name) {
    const [rows] = await db.query(
      `SELECT * FROM document_types WHERE document_name = ? LIMIT 1`,
      [document_name]
    );
    return rows[0] || null;
  },

  async create({ document_name, price, processing_days, description }) {
    const [result] = await db.query(
      `INSERT INTO document_types 
         (document_name, price, processing_days, description, is_active, created_at)
       VALUES (?, ?, ?, ?, 1, NOW())`,
      [document_name, price || 0, processing_days, description]
    );
    return this.findById(result.insertId);
  },

  async update(id, { document_name, price, processing_days, description, is_active }) {
    const updates = [];
    const values = [];

    if (document_name !== undefined) {
      updates.push("document_name = ?");
      values.push(document_name);
    }
    if (price !== undefined) {
      updates.push("price = ?");
      values.push(price);
    }
    if (processing_days !== undefined) {
      updates.push("processing_days = ?");
      values.push(processing_days);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) return this.findById(id);

    values.push(id);
    await db.query(
      `UPDATE document_types SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    return this.findById(id);
  },

  async delete(id) {
    // Soft delete by setting is_active to 0
    await db.query(
      `UPDATE document_types SET is_active = 0 WHERE id = ?`,
      [id]
    );
    return { success: true };
  },

  async getAllDocumentNames() {
    const [rows] = await db.query(
      `SELECT document_name FROM document_types 
       WHERE is_active = 1 
       ORDER BY document_name ASC`
    );
    return rows.map(r => r.document_name);
  },

  async getPrice(document_name) {
    const doc = await this.findByName(document_name);
    return doc ? parseFloat(doc.price) : 0.00;
  }
};

module.exports = DocumentTypeModel;
