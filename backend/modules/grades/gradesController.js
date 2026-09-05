/**
 * modules/grades/gradesController.js
 */
const GradeModel  = require("./gradeModel");
const ConfigModel = require("../shared/configModel");

async function getMyGrades(req, res, next) {
  try {
    const { student_id } = req.student;
    const { active_term } = await ConfigModel.getEnrollmentConfig();

    const rows     = await GradeModel.findByStudentAndTerm(student_id, active_term);
    const enriched = rows.map((r) => GradeModel.enrichGrade(r));
    const gwa      = rows.length ? GradeModel.computeGWA(rows) : null;

    res.json({
      term:   active_term,
      grades: enriched,
      gwa:    gwa !== null ? gwa : "N/A",
    });
  } catch (err) { next(err); }
}

module.exports = { getMyGrades };
