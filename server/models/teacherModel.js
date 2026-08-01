/**
 * models/teacherModel.js
 * All queries use the promise-based mysql2 pool.
 */
const db     = require("../config/db");
const bcrypt = require("bcryptjs");

const TeacherModel = {
  async findByTeacherId(teacher_id) {
    const [rows] = await db.query(
      "SELECT id, teacher_id, full_name, department, email, created_at FROM teachers WHERE teacher_id = ? LIMIT 1",
      [teacher_id]
    );
    return rows[0] || null;
  },

  async findByIdPk(pk) {
    const [rows] = await db.query(
      "SELECT id, teacher_id, full_name, department, email, created_at FROM teachers WHERE id = ? LIMIT 1",
      [pk]
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

  async getStudentsInClasses(teacher_id) {
    const [rows] = await db.query(
      `SELECT DISTINCT st.id, st.student_id, st.full_name, st.pathway, st.grade_level, st.email
       FROM students st
       INNER JOIN enrollment_subjects es ON st.student_id IN (
         SELECT e.student_id FROM enrollments e
         INNER JOIN enrollment_subjects es2 ON e.id = es2.enrollment_id
         INNER JOIN subjects s ON es2.subject_id = s.id
         WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1)
       )
       ORDER BY st.full_name`,
      [teacher_id]
    );
    return rows;
  },

  async getStudentsInSubject(subject_id) {
    const [rows] = await db.query(
      `SELECT st.id, st.student_id, st.full_name, st.pathway, st.grade_level, st.email
       FROM students st
       INNER JOIN enrollments e ON e.student_id = st.student_id
       INNER JOIN enrollment_subjects es ON es.enrollment_id = e.id
       WHERE es.subject_id = ?
       ORDER BY st.full_name`,
      [subject_id]
    );
    return rows;
  },

  async getSubjectGrades(subject_id, term) {
    const [rows] = await db.query(
      `SELECT g.id, g.student_id, st.full_name, g.percentage, g.term, g.created_at
       FROM grades g
       INNER JOIN students st ON g.student_id = st.student_id
       WHERE g.subject_id = ? AND g.term = ?
       ORDER BY st.full_name`,
      [subject_id, term]
    );
    return rows;
  },

  async submitGrade(student_id, subject_id, teacher_id, percentage, term) {
    const [result] = await db.query(
      `INSERT INTO grades (student_id, subject_id, teacher_id, percentage, term, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE percentage = VALUES(percentage), created_at = NOW()`,
      [student_id, subject_id, teacher_id, percentage, term]
    );
    return { insertId: result.insertId, student_id, subject_id, percentage, term };
  },

  async getSubjectAttendance(subject_id, term) {
    const [rows] = await db.query(
      `SELECT a.id, a.student_id, st.full_name, a.total_meetings, a.days_present, a.term
       FROM attendance a
       INNER JOIN students st ON a.student_id = st.student_id
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
       ON DUPLICATE KEY UPDATE total_meetings = VALUES(total_meetings), days_present = VALUES(days_present)`,
      [student_id, subject_id, total_meetings, days_present, term]
    );
    return { student_id, subject_id, total_meetings, days_present, term };
  },

  async getClassStatistics(teacher_id) {
    const [rows] = await db.query(
      `SELECT
         COUNT(DISTINCT s.id)  AS total_subjects,
         COUNT(DISTINCT e.student_id) AS total_students,
         AVG(g.percentage)     AS avg_grade
       FROM subjects s
       LEFT JOIN enrollment_subjects es ON s.id = es.subject_id
       LEFT JOIN enrollments e ON es.enrollment_id = e.id
       LEFT JOIN grades g ON e.student_id = g.student_id AND s.id = g.subject_id
       WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1)`,
      [teacher_id]
    );
    return rows[0] || { total_subjects: 0, total_students: 0, avg_grade: 0 };
  },

  async getRecentActivity(teacher_id, limit = 10) {
    const [rows] = await db.query(
      `(SELECT 'Grade Submitted' AS action, st.full_name AS name, g.created_at AS time
        FROM grades g
        INNER JOIN students st ON g.student_id = st.student_id
        INNER JOIN subjects s  ON g.subject_id  = s.id
        WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1))
       UNION ALL
       (SELECT 'Attendance Updated' AS action, st.full_name AS name, a.created_at AS time
        FROM attendance a
        INNER JOIN students st ON a.student_id = st.student_id
        INNER JOIN subjects s  ON a.subject_id  = s.id
        WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1))
       ORDER BY time DESC
       LIMIT ?`,
      [teacher_id, teacher_id, limit]
    );
    return rows;
  },

  async verifyPassword(teacher_id, password) {
    const [rows] = await db.query(
      "SELECT password FROM teachers WHERE teacher_id = ? LIMIT 1",
      [teacher_id]
    );
    if (!rows[0]) return false;
    return bcrypt.compare(password, rows[0].password);
  },
};

module.exports = TeacherModel;
