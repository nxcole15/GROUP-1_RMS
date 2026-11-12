/**
 * utils/mailer.js
 * Email service using Resend
 * 
 * CONFIGURATION:
 *   RESEND_API_KEY=re_xxxxxxxxxxxxx
 *   EMAIL_FROM="CFEI INFORM" <noreply@yourdomain.com>
 *
 * Setup Instructions:
 *   1. Buy domain on Cloudflare
 *   2. Sign up at resend.com
 *   3. Add and verify your domain in Resend
 *   4. Get API key from Resend dashboard
 *   5. Update .env file with your domain and API key
 */
require("dotenv").config();
const { Resend } = require("resend");

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend
 */
async function deliverEmail(message) {
  try {
    const { data, error } = await resend.emails.send(message);
    
    if (error) {
      console.error(`❌ Resend error:`, error);
      throw new Error(error.message);
    }
    
    console.log(`✅ Email sent successfully to ${message.to}`);
    return data;
  } catch (error) {
    console.error(`❌ Failed to send email:`, error);
    throw error;
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
  const from = process.env.EMAIL_FROM || "CFEI INFORM <noreply@resend.dev>";
  
  const clientOrigins = process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map(o => o.trim()) : [];
  const productionUrl = clientOrigins.find(url => url.startsWith("https://")) || clientOrigins[0] || "http://localhost:3000";
  const loginUrl = `${productionUrl}/login`;
  
  try {
    await deliverEmail({
      from,
      to,
      subject: "🎓 CFEI Enrollment Approved — Your Login Credentials",
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f0f4ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#dc2626);padding:32px 24px;text-align:center;">
      <!-- School Logo -->
      <img src="https://cfeistudentportal.com/cfei-logo.jpg" alt="CFEI Logo" style="width:80px;height:80px;margin-bottom:16px;border-radius:50%;border:3px solid rgba(255,255,255,0.3);object-fit:cover;">
      <h1 style="color:#fff;margin:0;font-size:22px;">🎓 Enrollment Approved!</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Welcome to Cebu Far East Institute</p>
    </div>
    <!-- Body -->
    <div style="padding:32px 24px;">
      <p style="color:#334155;font-size:15px;margin:0 0 16px;">Dear <strong>${fullName}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Congratulations! Your enrollment application has been <strong>approved by the Principal</strong>. 
        Your student account has been created. Below are your login credentials for the INFORM Student Portal.
      </p>

      <!-- Credentials box -->
      <div style="background:#f8fafc;border:2px solid #1e40af;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
        <div style="margin-bottom:14px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-bottom:4px;">Student ID</div>
          <div style="font-size:24px;font-weight:900;color:#1e40af;letter-spacing:0.04em;">${studentId}</div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-bottom:4px;">Password</div>
          <div style="font-size:24px;font-weight:900;color:#dc2626;letter-spacing:0.04em;font-family:monospace;">${tempPass}</div>
        </div>
      </div>

      <div style="background:#fef3c7;border:2px solid #fbbf24;border-radius:8px;padding:14px 18px;margin-bottom:24px;font-size:13px;color:#78350f;">
        <strong>⚠️ Important Security Notice:</strong>
        <ul style="margin:8px 0 0;padding-left:20px;">
          <li>Keep these credentials private and secure</li>
          <li>Do not share with anyone</li>
        </ul>
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#1e40af,#dc2626);color:#fff;font-weight:700;font-size:15px;padding:14px 40px;border-radius:8px;text-decoration:none;box-shadow:0 4px 12px rgba(30,64,175,0.3);">
          Login to INFORM Portal →
        </a>
      </div>

      <div style="background:#f1f5f9;border-left:4px solid #3b82f6;padding:12px 16px;margin-bottom:20px;border-radius:4px;">
        <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
          <strong>Next Steps:</strong><br/>
          1. Log in using your credentials above<br/>
          2. Complete your student profile<br/>
          3. Check your class schedule
        </p>
      </div>

      <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
        Need help? Contact the Registrar's Office:<br/>
        📧 <a href="mailto:registrar@cfei.edu" style="color:#1e40af;text-decoration:none;">registrar@cfei.edu</a><br/>
        🏢 Room 101, Admin Building (Mon–Fri, 8AM–5PM)
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f1f5f9;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">© ${new Date().getFullYear()} Cebu Far East Institute · INFORM Student Portal</p>
    </div>
  </div>
</body>
</html>`,
    });
    
    console.log(`✅ Credentials email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send credentials email to ${to}:`, error.message);
    throw error;
  }
}

async function sendRequirementsEmail({ to, fullName, dueDate }) {
  const from = process.env.EMAIL_FROM || "CFEI INFORM <noreply@resend.dev>";
  
  const requirements = [
    "School Form 9 / Report Card",
    "Birth Certificate (PSA Copy)",
    "Certificate of Good Moral Character",
    "2x2 Colored ID Pictures (3 copies)",
    "Certificate of Completion / Diploma",
    "School Form 10 (if applicable)",
  ];

  try {
    await deliverEmail({
      from,
      to,
      subject: "📋 CFEI Enrollment Application Received — Requirements Needed",
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f0f4ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#dc2626);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">📋 Application Received</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Cebu Far East Institute</p>
    </div>
    <!-- Body -->
    <div style="padding:32px 24px;">
      <p style="color:#334155;font-size:15px;margin:0 0 16px;">Dear <strong>${fullName}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Thank you for submitting your enrollment application to <strong>Cebu Far East Institute</strong>. 
        We have received your application and it is now under review.
      </p>

      <div style="background:#fef3c7;border:2px solid #fbbf24;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#78350f;font-weight:600;">
          ⏰ Requirements Deadline: <span style="font-size:16px;">${dueDate}</span>
        </p>
      </div>

      <h3 style="color:#1e40af;font-size:16px;margin:0 0 16px;">📑 Required Documents</h3>
      <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <ol style="margin:0;padding-left:20px;color:#475569;">
          ${requirements.map(item => `<li style="margin-bottom:8px;font-size:14px;">${item}</li>`).join("")}
        </ol>
      </div>

      <div style="background:#dbeafe;border-left:4px solid #3b82f6;padding:14px 18px;margin-bottom:24px;border-radius:4px;">
        <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.6;">
          <strong>📍 Where to Submit:</strong><br/>
          Registrar's Office, Room 101, Admin Building<br/>
          Monday to Friday, 8:00 AM – 5:00 PM
        </p>
      </div>

      <h3 style="color:#1e40af;font-size:16px;margin:0 0 12px;">🔄 What Happens Next?</h3>
      <ol style="color:#475569;font-size:14px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>Submit your requirements before the deadline</li>
        <li>Our Registrar will verify all documents</li>
        <li>Application forwarded to Principal for approval</li>
        <li>You'll receive your login credentials via email</li>
      </ol>

      <div style="text-align:center;margin-bottom:24px;">
        <p style="color:#64748b;font-size:13px;margin:0 0 12px;">Questions about your application?</p>
        <a href="mailto:registrar@cfei.edu" style="display:inline-block;background:#1e40af;color:#fff;font-weight:600;font-size:14px;padding:12px 32px;border-radius:8px;text-decoration:none;">
          Contact Registrar's Office
        </a>
      </div>

      <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;text-align:center;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f1f5f9;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">© ${new Date().getFullYear()} Cebu Far East Institute · INFORM System</p>
    </div>
  </div>
</body>
</html>`,
    });
    
    console.log(`✅ Requirements email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send requirements email to ${to}:`, error.message);
    // Don't throw - this is non-critical
  }
}

async function sendPasswordResetCode({ to, fullName, code }) {
  const from = process.env.EMAIL_FROM || "CFEI INFORM <noreply@resend.dev>";

  try {
    await deliverEmail({
      from,
      to,
      subject: "🔐 CFEI INFORM — Password Reset Verification Code",
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f0f4ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#dc2626,#f97316);padding:32px 24px;text-align:center;">
      <img src="https://cfeistudentportal.com/cfei-logo.jpg" alt="CFEI Logo" style="width:72px;height:72px;margin-bottom:16px;border-radius:50%;border:3px solid rgba(255,255,255,0.3);object-fit:cover;">
      <h1 style="color:#fff;margin:0;font-size:22px;">🔐 Password Reset</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Cebu Far East Institute — INFORM Portal</p>
    </div>
    <div style="padding:32px 24px;">
      <p style="color:#334155;font-size:15px;margin:0 0 16px;">Dear <strong>${fullName}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
        We received a request to reset your INFORM Portal password. Use the verification code below to continue.
        This code expires in <strong>15 minutes</strong>.
      </p>

      <div style="background:#fff7ed;border:2px solid #f97316;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9a3412;margin-bottom:12px;">Your Verification Code</div>
        <div style="font-size:40px;font-weight:900;color:#dc2626;letter-spacing:0.25em;font-family:monospace;">${code}</div>
      </div>

      <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;margin-bottom:24px;border-radius:4px;">
        <p style="margin:0;font-size:13px;color:#7f1d1d;line-height:1.6;">
          <strong>⚠️ Security Notice:</strong> If you did not request a password reset, please ignore this email.
          Your password will remain unchanged.
        </p>
      </div>

      <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;text-align:center;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
    <div style="background:#f1f5f9;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">© ${new Date().getFullYear()} Cebu Far East Institute · INFORM Student Portal</p>
    </div>
  </div>
</body>
</html>`,
    });
    console.log(`✅ Password reset code sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${to}:`, error.message);
    throw error;
  }
}

module.exports = { sendCredentials, sendRequirementsEmail, sendRejectionEmail, sendPasswordResetCode };

async function sendRejectionEmail({ to, fullName, rejectionReason, schoolYear }) {
  const from = process.env.EMAIL_FROM || "CFEI INFORM <noreply@resend.dev>";

  try {
    await deliverEmail({
      from,
      to,
      subject: "❌ CFEI Enrollment Application — Update on Your Application",
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;background:#f0f4ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Application Status Update</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Cebu Far East Institute${schoolYear ? ` · SY ${schoolYear}` : ""}</p>
    </div>
    <!-- Body -->
    <div style="padding:32px 24px;">
      <p style="color:#334155;font-size:15px;margin:0 0 16px;">Dear <strong>${fullName}</strong>,</p>
      <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Thank you for your interest in enrolling at <strong>Cebu Far East Institute</strong>. 
        After careful review of your enrollment application, we regret to inform you that your 
        application has not been approved at this time.
      </p>

      <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:8px;padding:18px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;color:#991b1b;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Reason for Rejection</p>
        <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.7;">${rejectionReason || "Your application did not meet the enrollment requirements."}</p>
      </div>

      <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:14px 18px;margin-bottom:24px;border-radius:4px;">
        <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.6;">
          <strong>📞 Questions or Appeals?</strong><br/>
          If you believe this decision was made in error or would like further clarification, 
          please contact the Registrar's Office directly.
        </p>
      </div>

      <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:600;">📍 Registrar's Office</p>
        <p style="margin:0;font-size:13px;color:#475569;line-height:1.8;">
          Room 101, Admin Building<br/>
          Monday – Friday · 8:00 AM – 5:00 PM<br/>
          Email: registrar@cfei.edu.ph
        </p>
      </div>

      <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;text-align:center;">
        This is an automated message. Please do not reply to this email directly.
      </p>
    </div>
    <!-- Footer -->
    <div style="background:#f1f5f9;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#94a3b8;font-size:11px;margin:0;">© ${new Date().getFullYear()} Cebu Far East Institute · INFORM System</p>
    </div>
  </div>
</body>
</html>`,
    });
    console.log(`✅ Rejection email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send rejection email to ${to}:`, error.message);
  }
}
