/**
 * modules/student/applicationModel.js
 * CRUD for enrollment_applications.
 */
const db = require("../../config/db");

const ApplicationModel = {

  async create(data) {
    const fields = [
      "first_name","last_name","middle_name","extension_name",
      "email","phone","date_of_birth","gender","civil_status",
      "nationality","religion","address",
      "student_status","existing_student_id",
      "pathway","grade_level","learning_modality",
      "father_name","father_occupation","mother_name","mother_occupation",
      "guardian_name","guardian_relation","guardian_phone",
      "previous_school","previous_school_address","years_attended",
    ];
    const values = fields.map(f => data[f] ?? null);
    const placeholders = fields.map(() => "?").join(", ");

    const [result] = await db.query(
      `INSERT INTO enrollment_applications (${fields.join(", ")}) VALUES (${placeholders})`,
      values
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM enrollment_applications WHERE id = ? LIMIT 1", [id]
    );
    return rows[0] || null;
  },

  // All apps except already-approved/rejected (for registrar initial queue)
  async findSubmitted() {
    const [rows] = await db.query(
      `SELECT * FROM enrollment_applications
       WHERE status = 'submitted'
       ORDER BY created_at ASC`
    );
    return rows;
  },

  // Everything the registrar needs to act on
  async findForRegistrar() {
    const [rows] = await db.query(
      `SELECT * FROM enrollment_applications
       WHERE status IN ('submitted','registrar_review','principal_review','approved','rejected')
       ORDER BY created_at DESC`
    );
    return rows;
  },

  // Everything the principal needs to act on
  async findForPrincipal() {
    const [rows] = await db.query(
      `SELECT * FROM enrollment_applications
       WHERE status IN ('principal_review','approved','rejected')
       ORDER BY created_at DESC`
    );
    return rows;
  },

  async updateStatus(id, status, extra = {}) {
    const allowed = [
      "registrar_note","principal_note","rejection_reason",
      "reviewed_by_registrar","reviewed_by_principal",
      "registrar_reviewed_at","principal_reviewed_at",
      "generated_student_id","temp_password","credentials_sent_at",
    ];
    const fields = ["status = ?", "updated_at = NOW()"];
    const values = [status];
    for (const key of allowed) {
      if (extra[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(extra[key]);
      }
    }
    values.push(id);
    await db.query(
      `UPDATE enrollment_applications SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return this.findById(id);
  },
};

module.exports = ApplicationModel;
