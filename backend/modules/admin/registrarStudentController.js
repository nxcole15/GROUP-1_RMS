/**
 * modules/admin/registrarStudentController.js
 * Registrar-specific student management operations.
 * Allows viewing and editing officially enrolled student records.
 */

const bcrypt = require("bcryptjs");
const db = require("../../config/db");

/**
 * GET /api/admin/students/manage
 * Get all officially enrolled students for Registrar management
 */
async function getStudentsForManagement(req, res, next) {
  try {
    const { search, grade_level, track, strand, school_year } = req.query;

    let query = `
      SELECT 
        s.id,
        s.student_id,
        s.full_name,
        s.email,
        s.pathway,
        s.track,
        s.strand,
        s.grade_level,
        s.term,
        s.account_status,
        s.created_at,
        ea.phone,
        ea.date_of_birth,
        ea.gender,
        ea.civil_status,
        ea.nationality,
        ea.religion,
        ea.address,
        ea.track as ea_track,
        ea.strand as ea_strand,
        ea.school_year,
        ea.learning_modality,
        ea.father_name,
        ea.father_occupation,
        ea.mother_name,
        ea.mother_occupation,
        ea.guardian_name,
        ea.guardian_relation,
        ea.guardian_phone,
        ea.previous_school,
        ea.previous_school_address,
        ea.years_attended,
        ea.first_name,
        ea.middle_name,
        ea.last_name,
        ea.extension_name,
        ea.lrn,
        ea.photo_url,
        COALESCE(s.track, ea.track) as track,
        COALESCE(s.strand, ea.strand) as strand
      FROM students s
      LEFT JOIN enrollment_applications ea ON (
        s.student_id = ea.generated_student_id 
        OR s.student_id = ea.official_student_id
      )
      WHERE s.account_status = 'active'
    `;

    const params = [];

    if (search) {
      query += ` AND (s.full_name LIKE ? OR s.student_id LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (grade_level) {
      query += ` AND s.grade_level = ?`;
      params.push(parseInt(grade_level, 10));
    }

    if (track) {
      query += ` AND (s.track = ? OR ea.track = ?)`;
      params.push(track, track);
    }

    if (strand) {
      query += ` AND (s.strand = ? OR ea.strand = ?)`;
      params.push(strand, strand);
    }

    if (school_year) {
      query += ` AND ea.school_year = ?`;
      params.push(school_year);
    }

    query += ` ORDER BY s.created_at DESC`;

    const [rows] = await db.query(query, params);

    res.json({ students: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/students/manage/:student_id
 * Get detailed information for a specific student
 */
async function getStudentDetails(req, res, next) {
  try {
    const { student_id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        s.id,
        s.student_id,
        s.full_name,
        s.email,
        s.pathway,
        s.track,
        s.strand,
        s.grade_level,
        s.term,
        s.account_status,
        s.created_at,
        ea.phone,
        ea.date_of_birth,
        ea.gender,
        ea.civil_status,
        ea.nationality,
        ea.religion,
        ea.address,
        COALESCE(s.track, ea.track) as track,
        COALESCE(s.strand, ea.strand) as strand,
        ea.school_year,
        ea.learning_modality,
        ea.father_name,
        ea.father_occupation,
        ea.mother_name,
        ea.mother_occupation,
        ea.guardian_name,
        ea.guardian_relation,
        ea.guardian_phone,
        ea.previous_school,
        ea.previous_school_address,
        ea.years_attended,
        ea.first_name,
        ea.middle_name,
        ea.last_name,
        ea.extension_name,
        ea.lrn,
        ea.photo_url,
        ea.status as enrollment_status,
        ea.reviewed_by_principal,
        ea.principal_reviewed_at
      FROM students s
      LEFT JOIN enrollment_applications ea ON s.student_id = ea.generated_student_id
      WHERE s.student_id = ?
      LIMIT 1
      `,
      [student_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    res.json({ student: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/students/manage/:student_id
 * Update student information (Registrar only)
 * Does NOT allow changing enrollment approval status
 */
async function updateStudentInfo(req, res, next) {
  try {
    const { student_id } = req.params;
    const {
      // Student ID change
      new_student_id,
      
      // Name fields
      first_name,
      middle_name,
      last_name,
      extension_name,
      
      // Personal info
      date_of_birth,
      gender,
      civil_status,
      nationality,
      religion,
      
      // Contact info
      phone,
      email,
      address,
      
      // Academic info
      grade_level,
      track,
      strand,
      learning_modality,
      
      // Parent/Guardian info
      father_name,
      father_occupation,
      mother_name,
      mother_occupation,
      guardian_name,
      guardian_relation,
      guardian_phone,
      
      // Previous school info
      previous_school,
      previous_school_address,
      years_attended,
      
      // LRN
      lrn,
    } = req.body;

    // Get current student record
    const [studentRows] = await db.query(
      "SELECT id, student_id, full_name FROM students WHERE student_id = ? LIMIT 1",
      [student_id]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    const student = studentRows[0];
    const changes = [];

    // Handle Student ID change
    if (new_student_id && new_student_id !== student_id) {
      // Check if new Student ID is already taken
      const [existingRows] = await db.query(
        "SELECT id FROM students WHERE student_id = ? AND id != ? LIMIT 1",
        [new_student_id, student.id]
      );

      if (existingRows.length > 0) {
        return res.status(409).json({
          error: `Student ID ${new_student_id} is already assigned to another student.`,
        });
      }

      // Update student_id in students table
      await db.query(
        "UPDATE students SET student_id = ? WHERE id = ?",
        [new_student_id, student.id]
      );

      // Update student_id in enrollment_applications
      await db.query(
        "UPDATE enrollment_applications SET generated_student_id = ? WHERE generated_student_id = ?",
        [new_student_id, student_id]
      );

      changes.push({
        field: "student_id",
        old_value: student_id,
        new_value: new_student_id,
      });
    }

    // Build full_name if name components are provided
    let full_name = null;
    if (first_name || last_name) {
      const nameArr = [
        first_name?.trim(),
        middle_name?.trim(),
        last_name?.trim(),
        extension_name?.trim(),
      ].filter(Boolean);
      full_name = nameArr.join(" ");
    }

    // Update students table
    const studentUpdates = [];
    const studentValues = [];

    if (full_name) {
      studentUpdates.push("full_name = ?");
      studentValues.push(full_name);
      changes.push({
        field: "full_name",
        old_value: student.full_name,
        new_value: full_name,
      });
    }

    if (email) {
      studentUpdates.push("email = ?");
      studentValues.push(email.trim().toLowerCase());
      changes.push({
        field: "email",
        old_value: null, // Would need to query old value
        new_value: email.trim().toLowerCase(),
      });
    }

    if (grade_level) {
      studentUpdates.push("grade_level = ?");
      studentValues.push(parseInt(grade_level, 10));
      changes.push({
        field: "grade_level",
        old_value: null,
        new_value: grade_level,
      });
    }

    // Save track and strand directly to students table
    if (track) {
      studentUpdates.push("track = ?");
      studentValues.push(track);
      changes.push({
        field: "track",
        old_value: null,
        new_value: track,
      });
    }

    if (strand) {
      studentUpdates.push("strand = ?");
      studentValues.push(strand);
      changes.push({
        field: "strand",
        old_value: null,
        new_value: strand,
      });
    }

    // For pathway, use track-strand combination or just strand for backward compatibility
    if (track && strand) {
      const pathway = track === "TECH-PRO" ? "TVL-TechPro" : strand;
      studentUpdates.push("pathway = ?");
      studentValues.push(pathway);
      changes.push({
        field: "pathway",
        old_value: null,
        new_value: pathway,
      });
    } else if (strand) {
      studentUpdates.push("pathway = ?");
      studentValues.push(strand);
    }

    if (studentUpdates.length > 0) {
      studentValues.push(student.id);
      await db.query(
        `UPDATE students SET ${studentUpdates.join(", ")} WHERE id = ?`,
        studentValues
      );
    }

    // Update enrollment_applications table (extended information)
    const appUpdates = [];
    const appValues = [];

    if (first_name) {
      appUpdates.push("first_name = ?");
      appValues.push(first_name.trim());
    }
    if (middle_name !== undefined) {
      appUpdates.push("middle_name = ?");
      appValues.push(middle_name?.trim() || null);
    }
    if (last_name) {
      appUpdates.push("last_name = ?");
      appValues.push(last_name.trim());
    }
    if (extension_name !== undefined) {
      appUpdates.push("extension_name = ?");
      appValues.push(extension_name?.trim() || null);
    }
    if (date_of_birth) {
      appUpdates.push("date_of_birth = ?");
      appValues.push(date_of_birth);
    }
    if (gender) {
      appUpdates.push("gender = ?");
      appValues.push(gender);
    }
    if (civil_status !== undefined) {
      appUpdates.push("civil_status = ?");
      appValues.push(civil_status || null);
    }
    if (nationality) {
      appUpdates.push("nationality = ?");
      appValues.push(nationality.trim());
    }
    if (religion !== undefined) {
      appUpdates.push("religion = ?");
      appValues.push(religion?.trim() || null);
    }
    if (phone) {
      appUpdates.push("phone = ?");
      appValues.push(phone.trim());
    }
    if (email) {
      appUpdates.push("email = ?");
      appValues.push(email.trim().toLowerCase());
    }
    if (address) {
      appUpdates.push("address = ?");
      appValues.push(address.trim());
    }
    if (track) {
      appUpdates.push("track = ?");
      appValues.push(track);
    }
    if (strand) {
      appUpdates.push("strand = ?");
      appValues.push(strand);
    }
    if (learning_modality) {
      appUpdates.push("learning_modality = ?");
      appValues.push(learning_modality);
    }
    if (father_name !== undefined) {
      appUpdates.push("father_name = ?");
      appValues.push(father_name?.trim() || null);
    }
    if (father_occupation !== undefined) {
      appUpdates.push("father_occupation = ?");
      appValues.push(father_occupation?.trim() || null);
    }
    if (mother_name !== undefined) {
      appUpdates.push("mother_name = ?");
      appValues.push(mother_name?.trim() || null);
    }
    if (mother_occupation !== undefined) {
      appUpdates.push("mother_occupation = ?");
      appValues.push(mother_occupation?.trim() || null);
    }
    if (guardian_name !== undefined) {
      appUpdates.push("guardian_name = ?");
      appValues.push(guardian_name?.trim() || null);
    }
    if (guardian_relation !== undefined) {
      appUpdates.push("guardian_relation = ?");
      appValues.push(guardian_relation?.trim() || null);
    }
    if (guardian_phone !== undefined) {
      appUpdates.push("guardian_phone = ?");
      appValues.push(guardian_phone?.trim() || null);
    }
    if (previous_school !== undefined) {
      appUpdates.push("previous_school = ?");
      appValues.push(previous_school?.trim() || null);
    }
    if (previous_school_address !== undefined) {
      appUpdates.push("previous_school_address = ?");
      appValues.push(previous_school_address?.trim() || null);
    }
    if (years_attended !== undefined) {
      appUpdates.push("years_attended = ?");
      appValues.push(years_attended?.trim() || null);
    }
    if (lrn) {
      appUpdates.push("lrn = ?");
      appValues.push(lrn.trim());
    }

    if (appUpdates.length > 0) {
      appValues.push(new_student_id || student_id);
      await db.query(
        `UPDATE enrollment_applications 
         SET ${appUpdates.join(", ")}, updated_at = NOW()
         WHERE generated_student_id = ?`,
        appValues
      );
    }

    // Log changes to audit table
    if (changes.length > 0) {
      const auditDetails = JSON.stringify({
        changes: changes,
        updated_by_name: req.admin.full_name || req.admin.admin_id,
      });

      await db.query(
        `INSERT INTO audit_log 
         (admin_id, action, target_request_id, entity_type, entity_id, details, created_at)
         VALUES (?, 'UPDATE_STUDENT_INFO', ?, 'student', ?, ?, NOW())`,
        [req.admin.admin_id, student.id, new_student_id || student_id, auditDetails]
      );
    }

    res.json({
      message: "Student information updated successfully.",
      changes: changes.length,
      new_student_id: new_student_id || student_id,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/students/manage/:student_id/audit
 * Get audit history for a student
 */
async function getStudentAuditLog(req, res, next) {
  try {
    const { student_id } = req.params;

    // Get student internal ID
    const [studentRows] = await db.query(
      "SELECT id FROM students WHERE student_id = ? LIMIT 1",
      [student_id]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    const [auditRows] = await db.query(
      `SELECT 
        al.id,
        al.action,
        al.details,
        al.admin_id,
        al.created_at,
        a.full_name as updated_by_name
      FROM audit_log al
      LEFT JOIN admins a ON al.admin_id = a.admin_id
      WHERE al.entity_type = 'student' AND al.entity_id = ?
      ORDER BY al.created_at DESC
      LIMIT 100`,
      [student_id]
    );

    // Parse JSON details
    const parsedRows = auditRows.map(row => ({
      ...row,
      details: row.details ? JSON.parse(row.details) : null,
    }));

    res.json({ audit_log: parsedRows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStudentsForManagement,
  getStudentDetails,
  updateStudentInfo,
  getStudentAuditLog,
};
