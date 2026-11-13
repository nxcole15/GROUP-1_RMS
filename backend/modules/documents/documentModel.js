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
       WHERE d.status = 'pending_registrar_review' 
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

  async findAllForTeacher(teacher_id) {
    const [rows] = await db.query(
      `SELECT d.*, s.full_name as student_name
       FROM documents d
       INNER JOIN students s ON d.student_id = s.student_id
       WHERE d.teacher_id = ?
       ORDER BY d.created_at DESC`,
      [teacher_id]
    );
    return rows;
  },

  async getTeacherDocumentStats(teacher_id) {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'student_requested' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status IN ('teacher_approved', 'registrar_forwarded', 'principal_approved', 'pending_payment', 'payment_verified', 'released') THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'principal_rejected' THEN 1 ELSE 0 END) as rejected
       FROM documents
       WHERE teacher_id = ?`,
      [teacher_id]
    );
    return rows[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };
  },

  async findPendingForRegistrar() {
    const [rows] = await db.query(
      `SELECT d.*, 
              s.student_id,
              s.full_name as student_name,
              s.email as student_email,
              s.grade_level,
              s.track,
              s.strand,
              -- Check if pickup date/time has passed for free documents
              CASE 
                WHEN d.status = 'pickup_scheduled' 
                     AND d.requires_payment = 0 
                     AND CONCAT(d.pickup_date, ' ', d.pickup_time) <= NOW() 
                THEN 'ready_for_release'
                ELSE d.status
              END as computed_status
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       WHERE d.status IN ('pending_registrar_review', 'approved', 'pickup_scheduled', 'ready_for_release')
          OR (d.status = 'pickup_scheduled' 
              AND d.requires_payment = 0 
              AND CONCAT(d.pickup_date, ' ', d.pickup_time) <= NOW())
       ORDER BY d.created_at ASC`
    );
    
    // Update any pickup_scheduled free documents that are now ready
    const readyDocs = rows.filter(r => 
      r.status === 'pickup_scheduled' && 
      r.requires_payment === 0 && 
      r.computed_status === 'ready_for_release'
    );
    
    for (const doc of readyDocs) {
      await db.query(
        `UPDATE documents SET status = 'ready_for_release' WHERE id = ?`,
        [doc.id]
      );
    }
    
    return rows.map(r => ({ ...r, status: r.computed_status }));
  },

  async findAllForRegistrar() {
    const [rows] = await db.query(
      `SELECT d.*, 
              s.student_id,
              s.full_name as student_name,
              s.email as student_email,
              s.grade_level,
              s.track,
              s.strand,
              r.full_name as registrar_name,
              p.full_name as principal_name
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       LEFT JOIN admins r ON d.registrar_id = r.admin_id
       LEFT JOIN admins p ON d.principal_id = p.admin_id
       ORDER BY d.created_at DESC`
    );
    return rows;
  },

  async getRegistrarDocumentStats() {
    // Auto-update free documents that are now ready for pickup
    await db.query(
      `UPDATE documents 
       SET status = 'ready_for_release' 
       WHERE status = 'pickup_scheduled' 
         AND requires_payment = 0 
         AND CONCAT(pickup_date, ' ', pickup_time) <= NOW()`
    );
    
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending_registrar_review' THEN 1 ELSE 0 END) as needs_forwarding,
        SUM(CASE WHEN status = 'pending_principal_approval' THEN 1 ELSE 0 END) as with_principal,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as needs_pickup_setup,
        SUM(CASE WHEN status = 'pending_payment_verification' THEN 1 ELSE 0 END) as awaiting_payment,
        SUM(CASE WHEN status = 'pickup_scheduled' THEN 1 ELSE 0 END) as scheduled_not_ready,
        SUM(CASE WHEN status = 'ready_for_release' THEN 1 ELSE 0 END) as ready_for_release,
        SUM(CASE WHEN status = 'released' THEN 1 ELSE 0 END) as released,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
       FROM documents`
    );
    return rows[0] || { 
      total: 0, 
      needs_forwarding: 0, 
      with_principal: 0, 
      needs_pickup_setup: 0, 
      awaiting_payment: 0,
      scheduled_not_ready: 0,
      ready_for_release: 0, 
      released: 0, 
      rejected: 0 
    };
  },
  
  async findPendingForAccounting() {
    const [rows] = await db.query(
      `SELECT d.*, 
              s.student_id,
              s.full_name as student_name,
              s.email as student_email,
              s.grade_level,
              s.track,
              s.strand
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       WHERE d.status = 'pending_payment_verification' AND d.requires_payment = 1
       ORDER BY d.created_at ASC`
    );
    return rows;
  },

  async findAllForAccounting() {
    const [rows] = await db.query(
      `SELECT d.*, 
              s.student_id,
              s.full_name as student_name,
              s.email as student_email,
              s.grade_level,
              s.track,
              s.strand,
              a.full_name as accounting_verified_by_name
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       LEFT JOIN admins a ON d.accounting_verified_by = a.admin_id
       WHERE d.requires_payment = 1
       ORDER BY d.created_at DESC`
    );
    return rows;
  },

  async getAccountingDocumentStats() {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending_payment_verification' THEN 1 ELSE 0 END) as needs_verification,
        SUM(CASE WHEN status = 'ready_for_release' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN status = 'released' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pending_payment_verification' THEN payment_amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN status IN ('ready_for_release', 'released') THEN payment_amount ELSE 0 END) as verified_amount
       FROM documents
       WHERE requires_payment = 1`
    );
    return rows[0] || { total: 0, needs_verification: 0, verified: 0, completed: 0, pending_amount: 0, verified_amount: 0 };
  },

  async findPendingForPrincipal() {
    const [rows] = await db.query(
      `SELECT d.*, 
              s.student_id,
              s.full_name as student_name,
              s.email as student_email,
              s.grade_level,
              s.track,
              s.strand,
              r.full_name as registrar_name
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       LEFT JOIN admins r ON d.registrar_id = r.admin_id
       WHERE d.status = 'pending_principal_approval'
       ORDER BY d.created_at ASC`
    );
    return rows;
  },

  async findAllForPrincipal() {
    const [rows] = await db.query(
      `SELECT d.*, 
              s.student_id,
              s.full_name as student_name,
              s.email as student_email,
              s.grade_level,
              s.track,
              s.strand,
              r.full_name as registrar_name,
              p.full_name as principal_name
       FROM documents d
       LEFT JOIN students s ON d.student_id = s.student_id
       LEFT JOIN admins r ON d.registrar_id = r.admin_id
       LEFT JOIN admins p ON d.principal_id = p.admin_id
       ORDER BY d.created_at DESC`
    );
    return rows;
  },

  async getPrincipalDocumentStats() {
    const [rows] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending_principal_approval' THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status IN ('pickup_scheduled', 'pending_payment_verification', 'payment_verified', 'ready_for_release', 'released') THEN 1 ELSE 0 END) as completed
       FROM documents`
    );
    return rows[0] || { total: 0, pending_review: 0, approved: 0, rejected: 0, completed: 0 };
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

  async create({ student_id, document_type, purpose, copies, payment_amount }) {
    // Determine if payment is required (amount > 0)
    const requires_payment = payment_amount && parseFloat(payment_amount) > 0 ? 1 : 0;
    
    const [result] = await db.query(
      `INSERT INTO documents
         (reference_number, student_id, document_type, purpose, copies, payment_amount, requires_payment, status, created_at)
       VALUES ('PENDING', ?, ?, ?, ?, ?, ?, 'pending_registrar_review', NOW())`,
      [student_id, document_type, purpose, copies, payment_amount || 0, requires_payment]
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
       SET status = 'pending_principal_approval',
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
       SET status = 'approved',
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
       SET status = 'rejected',
           rejection_reason = ?,
           principal_id = ?,
           principal_reviewed_at = NOW()
       WHERE id = ?`,
      [rejection_reason, principal_id, id]
    );
    return this.findById(id);
  },

  async schedulePickup(id, registrar_id, pickup_date, pickup_time, pickup_location, pickup_instructions = null) {
    // Get document to check if payment is required
    const doc = await this.findById(id);
    let newStatus = 'pickup_scheduled';
    
    // If payment required, set status to pending payment verification
    if (doc && doc.requires_payment && parseFloat(doc.payment_amount) > 0) {
      newStatus = 'pending_payment_verification';
    } else {
      // For free documents, keep as "pickup_scheduled" until pickup date arrives
      // Frontend/backend will check pickup_date to determine if ready for release
      newStatus = 'pickup_scheduled';
    }
    
    await db.query(
      `UPDATE documents
       SET status = ?,
           pickup_date = ?,
           pickup_time = ?,
           pickup_location = ?,
           pickup_instructions = ?,
           pickup_scheduled_by = ?,
           pickup_scheduled_at = NOW()
       WHERE id = ?`,
      [newStatus, pickup_date, pickup_time, pickup_location, pickup_instructions, registrar_id, id]
    );
    return this.findById(id);
  },

  async setPendingPayment(id, registrar_id, pickup_date, pickup_time, pickup_location, pickup_instructions = null) {
    // Legacy method - redirects to schedulePickup
    return this.schedulePickup(id, registrar_id, pickup_date, pickup_time, pickup_location, pickup_instructions);
  },

  async accountingVerifyPayment(id, accounting_id, payment_reference) {
    await db.query(
      `UPDATE documents
       SET status = 'ready_for_release',
           accounting_verified_by = ?,
           payment_reference = ?,
           accounting_verified_at = NOW()
       WHERE id = ?`,
      [accounting_id, payment_reference, id]
    );
    return this.findById(id);
  },

  async setReadyForPickup(id, registrar_id) {
    await db.query(
      `UPDATE documents
       SET status = 'ready_for_release',
           registrar_id = ?,
           admin_timestamp = NOW()
       WHERE id = ?`,
      [registrar_id, id]
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
