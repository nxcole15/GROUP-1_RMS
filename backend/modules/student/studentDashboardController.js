/**
 * modules/student/studentDashboardController.js
 * Controller for student dashboard data
 */
const db = require("../../config/db");

/**
 * GET /api/student/dashboard
 * Returns student dashboard overview data
 */
async function getDashboardData(req, res, next) {
  try {
    const studentId = req.student.student_id;

    // Get basic student info from the JWT token first as fallback
    const basicStudent = {
      student_id: req.student.student_id,
      full_name: req.student.full_name,
      pathway: null,
      grade_level: null,
      term: null,
      email: null,
      photo_url: null,
      lrn: null
    };

    // Try to get student info with photo from enrollment_applications
    let student = basicStudent;
    try {
      const [studentRows] = await db.query(`
        SELECT 
          s.student_id,
          s.full_name,
          s.pathway,
          s.grade_level,
          s.term,
          s.email,
          ea.photo_url,
          ea.lrn
        FROM students s
        LEFT JOIN enrollment_applications ea ON s.student_id = ea.generated_student_id
        WHERE s.student_id = ?
        LIMIT 1
      `, [studentId]);

      if (studentRows && studentRows[0]) {
        student = studentRows[0];
      }
    } catch (err) {
      console.error("Error fetching student info:", err.message);
      // Continue with basic student info from JWT
    }

    // Get grades data - calculate GWA (handle empty table)
    let averageGrade = 0;
    try {
      const [gradesRows] = await db.query(`
        SELECT 
          AVG(g.percentage) as average_grade
        FROM grades g
        WHERE g.student_id = ?
      `, [studentId]);
      averageGrade = gradesRows[0]?.average_grade || 0;
    } catch (err) {
      // Grades table might not exist yet
    }

    // Get tuition/payment data (handle missing tables)
    let totalPaid = 0;
    try {
      const [paymentsRows] = await db.query(`
        SELECT 
          COALESCE(SUM(amount), 0) as total_paid
        FROM payments
        WHERE student_id = ? AND status = 'paid'
      `, [studentId]);
      totalPaid = paymentsRows[0]?.total_paid || 0;
    } catch (err) {
      // Payments table might not exist yet
    }

    // Get total tuition fee (handle missing table)
    let totalTuition = 0;
    try {
      const [tuitionRows] = await db.query(`
        SELECT 
          COALESCE(total_amount, 0) as total_tuition
        FROM student_tuition
        WHERE student_id = ?
        LIMIT 1
      `, [studentId]);
      totalTuition = tuitionRows[0]?.total_tuition || 0;
    } catch (err) {
      // Student_tuition table might not exist yet
    }

    // Get pending document requests count (handle missing table)
    let pendingDocs = 0;
    try {
      const [docsRows] = await db.query(`
        SELECT COUNT(*) as pending_count
        FROM document_requests
        WHERE student_id = ? AND status = 'pending'
      `, [studentId]);
      pendingDocs = docsRows[0]?.pending_count || 0;
    } catch (err) {
      // Document_requests table might not exist yet
    }

    // Get recent grades (handle missing table)
    let recentGradesRows = [];
    try {
      const [rows] = await db.query(`
        SELECT 
          g.subject_code,
          g.subject_title,
          g.percentage,
          g.term
        FROM grades g
        WHERE g.student_id = ?
        ORDER BY g.created_at DESC
        LIMIT 5
      `, [studentId]);
      recentGradesRows = rows;
    } catch (err) {
      // Grades table might not exist yet
    }

    res.json({
      student: {
        student_id: student.student_id,
        full_name: student.full_name,
        pathway: student.pathway,
        grade_level: student.grade_level,
        term: student.term,
        email: student.email,
        photo_url: student.photo_url,
        lrn: student.lrn
      },
      stats: {
        average_grade: Math.round(averageGrade),
        total_paid: totalPaid,
        total_tuition: totalTuition,
        balance_due: totalTuition - totalPaid,
        pending_docs: pendingDocs
      },
      recent_grades: recentGradesRows
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    next(err);
  }
}

/**
 * GET /api/student/profile
 * Returns detailed student profile data from enrollment application
 */
async function getProfileData(req, res, next) {
  try {
    const studentId = req.student.student_id;
    
    // Get detailed info from enrollment_applications
    const [rows] = await db.query(`
      SELECT 
        date_of_birth,
        phone,
        address,
        gender,
        nationality,
        guardian_name,
        guardian_phone,
        created_at as enrollment_date
      FROM enrollment_applications
      WHERE generated_student_id = ?
      LIMIT 1
    `, [studentId]);

    if (!rows[0]) {
      return res.json({
        date_of_birth: null,
        phone: null,
        address: null,
        gender: null,
        nationality: null,
        guardian_name: null,
        guardian_phone: null,
        enrollment_date: null
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    next(err);
  }
}

/**
 * GET /api/student/schedules
 * Returns student's enrolled schedules
 */
async function getStudentSchedules(req, res, next) {
  try {
    const studentId = req.student.student_id;

    const [schedules] = await db.query(`
      SELECT 
        ts.id as schedule_id,
        ts.subject_name,
        ts.room,
        ts.day,
        ts.time_start,
        ts.time_end,
        ts.track,
        ts.strand,
        ts.term,
        ts.school_year,
        t.full_name as teacher_name,
        t.department,
        sse.enrolled_at
      FROM student_schedule_enrollments sse
      INNER JOIN teacher_schedules ts ON sse.teacher_schedule_id = ts.id
      INNER JOIN teachers t ON ts.teacher_id = t.id
      WHERE sse.student_id = ?
      ORDER BY ts.day, ts.time_start ASC
    `, [studentId]);

    res.json({
      student_id: studentId,
      schedules,
      total: schedules.length
    });
  } catch (err) {
    console.error("Error fetching student schedules:", err);
    next(err);
  }
}

module.exports = {
  getDashboardData,
  getProfileData,
  getStudentSchedules
};
