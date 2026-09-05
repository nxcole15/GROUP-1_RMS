/**
 * modules/admin/adminController.js
 * All admin-facing operations.
 */
const bcrypt           = require("bcryptjs");
const db               = require("../../config/db");
const AdminModel       = require("./adminModel");
const EnrollmentModel  = require("../student/enrollmentModel");
const PaymentModel     = require("../payments/paymentModel");
const DocumentModel    = require("../documents/documentModel");
const AuditModel       = require("./auditModel");
const ConfigModel      = require("../shared/configModel");
const { sendNotification } = require("../../utils/notify");

async function createAdminAccount(req, res, next) {
  try {
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({ error: "Only the super admin can create admin accounts." });
    }

    const { admin_id, full_name, email, password, role } = req.body || {};
    const allowedRoles = ["principal", "registrar", "accounting"];

    if (!admin_id || !full_name || !email || !password || !role) {
      return res.status(400).json({ error: "Admin ID, full name, email, password, and role are required." });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Role must be principal, registrar, or accounting." });
    }

    const normalizedAdminId = String(admin_id).trim();
    const normalizedName = String(full_name).trim();
    const normalizedEmail = String(email).trim();

    if (normalizedAdminId.length < 4 || normalizedName.length < 2 || normalizedEmail.length < 6 || password.length < 8) {
      return res.status(400).json({ error: "Please provide valid values. Password must be at least 8 characters long." });
    }

    if (await AdminModel.findByAdminId(normalizedAdminId)) {
      return res.status(409).json({ error: "An admin with this ID already exists." });
    }

    if (await AdminModel.findByEmail(normalizedEmail)) {
      return res.status(409).json({ error: "An admin with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await AdminModel.createAdmin({
      admin_id: normalizedAdminId,
      password: hashedPassword,
      full_name: normalizedName,
      role,
      email: normalizedEmail,
    });

    res.status(201).json({
      message: `${role} admin account created successfully.`,
      admin,
    });
  } catch (err) {
    next(err);
  }
}

async function listAdminAccounts(req, res, next) {
  try {
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({ error: "Only the super admin can manage admin accounts." });
    }

    const admins = await AdminModel.getAll();
    res.json({ admins });
  } catch (err) {
    next(err);
  }
}

async function updateAdminAccount(req, res, next) {
  try {
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({ error: "Only the super admin can manage admin accounts." });
    }

    const id = Number(req.params.id);
    const { full_name, email, role } = req.body || {};
    const allowedRoles = ["principal", "registrar", "accounting"];

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "A valid admin ID is required." });
    }

    if (!full_name || !email || !role) {
      return res.status(400).json({ error: "Full name, email, and role are required." });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Role must be principal, registrar, or accounting." });
    }

    const normalizedName = String(full_name).trim();
    const normalizedEmail = String(email).trim();
    if (normalizedName.length < 2 || normalizedEmail.length < 6) {
      return res.status(400).json({ error: "Please provide valid name and email values." });
    }

    const existing = await AdminModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Admin account not found." });
    }

    const duplicate = await AdminModel.findByEmailExcludingId(normalizedEmail, id);
    if (duplicate) {
      return res.status(409).json({ error: "Another admin account is already using this email." });
    }

    const updated = await AdminModel.updateAdmin(id, {
      full_name: normalizedName,
      email: normalizedEmail,
      role,
    });

    if (!updated) {
      return res.status(500).json({ error: "Unable to update the admin account." });
    }

    res.json({ message: "Admin account updated successfully." });
  } catch (err) {
    next(err);
  }
}

async function archiveAdminAccount(req, res, next) {
  try {
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({ error: "Only the super admin can manage admin accounts." });
    }

    const id = Number(req.params.id);
    const { archived } = req.body || {};

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "A valid admin ID is required." });
    }

    const existing = await AdminModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Admin account not found." });
    }

    const updated = await AdminModel.archiveAdmin(id, Boolean(archived));
    if (!updated) {
      return res.status(500).json({ error: "Unable to update archive status." });
    }

    res.json({ message: Boolean(archived) ? "Admin account archived." : "Admin account restored." });
  } catch (err) {
    next(err);
  }
}

async function deleteAdminAccount(req, res, next) {
  try {
    if (req.admin.role !== "super_admin") {
      return res.status(403).json({ error: "Only the super admin can manage admin accounts." });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "A valid admin ID is required." });
    }

    const existing = await AdminModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Admin account not found." });
    }

    if (existing.admin_id === process.env.SUPER_ADMIN_ID) {
      return res.status(400).json({ error: "The super admin account cannot be deleted." });
    }

    const deleted = await AdminModel.deleteAdmin(id);
    if (!deleted) {
      return res.status(500).json({ error: "Unable to delete the admin account." });
    }

    res.json({ message: "Admin account deleted successfully." });
  } catch (err) {
    next(err);
  }
}

/* ── Dashboard ─────────────────────────────────────────────── */
async function getDashboard(req, res, next) {
  try {
    const pending = {
      enrollments: (await EnrollmentModel.findAllPending()).length,
      payments:    (await PaymentModel.findAllPending()).length,
      documents:   (await DocumentModel.findAllPending()).length,
    };
    pending.total = pending.enrollments + pending.payments + pending.documents;
    res.json({ pending });
  } catch (err) { next(err); }
}

