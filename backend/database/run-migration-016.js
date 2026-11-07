require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('Running Migration 016...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'migrations', '016-redesign-document-request-workflow.sql'),
      'utf8'
    );
    
    await connection.query(sql);
    console.log('Migration 016 completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
