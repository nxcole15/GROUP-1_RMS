/**
 * One-time sync: Update all student_id fields to match current student records
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function syncStudentIds() {
  console.log('🔄 Syncing student_id fields across all tables...\n');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_student_service'
  });

  try {
    // Update payments
    await connection.query(`
      UPDATE payments p
      INNER JOIN students s ON p.student_internal_id = s.id
      SET p.student_id = s.student_id
    `);
    console.log('✅ Synced payments');
    
    // Update documents
    await connection.query(`
      UPDATE documents d
      INNER JOIN students s ON d.student_internal_id = s.id
      SET d.student_id = s.student_id
    `);
    console.log('✅ Synced documents');
    
    // Update enrollments
    await connection.query(`
      UPDATE enrollments e
      INNER JOIN students s ON e.student_internal_id = s.id
      SET e.student_id = s.student_id
    `);
    console.log('✅ Synced enrollments');
    
    // Update notifications
    await connection.query(`
      UPDATE notifications n
      INNER JOIN students s ON n.student_internal_id = s.id
      SET n.student_id = s.student_id
    `);
    console.log('✅ Synced notifications');
    
    // Update attendance
    await connection.query(`
      UPDATE attendance a
      INNER JOIN students s ON a.student_internal_id = s.id
      SET a.student_id = s.student_id
    `);
    console.log('✅ Synced attendance');
    
    // Update grade_requests
    await connection.query(`
      UPDATE grade_requests gr
      INNER JOIN students s ON gr.student_internal_id = s.id
      SET gr.student_id = s.student_id
    `);
    console.log('✅ Synced grade_requests');
    
    // Update student_assessments
    await connection.query(`
      UPDATE student_assessments sa
      INNER JOIN students s ON sa.student_internal_id = s.id
      SET sa.student_id = s.student_id
    `);
    console.log('✅ Synced student_assessments');
    
    // Update grade_edit_requests
    await connection.query(`
      UPDATE grade_edit_requests ger
      INNER JOIN students s ON ger.student_internal_id = s.id
      SET ger.student_id = s.student_id
    `);
    console.log('✅ Synced grade_edit_requests');
    
    // Update student_schedule_enrollments
    await connection.query(`
      UPDATE student_schedule_enrollments sse
      INNER JOIN students s ON sse.student_internal_id = s.id
      SET sse.student_id = s.student_id
    `);
    console.log('✅ Synced student_schedule_enrollments');
    
    console.log('\n✅ All student_id fields synchronized!');
    console.log('Now test your application - everything should work!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
  } finally {
    await connection.end();
  }
}

syncStudentIds();
