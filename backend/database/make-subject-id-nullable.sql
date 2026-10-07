-- Make subject_id nullable in grades table to support new scheduling system
-- When using teacher_schedules (subject_name + strand), we don't have a subject_id

-- Step 1: Drop foreign key constraint on grades table
ALTER TABLE grades 
DROP FOREIGN KEY grades_ibfk_2;

-- Step 2: Make subject_id nullable
ALTER TABLE grades 
MODIFY COLUMN subject_id INT NULL;

-- Step 3: Re-add foreign key constraint (allowing NULL)
ALTER TABLE grades
ADD CONSTRAINT grades_ibfk_2 
FOREIGN KEY (subject_id) 
REFERENCES subjects(id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Step 4: Make subject_id nullable in grade_submission_batches
-- First check if there's a foreign key
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'grade_submission_batches' 
  AND COLUMN_NAME = 'subject_id' 
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- If foreign key exists, drop it first (run this only if the above query returns a result)
-- ALTER TABLE grade_submission_batches DROP FOREIGN KEY <constraint_name>;

ALTER TABLE grade_submission_batches
MODIFY COLUMN subject_id INT NULL;

-- Step 5: grade_audit_log should already be done
ALTER TABLE grade_audit_log
MODIFY COLUMN subject_id INT NULL;

-- Verify changes
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    IS_NULLABLE,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('grades', 'grade_submission_batches', 'grade_audit_log')
    AND COLUMN_NAME = 'subject_id';
