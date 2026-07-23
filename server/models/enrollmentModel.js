/**
 * models/enrollmentModel.js
 */
const db = require("../config/db");

const EnrollmentModel = {
  async findByStudentAndTerm(student_id, term) {
  const [rows] = await db.query(
    `SELECT e.*,
            GROUP_CONCAT(es.subject_id ORDER BY es.subject_id) AS subject_ids
     FROM enrollments e
     LEFT JOIN enrollment_subjects es ON es.enrollment_id = e.id
     WHERE e.student_id = ? AND e.term = ?
     GROUP BY e.id
     LIMIT 1`,
    [student_id, term]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  row.subjects = row.subject_ids
    ? row.subject_ids.split(",").map(Number)
    : [];
  delete row.subject_ids;
  return row;
},



  async findById(id) {
    const [rows] = await db.query(
      `SELECT e.*,
              GROUP_CONCAT(es.subject_id ORDER BY es.subject_id) AS subject_ids
       FROM enrollments e
       LEFT JOIN enrollment_subjects es ON es.enrollment_id = e.id
       WHERE e.id = ?
       GROUP BY e.id
       LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;
    const row = rows[0];
    row.subjects = row.subject_ids
      ? row.subject_ids.split(",").map(Number)
      : [];
    delete row.subject_ids;
    return row;
  },

  async findAllPending() {
    const [rows] = await db.query(
      `SELECT e.*,
              GROUP_CONCAT(es.subject_id ORDER BY es.subject_id) AS subject_ids
       FROM enrollments e
       LEFT JOIN enrollment_subjects es ON es.enrollment_id = e.id
       WHERE e.status = 'pending'
       GROUP BY e.id
       ORDER BY e.created_at ASC`
    );
    return rows.map((row) => {
      row.subjects = row.subject_ids
        ? row.subject_ids.split(",").map(Number)
        : [];
      delete row.subject_ids;
      return row;
    });
  },

  async create({ student_id, term, subjects }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        `INSERT INTO enrollments (student_id, term, status, created_at)
         VALUES (?, ?, 'pending', NOW())`,
        [student_id, term]
      );
      const enrollmentId = result.insertId;

      for (const sid of subjects) {
        await conn.query(
          "INSERT INTO enrollment_subjects (enrollment_id, subject_id) VALUES (?, ?)",
          [enrollmentId, sid]
        );
      }

      await conn.commit();
      return this.findById(enrollmentId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async approve(id, admin_id) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `UPDATE enrollments
         SET status = 'approved', admin_id = ?, admin_timestamp = NOW()
         WHERE id = ?`,
        [admin_id, id]
      );

      // Increment enrolled_count for each subject in this enrollment
      await conn.query(
        `UPDATE subjects s
         JOIN enrollment_subjects es ON es.subject_id = s.id
         SET s.enrolled_count = s.enrolled_count + 1
         WHERE es.enrollment_id = ?`,
        [id]
      );

      await conn.commit();
      return this.findById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async reject(id, admin_id, rejection_reason) {
    await db.query(
      `UPDATE enrollments
       SET status = 'rejected', rejection_reason = ?, admin_id = ?, admin_timestamp = NOW()
       WHERE id = ?`,
      [rejection_reason, admin_id, id]
    );
    return this.findById(id);
  },
};

module.exports = EnrollmentModel;
