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
    // get admin info
    const adminInfo = {
      full_name: req.admin.full_name || 'Admin', 
      role: req.admin.role || 'admin'
    };

    // Pending counts
    const pending = {
      enrollments: 0,
      payments:    (await PaymentModel.findAllPending()).length,
      documents:   (await DocumentModel.findAllPending()).length,
    };
    
    // Count pending enrollment applications (not approved/rejected)
    const [pendingAppsResult] = await db.query(
      `SELECT COUNT(*) as count 
       FROM enrollment_applications 
       WHERE status IN ('submitted', 'registrar_review', 'principal_review')`
    );
    pending.enrollments = pendingAppsResult[0]?.count || 0;
    pending.total = pending.enrollments + pending.payments + pending.documents;

    // Active students count
    const [activeStudentsResult] = await db.query(
      "SELECT COUNT(*) as count FROM students WHERE account_status = 'active'"
    );
    const activeStudents = activeStudentsResult[0]?.count || 0;

    // Average GWA - calculate from grades table
    const [avgGwaResult] = await db.query(
      `SELECT AVG(percentage) as avg_gwa 
       FROM grades 
       WHERE percentage IS NOT NULL`
    );
    const avgGwa = avgGwaResult[0]?.avg_gwa 
      ? parseFloat(avgGwaResult[0].avg_gwa).toFixed(2) 
      : "0.00";

    // Students by track and grade level for enrollment insights
    // Count from active students only (they were already created from approved applications)
    const [studentsByTrack] = await db.query(
      `SELECT 
        CASE 
          WHEN s.track IS NOT NULL AND s.strand IS NOT NULL 
          THEN CONCAT(s.track, ' - ', s.strand)
          ELSE s.pathway
        END as track,
        s.grade_level,
        ea.gender,
        COUNT(*) as count
       FROM students s
       LEFT JOIN enrollment_applications ea ON s.student_id = ea.generated_student_id
       WHERE s.account_status = 'active'
       GROUP BY s.track, s.strand, s.pathway, s.grade_level, ea.gender
       ORDER BY track, grade_level, gender`
    );

    // Recent activity - enrollments and payments
    const [recentEnrollments] = await db.query(
      `SELECT 
        ea.id,
        ea.generated_student_id as student_id, CONCAT(ea.first_name, ' ', ea.last_name) as full_name,
        ea.school_year as term,
        ea.status,
        ea.created_at
       FROM enrollment_applications ea
       WHERE ea.status IN ('pending', 'approved', 'rejected')
       ORDER BY ea.created_at DESC
       LIMIT 5`
    );

    const [recentPayments] = await db.query(
      `SELECT 
        p.id,
        p.student_id,
        s.full_name,
        p.amount,
        p.fee_item,
        p.status,
        p.paid_at as created_at
       FROM payments p
       JOIN students s ON p.student_id = s.student_id
       ORDER BY p.paid_at DESC
       LIMIT 5`
    );

    // Combine and format recent activity
    const recentActivity = [
      ...recentEnrollments.map(e => ({
        type: 'enrollment',
        action: `Enrollment ${e.status}`,
        name: e.full_name,
        time: new Date(e.created_at).toLocaleDateString('en-PH'),
        created_at: e.created_at
      })),
      ...recentPayments.map(p => ({
        type: 'payment',
        action: `Payment ${p.status} - ₱${Number(p.amount).toLocaleString()}`,
        name: p.full_name,
        time: new Date(p.created_at).toLocaleDateString('en-PH'),
        created_at: p.created_at
      }))
    ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
    .map(({ created_at, ...rest }) => rest); // Remove created_at from response

    res.json({ 
      pending,
      stats: {
        activeStudents,
        avgGwa,
      },
      enrollmentInsights: studentsByTrack,
      recentActivity,
      adminInfo
    });
  } catch (err) { next(err); }
}

