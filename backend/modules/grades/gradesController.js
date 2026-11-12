/**
 * modules/grades/gradesController.js
 * Returns RELEASED grades from grade_requests table
 */
const db = require("../../config/db");
const ConfigModel = require("../shared/configModel");

async function getMyGrades(req, res, next) {
  try {
    const { student_id } = req.student;
    const { active_term } = await ConfigModel.getEnrollmentConfig();

    console.log('[getMyGrades] Student:', student_id, 'Active Term:', active_term);

    // Get grade requests (released grades) for this student and term
    const [releasedGrades] = await db.query(
      `SELECT 
         gr.id as request_id,
         gr.score as percentage,
         gr.letter_grade,
         gr.remarks,
         gr.updated_at as released_at,
         COALESCE(ts.subject_name, 'Unknown Subject') AS subject_name,
         COALESCE(ts.strand, 'N/A') AS subject_code,
         t.full_name AS teacher_name
       FROM grade_requests gr
       LEFT JOIN teacher_schedules ts ON ts.id = gr.subject_id
       JOIN teachers t ON t.id = gr.teacher_id
       WHERE gr.student_id = ? 
         AND gr.term = ?
         AND gr.status = 'released_to_student'
       ORDER BY gr.updated_at DESC`,
      [student_id, active_term]
    );

    console.log('[getMyGrades] Found', releasedGrades.length, 'released grade requests');

    // ALSO get available subjects (subjects enrolled but not requested yet)
    // Look up student's internal ID
    const [studentLookup] = await db.query(
      `SELECT id FROM students WHERE student_id = ?`,
      [student_id]
    );

    let availableSubjects = [];
    if (studentLookup.length > 0) {
      const studentInternalId = studentLookup[0].id;
      
      const [subjects] = await db.query(
        `SELECT 
           ts.id as subject_id,
           ts.subject_name,
           ts.strand,
           ts.term,
           t.id as teacher_db_id,
           t.full_name as teacher_name
         FROM student_schedule_enrollments sse
         INNER JOIN teacher_schedules ts ON sse.teacher_schedule_id = ts.id
         INNER JOIN teachers t ON ts.teacher_id = t.id
         WHERE sse.student_internal_id = ?
           AND ts.term = ?
           AND NOT EXISTS (
             SELECT 1 FROM grade_requests gr
             WHERE gr.student_id = ?
               AND gr.subject_id = ts.id
               AND gr.term = ?
           )
         ORDER BY ts.subject_name ASC`,
        [studentInternalId, active_term, student_id, active_term]
      );
      
      availableSubjects = subjects;
      console.log('[getMyGrades] Found', availableSubjects.length, 'available subjects for requesting');
      availableSubjects.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.subject_name} (schedule_id: ${s.subject_id})`);
      });
    }

    // Enrich the grades
    const { toLetterGrade, toPerformanceStatus, computeGWA } = require("../../utils/grading");
    
    const enriched = releasedGrades.map((row) => {
      const pct = parseFloat(row.percentage || 0);
      return {
        request_id: row.request_id,
        subject_code: row.subject_code,
        subject_name: row.subject_name,
        teacher_name: row.teacher_name,
        percentage: pct,
        letter_grade: row.letter_grade || toLetterGrade(pct),
        performance_status: row.letter_grade ? toPerformanceStatus(row.letter_grade) : 'N/A',
        remarks: row.remarks,
        released_at: row.released_at
      };
    });

    // Compute GWA from released grades
    const letterGrades = releasedGrades.map(r => r.letter_grade).filter(Boolean);
    const gwa = letterGrades.length ? computeGWA(letterGrades) : null;

    res.json({
      term: active_term,
      grades: enriched,
      available_subjects: availableSubjects,
      gwa: gwa !== null ? gwa : "N/A",
    });
  } catch (err) { 
    console.error('[getMyGrades] Error:', err);
    next(err); 
  }
}

/**
 * Get available subjects for grade requests
 * Returns subjects student is enrolled in but hasn't requested grades for yet
 */
async function getAvailableSubjects(req, res, next) {
  try {
    const { student_id } = req.student;
    const { term } = req.query;

    console.log('[getAvailableSubjects] Student:', student_id, 'Term:', term);

    if (!term) {
      return res.status(400).json({ error: "term parameter is required" });
    }

    // Look up student's internal ID
    const [studentLookup] = await db.query(
      `SELECT id FROM students WHERE student_id = ?`,
      [student_id]
    );

    if (studentLookup.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const studentInternalId = studentLookup[0].id;
    console.log('[getAvailableSubjects] Student internal_id:', studentInternalId);

    // Get enrolled subjects that don't have grade requests yet
    const [availableSubjects] = await db.query(
      `SELECT 
         ts.id as subject_id,
         ts.subject_name,
         ts.strand,
         ts.term,
         t.id as teacher_id,
         t.full_name as teacher_name
       FROM student_schedule_enrollments sse
       INNER JOIN teacher_schedules ts ON sse.teacher_schedule_id = ts.id
       INNER JOIN teachers t ON ts.teacher_id = t.id
       WHERE sse.student_internal_id = ?
         AND ts.term = ?
         AND NOT EXISTS (
           SELECT 1 FROM grade_requests gr
           WHERE gr.student_id = ?
             AND gr.subject_id = ts.id
             AND gr.term = ?
         )
       ORDER BY ts.subject_name ASC`,
      [studentInternalId, term, student_id, term]
    );

    console.log('[getAvailableSubjects] Found', availableSubjects.length, 'available subjects');
    availableSubjects.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.subject_name} (ID: ${s.subject_id}) - ${s.teacher_name}`);
    });

    res.json({
      term,
      subjects: availableSubjects,
      total: availableSubjects.length
    });
  } catch (err) {
    console.error('[getAvailableSubjects] Error:', err);
    next(err);
  }
}

module.exports = { getMyGrades, getAvailableSubjects };
