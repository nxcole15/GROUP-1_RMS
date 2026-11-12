const mysql = require('mysql2/promise');
(async () => {
  const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: 'root', database: 'smart_student_service' });

  // Test the listApplications query
  try {
    const [rows] = await c.query(
      `SELECT id, first_name, middle_name, last_name, extension_name,
       email, phone, date_of_birth, gender, address,
       pathway, track, strand, grade_level, school_year,
       status, created_at, generated_student_id, official_student_id,
       photo_url, lrn
       FROM enrollment_applications
       WHERE status IN ('submitted','registrar_review','principal_review','pending_registrar','approved','rejected')
       ORDER BY created_at DESC`
    );
    console.log('listApplications query OK, rows:', rows.length);
  } catch (e) {
    console.error('listApplications SQL ERROR:', e.message);
  }

  await c.end();
})().catch(e => { console.error(e.message); process.exit(1); });
