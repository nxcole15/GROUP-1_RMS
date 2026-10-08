-- Migration: Add new scheduling system tables
-- Date: 2026-10-06
-- Description: Adds teacher_schedules, student_schedule_enrollments, grade_submission_config, etc.
-- Run this if you get "Table doesn't exist" errors for new scheduling features

-- 1. Create teacher_schedules table
CREATE TABLE IF NOT EXISTS teacher_schedules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT UNSIGNED NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  room VARCHAR(50) NOT NULL,
  day ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  track VARCHAR(100) NOT NULL,
  strand VARCHAR(50) NOT NULL,
  term VARCHAR(50) NOT NULL,
  school_year VARCHAR(20) NOT NULL,
  max_capacity INT NOT NULL DEFAULT 40,
  enrolled_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(50) NULL,
  INDEX idx_teacher (teacher_id),
  INDEX idx_day (day),
  INDEX idx_term (term)
);

-- 2. Create student_schedule_enrollments table
CREATE TABLE IF NOT EXISTS student_schedule_enrollments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(12) NOT NULL,
  teacher_schedule_id INT UNSIGNED NOT NULL,
  enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enrolled_by VARCHAR(50) NULL,
  INDEX idx_student (student_id),
  INDEX idx_schedule (teacher_schedule_id)
);

-- 3. Create grade_submission_batches table
CREATE TABLE IF NOT EXISTS grade_submission_batches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT UNSIGNED NOT NULL,
  subject_id INT UNSIGNED NULL,
  subject_name VARCHAR(100) NULL,
  strand VARCHAR(50) NULL,
  term VARCHAR(50) NOT NULL,
  status ENUM('draft','submitted','approved','returned') NOT NULL DEFAULT 'draft',
  total_students INT NOT NULL DEFAULT 0,
  submitted_at DATETIME NULL,
  approved_at DATETIME NULL,
  return_reason TEXT NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_teacher (teacher_id),
  INDEX idx_term (term),
  INDEX idx_status (status)
);

-- 4. Create grade_submission_config table
CREATE TABLE IF NOT EXISTS grade_submission_config (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  term ENUM('Term 1','Term 2','Term 3') NOT NULL UNIQUE,
  is_open TINYINT(1) NOT NULL DEFAULT 0,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  manual_override ENUM('open','closed','none') NOT NULL DEFAULT 'none',
  opened_at DATETIME NULL,
  last_modified_by VARCHAR(50) NULL,
  last_modified_at DATETIME NULL,
  notes TEXT NULL
);

-- Insert default config for all terms
INSERT IGNORE INTO grade_submission_config (term, is_open, manual_override)
VALUES ('Term 1', 0, 'none'), ('Term 2', 0, 'none'), ('Term 3', 0, 'none');

-- 5. Create grade_audit_log table
CREATE TABLE IF NOT EXISTS grade_audit_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  grade_id INT UNSIGNED NOT NULL,
  student_id VARCHAR(12) NOT NULL,
  subject_id INT UNSIGNED NULL,
  subject_name VARCHAR(100) NULL,
  strand VARCHAR(50) NULL,
  term VARCHAR(50) NOT NULL,
  action ENUM('created', 'updated', 'submitted', 'approved', 'returned') NOT NULL,
  old_percentage DECIMAL(5,2) NULL,
  new_percentage DECIMAL(5,2) NULL,
  old_status VARCHAR(20) NULL,
  new_status VARCHAR(20) NULL,
  changed_by_type ENUM('teacher', 'admin') NOT NULL,
  changed_by_id VARCHAR(20) NOT NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_grade (grade_id),
  INDEX idx_student (student_id),
  INDEX idx_action (action)
);

-- 6. Create enrollment_config table (if missing)
CREATE TABLE IF NOT EXISTS enrollment_config (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  active_term VARCHAR(50) NOT NULL,
  deadline DATETIME NOT NULL
);

-- Insert default enrollment config
INSERT IGNORE INTO enrollment_config (active_term, deadline)
VALUES ('Term 1', '2027-12-31 23:59:59');

-- 7. Modify existing grades table to support new system
ALTER TABLE grades MODIFY COLUMN subject_id INT UNSIGNED NULL;

-- Check if columns exist before adding (MySQL 8.0+ syntax)
-- For older MySQL, comment out the IF NOT EXISTS and run ALTER one by one
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'subject_name') = 0,
  'ALTER TABLE grades ADD COLUMN subject_name VARCHAR(100) NULL',
  'SELECT "Column subject_name already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'strand') = 0,
  'ALTER TABLE grades ADD COLUMN strand VARCHAR(50) NULL',
  'SELECT "Column strand already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'teacher_schedule_id') = 0,
  'ALTER TABLE grades ADD COLUMN teacher_schedule_id INT UNSIGNED NULL',
  'SELECT "Column teacher_schedule_id already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'submission_status') = 0,
  'ALTER TABLE grades ADD COLUMN submission_status VARCHAR(50) DEFAULT "draft"',
  'SELECT "Column submission_status already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'submitted_at') = 0,
  'ALTER TABLE grades ADD COLUMN submitted_at DATETIME NULL',
  'SELECT "Column submitted_at already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'approved_at') = 0,
  'ALTER TABLE grades ADD COLUMN approved_at DATETIME NULL',
  'SELECT "Column approved_at already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'approved_by') = 0,
  'ALTER TABLE grades ADD COLUMN approved_by VARCHAR(50) NULL',
  'SELECT "Column approved_by already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'return_reason') = 0,
  'ALTER TABLE grades ADD COLUMN return_reason TEXT NULL',
  'SELECT "Column return_reason already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'updated_at') = 0,
  'ALTER TABLE grades ADD COLUMN updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'SELECT "Column updated_at already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 8. Fix grade_requests table
ALTER TABLE grade_requests MODIFY COLUMN subject_id INT UNSIGNED NULL;

-- Drop foreign key constraint if it exists
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'grade_requests' 
   AND CONSTRAINT_NAME = 'grade_requests_ibfk_2') > 0,
  'ALTER TABLE grade_requests DROP FOREIGN KEY grade_requests_ibfk_2',
  'SELECT "Foreign key grade_requests_ibfk_2 does not exist"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verification
SELECT 'Migration completed successfully!' as status;
SELECT 'Verifying new tables...' as step;
SHOW TABLES LIKE '%schedule%';
SHOW TABLES LIKE '%grade_submission%';
SHOW TABLES LIKE '%grade_audit%';
