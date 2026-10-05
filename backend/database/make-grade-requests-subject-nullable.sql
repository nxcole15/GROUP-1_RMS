-- Make subject_id nullable in grade_requests table to support new scheduling system
-- This allows grade requests to work with teacher_schedules instead of subjects

USE smart_student_service;

-- Drop foreign key constraint first
ALTER TABLE grade_requests DROP FOREIGN KEY grade_requests_ibfk_2;

-- Make subject_id nullable
ALTER TABLE grade_requests MODIFY COLUMN subject_id INT NULL;

-- Optionally re-add foreign key with ON DELETE SET NULL if you want to keep the constraint for old system
-- ALTER TABLE grade_requests 
-- ADD CONSTRAINT grade_requests_ibfk_2 
-- FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL;

SELECT 'Migration completed: subject_id in grade_requests is now nullable' AS message;
