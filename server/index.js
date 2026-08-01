const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const { PORT }     = require("./config/env");
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

const app = express();

/* ── Global middleware ── */
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
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

/* ── 404 handler ── */
app.use((req, res) => res.status(404).json({ error: "Route not found." }));

/* ── Global error handler ── */
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅  Record Management System API running on http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/api/health`);
});
