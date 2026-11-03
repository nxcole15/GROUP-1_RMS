/**
 * modules/admin/adviserModel.js
 * Model for adviser assignment management
 */
const db = require("../../config/db");

const AdviserModel = {
  /**
   * Get students with filters and adviser information
   */
  async getStudentsWithAdvisers({
    gradeLevel,
    track,
    strand,
    adviserStatus,
    schoolYearId,
    searchQuery,
    limit = 50,
    offset = 0,
  }) {
    let query = `
      SELECT 
        s.id,
        s.student_id,
        s.full_name,
        s.grade_level,
        s.track,
        s.strand,
        s.pathway,
        s.email,
        s.account_status,
        t.teacher_id,
        t.full_name AS adviser_name,
        saa.id AS assignment_id,
        saa.assigned_at
      FROM students s
      LEFT JOIN student_adviser_assignments saa 
        ON s.student_id = saa.student_id 
        AND saa.school_year_id = ?
        AND saa.status = 'active'
      LEFT JOIN teachers t ON saa.teacher_id = t.id
      WHERE s.account_status = 'active'
    `;

    const params = [schoolYearId];

    if (gradeLevel && gradeLevel !== "all") {
      query += ` AND s.grade_level = ?`;
      params.push(gradeLevel);
    }

    if (track && track !== "all") {
      query += ` AND s.track = ?`;
      params.push(track);
    }

    if (strand && strand !== "all") {
      query += ` AND s.strand = ?`;
      params.push(strand);
    }

    if (adviserStatus === "assigned") {
      query += ` AND saa.id IS NOT NULL`;
    } else if (adviserStatus === "unassigned") {
      query += ` AND saa.id IS NULL`;
    }

    if (searchQuery) {
      query += ` AND (s.full_name LIKE ? OR s.student_id LIKE ?)`;
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern);
    }

    query += ` ORDER BY s.full_name LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
  },

  /**
   * Get total count of students matching filters
   */
  async getStudentsCount({
    gradeLevel,
    track,
    strand,
    adviserStatus,
    schoolYearId,
    searchQuery,
  }) {
    let query = `
      SELECT COUNT(DISTINCT s.id) AS total
      FROM students s
      LEFT JOIN student_adviser_assignments saa 
        ON s.student_id = saa.student_id 
        AND saa.school_year_id = ?
        AND saa.status = 'active'
      WHERE s.account_status = 'active'
    `;

    const params = [schoolYearId];

    if (gradeLevel && gradeLevel !== "all") {
      query += ` AND s.grade_level = ?`;
      params.push(gradeLevel);
    }

    if (track && track !== "all") {
      query += ` AND s.track = ?`;
      params.push(track);
    }

    if (strand && strand !== "all") {
      query += ` AND s.strand = ?`;
      params.push(strand);
    }

    if (adviserStatus === "assigned") {
      query += ` AND saa.id IS NOT NULL`;
    } else if (adviserStatus === "unassigned") {
      query += ` AND saa.id IS NULL`;
    }

    if (searchQuery) {
      query += ` AND (s.full_name LIKE ? OR s.student_id LIKE ?)`;
      const searchPattern = `%${searchQuery}%`;
      params.push(searchPattern, searchPattern);
    }

    const [rows] = await db.query(query, params);
    return rows[0]?.total || 0;
  },

  /**
   * Get all available teachers for adviser assignment
   */
  async getAvailableTeachers() {
    const [rows] = await db.query(
      `SELECT 
        id, 
        teacher_id, 
        full_name, 
        department, 
        email 
       FROM teachers 
       ORDER BY full_name`
    );
    return rows;
  },

  /**
   * Validate that all students being assigned have the same Grade Level, Track, and Strand
   */
  async validateStudentsForAssignment(studentIds) {
    if (!studentIds || studentIds.length === 0) {
      return {
        valid: false,
        message: "No students provided for validation",
      };
    }

    // Get student details
    const placeholders = studentIds.map(() => "?").join(",");
    const [students] = await db.query(
      `SELECT student_id, full_name, grade_level, track, strand
       FROM students
       WHERE student_id IN (${placeholders})
         AND account_status = 'active'`,
      studentIds
    );

    if (students.length === 0) {
      return {
        valid: false,
        message: "No valid students found",
      };
    }

    if (students.length !== studentIds.length) {
      return {
        valid: false,
        message: "Some selected students were not found or are inactive",
      };
    }

    // Get the first student's academic details as the reference
    const reference = students[0];
    const refGrade = reference.grade_level;
    const refTrack = reference.track;
    const refStrand = reference.strand;

    // Check if all students match the reference
    const mismatches = [];
    
    for (let i = 1; i < students.length; i++) {
      const student = students[i];
      const issues = [];

      if (student.grade_level !== refGrade) {
        issues.push(`Grade Level: ${student.grade_level} (expected: ${refGrade})`);
      }
      if (student.track !== refTrack) {
        issues.push(`Track: ${student.track || "None"} (expected: ${refTrack || "None"})`);
      }
      if (student.strand !== refStrand) {
        issues.push(`Strand: ${student.strand || "None"} (expected: ${refStrand || "None"})`);
      }

      if (issues.length > 0) {
        mismatches.push({
          student_id: student.student_id,
          student_name: student.full_name,
          issues: issues.join(", "),
        });
      }
    }

    if (mismatches.length > 0) {
      return {
        valid: false,
        message: "Students must belong to the same Grade Level, Track, and Strand to be assigned to the same adviser",
        details: {
          expected: {
            grade_level: refGrade,
            track: refTrack || "None",
            strand: refStrand || "None",
          },
          mismatches: mismatches,
        },
      };
    }

    return {
      valid: true,
      academicDetails: {
        grade_level: refGrade,
        track: refTrack,
        strand: refStrand,
      },
    };
  },

  /**
   * Assign adviser to a student
   */
  async assignAdviser({
    studentId,
    teacherId,
    schoolYearId,
    assignedBy,
    replace = false,
  }) {
    // Check if student already has an adviser for this school year
    const [existing] = await db.query(
      `SELECT id FROM student_adviser_assignments 
       WHERE student_id = ? AND school_year_id = ? AND status = 'active'`,
      [studentId, schoolYearId]
    );

    if (existing.length > 0) {
      if (!replace) {
        return {
          success: false,
          message: "Student already has an adviser for this school year",
          existingAssignment: existing[0],
        };
      }

      // Mark existing assignment as inactive
      await db.query(
        `UPDATE student_adviser_assignments 
         SET status = 'inactive' 
         WHERE id = ?`,
        [existing[0].id]
      );
    }

    // Create new assignment
    const [result] = await db.query(
      `INSERT INTO student_adviser_assignments 
       (student_id, teacher_id, school_year_id, assigned_by, assigned_at, status)
       VALUES (?, ?, ?, ?, NOW(), 'active')`,
      [studentId, teacherId, schoolYearId, assignedBy]
    );

    return {
      success: true,
      assignmentId: result.insertId,
      replaced: existing.length > 0,
    };
  },

  /**
   * Bulk assign adviser to multiple students
   */
  async bulkAssignAdviser({
    studentIds,
    teacherId,
    schoolYearId,
    assignedBy,
    replace = false,
  }) {
    const results = {
      success: [],
      skipped: [],
      replaced: [],
      errors: [],
    };

    for (const studentId of studentIds) {
      try {
        const result = await this.assignAdviser({
          studentId,
          teacherId,
          schoolYearId,
          assignedBy,
          replace,
        });

        if (result.success) {
          if (result.replaced) {
            results.replaced.push(studentId);
          } else {
            results.success.push(studentId);
          }
        } else {
          results.skipped.push(studentId);
        }
      } catch (error) {
        results.errors.push({ studentId, error: error.message });
      }
    }

    return results;
  },

  /**
   * Remove adviser assignment
   */
  async removeAdviser(assignmentId) {
    await db.query(
      `UPDATE student_adviser_assignments 
       SET status = 'inactive' 
       WHERE id = ?`,
      [assignmentId]
    );
    return true;
  },

  /**
   * Get adviser assignments for a specific teacher
   */
  async getAdviseesForTeacher(teacherId, schoolYearId) {
    const [rows] = await db.query(
      `SELECT 
        s.student_id,
        s.full_name AS student_name,
        s.full_name,
        s.grade_level,
        s.track,
        s.strand,
        s.email,
        saa.assigned_at
       FROM student_adviser_assignments saa
       INNER JOIN students s ON saa.student_id = s.student_id
       WHERE saa.teacher_id = ? 
         AND saa.school_year_id = ? 
         AND saa.status = 'active'
         AND s.account_status = 'active'
       ORDER BY s.full_name`,
      [teacherId, schoolYearId]
    );
    return rows;
  },

  /**
   * Get adviser for a specific student
   */
  async getAdviserForStudent(studentId, schoolYearId) {
    const [rows] = await db.query(
      `SELECT 
        t.teacher_id,
        t.full_name,
        t.department,
        t.email,
        saa.assigned_at
       FROM student_adviser_assignments saa
       INNER JOIN teachers t ON saa.teacher_id = t.id
       WHERE saa.student_id = ? 
         AND saa.school_year_id = ? 
         AND saa.status = 'active'
       LIMIT 1`,
      [studentId, schoolYearId]
    );
    return rows[0] || null;
  },

  /**
   * Get statistics for adviser assignments
   */
  async getAdviserStats(schoolYearId) {
    const [totalStudents] = await db.query(
      `SELECT COUNT(*) AS count FROM students WHERE account_status = 'active'`
    );

    const [assignedStudents] = await db.query(
      `SELECT COUNT(DISTINCT student_id) AS count 
       FROM student_adviser_assignments 
       WHERE school_year_id = ? AND status = 'active'`,
      [schoolYearId]
    );

    const [teachersWithAdvisees] = await db.query(
      `SELECT COUNT(DISTINCT teacher_id) AS count 
       FROM student_adviser_assignments 
       WHERE school_year_id = ? AND status = 'active'`,
      [schoolYearId]
    );

    return {
      totalStudents: totalStudents[0]?.count || 0,
      assignedStudents: assignedStudents[0]?.count || 0,
      unassignedStudents:
        (totalStudents[0]?.count || 0) - (assignedStudents[0]?.count || 0),
      teachersWithAdvisees: teachersWithAdvisees[0]?.count || 0,
    };
  },

  /**
   * Get unique tracks from students
   */
  async getTracks() {
    const [rows] = await db.query(
      `SELECT DISTINCT track FROM students WHERE track IS NOT NULL AND track != '' ORDER BY track`
    );
    return rows.map((r) => r.track);
  },

  /**
   * Get unique strands from students
   */
  async getStrands(track = null) {
    let query = `SELECT DISTINCT strand FROM students WHERE strand IS NOT NULL AND strand != ''`;
    const params = [];

    if (track && track !== "all") {
      query += ` AND track = ?`;
      params.push(track);
    }

    query += ` ORDER BY strand`;

    const [rows] = await db.query(query, params);
    return rows.map((r) => r.strand);
  },
};

module.exports = AdviserModel;
