/**
 * modules/teacher/teacherModel.js
 */
const db = require("../../config/db");

const TeacherModel = {
  async findById(teacher_id) {
    const [rows] = await db.query(
      `SELECT id, teacher_id, full_name, department, email, created_at
       FROM teachers WHERE teacher_id = ? LIMIT 1`,
      [teacher_id]
    );
    return rows[0] || null;
  },

  async verifyPassword(teacher_id, password) {
    const bcrypt = require("bcryptjs");
    const [rows] = await db.query(
      "SELECT password FROM teachers WHERE teacher_id = ? LIMIT 1",
      [teacher_id]
    );
    if (!rows[0]) return false;
    return bcrypt.compare(password, rows[0].password);
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

  async getStudentsInClasses(teacher_id) {
    const [rows] = await db.query(
      `SELECT DISTINCT st.student_id, st.full_name, st.email
       FROM students st
       JOIN enrollments e ON e.student_id = st.student_id
       JOIN enrollment_subjects es ON es.enrollment_id = e.id
       JOIN subjects s ON s.id = es.subject_id
       WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1)
       ORDER BY st.full_name`,
      [teacher_id]
    );
    return rows;
  },

  async getSubjectGrades(subject_id, term) {
    const [rows] = await db.query(
      `SELECT g.id, g.student_id, st.full_name, g.percentage, g.term, g.created_at
       FROM grades g
       JOIN students st ON g.student_id = st.student_id
       WHERE g.subject_id = ? AND g.term = ?
       ORDER BY st.full_name`,
      [subject_id, term]
    );
    return rows;
  },

  async submitGrade(student_id, subject_id, teacher_id, percentage, term) {
    await db.query(
      `INSERT INTO grades (student_id, subject_id, teacher_id, percentage, term, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE percentage = ?, created_at = NOW()`,
      [student_id, subject_id, teacher_id, percentage, term, percentage]
    );
    const [rows] = await db.query(
      `SELECT * FROM grades
       WHERE student_id = ? AND subject_id = ? AND term = ? LIMIT 1`,
      [student_id, subject_id, term]
    );
    return rows[0];
  },

  async getSubjectAttendance(subject_id, term) {
    const [rows] = await db.query(
      `SELECT a.id, a.student_id, st.full_name, a.total_meetings, a.days_present, a.term
       FROM attendance a
       JOIN students st ON a.student_id = st.student_id
       WHERE a.subject_id = ? AND a.term = ?
       ORDER BY st.full_name`,
      [subject_id, term]
    );
    return rows;
  },

  async updateAttendance(student_id, subject_id, total_meetings, days_present, term) {
    await db.query(
      `INSERT INTO attendance (student_id, subject_id, total_meetings, days_present, term, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE total_meetings = ?, days_present = ?`,
      [student_id, subject_id, total_meetings, days_present, term, total_meetings, days_present]
    );
    const [rows] = await db.query(
      `SELECT * FROM attendance
       WHERE student_id = ? AND subject_id = ? AND term = ? LIMIT 1`,
      [student_id, subject_id, term]
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

  async getRecentActivity(teacher_id, limit = 5) {
    const [rows] = await db.query(
      `SELECT 'grade' AS type, g.created_at, st.full_name AS student_name,
              s.name AS subject_name, g.percentage AS value
       FROM grades g
       JOIN students st ON st.student_id = g.student_id
       JOIN subjects s ON s.id = g.subject_id
       WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1)
       ORDER BY g.created_at DESC
       LIMIT ?`,
      [teacher_id, limit]
    );
    return rows;
  },
};

module.exports = TeacherModel;
