/**
 * modules/admin/schedulingController.js
 * Handles teacher scheduling and student enrollment for registrars
 */
const pool = require("../../config/db");

/**
 * Get all teachers (for scheduling assignment)
 */
async function getTeachersForScheduling(req, res, next) {
  try {
    const [teachers] = await pool.query(`
      SELECT 
        t.id,
        t.teacher_id,
        t.full_name,
        t.department,
        t.email,
        COUNT(DISTINCT ts.id) as schedule_count
      FROM teachers t
      LEFT JOIN teacher_schedules ts ON t.id = ts.teacher_id
      GROUP BY t.id
      ORDER BY t.full_name ASC
    `);

    res.json({
      teachers,
      total: teachers.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all teacher schedules with optional filters
 */
async function getTeacherSchedules(req, res, next) {
  try {
    const { teacher_id, term, school_year, track, strand } = req.query;
    
    let query = `
      SELECT 
        ts.id,
        ts.teacher_id,
        ts.subject_name,
        ts.room,
        ts.day,
        ts.time_start,
        ts.time_end,
        ts.track,
        ts.strand,
        ts.term,
        ts.school_year,
        ts.max_capacity,
        ts.enrolled_count,
        ts.created_at,
        ts.created_by,
        t.teacher_id as teacher_code,
        t.full_name as teacher_name,
        t.department
      FROM teacher_schedules ts
      INNER JOIN teachers t ON ts.teacher_id = t.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (teacher_id) {
      query += ` AND ts.teacher_id = ?`;
      params.push(teacher_id);
    }
    
    if (term) {
      query += ` AND ts.term = ?`;
      params.push(term);
    }
    
    if (school_year) {
      query += ` AND ts.school_year = ?`;
      params.push(school_year);
    }
    
    if (track) {
      query += ` AND ts.track = ?`;
      params.push(track);
    }
    
    if (strand) {
      query += ` AND ts.strand = ?`;
      params.push(strand);
    }
    
    query += ` ORDER BY ts.day, ts.time_start ASC`;
    
    const [schedules] = await pool.query(query, params);

    res.json({
      schedules,
      total: schedules.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get schedules for a specific teacher
 */
async function getTeacherScheduleDetails(req, res, next) {
  try {
    const { teacher_id } = req.params;

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
        ts.max_capacity,
        ts.enrolled_count,
        ts.created_at,
        t.full_name as teacher_name,
        t.department
      FROM teacher_schedules ts
      INNER JOIN teachers t ON ts.teacher_id = t.id
      WHERE ts.teacher_id = ?
      ORDER BY ts.day, ts.time_start ASC
    `, [teacher_id]);

    res.json({
      teacher_id,
      schedules,
      total: schedules.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new teacher schedule
 */
async function createTeacherSchedule(req, res, next) {
  try {
    const adminId = req.admin?.admin_id;
    const {
      teacher_id,
      subject_name,
      room,
      day,
      time_start,
      time_end,
      track,
      strand,
      term,
      school_year,
      max_capacity
    } = req.body;

    // Validation
    if (!teacher_id || !subject_name || !room || !day || !time_start || !time_end || !track || !strand || !term || !school_year) {
      return res.status(400).json({
        error: "All fields are required: teacher_id, subject_name, room, day, time_start, time_end, track, strand, term, school_year"
      });
    }

    // Check for time conflicts
    const [conflicts] = await pool.query(`
      SELECT id, subject_name, room 
      FROM teacher_schedules 
      WHERE teacher_id = ? 
        AND day = ? 
        AND term = ?
        AND school_year = ?
        AND (
          (time_start <= ? AND time_end > ?) OR
          (time_start < ? AND time_end >= ?) OR
          (time_start >= ? AND time_end <= ?)
        )
    `, [teacher_id, day, term, school_year, time_start, time_start, time_end, time_end, time_start, time_end]);

    if (conflicts.length > 0) {
      return res.status(409).json({
        error: "Time conflict detected",
        conflict: conflicts[0]
      });
    }

    // Insert schedule
    const [result] = await pool.query(`
      INSERT INTO teacher_schedules 
        (teacher_id, subject_name, room, day, time_start, time_end, track, strand, term, school_year, max_capacity, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [teacher_id, subject_name, room, day, time_start, time_end, track, strand, term, school_year, max_capacity || 40, adminId]);

    res.status(201).json({
      message: "Teacher schedule created successfully",
      schedule_id: result.insertId
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update a teacher schedule
 */
async function updateTeacherSchedule(req, res, next) {
  try {
    const { schedule_id } = req.params;
    const {
      subject_name,
      room,
      day,
      time_start,
      time_end,
      track,
      strand,
      term,
      max_capacity
    } = req.body;

    // Check if schedule exists
    const [existing] = await pool.query(`
      SELECT teacher_id, school_year FROM teacher_schedules WHERE id = ?
    `, [schedule_id]);

    if (existing.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Check for time conflicts (excluding current schedule)
    if (day && time_start && time_end) {
      const [conflicts] = await pool.query(`
        SELECT id, subject_name 
        FROM teacher_schedules 
        WHERE id != ?
          AND teacher_id = ? 
          AND day = ? 
          AND term = ?
          AND school_year = ?
          AND (
            (time_start <= ? AND time_end > ?) OR
            (time_start < ? AND time_end >= ?) OR
            (time_start >= ? AND time_end <= ?)
          )
      `, [schedule_id, existing[0].teacher_id, day, term, existing[0].school_year, time_start, time_start, time_end, time_end, time_start, time_end]);

      if (conflicts.length > 0) {
        return res.status(409).json({
          error: "Time conflict detected",
          conflict: conflicts[0]
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (subject_name !== undefined) { updates.push('subject_name = ?'); values.push(subject_name); }
    if (room !== undefined) { updates.push('room = ?'); values.push(room); }
    if (day !== undefined) { updates.push('day = ?'); values.push(day); }
    if (time_start !== undefined) { updates.push('time_start = ?'); values.push(time_start); }
    if (time_end !== undefined) { updates.push('time_end = ?'); values.push(time_end); }
    if (track !== undefined) { updates.push('track = ?'); values.push(track); }
    if (strand !== undefined) { updates.push('strand = ?'); values.push(strand); }
    if (term !== undefined) { updates.push('term = ?'); values.push(term); }
    if (max_capacity !== undefined) { updates.push('max_capacity = ?'); values.push(max_capacity); }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(schedule_id);

    await pool.query(`
      UPDATE teacher_schedules 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values);

    res.json({ message: "Schedule updated successfully" });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a teacher schedule
 */
async function deleteTeacherSchedule(req, res, next) {
  try {
    const { schedule_id } = req.params;

    // Check if any students are enrolled
    const [enrollments] = await pool.query(`
      SELECT COUNT(*) as count FROM student_schedule_enrollments WHERE teacher_schedule_id = ?
    `, [schedule_id]);

    if (enrollments[0].count > 0) {
      return res.status(409).json({
        error: "Cannot delete schedule with enrolled students",
        enrolled_count: enrollments[0].count
      });
    }

    const [result] = await pool.query(`
      DELETE FROM teacher_schedules WHERE id = ?
    `, [schedule_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ message: "Schedule deleted successfully" });
  } catch (err) {
    next(err);
  }
}

/**
 * Get approved enrolled students (for enrollment in schedules)
 */
async function getEnrolledStudents(req, res, next) {
  try {
    const { term, school_year, track, strand } = req.query;

    let query = `
      SELECT 
        s.student_id,
        s.full_name,
        s.pathway as strand,
        s.grade_level,
        s.email,
        e.term,
        CASE 
          WHEN s.pathway IN ('STEM', 'HUMMS', 'ABM', 'GAS') THEN 'Academic Track'
          WHEN s.pathway IN ('ICT', 'Cookery') THEN 'TechPro Track'
          ELSE 'Academic Track'
        END as track
      FROM students s
      INNER JOIN enrollments e ON s.student_id = e.student_id
      WHERE e.status = 'approved'
    `;

    const params = [];

    if (term) {
      query += ` AND e.term = ?`;
      params.push(term);
    }

    if (track) {
      if (track === 'Academic Track') {
        query += ` AND s.pathway IN ('STEM', 'HUMMS', 'ABM', 'GAS')`;
      } else if (track === 'TechPro Track') {
        query += ` AND s.pathway IN ('ICT', 'Cookery')`;
      }
    }

    if (strand) {
      query += ` AND s.pathway = ?`;
      params.push(strand);
    }

    query += ` ORDER BY s.full_name ASC`;

    const [students] = await pool.query(query, params);

    res.json({
      students,
      total: students.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Enroll student(s) in a teacher schedule
 */
async function enrollStudentInSchedule(req, res, next) {
  try {
    const adminId = req.admin?.admin_id;
    const { schedule_id } = req.params;
    const { student_ids } = req.body; // Array of student IDs

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: "student_ids must be a non-empty array" });
    }

    // Check schedule capacity
    const [schedule] = await pool.query(`
      SELECT max_capacity, enrolled_count FROM teacher_schedules WHERE id = ?
    `, [schedule_id]);

    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const availableSlots = schedule[0].max_capacity - schedule[0].enrolled_count;
    if (student_ids.length > availableSlots) {
      return res.status(409).json({
        error: "Not enough capacity",
        requested: student_ids.length,
        available: availableSlots
      });
    }

    // Insert enrollments
    const values = student_ids.map(student_id => [student_id, schedule_id, adminId]);
    
    await pool.query(`
      INSERT IGNORE INTO student_schedule_enrollments (student_id, teacher_schedule_id, enrolled_by)
      VALUES ?
    `, [values]);

    res.json({
      message: "Students enrolled successfully",
      enrolled_count: student_ids.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Unenroll student from a schedule
 */
async function unenrollStudentFromSchedule(req, res, next) {
  try {
    const { schedule_id, student_id } = req.params;

    const [result] = await pool.query(`
      DELETE FROM student_schedule_enrollments 
      WHERE teacher_schedule_id = ? AND student_id = ?
    `, [schedule_id, student_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    res.json({ message: "Student unenrolled successfully" });
  } catch (err) {
    next(err);
  }
}

/**
 * Get students enrolled in a specific schedule
 */
async function getScheduleStudents(req, res, next) {
  try {
    const { schedule_id } = req.params;

    const [students] = await pool.query(`
      SELECT 
        s.student_id,
        s.full_name,
        s.pathway as strand,
        s.grade_level,
        s.email,
        sse.enrolled_at,
        sse.enrolled_by
      FROM student_schedule_enrollments sse
      INNER JOIN students s ON sse.student_id = s.student_id
      WHERE sse.teacher_schedule_id = ?
      ORDER BY s.full_name ASC
    `, [schedule_id]);

    res.json({
      schedule_id,
      students,
      total: students.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a student's enrolled schedules
 */
async function getStudentSchedules(req, res, next) {
  try {
    const { student_id } = req.params;

    const [schedules] = await pool.query(`
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
    `, [student_id]);

    res.json({
      student_id,
      schedules,
      total: schedules.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get weekly timetable view (all schedules in grid format)
 * Priority 2 Feature
 */
async function getWeeklyTimetable(req, res, next) {
  try {
    const { term, school_year, track, strand, teacher_id, room } = req.query;

    let query = `
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
        ts.max_capacity,
        ts.enrolled_count,
        t.id as teacher_id,
        t.teacher_id as teacher_code,
        t.full_name as teacher_name,
        t.department
      FROM teacher_schedules ts
      INNER JOIN teachers t ON ts.teacher_id = t.id
      WHERE 1=1
    `;

    const params = [];

    if (term) {
      query += ` AND ts.term = ?`;
      params.push(term);
    }

    if (school_year) {
      query += ` AND ts.school_year = ?`;
      params.push(school_year);
    }

    if (track) {
      query += ` AND ts.track = ?`;
      params.push(track);
    }

    if (strand) {
      query += ` AND ts.strand = ?`;
      params.push(strand);
    }

    if (teacher_id) {
      query += ` AND ts.teacher_id = ?`;
      params.push(teacher_id);
    }

    if (room) {
      query += ` AND ts.room = ?`;
      params.push(room);
    }

    query += ` ORDER BY 
      FIELD(ts.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
      ts.time_start ASC
    `;

    const [schedules] = await pool.query(query, params);

    // Group schedules by day and time for easier grid rendering
    const timetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    schedules.forEach(schedule => {
      if (timetable[schedule.day]) {
        timetable[schedule.day].push(schedule);
      }
    });

    // Find room conflicts
    const conflicts = [];
    schedules.forEach((s1, i) => {
      schedules.slice(i + 1).forEach(s2 => {
        if (s1.room === s2.room && 
            s1.day === s2.day && 
            s1.term === s2.term &&
            s1.school_year === s2.school_year) {
          // Check time overlap
          const s1Start = s1.time_start;
          const s1End = s1.time_end;
          const s2Start = s2.time_start;
          const s2End = s2.time_end;

          const overlap = (s1Start < s2End && s1End > s2Start);
          
          if (overlap) {
            conflicts.push({
              room: s1.room,
              day: s1.day,
              schedule1: {
                id: s1.id,
                subject: s1.subject_name,
                teacher: s1.teacher_name,
                time: `${s1.time_start.slice(0,5)}-${s1.time_end.slice(0,5)}`
              },
              schedule2: {
                id: s2.id,
                subject: s2.subject_name,
                teacher: s2.teacher_name,
                time: `${s2.time_start.slice(0,5)}-${s2.time_end.slice(0,5)}`
              }
            });
          }
        }
      });
    });

    res.json({
      timetable,
      schedules,
      conflicts,
      total: schedules.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Bulk enroll students in a schedule
 * Priority 2 Feature
 */
async function bulkEnrollStudents(req, res, next) {
  try {
    const adminId = req.admin?.admin_id;
    const { schedule_id } = req.params;
    const { student_ids } = req.body;

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: "student_ids must be a non-empty array" });
    }

    // Check schedule capacity
    const [schedule] = await pool.query(`
      SELECT max_capacity, enrolled_count, track, strand FROM teacher_schedules WHERE id = ?
    `, [schedule_id]);

    if (schedule.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const availableSlots = schedule[0].max_capacity - schedule[0].enrolled_count;
    if (student_ids.length > availableSlots) {
      return res.status(409).json({
        error: "Not enough capacity",
        requested: student_ids.length,
        available: availableSlots
      });
    }

    // Validate track/strand compatibility
    const placeholders = student_ids.map(() => '?').join(',');
    const [students] = await pool.query(`
      SELECT 
        s.student_id,
        s.full_name,
        s.pathway as strand,
        CASE 
          WHEN s.pathway IN ('STEM', 'HUMMS', 'ABM', 'GAS') THEN 'Academic Track'
          WHEN s.pathway IN ('ICT', 'Cookery') THEN 'TechPro Track'
          ELSE 'Academic Track'
        END as track
      FROM students s
      WHERE s.student_id IN (${placeholders})
    `, student_ids);

    const incompatibleStudents = students.filter(student => 
      student.track !== schedule[0].track || student.strand !== schedule[0].strand
    );

    if (incompatibleStudents.length > 0) {
      return res.status(400).json({
        error: "Track/Strand mismatch detected",
        incompatible: incompatibleStudents.map(s => ({
          student_id: s.student_id,
          name: s.full_name,
          student_track: s.track,
          student_strand: s.strand,
          schedule_track: schedule[0].track,
          schedule_strand: schedule[0].strand
        }))
      });
    }

    // Check for already enrolled students
    const [alreadyEnrolled] = await pool.query(`
      SELECT student_id 
      FROM student_schedule_enrollments 
      WHERE teacher_schedule_id = ? AND student_id IN (${placeholders})
    `, [schedule_id, ...student_ids]);

    const alreadyEnrolledIds = alreadyEnrolled.map(e => e.student_id);
    const newEnrollments = student_ids.filter(id => !alreadyEnrolledIds.includes(id));

    if (newEnrollments.length === 0) {
      return res.status(400).json({
        error: "All students are already enrolled in this schedule",
        already_enrolled: alreadyEnrolledIds.length
      });
    }

    // Insert enrollments
    const values = newEnrollments.map(student_id => [student_id, schedule_id, adminId]);
    
    await pool.query(`
      INSERT INTO student_schedule_enrollments (student_id, teacher_schedule_id, enrolled_by)
      VALUES ?
    `, [values]);

    res.json({
      message: "Students enrolled successfully",
      enrolled: newEnrollments.length,
      skipped: alreadyEnrolledIds.length,
      total_requested: student_ids.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get scheduling statistics dashboard data
 * Priority 2 Feature
 */
async function getSchedulingStatistics(req, res, next) {
  try {
    const { term, school_year } = req.query;

    // Total schedules
    let scheduleQuery = `SELECT COUNT(*) as count FROM teacher_schedules WHERE 1=1`;
    const params = [];

    if (term) {
      scheduleQuery += ` AND term = ?`;
      params.push(term);
    }

    if (school_year) {
      scheduleQuery += ` AND school_year = ?`;
      params.push(school_year);
    }

    const [totalSchedules] = await pool.query(scheduleQuery, params);

    // Teachers with schedules vs total
    let teacherQuery = `
      SELECT 
        COUNT(DISTINCT t.id) as total_teachers,
        COUNT(DISTINCT ts.teacher_id) as teachers_with_schedules
      FROM teachers t
      LEFT JOIN teacher_schedules ts ON t.id = ts.teacher_id
    `;

    if (term || school_year) {
      teacherQuery += ` AND 1=1`;
      if (term) {
        teacherQuery += ` AND ts.term = ?`;
      }
      if (school_year) {
        teacherQuery += ` AND ts.school_year = ?`;
      }
    }

    const [teacherStats] = await pool.query(teacherQuery, params);

    // Students enrolled vs total approved
    let studentQuery = `
      SELECT 
        COUNT(DISTINCT s.student_id) as total_students,
        COUNT(DISTINCT sse.student_id) as students_enrolled
      FROM students s
      INNER JOIN enrollments e ON s.student_id = e.student_id
      LEFT JOIN student_schedule_enrollments sse ON s.student_id = sse.student_id
      WHERE e.status = 'approved'
    `;

    if (term) {
      studentQuery += ` AND e.term = ?`;
    }

    const studentParams = term ? [term] : [];
    const [studentStats] = await pool.query(studentQuery, studentParams);

    // Total unique rooms used
    let roomQuery = `
      SELECT COUNT(DISTINCT room) as rooms_used 
      FROM teacher_schedules 
      WHERE 1=1
    `;
    const [roomStats] = await pool.query(roomQuery + (term ? ` AND term = ?` : '') + (school_year ? ` AND school_year = ?` : ''), params);

    // Track distribution
    let trackQuery = `
      SELECT 
        track,
        COUNT(*) as schedule_count,
        SUM(enrolled_count) as total_students
      FROM teacher_schedules
      WHERE 1=1
    `;
    const [trackDistribution] = await pool.query(trackQuery + (term ? ` AND term = ?` : '') + (school_year ? ` AND school_year = ?` : '') + ` GROUP BY track`, params);

    // Capacity utilization
    let capacityQuery = `
      SELECT 
        SUM(max_capacity) as total_capacity,
        SUM(enrolled_count) as total_enrolled,
        ROUND((SUM(enrolled_count) / SUM(max_capacity)) * 100, 2) as utilization_percentage
      FROM teacher_schedules
      WHERE 1=1
    `;
    const [capacityStats] = await pool.query(capacityQuery + (term ? ` AND term = ?` : '') + (school_year ? ` AND school_year = ?` : ''), params);

    // Room conflicts count (simplified check)
    let conflictQuery = `
      SELECT COUNT(*) as conflict_count
      FROM teacher_schedules ts1
      INNER JOIN teacher_schedules ts2 
        ON ts1.room = ts2.room 
        AND ts1.day = ts2.day 
        AND ts1.id < ts2.id
        AND ts1.time_start < ts2.time_end 
        AND ts1.time_end > ts2.time_start
      WHERE 1=1
    `;
    const [conflicts] = await pool.query(conflictQuery + (term ? ` AND ts1.term = ?` : '') + (school_year ? ` AND ts1.school_year = ?` : ''), params);

    res.json({
      statistics: {
        total_schedules: totalSchedules[0].count,
        teachers: {
          total: teacherStats[0].total_teachers,
          with_schedules: teacherStats[0].teachers_with_schedules,
          percentage: teacherStats[0].total_teachers > 0 
            ? Math.round((teacherStats[0].teachers_with_schedules / teacherStats[0].total_teachers) * 100) 
            : 0
        },
        students: {
          total_approved: studentStats[0].total_students,
          enrolled: studentStats[0].students_enrolled,
          percentage: studentStats[0].total_students > 0 
            ? Math.round((studentStats[0].students_enrolled / studentStats[0].total_students) * 100) 
            : 0
        },
        rooms: {
          utilized: roomStats[0].rooms_used
        },
        capacity: {
          total: capacityStats[0].total_capacity || 0,
          enrolled: capacityStats[0].total_enrolled || 0,
          utilization_percentage: capacityStats[0].utilization_percentage || 0
        },
        conflicts: {
          room_conflicts: conflicts[0].conflict_count
        },
        track_distribution: trackDistribution
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTeachersForScheduling,
  getTeacherSchedules,
  getTeacherScheduleDetails,
  createTeacherSchedule,
  updateTeacherSchedule,
  deleteTeacherSchedule,
  getEnrolledStudents,
  enrollStudentInSchedule,
  unenrollStudentFromSchedule,
  getScheduleStudents,
  getStudentSchedules,
  // Priority 2 Features
  getWeeklyTimetable,
  bulkEnrollStudents,
  getSchedulingStatistics
};
