/**
 * models/gradeModel.js
 */
const db = require("../config/db");
const { toLetterGrade, toPerformanceStatus, computeGWA } = require("../utils/grading");

const GradeModel = {
  async findByStudentAndTerm(student_id, term) {
    const [rows] = await db.query(
      `SELECT g.*, s.code AS subject_code, s.name AS subject_name,
              t.full_name AS teacher_name
       FROM grades g
       JOIN subjects s ON s.id = g.subject_id
       JOIN teachers t ON t.id = g.teacher_id
       WHERE g.student_id = ? AND g.term = ?`,
      [student_id, term]
    );
    return rows;
  },

  enrichGrade(row) {
    const pct    = parseFloat(row.percentage);
    const letter = toLetterGrade(pct);
    return {
      subject_code:       row.subject_code,
      subject_name:       row.subject_name,
      teacher_name:       row.teacher_name,
      percentage:         pct,
      letter_grade:       letter,
      performance_status: toPerformanceStatus(letter),
    };
  },

  computeGWA(rows) {
    if (!rows.length) return null;
    const letterGrades = rows.map((r) => toLetterGrade(parseFloat(r.percentage)));
    return computeGWA(letterGrades);
  },
};

module.exports = GradeModel;
