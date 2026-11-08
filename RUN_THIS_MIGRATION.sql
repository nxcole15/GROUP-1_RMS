-- Enhanced Enrollment Workflow Migration
-- Run this in MySQL

USE smart_student_service;

-- Add columns one by one (MySQL doesn't support IF NOT EXISTS for columns)
-- If a column already exists, you'll get a harmless error - just continue

ALTER TABLE enrollment_applications 
ADD COLUMN official_student_id VARCHAR(20) NULL AFTER generated_student_id;

ALTER TABLE enrollment_applications 
ADD COLUMN student_id_confirmed_by VARCHAR(20) NULL AFTER official_student_id;

ALTER TABLE enrollment_applications 
ADD COLUMN student_id_confirmed_at DATETIME NULL AFTER student_id_confirmed_by;

ALTER TABLE enrollment_applications 
ADD COLUMN forwarded_to_principal_at DATETIME NULL AFTER registrar_reviewed_at;

-- Done! If you see "Duplicate column" errors, that's OK - the columns already exist.
SELECT 'Migration complete!' AS status;