/* ── Student listing & search ────────────────────────────── */
async function listStudents(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT 
        s.id, 
        s.student_id, 
        s.full_name, 
        s.pathway,
        s.track,
        s.strand,
        s.grade_level, 
        s.term,
        s.pathway AS course, 
        s.grade_level AS year_level, 
        s.term AS semester,
        s.email, 
        s.account_status,
        ROUND(AVG(g.percentage), 2) as gwa,
        NULL as room,
        ea.photo_url
       FROM students s
       LEFT JOIN grades g ON s.student_id = g.student_id
       LEFT JOIN enrollment_applications ea ON s.student_id = ea.generated_student_id
       GROUP BY s.id, s.student_id, s.full_name, s.pathway, s.track, s.strand, s.grade_level, s.term, s.email, s.account_status, ea.photo_url
       ORDER BY s.full_name`
    );

    res.json({ students: rows });
  } catch (err) { next(err); }
}

async function searchStudents(req, res, next) {
  try {
    const query = (req.query.q || "").trim();
    if (!query) return listStudents(req, res, next);

    const [rows] = await db.query(
      `SELECT 
        s.id, 
        s.student_id, 
        s.full_name, 
        s.pathway,
        s.track,
        s.strand,
        s.grade_level, 
        s.term,
        s.pathway AS course, 
        s.grade_level AS year_level, 
        s.term AS semester,
        s.email, 
        s.account_status,
        ROUND(AVG(g.percentage), 2) as gwa,
        NULL as room,
        ea.photo_url
       FROM students s
       LEFT JOIN grades g ON s.student_id = g.student_id
       LEFT JOIN enrollment_applications ea ON s.student_id = ea.generated_student_id
       WHERE s.full_name LIKE ? OR s.student_id LIKE ?
       GROUP BY s.id, s.student_id, s.full_name, s.pathway, s.track, s.strand, s.grade_level, s.term, s.email, s.account_status, ea.photo_url
       ORDER BY s.full_name`,
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
          "SELECT full_name, pathway FROM students WHERE student_id = ? LIMIT 1",
          [e.student_id]
        );
        const subjects = await Promise.all(
          e.subjects.map((sid) => ConfigModel.getSubjectById(sid))
        );
        return {
          ...e,
          student_name: students[0]?.full_name || "Unknown",
          course:       students[0]?.pathway    || "Unknown",
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
      `SELECT id, teacher_id, full_name, department, email, employment_type, term, account_status, created_at
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

    const { first_name, last_name, email, password, employment_type, term } = req.body || {};
    const firstName = String(first_name || "").trim();
    const lastName = String(last_name || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const employmentType = employment_type || "Full-time";
    const teacherTerm = term || null;

    if (!firstName || !lastName || !normalizedEmail || !password) {
      return res.status(400).json({ error: "First name, last name, email, and password are required." });
    }

    if (firstName.length < 2 || lastName.length < 2 || normalizedEmail.length < 6 || password.length < 8) {
      return res.status(400).json({ error: "Please provide valid values. Password must be at least 8 characters long." });
    }

    // Validate employment_type
    if (!["Part-time", "Full-time"].includes(employmentType)) {
      return res.status(400).json({ error: "Employment type must be either 'Part-time' or 'Full-time'." });
    }

    // Validate term if provided
    if (teacherTerm && !["Term 1", "Term 2", "Term 3"].includes(teacherTerm)) {
      return res.status(400).json({ error: "Term must be 'Term 1', 'Term 2', or 'Term 3'." });
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
      `INSERT INTO teachers (teacher_id, password, full_name, department, email, employment_type, term, account_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [teacherId, hashedPassword, fullName, "Unassigned", normalizedEmail, employmentType, teacherTerm, "active"]
    );

    res.status(201).json({
      message: "Teacher account created successfully.",
      teacher: { 
        id: result.insertId, 
        teacher_id: teacherId, 
        full_name: fullName, 
        email: normalizedEmail,
        employment_type: employmentType,
        term: teacherTerm,
        account_status: "active"
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateTeacher(req, res, next) {
  try {
    if (req.admin.role !== "principal") {
      return res.status(403).json({ error: "Only the principal can update teacher accounts." });
    }

    const { teacher_id } = req.params;
    const { first_name, last_name, email, employment_type, term } = req.body || {};

    // Fetch existing teacher
    const [existing] = await db.query(
      "SELECT * FROM teachers WHERE teacher_id = ? LIMIT 1",
      [teacher_id]
    );

    if (!existing.length) {
      return res.status(404).json({ error: "Teacher not found." });
    }

    const teacher = existing[0];
    const firstName = first_name ? String(first_name).trim() : teacher.full_name.split(" ")[0];
    const lastName = last_name ? String(last_name).trim() : teacher.full_name.split(" ").slice(1).join(" ");
    const normalizedEmail = email ? String(email).trim().toLowerCase() : teacher.email;
    const employmentType = employment_type || teacher.employment_type;
    const teacherTerm = term !== undefined ? term : teacher.term;

    // Validate employment_type
    if (!["Part-time", "Full-time"].includes(employmentType)) {
      return res.status(400).json({ error: "Employment type must be either 'Part-time' or 'Full-time'." });
    }

    // Validate term if provided
    if (teacherTerm && !["Term 1", "Term 2", "Term 3"].includes(teacherTerm)) {
      return res.status(400).json({ error: "Term must be 'Term 1', 'Term 2', or 'Term 3'." });
    }

    // Check if email is already taken by another teacher
    if (normalizedEmail !== teacher.email) {
      const [emailCheck] = await db.query(
        "SELECT id FROM teachers WHERE email = ? AND teacher_id != ? LIMIT 1",
        [normalizedEmail, teacher_id]
      );
      if (emailCheck.length) {
        return res.status(409).json({ error: "Email already in use by another teacher." });
      }
    }

    const fullName = `${firstName} ${lastName}`;

    await db.query(
      `UPDATE teachers 
       SET full_name = ?, email = ?, employment_type = ?, term = ?
       WHERE teacher_id = ?`,
      [fullName, normalizedEmail, employmentType, teacherTerm, teacher_id]
    );

    res.json({
      message: "Teacher updated successfully.",
      teacher: {
        teacher_id,
        full_name: fullName,
        email: normalizedEmail,
        employment_type: employmentType,
        term: teacherTerm
      }
    });
  } catch (err) {
    next(err);
  }
}

async function deactivateTeacher(req, res, next) {
  try {
    if (req.admin.role !== "principal") {
      return res.status(403).json({ error: "Only the principal can deactivate teacher accounts." });
    }

    const { teacher_id } = req.params;

    const [existing] = await db.query(
      "SELECT account_status FROM teachers WHERE teacher_id = ? LIMIT 1",
      [teacher_id]
    );

    if (!existing.length) {
      return res.status(404).json({ error: "Teacher not found." });
    }

    if (existing[0].account_status === "suspended") {
      return res.status(400).json({ error: "Teacher is already deactivated." });
    }

    await db.query(
      "UPDATE teachers SET account_status = 'suspended' WHERE teacher_id = ?",
      [teacher_id]
    );

    res.json({ message: "Teacher deactivated successfully." });
  } catch (err) {
    next(err);
  }
}

async function reactivateTeacher(req, res, next) {
  try {
    if (req.admin.role !== "principal") {
      return res.status(403).json({ error: "Only the principal can reactivate teacher accounts." });
    }

    const { teacher_id } = req.params;

    const [existing] = await db.query(
      "SELECT account_status FROM teachers WHERE teacher_id = ? LIMIT 1",
      [teacher_id]
    );

    if (!existing.length) {
      return res.status(404).json({ error: "Teacher not found." });
    }

    if (existing[0].account_status === "active") {
      return res.status(400).json({ error: "Teacher is already active." });
    }

    await db.query(
      "UPDATE teachers SET account_status = 'active' WHERE teacher_id = ?",
      [teacher_id]
    );

    res.json({ message: "Teacher reactivated successfully." });
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

async function deactivateStudent(req, res, next) {
  try {
    const studentId = req.params.student_id;

    const [result] = await db.query(
      `UPDATE students
       SET account_status = 'suspended'
       WHERE student_id = ? AND account_status = 'active'`,
      [studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Active student account not found.",
      });
    }

    res.json({
      message: "Student account deactivated successfully.",
      student_id: studentId,
      account_status: "suspended",
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
  getDashboard, searchStudents, listStudents,
  reactivateStudent,
  deactivateStudent,
  getPendingEnrollments, approveEnrollment, rejectEnrollment,
  getPendingPayments, verifyPayment,
  getPendingDocuments, approveDocument, rejectDocument,
  getTeachers, createTeacherAccount, updateTeacher, deactivateTeacher, reactivateTeacher,
};
