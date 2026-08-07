/**
 * modules/student/applicationController.js
 *
 * Enrollment application flow:
 *   1. Student submits form  → POST /api/applications        (public, no token)
 *   2. Registrar reviews     → GET  /api/applications        (admin token, registrar role)
 *                           → PATCH /api/applications/:id/forward  (send to principal)
 *                           → PATCH /api/applications/:id/reject
 *   3. Principal reviews     → GET  /api/applications/principal
 *                           → PATCH /api/applications/:id/approve  (creates student account + sends email)
 *                           → PATCH /api/applications/:id/reject
 */
const bcrypt          = require("bcryptjs");
const db              = require("../../config/db");
const ApplicationModel = require("./applicationModel");
const { sendCredentials } = require("../../utils/mailer");

/* ── helpers ── */
function generateStudentId() {
  const y = new Date().getFullYear();
  const rand = String(Math.floor(Math.random() * 900000) + 100000); // 6 digits
  return `${y}${rand}`;
}

function generateTempPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pw = "Cfei@";
  for (let i = 0; i < 6; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

/* ─────────────────────────────────────────────────────────────
 * PUBLIC — Student submits enrollment application
 * POST /api/applications
 * ───────────────────────────────────────────────────────────── */
async function submitApplication(req, res, next) {
  try {
    const required = [
      "first_name","last_name","email","phone","date_of_birth",
      "gender","nationality","address","pathway","grade_level","learning_modality",
    ];
    for (const field of required) {
      if (!req.body[field]?.toString().trim()) {
        return res.status(400).json({ error: `${field.replace(/_/g," ")} is required.` });
      }
    }

    // Prevent duplicate pending applications for same email
    const [existing] = await db.query(
      `SELECT id FROM enrollment_applications
       WHERE email = ? AND status NOT IN ('rejected')
       LIMIT 1`,
      [req.body.email.trim().toLowerCase()]
    );
    if (existing[0]) {
      return res.status(409).json({
        error: "An application with this email is already pending. Please contact the Registrar's Office.",
      });
    }

    const app = await ApplicationModel.create({
      first_name:              req.body.first_name?.trim(),
      last_name:               req.body.last_name?.trim(),
      middle_name:             req.body.middle_name?.trim() || null,
      extension_name:          req.body.extension_name?.trim() || null,
      email:                   req.body.email?.trim().toLowerCase(),
      phone:                   req.body.phone?.trim(),
      date_of_birth:           req.body.date_of_birth,
      gender:                  req.body.gender,
      civil_status:            req.body.civil_status || null,
      nationality:             req.body.nationality?.trim(),
      religion:                req.body.religion?.trim() || null,
      address:                 req.body.address?.trim(),
      student_status:          req.body.student_status || "new",
      existing_student_id:     req.body.existing_student_id?.trim() || null,
      pathway:                 req.body.pathway,
      grade_level:             parseInt(req.body.grade_level, 10),
      learning_modality:       req.body.learning_modality,
      father_name:             req.body.father_name?.trim() || null,
      father_occupation:       req.body.father_occupation?.trim() || null,
      mother_name:             req.body.mother_name?.trim() || null,
      mother_occupation:       req.body.mother_occupation?.trim() || null,
      guardian_name:           req.body.guardian_name?.trim() || null,
      guardian_relation:       req.body.guardian_relation?.trim() || null,
      guardian_phone:          req.body.guardian_phone?.trim() || null,
      previous_school:         req.body.previous_school?.trim() || null,
      previous_school_address: req.body.previous_school_address?.trim() || null,
      years_attended:          req.body.years_attended?.trim() || null,
    });

    res.status(201).json({
      message: "Application submitted successfully. The Registrar will review it and you will receive an email once approved.",
      application_id: app.id,
    });
  } catch (err) { next(err); }
}

/* ─────────────────────────────────────────────────────────────
 * REGISTRAR — List all applications
 * GET /api/applications
 * ───────────────────────────────────────────────────────────── */
async function listApplications(req, res, next) {
  try {
    const apps = await ApplicationModel.findForRegistrar();
    res.json({ applications: apps });
  } catch (err) { next(err); }
}

/* ─────────────────────────────────────────────────────────────
 * REGISTRAR — Forward to principal for approval
 * PATCH /api/applications/:id/forward
 * ───────────────────────────────────────────────────────────── */
async function forwardToPrincipal(req, res, next) {
  try {
    const id  = parseInt(req.params.id, 10);
    const app = await ApplicationModel.findById(id);
    if (!app) return res.status(404).json({ error: "Application not found." });
    if (!["submitted","registrar_review"].includes(app.status)) {
      return res.status(409).json({ error: "Application is not in a forwardable state." });
    }

    const updated = await ApplicationModel.updateStatus(id, "principal_review", {
      reviewed_by_registrar: req.admin.admin_id,
      registrar_reviewed_at: new Date(),
      registrar_note:        req.body.registrar_note?.trim() || null,
    });

    res.json({ message: "Application forwarded to the Principal.", application: updated });
  } catch (err) { next(err); }
}

/* ─────────────────────────────────────────────────────────────
 * PRINCIPAL — List applications pending principal review
 * GET /api/applications/principal
 * ───────────────────────────────────────────────────────────── */
async function listForPrincipal(req, res, next) {
  try {
    const apps = await ApplicationModel.findForPrincipal();
    res.json({ applications: apps });
  } catch (err) { next(err); }
}

/* ─────────────────────────────────────────────────────────────
 * PRINCIPAL — Approve application → create student account → send email
 * PATCH /api/applications/:id/approve
 * ───────────────────────────────────────────────────────────── */
async function approveApplication(req, res, next) {
  try {
    const id  = parseInt(req.params.id, 10);
    const app = await ApplicationModel.findById(id);
    if (!app) return res.status(404).json({ error: "Application not found." });
    if (app.status !== "principal_review") {
      return res.status(409).json({ error: "Application is not pending principal review." });
    }

    // Generate unique student ID (retry if collision)
    let studentId;
    for (let i = 0; i < 5; i++) {
      const candidate = generateStudentId();
      const [rows] = await db.query(
        "SELECT id FROM students WHERE student_id = ? LIMIT 1", [candidate]
      );
      if (!rows[0]) { studentId = candidate; break; }
    }
    if (!studentId) return res.status(500).json({ error: "Could not generate a unique student ID. Please try again." });

    const tempPass   = generateTempPassword();
    const hashedPass = await bcrypt.hash(tempPass, 10);
    const fullName   = [app.first_name, app.middle_name, app.last_name, app.extension_name]
                         .filter(Boolean).join(" ");

    // Determine active term from config
    const [configRows] = await db.query(
      "SELECT active_term FROM enrollment_config ORDER BY id DESC LIMIT 1"
    );
    const term = configRows[0]?.active_term || "2nd Semester SY 2025-2026";

    // Create student account
    await db.query(
      `INSERT INTO students
         (student_id, password, full_name, pathway, grade_level, term, email, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [studentId, hashedPass, fullName, app.pathway, app.grade_level, term, app.email]
    );

    // Mark application approved and save generated credentials
    const updated = await ApplicationModel.updateStatus(id, "approved", {
      reviewed_by_principal: req.admin.admin_id,
      principal_reviewed_at: new Date(),
      principal_note:        req.body.principal_note?.trim() || null,
      generated_student_id:  studentId,
      temp_password:         tempPass,           // stored in plain text for audit; student must change it
      credentials_sent_at:   new Date(),
    });

    // Send credentials email (non-blocking — don't fail the request if email fails)
    sendCredentials({ to: app.email, fullName, studentId, tempPass })
      .then(() => console.log(`📧  Credentials sent to ${app.email}`))
      .catch(err => console.error("⚠️  Failed to send credentials email:", err.message));

    res.json({
      message:    `Application approved. Student account created and credentials emailed to ${app.email}.`,
      student_id: studentId,
      application: updated,
    });
  } catch (err) { next(err); }
}

/* ─────────────────────────────────────────────────────────────
 * REGISTRAR or PRINCIPAL — Reject application
 * PATCH /api/applications/:id/reject
 * ───────────────────────────────────────────────────────────── */
async function rejectApplication(req, res, next) {
  try {
    const id               = parseInt(req.params.id, 10);
    const { rejection_reason } = req.body;
    if (!rejection_reason?.trim()) {
      return res.status(400).json({ error: "rejection_reason is required." });
    }

    const app = await ApplicationModel.findById(id);
    if (!app) return res.status(404).json({ error: "Application not found." });
    if (["approved","rejected"].includes(app.status)) {
      return res.status(409).json({ error: "Application has already been processed." });
    }

    const updated = await ApplicationModel.updateStatus(id, "rejected", {
      rejection_reason: rejection_reason.trim(),
      reviewed_by_principal: req.admin?.admin_id || null,
      principal_reviewed_at: new Date(),
    });

    res.json({ message: "Application rejected.", application: updated });
  } catch (err) { next(err); }
}

module.exports = {
  submitApplication,
  listApplications,
  forwardToPrincipal,
  listForPrincipal,
  approveApplication,
  rejectApplication,
};
