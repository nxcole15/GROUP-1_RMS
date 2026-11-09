/**
 * modules/teacher/teacherModel.js
 */
const db = require("../../config/db");

const TeacherModel = {
  async findById(teacher_id) {
    const [rows] = await db.query(
      `SELECT id, teacher_id, full_name, email, created_at
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
      "SELECT id, teacher_id, full_name, email, created_at FROM teachers ORDER BY full_name"
    );
    return rows;
  },

  async getAssignedSubjects(teacher_id) {
    // Get teacher's internal ID first
    const [teacherIdRows] = await db.query(
      `SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1`,
      [teacher_id]
    );
    const internalTeacherId = teacherIdRows[0]?.id;

    if (!internalTeacherId) {
      return [];
    }

    // Get subjects from teacher_schedules (new system)
    const [rows] = await db.query(
      `SELECT 
         ts.id,
         ts.subject_name AS name,
         ts.subject_name AS code,
         ts.strand,
         ts.track,
         ts.term,
         COUNT(DISTINCT sse.student_id) AS enrolled_count
       FROM teacher_schedules ts
       LEFT JOIN student_schedule_enrollments sse ON sse.teacher_schedule_id = ts.id
       WHERE ts.teacher_id = ?
       GROUP BY ts.id, ts.subject_name, ts.strand, ts.track, ts.term
       ORDER BY ts.subject_name`,
      [internalTeacherId]
    );
    return rows;
  },

  async getStudentsInClasses(teacher_id) {
    const [rows] = await db.query(
      `SELECT 
         st.student_id, 
         st.full_name, 
         st.pathway, 
         st.grade_level, 
         st.email,
         ea.photo_url,
         ea.track,
         ea.strand,
         ts.subject_name,
         ts.term,
         CONCAT(ea.track, ' - ', ea.strand) as track_strand
       FROM students st
       INNER JOIN student_schedule_enrollments sse ON st.student_id = sse.student_id
       INNER JOIN teacher_schedules ts ON sse.teacher_schedule_id = ts.id
       INNER JOIN teachers t ON ts.teacher_id = t.id
       LEFT JOIN enrollment_applications ea ON st.student_id = ea.generated_student_id
       WHERE t.teacher_id = ?
       ORDER BY st.full_name`,
      [teacher_id]
    );
    return rows;
  },

  async getSubjectGrades(subject_id, term) {
    const [rows] = await db.query(
      `SELECT g.id, st.student_id, st.full_name, g.percentage, g.term, g.created_at
       FROM grades g
       JOIN students st ON g.student_internal_id = st.id
       WHERE g.subject_id = ? AND g.term = ?
       ORDER BY st.full_name`,
      [subject_id, term]
    );
    return rows;
  },

  async submitGrade(student_id, subject_id, teacher_id, percentage, term) {
    // Look up student's internal ID
    const [studentLookup] = await db.query(
      `SELECT id FROM students WHERE student_id = ?`,
      [student_id]
    );
    
    if (studentLookup.length === 0) {
      throw new Error(`Student ${student_id} not found`);
    }
    
    const studentInternalId = studentLookup[0].id;
    
    await db.query(
      `INSERT INTO grades (student_internal_id, subject_id, teacher_id, percentage, term, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE percentage = ?, created_at = NOW()`,
      [studentInternalId, subject_id, teacher_id, percentage, term, percentage]
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
    // Get teacher's internal ID first
    const [teacherIdRows] = await db.query(
      `SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1`,
      [teacher_id]
    );
    const internalTeacherId = teacherIdRows[0]?.id;

    if (!internalTeacherId) {
      return { total_subjects: 0, total_students: 0, avg_grade: 0 };
    }

    // Use new teacher_schedules system
    const [rows] = await db.query(
      `SELECT
         COUNT(DISTINCT ts.id) AS total_subjects,
         COUNT(DISTINCT sse.student_id) AS total_students,
         ROUND(AVG(g.percentage), 2) AS avg_grade
       FROM teacher_schedules ts
       LEFT JOIN student_schedule_enrollments sse ON ts.id = sse.teacher_schedule_id
       LEFT JOIN grades g ON g.teacher_schedule_id = ts.id
       WHERE ts.teacher_id = ?`,
      [internalTeacherId]
    );
    return rows[0] || { total_subjects: 0, total_students: 0, avg_grade: 0 };
  },

  async getOverviewStats(teacher_id) {
    // Get teacher's internal ID first
    const [teacherIdRows] = await db.query(
      `SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1`,
      [teacher_id]
    );
    const internalTeacherId = teacherIdRows[0]?.id;

    if (!internalTeacherId) {
      return {
        total_students: 0,
        avg_grade: 0,
        pending_requests: 0,
        active_term: 'Term 1'
      };
    }

    // Get active school year
    const [configRows] = await db.query(
      `SELECT id, current_term FROM enrollment_config WHERE status = 'active' ORDER BY id DESC LIMIT 1`
    );
    const activeSchoolYearId = configRows[0]?.id;
    const activeTerm = configRows[0]?.current_term || 'Term 1';

    // Get average grade for this teacher's students
    // Check if teacher_schedule_id column exists in grades table
    const [columnCheck] = await db.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'grades' 
         AND COLUMN_NAME = 'teacher_schedule_id'`
    );
    
    let gradeRows;
    // Grades table now only uses teacher_schedule_id (we removed subject_id and subject_name)
    [gradeRows] = await db.query(
      `SELECT ROUND(AVG(g.percentage), 2) AS avg_grade,
              COUNT(g.id) AS grade_count
       FROM grades g
       INNER JOIN teacher_schedules ts ON g.teacher_schedule_id = ts.id
       WHERE ts.teacher_id = ? 
         AND g.percentage IS NOT NULL`,
      [internalTeacherId]
    );

    // Get pending grade requests count for this teacher
    const [requestRows] = await db.query(
      `SELECT COUNT(*) AS pending_requests
       FROM grade_requests gr
       WHERE gr.teacher_id = ? AND gr.status = 'pending'`,
      [internalTeacherId]
    );

    // Get pending document approvals count for this teacher
    const [docRequestRows] = await db.query(
      `SELECT COUNT(*) AS pending_docs
       FROM documents d
       WHERE d.teacher_id = ? AND d.status = 'student_requested'`,
      [internalTeacherId]
    );

    // Get total unique students enrolled in this teacher's subjects
    const [studentRows] = await db.query(
      `SELECT COUNT(DISTINCT sse.student_id) AS total_students
       FROM student_schedule_enrollments sse
       INNER JOIN teacher_schedules ts ON sse.teacher_schedule_id = ts.id
       WHERE ts.teacher_id = ?`,
      [internalTeacherId]
    );

    return {
      total_students: studentRows[0]?.total_students || 0,
      avg_grade: gradeRows[0]?.avg_grade || 0,
      pending_requests: (requestRows[0]?.pending_requests || 0) + (docRequestRows[0]?.pending_docs || 0),
      active_term: activeTerm
    };
  },

  async getRecentActivity(teacher_id, limit = 5) {
    // Get teacher's internal ID
    const [teacherIdRows] = await db.query(
      `SELECT id FROM teachers WHERE teacher_id = ? LIMIT 1`,
      [teacher_id]
    );
    const internalTeacherId = teacherIdRows[0]?.id;

    if (!internalTeacherId) {
      return [];
    }

    const [rows] = await db.query(
      `SELECT 'grade' AS type, g.created_at, st.full_name AS student_name,
              ts.subject_name, g.percentage AS value, NULL AS document_type
       FROM grades g
       INNER JOIN students st ON g.student_internal_id = st.id
       INNER JOIN teacher_schedules ts ON g.teacher_schedule_id = ts.id
       WHERE ts.teacher_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [internalTeacherId, limit]
    );
    return rows;
  },
};

module.exports = TeacherModel;
