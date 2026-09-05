/**
 * utils/mailer.js
 * resend — used to email credentials to applicants.
 *
 * SMTP Configuration Required:
 *   Set these in server/.env:
 *   - SMTP_HOST (e.g., smtp.gmail.com)
 *   - SMTP_PORT (e.g., 587)
 *   - SMTP_USER (your email address)
 *   - SMTP_PASS (your app password or API key)
 *   - EMAIL_FROM (optional, defaults to SMTP_USER)
 *
 * Example for Gmail:
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your-email@gmail.com
 *   SMTP_PASS=xxxx xxxx xxxx xxxx (16-char app password)
 *   EMAIL_FROM="CFEI INFORM" <your-email@gmail.com>
 *
 * Example for SendGrid:
 *   SMTP_HOST=smtp.sendgrid.net
 *   SMTP_PORT=587
 *   SMTP_USER=apikey
 *   SMTP_PASS=SG.your_api_key_here
 *   EMAIL_FROM=noreply@cfei.edu
 */
  require("dotenv").config();
  const { Resend } = require("resend");

  const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

    async function deliverEmail(message) {
      if (!resend) {
        throw new Error("RESEND_API_KEY is not configured.");
      }

      const { data, error } = await resend.emails.send(message);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }

/**
 *Send enrollment credentials to an applicant.
 * @param {object} opts
 * @param {string} opts.to         - Recipient email
 * @param {string} opts.fullName   - Student's full name
 * @param {string} opts.studentId  - Generated student ID
 * @param {string} opts.tempPass   - Temporary password
 */
async function sendCredentials({ to, fullName, studentId, tempPass }) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  
  // For emails, always use production URL if available (first URL in comma-separated list)
  const clientOrigins = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map(o => o.trim()) : [];
  const productionUrl = clientOrigins.find(url => url.startsWith("https://")) || clientOrigins[0] || "http://localhost:3000";
  const loginUrl = `${productionUrl}/login`;
  


  const info = await deliverEmail({
    from,
    to,
    subject: "CFEI Enrollment Application Received — Login Credentials",
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f0f4ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#dc2626);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;"> 🎓 Enrollment Application Received</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px;">Cebu Far East Institute — INFORM Student Portal</p>
    </div>
    <!-- Body -->
    <div style="padding:32px 24px;">
      <p style="color:#334155;font-size:15px;margin:0 0 16px;">Dear <strong>${fullName}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Thank you for submitting your enrollment application to <strong>Cebu Far East Institute</strong>.
        Below are your login credentials for the INFORM Student Portal. Your account will become active after Principal approval.
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
        ⚠️ <strong>Important:</strong> Your account is not active yet. You may log in after Principal approval.
        Please change your password after your first login and do not share your credentials.
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
    text: `Dear ${fullName},

    Your enrollment application has been received.

    Student ID: ${studentId}
    Temporary Password: ${tempPass}

    Your account will become active after Principal approval.
    Login at: ${loginUrl}

    Please change your password after Principal approval.

    CFEI INFORM System`,
  });

  console.log(`✅  Email sent successfully to ${to}`);
  return info;
}

async function sendRequirementsEmail({ to, fullName, dueDate }) {
    if (!resend) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const requirements = [
    "School Form 9 / Report Card",
    "Birth Certificate",
    "Certificate of Good Moral Character",
    "2x2 Colored ID Pictures",
    "Certificate of Completion / Diploma",
    "School Form 10",
  ];

  await deliverEmail({
    from,
    to,
    subject: "CFEI Enrollment Application Received - Requirements Needed",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#334155;">
        <h2 style="color:#1e40af;">Enrollment Application Received</h2>

        <p>Dear <strong>${fullName}</strong>,</p>

        <p>
          We received your enrollment application for Cebu Far East Institute.
          Please submit the following requirements before the deadline:
        </p>

        <ul>
          ${requirements.map(item => `<li>${item}</li>`).join("")}
        </ul>

        <p>
          <strong>Requirements deadline:</strong> ${dueDate}
        </p>

        <p>
          Your application will be reviewed by the Registrar and then forwarded
          to the Principal for final approval.
        </p>

        <p>
          Your student account and login credentials will be sent only after
          Principal approval.
        </p>

        <p>
          Regards,<br />
          CFEI INFORM System
        </p>
      </div>
    `,
    text: `Dear ${fullName},

We received your enrollment application for Cebu Far East Institute.

Please submit these requirements:
${requirements.map(item => `- ${item}`).join("\n")}

Requirements deadline: ${dueDate}

Your application will be reviewed by the Registrar and then forwarded to the Principal.

Your student account and login credentials will be sent only after Principal approval.

CFEI INFORM System`,
  });
}

module.exports = { sendCredentials, sendRequirementsEmail };
