/**
 * modules/teacher/teacherMiddleware.js
 * Teacher authentication and authorization middleware.
 */
const jwt = require("jsonwebtoken");
const { TEACHER_JWT_SECRET } = require("../../config/env");

function authenticateTeacher(req, res, next) {
  const token =
    req.cookies?.teacher_token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, TEACHER_JWT_SECRET);
    if (decoded.role !== "teacher") {
      return res.status(403).json({ error: "Access denied." });
    }
    req.teacher = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again" });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
}

module.exports = { authenticateTeacher };
