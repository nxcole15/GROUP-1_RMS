/**
 * utils/mailer.js
 * Nodemailer transporter — used to email credentials to approved students.
 *
 * Setup (Gmail):
 *   1. Go to Google Account → Security → App Passwords
 *   2. Generate an app password for "Mail"
 *   3. Set SMTP_USER and SMTP_PASS in server/.env
 *
 * If SMTP_USER is not set the mailer falls back to Ethereal (test) transport
 * so development still works without real email credentials.
 */
require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  // Real SMTP transport (Gmail / SendGrid / etc.)
  transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST || "smtp.gmail.com",
    port:   parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log("✅  Mailer: using SMTP transport →", process.env.SMTP_HOST);
} else {
  // Ethereal test transport — no real emails sent, preview URL logged instead
  nodemailer.createTestAccount().then((account) => {
    transporter = nodemailer.createTransport({
      host:   "smtp.ethereal.email",
      port:   587,
      secure: false,
      auth: { user: account.user, pass: account.pass },
    });
    console.log("⚠️  Mailer: no SMTP credentials found — using Ethereal test transport");
    console.log("   Ethereal user:", account.user);
  });
}

/**
 * Send enrollment credentials to an approved student.
 * @param {object} opts
 * @param {string} opts.to         - Recipient email
 * @param {string} opts.fullName   - Student's full name
 * @param {string} opts.studentId  - Generated student ID
 * @param {string} opts.tempPass   - Temporary password
 */
async function sendCredentials({ to, fullName, studentId, tempPass }) {
  if (!transporter) {
    console.warn("⚠️  Mailer not ready yet — skipping email to", to);
    return;
  }

  const from = process.env.EMAIL_FROM || '"CFEI INFORM System" <no-reply@cfei.edu>';
  const loginUrl = process.env.CLIENT_ORIGIN
    ? `${process.env.CLIENT_ORIGIN}/login`
    : "http://localhost:3000/login";

  const info = await transporter.sendMail({
    from,
    to,
    subject: "🎓 Your CFEI Enrollment Has Been Approved — Login Credentials",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f0f4ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#dc2626);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">🎓 Enrollment Approved!</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Cebu Far East Institute — INFORM Student Portal</p>
    </div>
    <!-- Body -->
    <div style="padding:32px 24px;">
      <p style="color:#334155;font-size:15px;margin:0 0 16px;">Dear <strong>${fullName}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Congratulations! Your enrollment application to <strong>Cebu Far East Institute</strong> has been reviewed and <strong>approved</strong>.
        Below are your login credentials for the INFORM Student Portal.
      </p>

      <!-- Credentials box -->
      <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;margin-bottom:4px;">Student ID</div>
          <div style="font-size:22px;font-weight:900;color:#1e40af;letter-spacing:0.04em;">${studentId}</div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;margin-bottom:4px;">Temporary Password</div>
          <div style="font-size:22px;font-weight:900;color:#dc2626;letter-spacing:0.04em;">${tempPass}</div>
        </div>
      </div>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:13px;color:#92400e;">
        ⚠️ <strong>Important:</strong> Please change your password immediately after your first login.
        Do not share your credentials with anyone.
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#dc2626);color:#fff;font-weight:700;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;">
          Go to INFORM Portal →
        </a>
      </div>

      <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
        If you have any concerns, please contact the Registrar's Office at
        <a href="mailto:registrar@cfei.edu" style="color:#1e40af;">registrar@cfei.edu</a>
        or visit Room 101, Admin Building (Mon–Fri, 8AM–5PM).
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f1f5f9;padding:16px 24px;text-align:center;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">© ${new Date().getFullYear()} Cebu Far East Institute · INFORM System</p>
    </div>
  </div>
</body>
</html>`,
    text: `Dear ${fullName},\n\nYour enrollment has been approved.\n\nStudent ID: ${studentId}\nTemporary Password: ${tempPass}\n\nLogin at: ${loginUrl}\n\nPlease change your password after first login.\n\n— CFEI INFORM System`,
  });

  // Log Ethereal preview URL when using test transport
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("📧  Email preview (Ethereal):", previewUrl);
  }

  return info;
}

module.exports = { sendCredentials };
