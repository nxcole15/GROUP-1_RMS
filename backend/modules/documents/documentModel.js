/**
 * modules/documents/documentModel.js
 */
const db = require("../../config/db");

function buildRefNumber(id) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq  = String(id).padStart(4, "0");
  return `DOC-${date}-${seq}`;
}

const SUPPORTED_DOCUMENT_TYPES = [
  "Transcript of Records",
  "Certificate of Enrollment",
  "Good Moral Certificate",
  "Diploma",
  "Form 137",
];

const DocumentModel = {
  SUPPORTED_TYPES: SUPPORTED_DOCUMENT_TYPES,

  async findByStudent(student_id) {
    const [rows] = await db.query(
      "SELECT * FROM documents WHERE student_id = ? ORDER BY created_at DESC",
      [student_id]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM documents WHERE id = ? LIMIT 1", [id]
    );
    return rows[0] || null;
  },

  async findAllPending() {
    const [rows] = await db.query(
      "SELECT * FROM documents WHERE status = 'pending' ORDER BY created_at ASC"
    );
    return rows;
  },

  async hasPendingDuplicate(student_id, document_type) {
    const [rows] = await db.query(
      `SELECT id FROM documents
       WHERE student_id = ? AND document_type = ? AND status = 'pending'
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       LIMIT 1`,
      [student_id, document_type]
    );
    return rows.length > 0;
  },

  async create({ student_id, document_type, purpose, copies }) {
    const [result] = await db.query(
      `INSERT INTO documents
         (reference_number, student_id, document_type, purpose, copies, status, created_at)
       VALUES ('PENDING', ?, ?, ?, ?, 'pending', NOW())`,
      [student_id, document_type, purpose, copies]
    );
    const id  = result.insertId;
    const ref = buildRefNumber(id);
    await db.query("UPDATE documents SET reference_number = ? WHERE id = ?", [ref, id]);
    return this.findById(id);
  },

  async approve(id, admin_id, expected_release_date) {
    await db.query(
      `UPDATE documents
       SET status = 'approved', expected_release_date = ?,
           admin_id = ?, admin_timestamp = NOW()
       WHERE id = ?`,
      [expected_release_date, admin_id, id]
    );
    return this.findById(id);
  },

  async reject(id, admin_id, rejection_reason) {
    await db.query(
      `UPDATE documents
       SET status = 'rejected', rejection_reason = ?,
           admin_id = ?, admin_timestamp = NOW()
       WHERE id = ?`,
      [rejection_reason, admin_id, id]
    );
    return this.findById(id);
  },
};

module.exports = DocumentModel;
