/**
 * modules/student/applicationController.js
 *
 * Enhanced Enrollment Application Workflow:
 *   1. Student submits form → status: pending_requirements
 *   2. Requirements email sent with deadline
 *   3. Student submits requirements → status: requirements_submitted
 *   4. Registrar reviews → status: under_registrar_review
 *   5. Registrar forwards to Principal → status: pending_principal_approval
 *   6. Principal approves → status: approved
 *   7. Registrar confirms official Student ID → status: pending_student_id_confirmation
 *   8. System creates account & sends credentials → status: enrolled
 *   
 * Rejection can happen at any review stage.
 */

const bcrypt          = require("bcryptjs");
const db              = require("../../config/db");
const ApplicationModel = require("./applicationModel");
const { sendRequirementsEmail, sendCredentials, sendRejectionEmail } = require("../../utils/mailer");
const { cloudinary } = require("../../config/cloudinary");
const NotificationService = require("../notifications/notificationService");

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
 * 
 * Changes:
 * - Immediately generates Student ID & temporary password
 * - Sends credentials email right away (no admin approval needed)
  * - Provides credentials by email without exposing them in a URL
 * ───────────────────────────────────────────────────────────── */
async function submitApplication(req, res, next) {
  try {
    // ✅ CHECK ENROLLMENT STATUS FIRST
    const [configRows] = await db.query(
      "SELECT enrollment_is_open, enrollment_start_date, enrollment_end_date, school_year FROM enrollment_config WHERE status = 'active' ORDER BY id DESC LIMIT 1"
    );
    
    if (!configRows[0]) {
      return res.status(503).json({ 
        error: "Enrollment system is not configured. Please contact the Registrar's Office." 
      });
    }

    const config = configRows[0];
    const now = new Date();

    // Check if enrollment is manually closed
    if (config.enrollment_is_open === 0) {
      return res.status(403).json({ 
        error: "Enrollment is currently closed. Please check back during the enrollment period or contact the Registrar's Office.",
        enrollment_closed: true,
        enrollment_status: "manually_closed"
      });
    }

    // Check if enrollment period hasn't started yet
    if (config.enrollment_start_date && now < new Date(config.enrollment_start_date)) {
      return res.status(403).json({ 
        error: `Enrollment has not yet opened. Enrollment begins on ${new Date(config.enrollment_start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
        enrollment_closed: true,
        enrollment_status: "not_yet_open",
        start_date: config.enrollment_start_date
      });
    }

    // Check if enrollment period has ended
    if (config.enrollment_end_date && now > new Date(config.enrollment_end_date)) {
      return res.status(403).json({ 
        error: `Enrollment period has ended. The deadline was ${new Date(config.enrollment_end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
        enrollment_closed: true,
        enrollment_status: "deadline_passed",
        end_date: config.enrollment_end_date
      });
    }

    // Store track and strand separately
    // Frontend sends: track="TECH-PRO", strand="Cookery" or track="Academic Track", strand="ABM"
    
    // Keep pathway for backward compatibility, but also store track and strand
    if (req.body.track && req.body.strand) {
      // For TECH-PRO track, map pathway to TVL-TechPro for compatibility
      if (req.body.track === "TECH-PRO") {
        req.body.pathway = "TVL-TechPro";
      } 
      // For Academic Track, use the strand as pathway
      else if (req.body.track === "Academic Track") {
        req.body.pathway = req.body.strand;
      }
      // Fallback: use strand
      else {
        req.body.pathway = req.body.strand;
      }
    }
    // Legacy compatibility: if only strand is provided
    else if (req.body.strand && !req.body.pathway) {
      req.body.pathway = req.body.strand;
    }

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

    const fullName = [req.body.first_name, req.body.middle_name, req.body.last_name, req.body.extension_name]
                       .filter(v => v?.trim())
                       .join(" ");

    // Get photo URL if uploaded
    const photoUrl = req.file ? req.file.path : null;

    // Get enrollment deadline for email
    const dueDate = config.enrollment_end_date
      ? new Date(config.enrollment_end_date).toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "the announced deadline";

    const app = await ApplicationModel.create({
      first_name:              req.body.first_name?.trim(),
      last_name:               req.body.last_name?.trim(),
      middle_name:             req.body.middle_name?.trim() || null,
      extension_name:          req.body.extension_name?.trim() || null,
      lrn:                     req.body.lrn?.trim() || null,
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
      track:                   req.body.track || null,
      strand:                  req.body.strand || null,
      grade_level:             parseInt(req.body.grade_level, 10),
      school_year:             req.body.school_year?.trim() || null,
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
      status:                  "submitted",
      photo_url:               photoUrl,
    });

    // Use the config already fetched above for the email deadline
      sendRequirementsEmail({
        to: req.body.email.trim().toLowerCase(),
        fullName,
        dueDate,
      }).catch(err => {
        console.error("Requirements email failed:", err.message);
      });

    // Notify Registrar of new application
    await NotificationService.notifyRole({
      role: 'registrar',
      message: `New Enrollment Application: ${fullName} (${req.body.email}) - Grade ${req.body.grade_level} ${req.body.pathway}`,
      type: 'enrollment',
      reference_id: app.id,
      reference_type: 'application',
    }).catch(err => console.error('Notification error:', err));

    res.status(201).json({
      message: "Application submitted successfully. Please submit your requirements before the deadline. Your application will be reviewed by the Registrar and Principal.",
      application_id: app.id,
      email: req.body.email.trim().toLowerCase(),
      instructions: "Check your email for the requirements checklist and deadline. Login credentials will be sent after Principal approval.",
    });
  } catch (err) { next(err); }
}

/* ─────────────────────────────────────────────────────────────
 * REGISTRAR — List all applications
 * GET /api/applications
 * ───────────────────────────────────────────────────────────── */
async function listApplications(req, res, next) {
  try {
    const [apps] = await db.query(`
      SELECT 
        id, first_name, middle_name, last_name, extension_name,
        email, phone, date_of_birth, gender, address,
        pathway, track, strand, grade_level, school_year,
        status, created_at, generated_student_id, official_student_id,
        photo_url, lrn
      FROM enrollment_applications
      WHERE status IN ('submitted','registrar_review','principal_review','pending_registrar','approved','rejected')
      ORDER BY created_at DESC
    `);
    res.json({ applications: apps });
  } catch (err) { next(err); }
}

/* ─────────────────────────────────────────────────────────────
 * REGISTRAR / PRINCIPAL — Get one application detail for review modal
 * GET /api/applications/:id
 * ───────────────────────────────────────────────────────────── */
async function getApplicationDetail(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const app = await ApplicationModel.findById(id);

    if (!app) {
      return res.status(404).json({ error: "Application not found." });
    }

    res.json({ application: app });
  } catch (err) {
    next(err);
  }
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
    if (!["submitted","registrar_review","pending_registrar"].includes(app.status)) {
      return res.status(409).json({ error: "Application is not in a forwardable state." });
    }

    const notePayload = {
      notes: req.body.registrar_note?.trim() || "",
      checklist: req.body.review_checklist || {},
    };

    const updated = await ApplicationModel.updateStatus(id, "principal_review", {
      reviewed_by_registrar: req.admin.admin_id,
      registrar_reviewed_at: new Date(),
      forwarded_to_principal_at: new Date(),
      registrar_note: JSON.stringify(notePayload),
    });

    // Notify Principal
    const fullName = [app.first_name, app.middle_name, app.last_name, app.extension_name].filter(Boolean).join(" ");
    await NotificationService.notifyRole({
      role: 'principal',
      message: `New Enrollment Application: ${fullName} (${app.email}) - Grade ${app.grade_level} ${app.pathway}. Please review and approve.`,
      type: 'enrollment_review',
      reference_id: app.id,
      reference_type: 'application',
    }).catch(err => console.error('Notification error:', err));

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
 * PRINCIPAL — Approve application (NO account creation yet)
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

    // Mark application approved - NO account creation yet
    const updated = await ApplicationModel.updateStatus(id, "approved", {
      reviewed_by_principal: req.admin.admin_id,
      principal_reviewed_at: new Date(),
      principal_note:        req.body.principal_note?.trim() || null,
    });

    // Notify Registrar to confirm Student ID
    await NotificationService.notifyRole({
      role: 'registrar',
      message: `Enrollment Approved: ${app.first_name} ${app.last_name} (${app.email}). Please confirm the official Student ID to create the account.`,
      type: 'enrollment_approved',
      reference_id: app.id,
      reference_type: 'application',
    }).catch(err => console.error('Notification error:', err));

    res.json({
      message: `Application approved. Registrar will confirm the official Student ID and create the account.`,
      application: updated,
    });
  } catch (err) { next(err); }
}

