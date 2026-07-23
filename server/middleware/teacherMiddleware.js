/**
 * middleware/teacherMiddleware.js
 * Teacher authentication and authorization middleware
 */

const jwt = require("jsonwebtoken");
const { TEACHER_JWT_SECRET } = require("../config/env");

function authenticateTeacher(req, res, next) {
  // 1. Read the token - check cookie first, the Authorize header
  const token = 
  req.cookies?.teacher_token ||
  (req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null);

  // 2. No token = not logged in
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // 3. Verify the token is real and not expired
  try {
    const decoded = jwt.verify(token, TEACHER_JWT_SECRET);

    // 4. Make sure it's actually a teacher token, not a student or admin
    if (decoded.role !== "teacher") {
      return res.status(403).json({ error: "Access denied." });
    }

    // 5. Attach teacher identity to the request so controllers can use it
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