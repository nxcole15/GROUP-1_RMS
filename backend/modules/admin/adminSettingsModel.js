/**
 * modules/admin/adminSettingsModel.js
 * Model for system settings management (school year, term, enrollment)
 */
const db = require("../../config/db");

const AdminSettingsModel = {
  /**
   * Get the active academic configuration
   */
  async getActiveConfig() {
    const [rows] = await db.query(
      `SELECT * FROM enrollment_config ORDER BY id DESC LIMIT 1`
    );
    return rows[0] || null;
  },

  /**
   * Get all school years (active and completed)
   */
  async getAllSchoolYears() {
    const [rows] = await db.query(
      `SELECT * FROM enrollment_config ORDER BY created_at DESC`
    );
    return rows;
  },

  /**
   * Get school year by ID
   */
  async getSchoolYearById(id) {
    const [rows] = await db.query(
      `SELECT * FROM enrollment_config WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create new school year
   */
  async createSchoolYear({ school_year, starting_term, created_by }) {
    const [result] = await db.query(
      `INSERT INTO enrollment_config 
       (school_year, current_term, status, created_by, created_at)
       VALUES (?, ?, 'active', ?, NOW())`,
      [school_year, starting_term, created_by]
    );

    // Mark other active years as completed
    await db.query(
      `UPDATE enrollment_config 
       SET status = 'completed' 
       WHERE id != ? AND status = 'active'`,
      [result.insertId]
    );

    return result.insertId;
  },

  /**
   * Update school year details
   */
  async updateSchoolYear(id, { school_year, current_term, last_modified_by }) {
    const updates = [];
    const values = [];

    if (school_year) {
      updates.push('school_year = ?');
      values.push(school_year);
    }
    if (current_term) {
      updates.push('current_term = ?');
      values.push(current_term);
    }
    if (last_modified_by) {
      updates.push('last_modified_by = ?');
      values.push(last_modified_by);
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    await db.query(
      `UPDATE enrollment_config SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getSchoolYearById(id);
  },

  /**
   * Delete school year (only if not active and no data associated)
   */
  async deleteSchoolYear(id) {
    // Check if it's the active year
    const schoolYear = await this.getSchoolYearById(id);
    if (!schoolYear) {
      throw new Error('School year not found');
    }
    if (schoolYear.status === 'active') {
      throw new Error('Cannot delete active school year');
    }

    await db.query(`DELETE FROM enrollment_config WHERE id = ?`, [id]);
    return true;
  },

  /**
   * Complete current term and advance to next term
   * Returns { success, current_term, school_year_completed }
   */
  async completeTerm(id, completed_by) {
    const schoolYear = await this.getSchoolYearById(id);
    if (!schoolYear) {
      throw new Error('School year not found');
    }
    if (schoolYear.status !== 'active') {
      throw new Error('Only active school year can have terms completed');
    }

    const currentTerm = schoolYear.current_term;
    let nextTerm = null;
    let termCompletedColumn = null;
    let schoolYearCompleted = false;

    // Determine next term and which column to update
    if (currentTerm === 'Term 1') {
      nextTerm = 'Term 2';
      termCompletedColumn = 'term1_completed_at';
    } else if (currentTerm === 'Term 2') {
      nextTerm = 'Term 3';
      termCompletedColumn = 'term2_completed_at';
    } else if (currentTerm === 'Term 3') {
      // Term 3 completed - mark school year as completed
      nextTerm = 'Term 3'; // stays at Term 3
      termCompletedColumn = 'term3_completed_at';
      schoolYearCompleted = true;
    }

    // Update the appropriate term completion timestamp
    if (schoolYearCompleted) {
      await db.query(
        `UPDATE enrollment_config 
         SET ${termCompletedColumn} = NOW(), 
             status = 'completed',
             last_modified_by = ?
         WHERE id = ?`,
        [completed_by, id]
      );
    } else {
      await db.query(
        `UPDATE enrollment_config 
         SET ${termCompletedColumn} = NOW(), 
             current_term = ?,
             last_modified_by = ?
         WHERE id = ?`,
        [nextTerm, completed_by, id]
      );
    }

    return {
      success: true,
      current_term: nextTerm,
      school_year_completed: schoolYearCompleted
    };
  },

  /**
   * Update enrollment configuration
   */
  async updateEnrollmentConfig(id, { start_date, end_date, open_now, last_modified_by }) {
    const updates = [];
    const values = [];

    if (start_date) {
      updates.push('enrollment_start_date = ?');
      values.push(start_date);
    }
    if (end_date) {
      updates.push('enrollment_end_date = ?');
      values.push(end_date);
    }
    if (open_now !== undefined) {
      updates.push('enrollment_is_open = ?');
      values.push(open_now ? 1 : 0);
    }
    if (last_modified_by) {
      updates.push('last_modified_by = ?');
      values.push(last_modified_by);
    }

    updates.push('updated_at = NOW()');
    values.push(id);

    await db.query(
      `UPDATE enrollment_config SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getSchoolYearById(id);
  },

  /**
   * Send system notification to all students
   */
  async notifyStudents(message) {
    const [students] = await db.query('SELECT student_id FROM students');
    
    const insertPromises = students.map(student => 
      db.query(
        `INSERT INTO notifications (student_id, message, type, is_read, created_at)
         VALUES (?, ?, 'system', 0, NOW())`,
        [student.student_id, message]
      )
    );

    await Promise.all(insertPromises);
    return students.length;
  },

  /**
   * Send notification to all staff (teachers and admins)
   */
  async notifyStaff(title, message, type = 'system') {
    // Notify all teachers
    const [teachers] = await db.query('SELECT teacher_id FROM teachers');
    const teacherPromises = teachers.map(teacher =>
      db.query(
        `INSERT INTO staff_notifications (recipient, role, title, message, type, is_read, created_at)
         VALUES (?, 'teacher', ?, ?, ?, 0, NOW())`,
        [teacher.teacher_id, title, message, type]
      )
    );

    // Notify all admins
    const [admins] = await db.query('SELECT admin_id FROM admins');
    const adminPromises = admins.map(admin =>
      db.query(
        `INSERT INTO staff_notifications (recipient, role, title, message, type, is_read, created_at)
         VALUES (?, 'admin', ?, ?, ?, 0, NOW())`,
        [admin.admin_id, title, message, type]
      )
    );

    await Promise.all([...teacherPromises, ...adminPromises]);
    return teachers.length + admins.length;
  }
};

module.exports = AdminSettingsModel;
