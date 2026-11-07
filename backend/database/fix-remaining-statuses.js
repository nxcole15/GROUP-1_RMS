require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function fixStatuses() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
  });

  try {
    console.log('Fixing remaining old statuses...\n');
    
    // Fix payment_verified and ready_for_pickup -> ready_for_release
    const [result1] = await connection.query(
      `UPDATE documents SET status = 'ready_for_release' 
       WHERE status IN ('payment_verified', 'ready_for_pickup')`
    );
    console.log('✓ Updated', result1.affectedRows, 'documents from payment_verified/ready_for_pickup -> ready_for_release');
    
    console.log('\n=== Current Status Distribution ===');
    const [statuses] = await connection.query(
      `SELECT status, COUNT(*) as count FROM documents GROUP BY status ORDER BY count DESC`
    );
    statuses.forEach(s => console.log(s.status.padEnd(30), ':', s.count));
    
    console.log('\n✅ All statuses fixed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

fixStatuses();
