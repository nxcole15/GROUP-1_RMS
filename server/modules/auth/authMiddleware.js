/**
 * modules/auth/authMiddleware.js
 * Verifies a student JWT from the Authorization header or cookie.
 * Attaches decoded payload to req.student.
 */
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../config/env");

function authenticateStudent(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "student") {
      return res.status(403).json({ error: "Access denied." });
    }
    req.student = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token." });
  }
}

module.exports = { authenticateStudent };
