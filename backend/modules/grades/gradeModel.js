/**
 * modules/grades/gradeModel.js
 */
const db = require("../../config/db");
const { toLetterGrade, toPerformanceStatus, computeGWA } = require("../../utils/grading");

const GradeModel = {
  async findByStudentAndTerm(student_id, term) {
    // Return ALL enrolled subjects for this student and term
    // Show grades where they exist, null where they don't (so students can request grades)
    const [rows] = await db.query(
      `SELECT 
         ts.id as schedule_id,
         ts.subject_name,
         ts.strand,
         t.full_name AS teacher_name,
         g.id as grade_id,
         g.percentage,
         g.submission_status,
         g.term
       FROM student_schedule_enrollments sse
       INNER JOIN teacher_schedules ts ON sse.teacher_schedule_id = ts.id
       INNER JOIN teachers t ON ts.teacher_id = t.id
       INNER JOIN students s ON sse.student_internal_id = s.id
       LEFT JOIN grades g ON g.teacher_schedule_id = ts.id 
         AND g.student_internal_id = s.id
         AND g.submission_status = 'approved'
       WHERE s.student_id = ? 
         AND ts.term = ?
       ORDER BY ts.subject_name ASC`,
      [student_id, term]
    );
    return rows;
  },

  enrichGrade(row) {
    // Handle subjects without grades yet
    if (row.percentage === null || row.percentage === undefined) {
      return {
        schedule_id:        row.schedule_id,
        subject_code:       row.strand || 'N/A',
        subject_name:       row.subject_name,
        teacher_name:       row.teacher_name,
        percentage:         null,
        letter_grade:       'No Grade Yet',
        performance_status: 'Not Available',
        has_grade:          false
      };
    }

    const pct    = parseFloat(row.percentage);
    const letter = toLetterGrade(pct);
    return {
      schedule_id:        row.schedule_id,
      subject_code:       row.strand || 'N/A',
      subject_name:       row.subject_name,
      teacher_name:       row.teacher_name,
      percentage:         pct,
      letter_grade:       letter,
      performance_status: toPerformanceStatus(letter),
      has_grade:          true
    };
  },

  computeGWA(rows) {
    // Only compute GWA for rows that have actual grades
    const rowsWithGrades = rows.filter(r => r.percentage !== null && r.percentage !== undefined);
    if (!rowsWithGrades.length) return null;
    const letterGrades = rowsWithGrades.map((r) => toLetterGrade(parseFloat(r.percentage)));
    return computeGWA(letterGrades);
  },
};

module.exports = GradeModel;
