const pool = require("../../config/db");

/**
 * Get teacher's assigned schedules
 */
async function getTeacherSchedules(req, res, next) {
  try {
    const teacherIdString = req.teacher?.teacher_id; // This is the string like 'T001'
    
    if (!teacherIdString) {
      return res.status(401).json({ error: "Teacher not authenticated" });
    }

    // First get the teacher's numeric ID from the teachers table
    const [teacherRows] = await pool.query(
      `SELECT id FROM teachers WHERE teacher_id = ?`,
      [teacherIdString]
    );

    if (teacherRows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacherNumericId = teacherRows[0].id;

    // Now get schedules using the numeric ID
    const [schedules] = await pool.query(`
      SELECT 
        ts.id,
        ts.subject_name,
        ts.room,
        ts.day,
        ts.time_start,
        ts.time_end,
        ts.track,
        ts.strand,
        ts.term,
        ts.school_year,
        ts.enrolled_count,
        ts.max_capacity
      FROM teacher_schedules ts
      WHERE ts.teacher_id = ?
      ORDER BY 
        FIELD(ts.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
        ts.time_start ASC
    `, [teacherNumericId]);
    
    res.json({
      schedules,
      total: schedules.length
    });
  } catch (err) {
    console.error("Error in getTeacherSchedules:", err);
    next(err);
  }
}

/**
 * Get students enrolled in a specific teacher's schedule
 */
async function getScheduleStudents(req, res, next) {
  try {
    const teacherIdString = req.teacher?.teacher_id;
    const { schedule_id } = req.params;

    if (!teacherIdString) {
      return res.status(401).json({ error: "Teacher not authenticated" });
    }

    // Get teacher's numeric ID
    const [teacherRows] = await pool.query(
      `SELECT id FROM teachers WHERE teacher_id = ?`,
      [teacherIdString]
    );

    if (teacherRows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacherNumericId = teacherRows[0].id;

    // Verify schedule belongs to this teacher
    const [scheduleCheck] = await pool.query(
      `SELECT id FROM teacher_schedules WHERE id = ? AND teacher_id = ?`,
      [schedule_id, teacherNumericId]
    );

    if (scheduleCheck.length === 0) {
      return res.status(403).json({ error: "Access denied to this schedule" });
    }

    const [students] = await pool.query(`
      SELECT 
        s.student_id,
        s.full_name,
        s.pathway as strand,
        s.grade_level,
        s.email,
        sse.enrolled_at
      FROM student_schedule_enrollments sse
      INNER JOIN students s ON sse.student_id = s.student_id
      WHERE sse.teacher_schedule_id = ?
      ORDER BY s.full_name ASC
    `, [schedule_id]);

    res.json({
      students,
      total: students.length
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTeacherSchedules,
  getScheduleStudents
};
