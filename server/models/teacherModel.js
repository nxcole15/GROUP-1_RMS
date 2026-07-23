/**
 * models/teacherModel.js
 * Teacher data model for database operations
 */

const db = require("../config/db");

class TeacherModel {

  /*** Find teacher by ID  */
   async findById(teacher_id) {
  const [rows] = await db.query(
    "SELECT id, teacher_id, full_name, department, email, created_at FROM teachers WHERE teacher_id = ? LIMIT 1",
    [teacher_id]
  );
  return rows[0] || null;
}


  /*** Get all teachers*/
   async findAll() {
  const [rows] = await db.query(
    "SELECT id, teacher_id, full_name, department, email, created_at FROM teachers ORDER BY full_name"
  );
  return rows;
}


  /*** Get teacher's assigned subjects*/
  async getAssignedSubjects(teacher_id) {
  const [rows] = await db.query(
    `SELECT s.id, s.code, s.name, s.units, s.max_capacity, s.enrolled_count
     FROM subjects s
     WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ?)
     ORDER BY s.code`,
    [teacher_id]
  );
  return rows;
}


  /* Get students in teacher's classes*/
   async getStudentsInClasses(teacher_id) {
  const [rows] = await db.query(
    `SELECT DISTINCT st.id, st.student_id, st.full_name, st.pathway, st.grade_level, st.email
     FROM students st
     INNER JOIN enrollment_subjects es ON st.id = es.student_id
     INNER JOIN subjects s ON es.subject_id = s.id
     WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ?)
     ORDER BY st.full_name`,
    [teacher_id]
  );
  return rows;
}


  /** Get students in specific subject*/
   async getStudentsInSubject(subject_id) {
  const [rows] = await db.query(
    `SELECT st.id, st.student_id, st.full_name, st.pathway, st.grade_level, st.email
     FROM students st
     INNER JOIN enrollment_subjects es ON st.id = es.student_id
     WHERE es.subject_id = ?
     ORDER BY st.full_name`,
    [subject_id]
  );
  return rows;
}


  /*** Get grades for a subject*/
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
}


  /*** Submit grade for student*/
   async submitGrade(student_id, subject_id, teacher_id, percentage, term) {
  const [result] = await db.query(
    `INSERT INTO grades (student_id, subject_id, teacher_id, percentage, term, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE percentage = ?, created_at = NOW()`,
    [student_id, subject_id, teacher_id, percentage, term, percentage]
  );
  return { id: result.insertId, student_id, subject_id, percentage, term };
}


  /*** Get attendance records for subject*/
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
}


  /*** Update attendance record*/
  async updateAttendance(student_id, subject_id, total_meetings, days_present, term) {
  await db.query(
    `INSERT INTO attendance (student_id, subject_id, total_meetings, days_present, term, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE total_meetings = ?, days_present = ?`,
    [student_id, subject_id, total_meetings, days_present, term, total_meetings, days_present]
  );
  return { student_id, subject_id, total_meetings, days_present, term };
}


  /*** Get class schedule*/
  async getClassSchedule(teacher_id) {
  const [rows] = await db.query(
    `SELECT s.id, s.code, s.name, s.units, s.max_capacity, s.enrolled_count
     FROM subjects s
     WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ?)
     ORDER BY s.code`,
    [teacher_id]
  );
  return rows;
}


  /*** Get class statistics*/
  async getClassStatistics(teacher_id) {
  const [rows] = await db.query(
    `SELECT 
       COUNT(DISTINCT s.id) as total_subjects,
       COUNT(DISTINCT st.id) as total_students,
       AVG(g.percentage) as avg_grade
     FROM subjects s
     LEFT JOIN enrollment_subjects es ON s.id = es.subject_id
     LEFT JOIN students st ON es.student_id = st.id
     LEFT JOIN grades g ON st.student_id = g.student_id AND s.id = g.subject_id
     WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ?)`,
    [teacher_id]
  );
  return rows[0] || { total_subjects: 0, total_students: 0, avg_grade: 0 };
}


  /*** Get recent activity*/
  async getRecentActivity(teacher_id, limit = 10) {
  const [rows] = await db.query(
    `SELECT 'Grade Submitted' as action, st.full_name as name, g.created_at as time, '📊' as icon
     FROM grades g
     INNER JOIN students st ON g.student_id = st.student_id
     INNER JOIN subjects s ON g.subject_id = s.id
     WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ?)
     UNION ALL
     SELECT 'Attendance Updated' as action, st.full_name as name, a.created_at as time, '✓' as icon
     FROM attendance a
     INNER JOIN students st ON a.student_id = st.student_id
     INNER JOIN subjects s ON a.subject_id = s.id
     WHERE s.teacher_id = (SELECT id FROM teachers WHERE teacher_id = ?)
     ORDER BY time DESC
     LIMIT ?`,
    [teacher_id, teacher_id, limit]
  );
  return rows;
}


  /*** Verify teacher password*/
   async verifyPassword(teacher_id, plainPassword) {
    // 1. Get the hashed password from the database
    const [rows] = await db.query(
      "SELECT password FROM teachers WHERE teacher_id = ? LIMIT 1",
      [teacher_id]
    );

    // 2. If no teacher found, return false
    if (!rows[0]) return false;

    // 3. Use bcrypt to compare the plain password against the stored hash
    const bcrypt = require("bcryptjs");
    return bcrypt.compare(plainPassword, rows[0].password);
  }
}

module.exports = TeacherModel;
