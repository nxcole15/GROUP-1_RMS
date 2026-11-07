require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function verifyMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
  });

  try {
    console.log('=== Checking New Columns ===');
    const [columns] = await connection.query(`DESCRIBE documents`);
    const newColumns = ['pickup_instructions', 'pickup_scheduled_at', 'pickup_scheduled_by', 'requires_payment'];
    newColumns.forEach(col => {
      const exists = columns.find(c => c.Field === col);
      if (exists) {
        console.log('✓', col, '-', exists.Type);
      } else {
        console.log('✗', col, '- MISSING!');
      }
    });

    console.log('\n=== Checking Status Distribution ===');
    const [statuses] = await connection.query(
      `SELECT status, COUNT(*) as count FROM documents GROUP BY status ORDER BY count DESC`
    );
    statuses.forEach(s => console.log(s.status.padEnd(30), ':', s.count));

    console.log('\n=== Checking Requires Payment ===');
    const [payment] = await connection.query(
      `SELECT requires_payment, COUNT(*) as count FROM documents GROUP BY requires_payment`
    );
    payment.forEach(p => 
      console.log('requires_payment =', p.requires_payment, ':', p.count, 'documents')
    );

    console.log('\n✅ Migration verification complete!');
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await connection.end();
  }
}

verifyMigration();
