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
  "School Form 10 (Form 137)",
  "School Form 9 - Report Card (1st copy)",
  "School Form 9 - Report Card (2nd copy)",
  "Diploma (1st copy)",
  "Diploma (succeeding copies)",
  "Certificate of Enrollment",
  "Certificate of Graduation",
  "Certificate of Grades (GWA)",
  "Certificate of Good Moral",
  "ESC Certificate / SHS-Voucher Cert.",
  "Official Grade Slip (Employment/Any Purpose)",
  "CTC - Form 137 (scanned)",
  "CTC - Report Card / Grade Slip",
  "CTC - NSO Cert. of Live Birth",
];

const DocumentModel = {
  SUPPORTED_TYPES: SUPPORTED_DOCUMENT_TYPES,

  async findByStudent(student_id) {
    const [rows] = await db.query(
      `SELECT d.*, 
              s.full_name as student_name,
              t.full_name as teacher_name,
              r.full_name as registrar_name,
              p.full_name as principal_name
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       LEFT JOIN teachers t ON d.teacher_id = t.id
       LEFT JOIN admins r ON d.registrar_id = r.admin_id
       LEFT JOIN admins p ON d.principal_id = p.admin_id
       WHERE d.student_id = ? 
       ORDER BY d.created_at DESC`,
      [student_id]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT d.*, 
              s.full_name as student_name,
              t.full_name as teacher_name,
              r.full_name as registrar_name,
              p.full_name as principal_name
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       LEFT JOIN teachers t ON d.teacher_id = t.id
       LEFT JOIN admins r ON d.registrar_id = r.admin_id
       LEFT JOIN admins p ON d.principal_id = p.admin_id
       WHERE d.id = ? 
       LIMIT 1`, 
      [id]
    );
    return rows[0] || null;
  },

  async findAllPending() {
    const [rows] = await db.query(
      `SELECT d.*, s.full_name as student_name
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       WHERE d.status = 'student_requested' 
       ORDER BY d.created_at ASC`
    );
    return rows;
  },

  async findPendingForTeacher(teacher_id) {
    const [rows] = await db.query(
      `SELECT d.*, s.full_name as student_name
       FROM documents d
       INNER JOIN students s ON d.student_id = s.student_id
       WHERE d.teacher_id = ? AND d.status = 'student_requested'
       ORDER BY d.created_at ASC`,
      [teacher_id]
    );
    return rows;
  },

  async findPendingForRegistrar() {
    const [rows] = await db.query(
      `SELECT d.*, 
              s.full_name as student_name,
              t.full_name as teacher_name
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       LEFT JOIN teachers t ON d.teacher_id = t.id
       WHERE d.status IN ('teacher_approved', 'principal_approved')
       ORDER BY d.created_at ASC`
    );
    return rows;
  },

  async findPendingForPrincipal() {
    const [rows] = await db.query(
      `SELECT d.*, 
              s.full_name as student_name,
              t.full_name as teacher_name,
              r.full_name as registrar_name
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       LEFT JOIN teachers t ON d.teacher_id = t.id
       LEFT JOIN admins r ON d.registrar_id = r.admin_id
       WHERE d.status = 'registrar_forwarded'
       ORDER BY d.created_at ASC`
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

  async create({ student_id, document_type, purpose, copies, teacher_id }) {
    const [result] = await db.query(
      `INSERT INTO documents
         (reference_number, student_id, teacher_id, document_type, purpose, copies, status, created_at)
       VALUES ('PENDING', ?, ?, ?, ?, ?, 'student_requested', NOW())`,
      [student_id, teacher_id, document_type, purpose, copies]
    );
    const id  = result.insertId;
    const ref = buildRefNumber(id);
    await db.query("UPDATE documents SET reference_number = ? WHERE id = ?", [ref, id]);
    return this.findById(id);
  },

  async teacherApprove(id, teacher_id) {
    await db.query(
      `UPDATE documents
       SET status = 'teacher_approved', 
           teacher_id = ?,
           teacher_reviewed_at = NOW()
       WHERE id = ?`,
      [teacher_id, id]
    );
    return this.findById(id);
  },

  async registrarForward(id, registrar_id) {
    await db.query(
      `UPDATE documents
       SET status = 'registrar_forwarded',
           registrar_id = ?,
           registrar_forwarded_at = NOW()
       WHERE id = ?`,
      [registrar_id, id]
    );
    return this.findById(id);
  },

  async principalApprove(id, principal_id) {
    await db.query(
      `UPDATE documents
       SET status = 'principal_approved',
           principal_id = ?,
           principal_reviewed_at = NOW()
       WHERE id = ?`,
      [principal_id, id]
    );
    return this.findById(id);
  },

  async principalReject(id, principal_id, rejection_reason) {
    await db.query(
      `UPDATE documents
       SET status = 'principal_rejected',
           rejection_reason = ?,
           principal_id = ?,
           principal_reviewed_at = NOW()
       WHERE id = ?`,
      [rejection_reason, principal_id, id]
    );
    return this.findById(id);
  },

  async setReadyForPickup(id, registrar_id, pickup_date, pickup_time, pickup_location) {
    await db.query(
      `UPDATE documents
       SET status = 'ready_for_pickup',
           pickup_date = ?,
           pickup_time = ?,
           pickup_location = ?,
           registrar_id = ?,
           admin_timestamp = NOW()
       WHERE id = ?`,
      [pickup_date, pickup_time, pickup_location, registrar_id, id]
    );
    return this.findById(id);
  },

  async markAsReleased(id, released_by) {
    await db.query(
      `UPDATE documents
       SET status = 'released',
           released_by = ?,
           released_at = NOW()
       WHERE id = ?`,
      [released_by, id]
    );
    return this.findById(id);
  },

  // Legacy methods for backward compatibility
  async approve(id, admin_id, expected_release_date) {
    return this.principalApprove(id, admin_id);
  },

  async reject(id, admin_id, rejection_reason) {
    return this.principalReject(id, admin_id, rejection_reason);
  },
};

module.exports = DocumentModel;