/* ── Student search ────────────────────────────────────────── */
async function searchStudents(req, res, next) {
  try {
    const query = (req.query.q || "").trim();
    if (!query) return res.status(400).json({ error: "Search query is required." });

    const [rows] = await db.query(
      `SELECT id, student_id, full_name, course, year_level, semester, email, account_status
       FROM students
       WHERE full_name LIKE ? OR student_id LIKE ?
       ORDER BY full_name`,
      [`%${query}%`, `%${query}%`]
    );

    if (!rows.length) {
      return res.json({ students: [], message: "No students found matching your search." });
    }
    res.json({ students: rows });
  } catch (err) { next(err); }
}

/* ── Enrollments ───────────────────────────────────────────── */
async function getPendingEnrollments(req, res, next) {
  try {
    const pending = await EnrollmentModel.findAllPending();
    const result  = await Promise.all(
      pending.map(async (e) => {
        const [students] = await db.query(
          "SELECT full_name, course FROM students WHERE student_id = ? LIMIT 1",
          [e.student_id]
        );
        const subjects = await Promise.all(
          e.subjects.map((sid) => ConfigModel.getSubjectById(sid))
        );
        return {
          ...e,
          student_name: students[0]?.full_name || "Unknown",
          course:       students[0]?.course    || "Unknown",
          subjects:     subjects.filter(Boolean).map(({ id, code, name, units }) => ({ id, code, name, units })),
        };
      })
    );
    res.json({ enrollments: result });
  } catch (err) { next(err); }
}

async function approveEnrollment(req, res, next) {
  try {
    const id         = parseInt(req.params.id, 10);
    const enrollment = await EnrollmentModel.findById(id);
    if (!enrollment)                     return res.status(404).json({ error: "Enrollment not found." });
    if (enrollment.status !== "pending") return res.status(409).json({ error: "This request has already been processed." });

    const updated = await EnrollmentModel.approve(id, req.admin.admin_id);
    sendNotification({ student_id: updated.student_id, message: `Your enrollment for ${updated.term} has been approved.`, type: "enrollment" });
    await AuditModel.log({ admin_id: req.admin.admin_id, action: "APPROVE_ENROLLMENT", target_request_id: id });
    res.json({ message: "Enrollment approved.", enrollment: updated });
  } catch (err) { next(err); }
}

async function rejectEnrollment(req, res, next) {
  try {
    const id               = parseInt(req.params.id, 10);
    const { rejection_reason } = req.body;
    if (!rejection_reason || rejection_reason.trim().length < 10 || rejection_reason.trim().length > 500) {
      return res.status(400).json({ error: "Rejection reason must be between 10 and 500 characters." });
    }
    const enrollment = await EnrollmentModel.findById(id);
    if (!enrollment)                     return res.status(404).json({ error: "Enrollment not found." });
    if (enrollment.status !== "pending") return res.status(409).json({ error: "This request has already been processed." });

    const reason  = rejection_reason.trim();
    const updated = await EnrollmentModel.reject(id, req.admin.admin_id, reason);
    sendNotification({ student_id: updated.student_id, message: `Your enrollment for ${updated.term} was rejected. Reason: ${reason}`, type: "enrollment" });
    await AuditModel.log({ admin_id: req.admin.admin_id, action: "REJECT_ENROLLMENT", target_request_id: id });
    res.json({ message: "Enrollment rejected.", enrollment: updated });
  } catch (err) { next(err); }
}

/* ── Payments ──────────────────────────────────────────────── */
async function getPendingPayments(req, res, next) {
  try {
    const pending = await PaymentModel.findAllPending();
    const result  = await Promise.all(
      pending.map(async (p) => {
        const [rows] = await db.query("SELECT full_name FROM students WHERE student_id = ? LIMIT 1", [p.student_id]);
        return { ...p, student_name: rows[0]?.full_name || "Unknown" };
      })
    );
    res.json({ payments: result });
  } catch (err) { next(err); }
}

async function verifyPayment(req, res, next) {
  try {
    const id      = parseInt(req.params.id, 10);
    const payment = await PaymentModel.findById(id);
    if (!payment)                     return res.status(404).json({ error: "Payment not found." });
    if (payment.status !== "pending") return res.status(409).json({ error: "This request has already been processed." });

    const updated = await PaymentModel.verify(id, req.admin.admin_id);
    sendNotification({ student_id: updated.student_id, message: `Your payment of ₱${Number(updated.amount).toLocaleString()} (${updated.fee_item}) has been verified.`, type: "payment" });
    await AuditModel.log({ admin_id: req.admin.admin_id, action: "VERIFY_PAYMENT", target_request_id: id });
    res.json({ message: "Payment verified.", payment: updated });
  } catch (err) { next(err); }
}

