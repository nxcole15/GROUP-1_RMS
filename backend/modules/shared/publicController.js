/**
 * modules/shared/publicController.js
 * Public endpoints that don't require authentication
 */
const db = require("../../config/db");

/**
 * GET /api/public/academic-config
 * Get active academic configuration (public, no auth required)
 */
async function getAcademicConfig(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT school_year, current_term, status, enrollment_is_open 
       FROM enrollment_config 
       WHERE status = 'active'
       ORDER BY id DESC 
       LIMIT 1`
    );

    if (!rows || rows.length === 0) {
      // Return sensible defaults if not configured
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const startYear = month >= 6 ? year : year - 1;
      const endYear = startYear + 1;
      
      return res.json({
        school_year: `${startYear}-${endYear}`,
        current_term: "Term 1",
        status: "active",
        enrollment_is_open: false
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get academic config error:", err);
    next(err);
  }
}

module.exports = {
  getAcademicConfig
};
