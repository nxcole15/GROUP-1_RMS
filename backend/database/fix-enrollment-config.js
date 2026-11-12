/**
 * fix-enrollment-config.js
 * Adds missing columns to enrollment_config table without dropping data.
 * Run: node database/fix-enrollment-config.js
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function fix() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_student_service',
    multipleStatements: true,
  });

  console.log('Connected to database:', process.env.DB_NAME || 'smart_student_service');

  // Show current columns
  const [cols] = await conn.query('DESCRIBE enrollment_config');
  console.log('\nCurrent columns:');
  cols.forEach((c) => console.log(`  ${c.Field} (${c.Type})`));

  // Add missing columns one by one (ignore error if already exists)
  const alters = [
    'ALTER TABLE enrollment_config ADD COLUMN school_year VARCHAR(20) NULL',
    "ALTER TABLE enrollment_config ADD COLUMN current_term ENUM('Term 1','Term 2','Term 3') NOT NULL DEFAULT 'Term 1'",
    "ALTER TABLE enrollment_config ADD COLUMN status ENUM('active','completed') NOT NULL DEFAULT 'active'",
    'ALTER TABLE enrollment_config ADD COLUMN enrollment_start_date DATE NULL',
    'ALTER TABLE enrollment_config ADD COLUMN enrollment_end_date DATE NULL',
    'ALTER TABLE enrollment_config ADD COLUMN enrollment_is_open TINYINT(1) NOT NULL DEFAULT 0',
    'ALTER TABLE enrollment_config ADD COLUMN term1_completed_at DATETIME NULL',
    'ALTER TABLE enrollment_config ADD COLUMN term2_completed_at DATETIME NULL',
    'ALTER TABLE enrollment_config ADD COLUMN term3_completed_at DATETIME NULL',
    'ALTER TABLE enrollment_config ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
    'ALTER TABLE enrollment_config ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    'ALTER TABLE enrollment_config ADD COLUMN created_by VARCHAR(20) NULL',
    'ALTER TABLE enrollment_config ADD COLUMN last_modified_by VARCHAR(20) NULL',
  ];

  for (const sql of alters) {
    try {
      await conn.query(sql);
      console.log(`  Added: ${sql.match(/ADD COLUMN (\S+)/)[1]}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`  Already exists: ${sql.match(/ADD COLUMN (\S+)/)[1]}`);
      } else {
        console.error(`  Error: ${e.message}`);
      }
    }
  }

  // Add indexes (ignore if already exist)
  const indexes = [
    'CREATE INDEX idx_school_year ON enrollment_config(school_year)',
    'CREATE INDEX idx_status ON enrollment_config(status)',
    'CREATE INDEX idx_current_term ON enrollment_config(current_term)',
  ];

  for (const sql of indexes) {
    try {
      await conn.query(sql);
    } catch (e) {
      // index already exists — fine
    }
  }

  // Seed initial active row if none exists
  const [rows] = await conn.query(
    "SELECT COUNT(*) as cnt FROM enrollment_config WHERE status = 'active'"
  );
  if (rows[0].cnt === 0) {
    await conn.query(
      `INSERT INTO enrollment_config
         (school_year, current_term, status, enrollment_start_date, enrollment_end_date, enrollment_is_open, created_by)
       VALUES ('2026-2027', 'Term 1', 'active', '2026-06-01', '2027-05-31', 1, 'SYSTEM')`
    );
    console.log('\nSeeded initial enrollment config row');
  } else {
    console.log('\nActive enrollment config row already exists');
  }

  // Show final state
  const [cols2] = await conn.query('DESCRIBE enrollment_config');
  console.log('\nFinal columns:');
  cols2.forEach((c) => console.log(`  ${c.Field} (${c.Type})`));

  await conn.end();
  console.log('\nDone — enrollment_config table is fixed.');
}

fix().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
