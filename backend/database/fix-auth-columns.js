/**
 * fix-auth-columns.js
 * Adds failed_attempts and locked_until columns to admins and teachers tables.
 * Run: node database/fix-auth-columns.js
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

  const fixes = [
    {
      table: 'admins',
      sql: [
        'ALTER TABLE admins ADD COLUMN failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0',
        'ALTER TABLE admins ADD COLUMN locked_until DATETIME NULL',
      ],
    },
    {
      table: 'teachers',
      sql: [
        'ALTER TABLE teachers ADD COLUMN failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0',
        'ALTER TABLE teachers ADD COLUMN locked_until DATETIME NULL',
      ],
    },
  ];

  for (const { table, sql } of fixes) {
    for (const stmt of sql) {
      try {
        await conn.query(stmt);
        console.log(`  Added: ${table}.${stmt.match(/ADD COLUMN (\S+)/)[1]}`);
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log(`  Already exists: ${table}.${stmt.match(/ADD COLUMN (\S+)/)[1]}`);
        } else {
          console.error(`  Error on ${table}: ${e.message}`);
        }
      }
    }
  }

  // Verify
  for (const t of ['students', 'admins', 'teachers']) {
    const [cols] = await conn.query(`DESCRIBE ${t}`);
    const has = cols.filter((c) => ['failed_attempts', 'locked_until'].includes(c.Field));
    console.log(`\n${t}: ${has.map((c) => c.Field).join(', ') || 'MISSING'}`);
  }

  await conn.end();
  console.log('\nDone — auth lockout columns added.');
}

fix().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
