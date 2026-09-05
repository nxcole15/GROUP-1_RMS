/**
 * modules/attendance/attendanceController.js
 */
const AttendanceModel = require("./attendanceModel");
const ConfigModel     = require("../shared/configModel");

async function getMyAttendance(req, res, next) {
  try {
    const { student_id } = req.student;
    const { active_term } = await ConfigModel.getEnrollmentConfig();

    const rows     = await AttendanceModel.findByStudentAndTerm(student_id, active_term);
    const enriched = rows.map((r) => AttendanceModel.enrichRecord(r));

    res.json({ term: active_term, attendance: enriched });
  } catch (err) { next(err); }
}

module.exports = { getMyAttendance };
