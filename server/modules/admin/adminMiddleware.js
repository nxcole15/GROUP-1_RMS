/**
 * modules/admin/adminMiddleware.js
 * Verifies an admin JWT. Attaches decoded payload to req.admin.
 */
const jwt = require("jsonwebtoken");
require("dotenv").config();
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'admin-secret-key-change-this';

function authenticateAdmin(req, res, next) {
  const token =
    req.cookies?.admin_token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ error: "Admin authentication required." });
  }

  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    const allowedRoles = ["admin", "super_admin", "principal", "registrar", "accounting"];
    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ error: "Access denied." });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Admin session expired. Please log in again." });
    }
    return res.status(403).json({ error: "Access denied." });
  }
}

module.exports = { authenticateAdmin };
