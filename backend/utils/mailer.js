/**
 * utils/mailer.js
 * Dual email provider system: Resend (primary) + Gmail SMTP (fallback)
 * 
 * CONFIGURATION:
 *   Set EMAIL_PROVIDER in .env to choose provider:
 *   - EMAIL_PROVIDER=resend (after domain verification)
 *   - EMAIL_PROVIDER=gmail (temporary/immediate use)
 *
 * RESEND Configuration:
 *   RESEND_API_KEY=your_api_key
 *   EMAIL_FROM="CFEI INFORM" <noreply@your-domain.com>
 *
 * GMAIL SMTP Configuration:
 *   GMAIL_USER=your-email@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx (16-char app password)
 *   
 * To generate Gmail App Password:
 *   1. Go to https://myaccount.google.com/security
 *   2. Enable 2-Step Verification
 *   3. Security → App passwords → Generate new
 */
require("dotenv").config();
const { Resend } = require("resend");
const nodemailer = require("nodemailer");

// Resend setup
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Gmail SMTP setup
const gmailTransporter = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null;

// Determine which provider to use
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';

/**
 * Send email using configured provider
 */
async function deliverEmail(message) {
  if (EMAIL_PROVIDER === 'gmail' && gmailTransporter) {
    // Use Gmail SMTP
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    };
    
    const info = await gmailTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent via Gmail to ${message.to}`);
    return info;
    
  } else if (EMAIL_PROVIDER === 'resend' && resend) {
    // Use Resend
    const { data, error } = await resend.emails.send(message);
    if (error) {
      throw new Error(error.message);
    }
    console.log(`✅ Email sent via Resend to ${message.to}`);
    return data;
    
  } else {
    throw new Error(`Email provider ${EMAIL_PROVIDER} is not configured properly. Check .env file.`);
  }
}

/**
 * Send enrollment credentials to an applicant.
 * @param {object} opts
 * @param {string} opts.to         - Recipient email
 * @param {string} opts.fullName   - Student's full name
 * @param {string} opts.studentId  - Generated student ID
 * @param {string} opts.tempPass   - Temporary password
 */
async function sendCredentials({ to, fullName, studentId, tempPass }) {
  const from = process.env.EMAIL_FROM || process.env.GMAIL_USER || "onboarding@resend.dev";
  
  const clientOrigins = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map(o => o.trim()) : [];
  const productionUrl = clientOrigins.find(url => url.startsWith("https://")) || clientOrigins[0] || "http://localhost:3000";
  const loginUrl = `${productionUrl}/login`;
  
  try {
    await deliverEmail({
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
    
    console.log(`✅ Credentials email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send credentials email to ${to}:`, error.message);
    throw error;
  }
}

async function sendRequirementsEmail({ to, fullName, dueDate }) {
  const from = process.env.EMAIL_FROM || process.env.GMAIL_USER || "onboarding@resend.dev";
  
  const requirements = [
    "School Form 9 / Report Card",
    "Birth Certificate",
    "Certificate of Good Moral Character",
    "2x2 Colored ID Pictures",
    "Certificate of Completion / Diploma",
    "School Form 10",
  ];

  try {
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
    
    console.log(`✅ Requirements email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send requirements email to ${to}:`, error.message);
    // Don't throw - this is non-critical
  }
}

module.exports = { sendCredentials, sendRequirementsEmail };