/* ── Documents ─────────────────────────────────────────────── */
async function getPendingDocuments(req, res, next) {
  try {
    const pending = await DocumentModel.findAllPending();
    const result  = await Promise.all(
      pending.map(async (d) => {
        const [rows] = await db.query("SELECT full_name FROM students WHERE student_id = ? LIMIT 1", [d.student_id]);
        return { ...d, student_name: rows[0]?.full_name || "Unknown" };
      })
    );
    res.json({ documents: result });
  } catch (err) { next(err); }
}

async function approveDocument(req, res, next) {
  try {
    const id                        = parseInt(req.params.id, 10);
    const { expected_release_date } = req.body;
    if (!expected_release_date) return res.status(400).json({ error: "expected_release_date is required." });

    const doc = await DocumentModel.findById(id);
    if (!doc)                     return res.status(404).json({ error: "Document request not found." });
    if (doc.status !== "pending") return res.status(409).json({ error: "This request has already been processed." });

    const updated = await DocumentModel.approve(id, req.admin.admin_id, expected_release_date);
    sendNotification({ student_id: updated.student_id, message: `Your document request (${updated.document_type}) has been approved. Expected release: ${expected_release_date}.`, type: "document" });
    await AuditModel.log({ admin_id: req.admin.admin_id, action: "APPROVE_DOCUMENT", target_request_id: id });
    res.json({ message: "Document request approved.", document: updated });
  } catch (err) { next(err); }
}

async function rejectDocument(req, res, next) {
  try {
    const id               = parseInt(req.params.id, 10);
    const { rejection_reason } = req.body;
    if (!rejection_reason || rejection_reason.trim().length < 10 || rejection_reason.trim().length > 500) {
      return res.status(400).json({ error: "Rejection reason must be between 10 and 500 characters." });
    }
    const doc = await DocumentModel.findById(id);
    if (!doc)                     return res.status(404).json({ error: "Document request not found." });
    if (doc.status !== "pending") return res.status(409).json({ error: "This request has already been processed." });

    const reason  = rejection_reason.trim();
    const updated = await DocumentModel.reject(id, req.admin.admin_id, reason);
    sendNotification({ student_id: updated.student_id, message: `Your document request (${updated.document_type}) was rejected. Reason: ${reason}`, type: "document" });
    await AuditModel.log({ admin_id: req.admin.admin_id, action: "REJECT_DOCUMENT", target_request_id: id });
    res.json({ message: "Document request rejected.", document: updated });
  } catch (err) { next(err); }
}

async function getTeachers(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT id, teacher_id, full_name, department, email, created_at
       FROM teachers
       ORDER BY full_name`
    );
    res.json({ teachers: rows });
  } catch (err) { next(err); }
}

async function createTeacherAccount(req, res, next) {
  try {
    if (req.admin.role !== "principal") {
      return res.status(403).json({ error: "Only the principal can create teacher accounts." });
    }

    const { first_name, last_name, email, password } = req.body || {};
    const firstName = String(first_name || "").trim();
    const lastName = String(last_name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!firstName || !lastName || !normalizedEmail || !password) {
      return res.status(400).json({ error: "First name, last name, email, and password are required." });
    }

    if (firstName.length < 2 || lastName.length < 2 || normalizedEmail.length < 6 || password.length < 8) {
      return res.status(400).json({ error: "Please provide valid values. Password must be at least 8 characters long." });
    }

    const [existing] = await db.query(
      "SELECT id FROM teachers WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );
    if (existing.length) {
      return res.status(409).json({ error: "A teacher with this email already exists." });
    }

    const [teacherRows] = await db.query(
      "SELECT teacher_id FROM teachers WHERE teacher_id LIKE 'T%'"
    );
    const highestNumber = teacherRows.reduce((highest, row) => {
      const match = /^T(\d+)$/i.exec(String(row.teacher_id || ""));
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    const teacherId = `T${String(highestNumber + 1).padStart(3, "0")}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${firstName} ${lastName}`;

    const [result] = await db.query(
      `INSERT INTO teachers (teacher_id, password, full_name, department, email)
       VALUES (?, ?, ?, ?, ?)`,
      [teacherId, hashedPassword, fullName, "Unassigned", normalizedEmail]
    );

    res.status(201).json({
      message: "Teacher account created successfully.",
      teacher: { id: result.insertId, teacher_id: teacherId, full_name: fullName, email: normalizedEmail },
    });
  } catch (err) {
    next(err);
  }
}

async function reactivateStudent(req, res, next) {
  try {
    const studentId = req.params.student_id;

    const [result] = await db.query(
      `UPDATE students
       SET account_status = 'active'
       WHERE student_id = ? AND account_status = 'suspended'`,
      [studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Suspended student account not found.",
      });
    }

    res.json({
      message: "Student account reactivated successfully.",
      student_id: studentId,
      account_status: "active",
    });
  } catch (err) {
    next(err);
  }
}


module.exports = {
  createAdminAccount,
  listAdminAccounts,
  updateAdminAccount,
  archiveAdminAccount,
  deleteAdminAccount,
  getDashboard, searchStudents,
  reactivateStudent,
  getPendingEnrollments, approveEnrollment, rejectEnrollment,
  getPendingPayments, verifyPayment,
  getPendingDocuments, approveDocument, rejectDocument,
  getTeachers, createTeacherAccount,
};