/* ─────────────────────────────────────────────────────────────
 * REGISTRAR — Confirm official Student ID and create account
 * PATCH /api/applications/:id/confirm-student-id
 * ───────────────────────────────────────────────────────────── */
async function confirmStudentId(req, res, next) {
  try {
    const id  = parseInt(req.params.id, 10);
    const { official_student_id } = req.body;

    if (!official_student_id?.trim()) {
      return res.status(400).json({ error: "Official Student ID is required." });
    }

    const app = await ApplicationModel.findById(id);
    if (!app) return res.status(404).json({ error: "Application not found." });
    if (app.status !== "approved") {
      return res.status(409).json({ error: "Application must be approved by Principal first." });
    }

    const studentId = official_student_id.trim();

    // Check if Student ID already exists
    const [existingRows] = await db.query(
      "SELECT id FROM students WHERE student_id = ? LIMIT 1",
      [studentId]
    );

    if (existingRows[0]) {
      return res.status(409).json({
        error: `Student ID ${studentId} already exists. Please use a different ID.`,
      });
    }

    // Generate temporary password
    const tempPass = generateTempPassword();
    const hashedPass = await bcrypt.hash(tempPass, 10);

    // Get current term
    const [configRows] = await db.query(
      "SELECT current_term FROM enrollment_config WHERE status = 'active' ORDER BY id DESC LIMIT 1"
    );
    const term = configRows[0]?.current_term || "Term 1";

    // Create student account with track and strand
    // Store track as-is from application (TECH-PRO or Academic Track)
    let trackValue = app.track;
    
    // Ensure consistent track naming
    if (app.pathway === 'TVL-TechPro' || app.track === 'TechPro Track' || app.track === 'TVL - Tech Pro') {
      trackValue = 'TECH-PRO';
    } else if (!app.track || app.track === '') {
      // Fallback: derive track from pathway if track is empty
      if (app.pathway === 'STEM' || app.pathway === 'ABM' || app.pathway === 'HUMSS') {
        trackValue = 'Academic Track';
      } else if (app.pathway === 'ICT' || app.pathway === 'Cookery') {
        trackValue = 'TECH-PRO';
      }
    }

    await db.query(
      `INSERT INTO students
      (student_id, password, full_name, pathway, track, strand, grade_level, term, email, account_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        studentId,
        hashedPass,
        [app.first_name, app.middle_name, app.last_name, app.extension_name].filter(Boolean).join(" "),
        app.pathway,     // Keep pathway for backward compatibility
        trackValue,      // Use mapped track value
        app.strand,      // Save strand from enrollment application
        app.grade_level,
        term,
        app.email,
      ]
    );

    // Mark application as enrolled with confirmed Student ID
    const updated = await ApplicationModel.updateStatus(id, "approved", {
      official_student_id:      studentId,
      student_id_confirmed_by:  req.admin.admin_id,
      student_id_confirmed_at:  new Date(),
      generated_student_id:     studentId,
      credentials_sent_at:      new Date(),
    });

    // Send credentials email
    sendCredentials({
      to: app.email,
      fullName: [app.first_name, app.middle_name, app.last_name, app.extension_name].filter(Boolean).join(" "),
      studentId,
      tempPass,
    }).catch(err => {
      console.error("Credentials email failed:", err.message);
    });

    // Notify student
    await NotificationService.notifyStudent({
      student_id: studentId,
      message: `Welcome to CFEI! Your enrollment is complete. Check your email for login credentials.`,
      type: 'enrollment',
    }).catch(err => console.error('Notification error:', err));

    res.json({
      message: `Student ID confirmed. Account ${studentId} created and credentials sent to ${app.email}.`,
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

    if (app.generated_student_id) {
      await db.query(
        "UPDATE students SET account_status = 'suspended' WHERE student_id = ?",
        [app.generated_student_id]
      );
    }

    const updated = await ApplicationModel.updateStatus(id, "rejected", {
      rejection_reason: rejection_reason.trim(),
      reviewed_by_principal: req.admin?.admin_id || null,
      principal_reviewed_at: new Date(),
    });

    // Send rejection email to applicant
    const fullName = [app.first_name, app.middle_name, app.last_name, app.extension_name].filter(Boolean).join(" ");
    sendRejectionEmail({
      to:              app.email,
      fullName,
      rejectionReason: rejection_reason.trim(),
      schoolYear:      app.school_year,
    }).catch(err => console.error("Rejection email failed:", err.message));

    res.json({ message: "Application rejected.", application: updated });
  } catch (err) { next(err); }
}

/**
 * GET /api/enrollment/status
 * Check if enrollment is currently open
 */
async function checkEnrollmentStatus(req, res, next) {
  try {
    const [configRows] = await db.query(
      "SELECT enrollment_is_open, enrollment_start_date, enrollment_end_date, school_year FROM enrollment_config WHERE status = 'active' ORDER BY id DESC LIMIT 1"
    );
    
    if (!configRows[0]) {
      return res.status(503).json({ 
        is_open: false,
        message: "Enrollment system is not configured.",
        status: "not_configured"
      });
    }

    const config = configRows[0];
    const now = new Date();

    // Check if manually closed
    if (config.enrollment_is_open === 0) {
      return res.json({ 
        is_open: false,
        message: "Enrollment is currently closed.",
        status: "manually_closed",
        school_year: config.school_year,
        start_date: config.enrollment_start_date,
        end_date: config.enrollment_end_date
      });
    }

    // Check if not yet started
    if (config.enrollment_start_date && now < new Date(config.enrollment_start_date)) {
      return res.json({ 
        is_open: false,
        message: `Enrollment opens on ${new Date(config.enrollment_start_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
        status: "not_yet_open",
        school_year: config.school_year,
        start_date: config.enrollment_start_date,
        end_date: config.enrollment_end_date
      });
    }

    // Check if ended
    if (config.enrollment_end_date && now > new Date(config.enrollment_end_date)) {
      return res.json({ 
        is_open: false,
        message: `Enrollment period ended on ${new Date(config.enrollment_end_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
        status: "deadline_passed",
        school_year: config.school_year,
        start_date: config.enrollment_start_date,
        end_date: config.enrollment_end_date
      });
    }

    // Enrollment is open!
    return res.json({ 
      is_open: true,
      message: "Enrollment is currently open.",
      status: "open",
      school_year: config.school_year,
      start_date: config.enrollment_start_date,
      end_date: config.enrollment_end_date
    });

  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/applications/:id/pending
 * Principal marks an application as pending — sends it back to Registrar for re-review.
 */
async function markAsPending(req, res, next) {
  try {
    const id  = parseInt(req.params.id, 10);
    const app = await ApplicationModel.findById(id);
    if (!app) return res.status(404).json({ error: "Application not found." });
    if (app.status !== "principal_review") {
      return res.status(409).json({ error: "Only applications under principal review can be marked as pending." });
    }

    const pendingNote = req.body.pending_note?.trim() || "Requirements incomplete. Please review and resubmit.";

    const updated = await ApplicationModel.updateStatus(id, "pending_registrar", {
      reviewed_by_principal: req.admin.admin_id,
      principal_reviewed_at: new Date(),
      principal_note: pendingNote,
    });

    // Notify Registrar to re-review
    const fullName = [app.first_name, app.middle_name, app.last_name, app.extension_name].filter(Boolean).join(" ");
    await NotificationService.notifyRole({
      role: 'registrar',
      message: `Application for ${fullName} (${app.email}) has been marked as pending by the Principal. Requirements may be incomplete — please follow up and re-forward when ready.`,
      type: 'enrollment_review',
      reference_id: app.id,
      reference_type: 'application',
    }).catch(err => console.error('Notification error:', err));

    res.json({
      message: "Application marked as pending. Registrar has been notified to follow up on missing requirements.",
      application: updated,
    });
  } catch (err) { next(err); }
}

module.exports = {
  submitApplication,
  listApplications,
  getApplicationDetail,
  forwardToPrincipal,
  listForPrincipal,
  approveApplication,
  confirmStudentId,
  rejectApplication,
  checkEnrollmentStatus,
  markAsPending,
};
