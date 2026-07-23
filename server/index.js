const express = require("express");
const cors    = require("cors");
const cookieParser = require("cookie-parser");
const { PORT } = require("./config/env");
const errorHandler = require("./middleware/errorHandler");

// Routes
const authRoutes          = require("./routes/authRoutes");
const adminRoutes         = require("./routes/adminRoutes");
const enrollmentRoutes    = require("./routes/enrollmentRoutes");
const gradesRoutes        = require("./routes/gradesRoutes");
const attendanceRoutes    = require("./routes/attendanceRoutes");
const paymentsRoutes      = require("./routes/paymentsRoutes");
const documentsRoutes     = require("./routes/documentsRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const teacherRoutes       = require("./routes/teacherRoutes");

const app = express();

/* ── Global middleware ── */
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

/* ── Health check ── */
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

/* ── Student routes ── */
app.use("/api/auth",          authRoutes);
app.use("/api/enrollment",    enrollmentRoutes);
app.use("/api/grades",        gradesRoutes);
app.use("/api/attendance",    attendanceRoutes);
app.use("/api/payments",      paymentsRoutes);
app.use("/api/documents",     documentsRoutes);
app.use("/api/notifications", notificationsRoutes);

/* ── Admin routes ── */
app.use("/api/admin", adminRoutes);

app.use("/api/teacher", teacherRoutes);

/* ── 404 handler ── */
app.use((req, res) => res.status(404).json({ error: "Route not found." }));

/* ── Global error handler ── */
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅  Smart Student Service API running on http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/api/health`);
});
