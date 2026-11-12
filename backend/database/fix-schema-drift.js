/**
 * fix-schema-drift.js — COMPREHENSIVE schema drift fix
 * Adds all missing columns and tables identified by codebase audit.
 * Run: node database/fix-schema-drift.js
 */
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

// [sql, label]
const FIXES = [
  // ── student_internal_id columns (code migrated from student_id VARCHAR to INT FK) ──
  ['ALTER TABLE grades ADD COLUMN student_internal_id INT UNSIGNED NULL', 'grades.student_internal_id'],
  ['ALTER TABLE student_schedule_enrollments ADD COLUMN student_internal_id INT UNSIGNED NULL', 'student_schedule_enrollments.student_internal_id'],
  ['ALTER TABLE documents ADD COLUMN student_internal_id INT UNSIGNED NULL', 'documents.student_internal_id'],
  ['ALTER TABLE payments ADD COLUMN student_internal_id INT UNSIGNED NULL', 'payments.student_internal_id'],
  ['ALTER TABLE student_assessments ADD COLUMN student_internal_id INT UNSIGNED NULL', 'student_assessments.student_internal_id'],

  // ── teacher_schedules.grade_level ──
  ['ALTER TABLE teacher_schedules ADD COLUMN grade_level TINYINT UNSIGNED NULL', 'teacher_schedules.grade_level'],

  // ── documents: migration 016 (pickup + requires_payment) ──
  ['ALTER TABLE documents ADD COLUMN requires_payment TINYINT(1) NOT NULL DEFAULT 0', 'documents.requires_payment'],
  ['ALTER TABLE documents ADD COLUMN pickup_instructions TEXT NULL', 'documents.pickup_instructions'],
  ['ALTER TABLE documents ADD COLUMN pickup_scheduled_by VARCHAR(20) NULL', 'documents.pickup_scheduled_by'],
  ['ALTER TABLE documents ADD COLUMN pickup_scheduled_at DATETIME NULL', 'documents.pickup_scheduled_at'],

  // ── payments: migration 014 (payment_method + notes) + extra cols ──
  ['ALTER TABLE payments ADD COLUMN fee_item_id INT UNSIGNED NULL', 'payments.fee_item_id'],
  ['ALTER TABLE payments ADD COLUMN verified_by_internal_id VARCHAR(20) NULL', 'payments.verified_by_internal_id'],
  ['ALTER TABLE payments ADD COLUMN payment_method VARCHAR(100) NULL', 'payments.payment_method'],
  ['ALTER TABLE payments ADD COLUMN notes TEXT NULL', 'payments.notes'],

  // ── staff_notifications: migration 009 (reference cols + role enum fix) ──
  ['ALTER TABLE staff_notifications ADD COLUMN reference_id VARCHAR(50) NULL', 'staff_notifications.reference_id'],
  ['ALTER TABLE staff_notifications ADD COLUMN reference_type VARCHAR(50) NULL', 'staff_notifications.reference_type'],
  ['ALTER TABLE staff_notifications ADD COLUMN link_url VARCHAR(255) NULL', 'staff_notifications.link_url'],
  ["ALTER TABLE staff_notifications MODIFY COLUMN role VARCHAR(20) NOT NULL", 'staff_notifications.role (enum→varchar)'],

  // ── grade_submission_batches.approved_by ──
  ['ALTER TABLE grade_submission_batches ADD COLUMN approved_by VARCHAR(50) NULL', 'grade_submission_batches.approved_by'],

  // ── students.account_status: add 'pending' alongside 'inactive' ──
  ["ALTER TABLE students MODIFY COLUMN account_status ENUM('pending','active','inactive','suspended') NOT NULL DEFAULT 'pending'", 'students.account_status enum fix'],
];

// Tables to create if missing (migration 013)
const TABLES = [
  `CREATE TABLE IF NOT EXISTS grade_edit_requests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT UNSIGNED NOT NULL,
    student_id VARCHAR(12) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    strand VARCHAR(100) NULL,
    term ENUM('Term 1','Term 2','Term 3') NOT NULL,
    original_grade DECIMAL(5,2) NOT NULL,
    proposed_grade DECIMAL(5,2) NULL,
    reason TEXT NOT NULL,
    status ENUM('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
    approved_by VARCHAR(20) NULL,
    approved_at DATETIME NULL,
    rejected_by VARCHAR(20) NULL,
    rejected_at DATETIME NULL,
    rejection_reason TEXT NULL,
    corrected_grade DECIMAL(5,2) NULL,
    corrected_at DATETIME NULL,
    completed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_teacher (teacher_id),
    INDEX idx_student (student_id),
    INDEX idx_status (status),
    INDEX idx_term (term),
    INDEX idx_created (created_at),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS grade_edit_audit (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    edit_request_id INT UNSIGNED NOT NULL,
    student_id VARCHAR(12) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    strand VARCHAR(100) NULL,
    term ENUM('Term 1','Term 2','Term 3') NOT NULL,
    original_grade DECIMAL(5,2) NOT NULL,
    new_grade DECIMAL(5,2) NOT NULL,
    corrected_by INT UNSIGNED NOT NULL,
    approved_by VARCHAR(20) NOT NULL,
    reason TEXT NOT NULL,
    approved_at DATETIME NOT NULL,
    corrected_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student (student_id),
    INDEX idx_term (term),
    INDEX idx_corrected_date (corrected_at),
    FOREIGN KEY (edit_request_id) REFERENCES grade_edit_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (corrected_by) REFERENCES teachers(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

async function fix() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'smart_student_service',
    multipleStatements: true,
  });

  console.log('Connected to:', process.env.DB_NAME || 'smart_student_service\n');

  let added = 0, skipped = 0, errored = 0;

  for (const [sql, label] of FIXES) {
    try {
      await conn.query(sql);
      console.log(`  ✅ ${label}`);
      added++;
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log(`  ⏭️  ${label} (already exists)`);
        skipped++;
      } else {
        console.error(`  ❌ ${label}: ${e.message}`);
        errored++;
      }
    }
  }

  for (const ddl of TABLES) {
    const tname = ddl.match(/CREATE TABLE IF NOT EXISTS (\S+)/)[1];
    try {
      await conn.query(ddl);
      console.log(`  ✅ Table: ${tname}`);
      added++;
    } catch (e) {
      console.error(`  ❌ Table ${tname}: ${e.message}`);
      errored++;
    }
  }

  console.log(`\nDone: ${added} added/created, ${skipped} already existed, ${errored} errors.`);
  await conn.end();
}

fix().catch(e => { console.error(e.message); process.exit(1); });
