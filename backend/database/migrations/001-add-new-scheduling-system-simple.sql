-- Migration: Add new scheduling system tables (SIMPLE VERSION)
-- Date: 2026-10-06
-- Description: Run this if the main migration script fails
-- NOTE: You may see "Duplicate column" errors - that's OK! It means the column already exists.

-- 1. Create new tables
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

CREATE TABLE IF NOT EXISTS student_schedule_enrollments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(12) NOT NULL,
  teacher_schedule_id INT UNSIGNED NOT NULL,
  enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enrolled_by VARCHAR(50) NULL,
  INDEX idx_student (student_id),
  INDEX idx_schedule (teacher_schedule_id)
);

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

INSERT IGNORE INTO grade_submission_config (term, is_open, manual_override)
VALUES ('Term 1', 0, 'none'), ('Term 2', 0, 'none'), ('Term 3', 0, 'none');

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

CREATE TABLE IF NOT EXISTS enrollment_config (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  active_term VARCHAR(50) NOT NULL,
  deadline DATETIME NOT NULL
);

INSERT IGNORE INTO enrollment_config (active_term, deadline)
VALUES ('Term 1', '2027-12-31 23:59:59');

-- 2. Modify existing grades table
ALTER TABLE grades MODIFY COLUMN subject_id INT UNSIGNED NULL;

-- Add new columns to grades (ignore errors if column already exists)
ALTER TABLE grades ADD COLUMN subject_name VARCHAR(100) NULL;
ALTER TABLE grades ADD COLUMN strand VARCHAR(50) NULL;
ALTER TABLE grades ADD COLUMN teacher_schedule_id INT UNSIGNED NULL;
ALTER TABLE grades ADD COLUMN submission_status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE grades ADD COLUMN submitted_at DATETIME NULL;
ALTER TABLE grades ADD COLUMN approved_at DATETIME NULL;
ALTER TABLE grades ADD COLUMN approved_by VARCHAR(50) NULL;
ALTER TABLE grades ADD COLUMN return_reason TEXT NULL;
ALTER TABLE grades ADD COLUMN updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 3. Fix grade_requests table
ALTER TABLE grade_requests MODIFY COLUMN subject_id INT UNSIGNED NULL;

-- Try to drop foreign key (ignore error if it doesn't exist)
ALTER TABLE grade_requests DROP FOREIGN KEY grade_requests_ibfk_2;

SELECT 'Migration completed! (Ignore "Duplicate column" or "Can''t DROP" errors - they are normal)' as status;
