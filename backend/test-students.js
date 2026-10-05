// Quick test to check approved enrolled students
const mysql = require('mysql2/promise');

async function checkStudents() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'eriam15',
    database: 'smart_student_service'
  });

  try {
    // Check total students
    const [allStudents] = await pool.query('SELECT COUNT(*) as total FROM students');
    console.log('Total students:', allStudents[0].total);

    // Check total enrollments
    const [allEnrollments] = await pool.query('SELECT COUNT(*) as total FROM enrollments');
    console.log('Total enrollments:', allEnrollments[0].total);

    // Check approved enrollments
    const [approvedEnrollments] = await pool.query(
      'SELECT COUNT(*) as total FROM enrollments WHERE status = "approved"'
    );
    console.log('Approved enrollments:', approvedEnrollments[0].total);

    // Check approved enrolled students (the actual query from backend)
    const [students] = await pool.query(`
      SELECT 
        s.student_id,
        s.full_name,
        s.pathway as strand,
        s.grade_level,
        e.status,
        e.term,
        CASE 
          WHEN s.pathway IN ('STEM', 'HUMMS', 'ABM', 'GAS') THEN 'Academic Track'
          WHEN s.pathway IN ('ICT', 'Cookery') THEN 'TechPro Track'
          ELSE 'Academic Track'
        END as track
      FROM students s
      INNER JOIN enrollments e ON s.student_id = e.student_id
      WHERE e.status = 'approved'
      ORDER BY s.full_name ASC
      LIMIT 5
    `);
    
    console.log('\nApproved enrolled students:');
    console.log(students);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkStudents();
