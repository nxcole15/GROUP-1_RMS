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
const gradesRoutes        = require("./modules/grades/gradesRoutes");
const attendanceRoutes    = require("./modules/attendance/attendanceRoutes");
const paymentsRoutes      = require("./modules/payments/paymentsRoutes");
const documentsRoutes     = require("./modules/documents/documentsRoutes");
const notificationsRoutes = require("./modules/notifications/notificationsRoutes");
const teacherRoutes       = require("./modules/teacher/teacherRoutes");
const gradeRequestRoutes = require("./modules/gradeRequests/gradeRequestRoutes");
const applicationRoutes  = require("./modules/student/applicationRoutes");


const app = express();

/* ── CORS ───────────────────────────────────────────────────────────────────
 * Allowed origins are read from CLIENT_ORIGIN in .env.
 * Multiple origins can be listed comma-separated, e.g.:
 *   CLIENT_ORIGIN=https://cfei-inform.vercel.app,https://www.cfei-inform.com
 * Falls back to localhost:3000 for local development.
 * ────────────────────────────────────────────────────────────────────────── */
const rawOrigins = process.env.CLIENT_ORIGIN || "http://localhost:3000";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

app.use(
  cors({
    origin(requestOrigin, callback) {
      // Allow server-to-server requests (no Origin header) and listed origins
      if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${requestOrigin} is not allowed.`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Respond 200 to all OPTIONS preflight requests immediately
app.options("*", cors());

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
app.use("/api/grades",        gradesRoutes);
app.use("/api/attendance",    attendanceRoutes);
app.use("/api/payments",      paymentsRoutes);
app.use("/api/documents",     documentsRoutes);
app.use("/api/notifications", notificationsRoutes);


/* ── Admin routes ── */
app.use("/api/admin",   adminRoutes);

/* ── Teacher routes ── */
app.use("/api/teacher", teacherRoutes);

app.use("/api/grade-requests", gradeRequestRoutes);
app.use("/api/applications",  applicationRoutes);

/* ── 404 handler ── */
app.use((req, res) => res.status(404).json({ error: "Route not found." }));

/* ── Global error handler ── */
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅  Record Management System API running on http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/api/health`);
});
