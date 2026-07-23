/**
 * models/teacherModel.js
 */
const db = require("../config/db");

const TeacherModel = {
  async findByTeacherId(teacher_id) {
    const [rows] = await db.query(
      `SELECT id, teacher_id, full_name, department, email, created_at
       FROM teachers WHERE teacher_id = ? LIMIT 1`,
      [teacher_id]
    );
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await db.query(
      "SELECT id, teacher_id, full_name, department, email, created_at FROM teachers ORDER BY full_name"
    );
    return rows;
  },

  async getAssignedSubjects(teacher_id) {
    const [rows] = await db.query(
      `SELECT s.id, s.code, s.name, s.units, s.max_capacity, s.enrolled_count
       FROM subjects s
       WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1)
       ORDER BY s.code`,
      [teacher_id]
    );
    return rows;
  },

  async getSubjectGrades(subject_id, semester) {
    const [rows] = await db.query(
      `SELECT g.id, g.student_id, st.full_name, g.percentage, g.semester, g.created_at
       FROM grades g
       JOIN students st ON g.student_id = st.student_id
       WHERE g.subject_id = ? AND g.semester = ?
       ORDER BY st.full_name`,
      [subject_id, semester]
    );
    return rows;
  },

  async submitGrade(student_id, subject_id, teacher_id, percentage, semester) {
    await db.query(
      `INSERT INTO grades (student_id, subject_id, teacher_id, percentage, semester, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE percentage = ?, created_at = NOW()`,
      [student_id, subject_id, teacher_id, percentage, semester, percentage]
    );
    const [rows] = await db.query(
      `SELECT * FROM grades
       WHERE student_id = ? AND subject_id = ? AND semester = ? LIMIT 1`,
      [student_id, subject_id, semester]
    );
    return rows[0];
  },

  async getSubjectAttendance(subject_id, semester) {
    const [rows] = await db.query(
      `SELECT a.id, a.student_id, st.full_name, a.total_meetings, a.days_present, a.semester
       FROM attendance a
       JOIN students st ON a.student_id = st.student_id
       WHERE a.subject_id = ? AND a.semester = ?
       ORDER BY st.full_name`,
      [subject_id, semester]
    );
    return rows;
  },

  async updateAttendance(student_id, subject_id, total_meetings, days_present, semester) {
    await db.query(
      `INSERT INTO attendance (student_id, subject_id, total_meetings, days_present, semester, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE total_meetings = ?, days_present = ?`,
      [student_id, subject_id, total_meetings, days_present, semester, total_meetings, days_present]
    );
    const [rows] = await db.query(
      `SELECT * FROM attendance
       WHERE student_id = ? AND subject_id = ? AND semester = ? LIMIT 1`,
      [student_id, subject_id, semester]
    );
    return rows[0];
  },

  async getClassStatistics(teacher_id) {
    const [rows] = await db.query(
      `SELECT
         COUNT(DISTINCT s.id)           AS total_subjects,
         COUNT(DISTINCT e.student_id)   AS total_students,
         ROUND(AVG(g.percentage), 2)    AS avg_grade
       FROM subjects s
       LEFT JOIN enrollment_subjects es ON s.id = es.subject_id
       LEFT JOIN enrollments e ON es.enrollment_id = e.id
       LEFT JOIN grades g ON e.student_id = g.student_id AND s.id = g.subject_id
       WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1)`,
      [teacher_id]
    );
    return rows[0] || { total_subjects: 0, total_students: 0, avg_grade: 0 };
  },
};

module.exports = TeacherModel;
