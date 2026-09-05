/**
 * modules/gradeRequests/gradeRequestModel.js
 */
const db = require("../../config/db");

const GradeRequestModel = {

  async findAll() {
    const [rows] = await db.query(
      `SELECT gr.*, s.full_name AS student_name, sub.name AS subject_name,
              sub.code AS subject_code, t.full_name AS teacher_name
       FROM grade_requests gr
       JOIN students s ON s.student_id = gr.student_id
       JOIN subjects sub ON sub.id = gr.subject_id
       JOIN teachers t ON t.id = gr.teacher_id
       ORDER BY gr.created_at DESC`
    );
    return rows;
  },

  async findByStudent(student_id) {
    const [rows] = await db.query(
      `SELECT gr.*, sub.name AS subject_name, sub.code AS subject_code,
              t.full_name AS teacher_name
       FROM grade_requests gr
       JOIN subjects sub ON sub.id = gr.subject_id
       JOIN teachers t ON t.id = gr.teacher_id
       WHERE gr.student_id = ?
       ORDER BY gr.created_at DESC`,
      [student_id]
    );
    return rows;
  },

  async findByTeacher(teacher_id) {
    const [rows] = await db.query(
      `SELECT gr.*, s.full_name AS student_name, sub.name AS subject_name,
              sub.code AS subject_code
       FROM grade_requests gr
       JOIN students s ON s.student_id = gr.student_id
       JOIN subjects sub ON sub.id = gr.subject_id
       WHERE gr.teacher_id = ?
       ORDER BY gr.created_at DESC`,
      [teacher_id]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT gr.*, s.full_name AS student_name, sub.name AS subject_name,
              sub.code AS subject_code, t.full_name AS teacher_name
       FROM grade_requests gr
       JOIN students s ON s.student_id = gr.student_id
       JOIN subjects sub ON sub.id = gr.subject_id
       JOIN teachers t ON t.id = gr.teacher_id
       WHERE gr.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ student_id, subject_id, teacher_id, term }) {
    const [result] = await db.query(
      `INSERT INTO grade_requests (student_id, subject_id, teacher_id, term, status)
       VALUES (?, ?, ?, ?, 'student_requested')`,
      [student_id, subject_id, teacher_id, term]
    );
    return this.findById(result.insertId);
  },

  async updateStatus(id, status, extra = {}) {
    const allowed = ['score','letter_grade','remarks','rejection_reason',
                     'rejected_by','principal_note','registrar_note'];
    const fields = ['status = ?'];
    const values = [status];
    for (const key of allowed) {
      if (extra[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(extra[key]);
      }
    }
    values.push(id);
    await db.query(
      `UPDATE grade_requests SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return this.findById(id);
  },
};

module.exports = GradeRequestModel;
