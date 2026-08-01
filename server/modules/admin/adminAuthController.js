/**
 * modules/admin/adminAuthController.js
 */
const bcrypt     = require("bcryptjs");
const jwt        = require("jsonwebtoken");
const AdminModel = require("./adminModel");
const AuditModel = require("./auditModel");
const { ADMIN_JWT_SECRET } = require("../../config/env");

async function adminLogin(req, res, next) {
  try {
    const { admin_id, password } = req.body;
    if (!admin_id || !password) {
      return res.status(400).json({ error: "Admin ID and password are required." });
    }

    const admin   = await AdminModel.findByAdminId(admin_id);
    const invalid = !admin || !(await bcrypt.compare(password, admin.password));
    if (invalid) {
      return res.status(401).json({ error: "Invalid Admin ID or password." });
    }

    const payload = {
      id:        admin.id,
      admin_id:  admin.admin_id,
      full_name: admin.full_name,
      role:      "admin",
    };
    const token = jwt.sign(payload, ADMIN_JWT_SECRET, { expiresIn: "8h" });

    res
      .cookie("admin_token", token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge:   8 * 60 * 60 * 1000,
      })
      .json({
        message: "Admin login successful.",
        admin:   { admin_id: admin.admin_id, full_name: admin.full_name },
        token,
      });
  } catch (err) { next(err); }
}

function adminLogout(req, res) {
  res.clearCookie("admin_token", { httpOnly: true, sameSite: "Strict" })
     .json({ message: "Admin logged out successfully." });
}

async function getAuditLog(req, res, next) {
  try {
    res.json({ audit_log: await AuditModel.getAll() });
  } catch (err) { next(err); }
}

module.exports = { adminLogin, adminLogout, getAuditLog };
