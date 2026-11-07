const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const PORT = process.env.PORT || 4000;
const errorHandler = require("./middleware/errorHandler");
const { swaggerUi, swaggerDocument } = require("./config/swagger");

// ── Routes (all from modules/) ───────────────────────────────
const authRoutes          = require("./modules/auth/authRoutes");
const adminRoutes         = require("./modules/admin/adminRoutes");
const enrollmentRoutes    = require("./modules/student/enrollmentRoutes");
const studentDashboardRoutes = require("./modules/student/studentDashboardRoutes");
const gradesRoutes        = require("./modules/grades/gradesRoutes");
const paymentsRoutes      = require("./modules/payments/paymentsRoutes");
const accountingPaymentRoutes = require("./modules/payments/accountingPaymentRoutes");
const documentsRoutes     = require("./modules/documents/documentsRoutes");
const notificationsRoutes = require("./modules/notifications/notificationsRoutes");
const staffNotificationRoutes = require("./modules/notifications/staffNotificationRoutes");
const teacherRoutes       = require("./modules/teacher/teacherRoutes");
const gradeRequestRoutes = require("./modules/gradeRequests/gradeRequestRoutes");
const gradeEditRequestRoutes = require("./modules/gradeEditRequests/gradeEditRequestRoutes");
const applicationRoutes  = require("./modules/student/applicationRoutes");
const feeRoutes          = require("./modules/fees/feeRoutes");
const studentFeeRoutes   = require("./modules/fees/studentFeeRoutes");
const publicRoutes       = require("./modules/shared/publicRoutes");


const app = express();

/* ── CORS ───────────────────────────────────────────────────────────────────
 * Allowed origins are read from CLIENT_ORIGIN in .env.
 * Multiple origins can be listed comma-separated, e.g.:
 *   CLIENT_ORIGIN=https://cfei-inform.vercel.app,https://www.cfei-inform.com
 * Falls back to localhost:3000 for local development.
 * ────────────────────────────────────────────────────────────────────────── */
const rawOrigins = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

const corsOptions = {
    origin(requestOrigin, callback) {
      // Allow server-to-server requests (no Origin header)
      if (!requestOrigin) {
        callback(null, true);
        return;
      }
      // Allow any .vercel.app domain or listed origins
      if (requestOrigin.endsWith('.vercel.app') || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${requestOrigin} is not allowed.`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

app.use(cors(corsOptions));

// Respond 200 to all OPTIONS preflight requests immediately
// NOTE: Express 5 / path-to-regexp v8 does not accept "*" — use a RegExp instead,
// and reuse the same configured CORS options so preflight keeps Allow-Origin/Credentials.
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

/* ── Health check ── */
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

/* ── API Documentation ── */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/* ── Student routes ── */
app.use("/api/auth",          authRoutes);
app.use("/api/enrollment",    enrollmentRoutes);
app.use("/api/student",       studentDashboardRoutes);
app.use("/api/grades",        gradesRoutes);
app.use("/api/payments",      paymentsRoutes);
app.use("/api/documents",     documentsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/staff-notifications", staffNotificationRoutes);


/* ── Admin routes ── */
app.use("/api/admin",   adminRoutes);

/* ── Teacher routes ── */
app.use("/api/teacher", teacherRoutes);

app.use("/api/grade-requests", gradeRequestRoutes);
app.use("/api/grade-edit-requests", gradeEditRequestRoutes);
app.use("/api/applications",  applicationRoutes);
app.use("/api/fees",           feeRoutes);
app.use("/api/student/fees",   studentFeeRoutes); // Student-facing fee routes

/* ── Accounting routes ── */
app.use("/api/accounting", accountingPaymentRoutes); // Accounting payment management

/* ── Public routes (no auth) ── */
app.use("/api/public", publicRoutes);

/* ── 404 handler ── */
app.use((req, res) => res.status(404).json({ error: "Route not found." }));

/* ── Global error handler ── */
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅  Record Management System API running on http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/api/health`);
});
