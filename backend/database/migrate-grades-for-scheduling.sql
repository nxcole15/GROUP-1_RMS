-- Migration: Update grades table to work with new teacher_schedules system
-- Date: 2026-10-03
-- Purpose: Add subject_name and strand columns to support new scheduling
-- Note: This is an ADD-ONLY migration (safe to run, won't break existing data)

USE smart_student_service;

-- Check if columns already exist, if not add them
SET @db_name = DATABASE();

-- Add subject_name to grades table if it doesn't exist
SET @query = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'subject_name') = 0,
  'ALTER TABLE grades ADD COLUMN subject_name VARCHAR(100) NULL AFTER subject_id',
  'SELECT "Column subject_name already exists in grades" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add strand to grades table if it doesn't exist
SET @query = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = 'grades' 
   AND COLUMN_NAME = 'strand') = 0,
  'ALTER TABLE grades ADD COLUMN strand VARCHAR(100) NULL AFTER subject_name',
  'SELECT "Column strand already exists in grades" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add subject_name to grade_submission_batches if it doesn't exist
SET @query = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = 'grade_submission_batches' 
   AND COLUMN_NAME = 'subject_name') = 0,
  'ALTER TABLE grade_submission_batches ADD COLUMN subject_name VARCHAR(100) NULL AFTER subject_id',
  'SELECT "Column subject_name already exists in grade_submission_batches" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add strand to grade_submission_batches if it doesn't exist
SET @query = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = 'grade_submission_batches' 
   AND COLUMN_NAME = 'strand') = 0,
  'ALTER TABLE grade_submission_batches ADD COLUMN strand VARCHAR(100) NULL AFTER subject_name',
  'SELECT "Column strand already exists in grade_submission_batches" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add subject_name to grade_audit_log if it doesn't exist
SET @query = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = 'grade_audit_log' 
   AND COLUMN_NAME = 'subject_name') = 0,
  'ALTER TABLE grade_audit_log ADD COLUMN subject_name VARCHAR(100) NULL AFTER subject_id',
  'SELECT "Column subject_name already exists in grade_audit_log" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add strand to grade_audit_log if it doesn't exist
SET @query = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = @db_name 
   AND TABLE_NAME = 'grade_audit_log' 
   AND COLUMN_NAME = 'strand') = 0,
  'ALTER TABLE grade_audit_log ADD COLUMN strand VARCHAR(100) NULL AFTER subject_name',
  'SELECT "Column strand already exists in grade_audit_log" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '✅ Migration completed successfully!' AS status;
SELECT 'Grades table now supports both old (subject_id) and new (subject_name + strand) systems' AS note;
