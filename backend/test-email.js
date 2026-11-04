/**
 * test-email.js
 * Quick test script to verify Gmail SMTP email configuration
 * 
 * Usage:
 *   1. Make sure GMAIL_USER and GMAIL_APP_PASSWORD are set in .env
 *   2. Run: node test-email.js
 *   3. Check your email inbox
 */

require("dotenv").config();
const nodemailer = require("nodemailer");

async function testGmailSMTP() {
  console.log("\n🔧 Testing Gmail SMTP Configuration...\n");

  // Check environment variables
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM || gmailUser;

  if (!gmailUser || !gmailAppPassword) {
    console.error("❌ ERROR: Gmail SMTP not configured!");
    console.error("\nPlease add to your .env file:");
    console.error("  GMAIL_USER=your-email@gmail.com");
    console.error("  GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx");
    console.error("\nTo generate Gmail App Password:");
    console.error("  1. Go to https://myaccount.google.com/security");
    console.error("  2. Enable 2-Step Verification (if not already)");
    console.error("  3. Security → App passwords → Generate new");
    console.error("  4. Copy the 16-character password to .env\n");
    process.exit(1);
  }

  console.log("✅ Environment variables found:");
  console.log(`   GMAIL_USER: ${gmailUser}`);
  console.log(`   GMAIL_APP_PASSWORD: ${gmailAppPassword.substring(0, 4)}... (hidden)`);
  console.log(`   EMAIL_FROM: ${emailFrom}\n`);

  // Create transporter
  console.log("📧 Creating Gmail SMTP transporter...");
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  // Verify connection
  console.log("🔍 Verifying SMTP connection...");
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified!\n");
  } catch (error) {
    console.error("❌ SMTP connection failed!");
    console.error(`   Error: ${error.message}`);
    console.error("\nPossible issues:");
    console.error("  1. Incorrect Gmail App Password");
    console.error("  2. 2-Step Verification not enabled");
    console.error("  3. Firewall blocking SMTP port 587");
    console.error("  4. No internet connection\n");
    process.exit(1);
  }

  // Send test email
  console.log("📤 Sending test email...");
  const mailOptions = {
    from: emailFrom,
    to: gmailUser, // Send to yourself for testing
    subject: "✅ CFEI INFORM System - Email Test Successful",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">🎉 Email Configuration Successful!</h2>
        <p>Your Gmail SMTP email system is working correctly.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>Provider: Gmail SMTP</li>
          <li>From: ${emailFrom}</li>
          <li>To: ${gmailUser}</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>✅ Test with real student enrollment flow</li>
          <li>✅ Go to school and enroll students</li>
          <li>⏳ Complete domain verification for permanent solution</li>
        </ol>
        <p style="color: #666; font-size: 12px;">
          This is an automated test message from the CFEI INFORM Student Portal system.
        </p>
      </div>
    `,
    text: `
Email Configuration Successful!

Your Gmail SMTP email system is working correctly.

Configuration Details:
- Provider: Gmail SMTP
- From: ${emailFrom}
- To: ${gmailUser}
- Time: ${new Date().toLocaleString()}

Next Steps:
1. Test with real student enrollment flow
2. Go to school and enroll students
3. Complete domain verification for permanent solution

This is an automated test message from the CFEI INFORM Student Portal system.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Test email sent successfully!");
    console.log(`   Message ID: ${info.messageId}\n`);
    
    console.log("🎉 SUCCESS! Email system is ready to use.\n");
    console.log("📥 Check your inbox at: " + gmailUser);
    console.log("   (Email might take 1-2 minutes to arrive)\n");
    
    console.log("⚠️  IMPORTANT REMINDERS:");
    console.log("   • Gmail limit: 100 emails per day");
    console.log("   • This is a temporary solution");
    console.log("   • Complete Tasks 3-6 for permanent domain-based solution\n");
    
    console.log("✅ You can now go to school and enroll students!\n");
    
  } catch (error) {
    console.error("❌ Failed to send test email!");
    console.error(`   Error: ${error.message}\n`);
    process.exit(1);
  }
}

// Run the test
testGmailSMTP().catch(error => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
