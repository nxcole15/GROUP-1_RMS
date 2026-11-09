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

    // Get grades data - calculate GWA from RELEASED grade requests only
    let averageGrade = 0;
    try {
      const [gradesRows] = await db.query(`
        SELECT 
          AVG(gr.score) as average_grade
        FROM grade_requests gr
        WHERE gr.student_id = ?
          AND gr.status = 'released_to_student'
      `, [studentId]);
      averageGrade = gradesRows[0]?.average_grade || 0;
    } catch (err) {
      // Grade requests table might not exist yet
      console.error("Error fetching grades:", err.message);
    }

    // Get tuition/payment data (handle missing tables)
    let totalPaid = 0;
    try {
      const [paymentsRows] = await db.query(`
        SELECT 
          COALESCE(SUM(p.amount), 0) as total_paid
        FROM payments p
        INNER JOIN students s ON p.student_internal_id = s.id
        WHERE s.student_id = ? AND p.status = 'verified'
      `, [studentId]);
      totalPaid = paymentsRows[0]?.total_paid || 0;
    } catch (err) {
      // Payments table might not exist yet
      console.error("Error fetching payments:", err.message);
    }

    // Get total tuition fee from new assessment system
    let totalTuition = 0;
    try {
      // Try new assessment system first
      const [assessmentRows] = await db.query(`
        SELECT 
          COALESCE(sa.net_assessment, 0) as total_tuition
        FROM student_assessments sa
        INNER JOIN students s ON sa.student_internal_id = s.id
        WHERE s.student_id = ?
        ORDER BY sa.assessed_at DESC
        LIMIT 1
      `, [studentId]);
      
      if (assessmentRows && assessmentRows[0] && assessmentRows[0].total_tuition > 0) {
        totalTuition = assessmentRows[0].total_tuition;
      } else {
        // Fallback to old student_tuition table if assessment doesn't exist
        const [tuitionRows] = await db.query(`
          SELECT 
            COALESCE(total_amount, 0) as total_tuition
          FROM student_tuition
          WHERE student_id = ?
          LIMIT 1
        `, [studentId]);
        totalTuition = tuitionRows[0]?.total_tuition || 0;
      }
    } catch (err) {
      // Tables might not exist yet
      console.error("Error fetching tuition:", err.message);
    }

    // Get pending document requests count (documents not yet picked up)
    let pendingDocs = 0;
    try {
      const [docsRows] = await db.query(`
        SELECT COUNT(*) as pending_count
        FROM documents d
        INNER JOIN students s ON d.student_internal_id = s.id
        WHERE s.student_id = ? AND d.status <> 'released'
      `, [studentId]);
      pendingDocs = docsRows[0]?.pending_count || 0;
    } catch (err) {
      // Documents table might not exist yet or query failed
      console.error("Error fetching pending documents:", err.message);
      pendingDocs = 0;
    }

    // Get recent RELEASED grades from grade_requests (not from grades table directly)
    let recentGradesRows = [];
    try {
      const [rows] = await db.query(`
        SELECT 
          gr.id,
          COALESCE(ts.subject_name, sub.name) AS subject_name,
          COALESCE(ts.strand, 'N/A') AS strand,
          gr.score as percentage,
          gr.term,
          gr.updated_at as created_at
        FROM grade_requests gr
        LEFT JOIN subjects sub ON sub.id = gr.subject_id
        LEFT JOIN teacher_schedules ts ON ts.id = gr.subject_id
        WHERE gr.student_id = ?
          AND gr.status = 'released_to_student'
        ORDER BY gr.updated_at DESC
        LIMIT 5
      `, [studentId]);
      recentGradesRows = rows.map(row => ({
        ...row,
        subject_name: row.subject_name,
        strand: row.strand
      }));
    } catch (err) {
      console.error("Error fetching recent grades:", err.message);
      // Grade requests table might not exist yet
    }

    // Get adviser information - DISABLED (feature removed in migration 015)
    // The student_adviser_assignments table no longer exists
    let adviser = null;

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
    
    // Get detailed info from enrollment_applications and students table
    const [rows] = await db.query(`
      SELECT 
        ea.date_of_birth,
        ea.phone,
        ea.address,
        ea.gender,
        ea.nationality,
        ea.guardian_name,
        ea.guardian_phone,
        ea.created_at as enrollment_date,
        ea.track,
        ea.strand,
        s.grade_level,
        s.track as student_track,
        s.strand as student_strand
      FROM enrollment_applications ea
      LEFT JOIN students s ON ea.generated_student_id = s.student_id
      WHERE ea.generated_student_id = ?
      LIMIT 1
    `, [studentId]);

    // Get current academic period
    let academicInfo = {
      school_year: null,
      current_term: null,
      track: null,
      strand: null,
      grade_level: null
    };

    try {
      const [academicRows] = await db.query(`
        SELECT 
          ec.school_year,
          ec.current_term,
          s.track,
          s.strand,
          s.grade_level
        FROM enrollment_config ec
        CROSS JOIN students s
        WHERE ec.status = 'active'
          AND s.student_id = ?
        LIMIT 1
      `, [studentId]);

      if (academicRows && academicRows[0]) {
        academicInfo = {
          school_year: academicRows[0].school_year,
          current_term: academicRows[0].current_term,
          track: academicRows[0].track,
          strand: academicRows[0].strand,
          grade_level: academicRows[0].grade_level
        };
      }
    } catch (err) {
      console.error("Error fetching academic info:", err.message);
    }

    if (!rows[0]) {
      return res.json({
        date_of_birth: null,
        phone: null,
        address: null,
        gender: null,
        nationality: null,
        guardian_name: null,
        guardian_phone: null,
        enrollment_date: null,
        school_year: academicInfo.school_year,
        current_term: academicInfo.current_term,
        adviser_name: academicInfo.adviser_name,
        track: academicInfo.track,
        strand: academicInfo.strand,
        grade_level: academicInfo.grade_level
      });
    }

    // Use track/strand from students table if available, otherwise from enrollment_applications
    const finalTrack = academicInfo.track || rows[0].student_track || rows[0].track;
    const finalStrand = academicInfo.strand || rows[0].student_strand || rows[0].strand;

    res.json({
      ...rows[0],
      school_year: academicInfo.school_year,
      current_term: academicInfo.current_term,
      adviser_name: academicInfo.adviser_name,
      track: finalTrack,
      strand: finalStrand,
      grade_level: academicInfo.grade_level || rows[0].grade_level
    });
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
    const studentId = req.student.student_id; // Display ID from JWT

    // Look up student's internal ID
    const [studentLookup] = await db.query(
      `SELECT id FROM students WHERE student_id = ?`,
      [studentId]
    );

    if (studentLookup.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const studentInternalId = studentLookup[0].id;

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
        sse.enrolled_at
      FROM student_schedule_enrollments sse
      INNER JOIN teacher_schedules ts ON sse.teacher_schedule_id = ts.id
      INNER JOIN teachers t ON ts.teacher_id = t.id
      WHERE sse.student_internal_id = ?
      ORDER BY ts.day, ts.time_start ASC
    `, [studentInternalId]);

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
