/**
 * update-enrollment-data.js
 * Cleans up enrollment_config rows: mark old rows as completed,
 * populate the latest active row with proper values.
 * Run: node database/update-enrollment-data.js
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function update() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_student_service',
    multipleStatements: true,
  });

  // Fix the status enum to include 'completed' (matches migration 006 schema)
  try {
    await conn.query(
      "ALTER TABLE enrollment_config MODIFY COLUMN status ENUM('active','completed') NOT NULL DEFAULT 'active'"
    );
    console.log('Updated status enum to include completed');
  } catch (e) {
    console.log('Status enum update skipped:', e.message);
  }

  // Mark old rows as completed, keep only the latest as active
  await conn.query("UPDATE enrollment_config SET status = 'completed' WHERE id IN (1, 2)");
  console.log('Marked rows 1 and 2 as completed');

  // Populate the latest active row (id = 3) with proper values
  await conn.query(
    `UPDATE enrollment_config
       SET school_year = '2026-2027',
           current_term = 'Term 1',
           enrollment_start_date = '2026-06-01',
           enrollment_end_date = '2027-05-31',
           enrollment_is_open = 1,
           created_by = 'SYSTEM'
     WHERE id = 3`
  );
  console.log('Updated row 3 with proper enrollment config values');

  // Verify
  const [rows] = await conn.query(
    'SELECT id, school_year, current_term, status, enrollment_start_date, enrollment_end_date, enrollment_is_open FROM enrollment_config'
  );
  console.log('\nFinal data:');
  console.log(JSON.stringify(rows, null, 2));

  await conn.end();
  console.log('\nDone.');
}

update().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
