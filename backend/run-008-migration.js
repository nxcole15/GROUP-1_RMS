require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_student_service',
    multipleStatements: true
  });

  try {
    console.log('🔄 Running migration 008...');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'database', 'migrations', '008-add-default-amount-to-fee-items.sql'),
      'utf8'
    );
    
    await connection.query(sql);
    console.log('✅ Migration 008 completed successfully!');
    
    // Verify the column was added
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM fee_items WHERE Field = 'default_amount'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Verified: default_amount column exists');
      console.log('   Type:', columns[0].Type);
      console.log('   Default:', columns[0].Default);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration();
