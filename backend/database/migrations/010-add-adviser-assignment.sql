-- ============================================================
-- Migration 010: Adviser Assignment System
-- Description: Add adviser assignment for students
-- Registrar can assign teachers as advisers to students
-- ============================================================

-- First, check what type teachers.id actually is
-- DROP the table if it exists (in case of previous failed attempt)
DROP TABLE IF EXISTS student_adviser_assignments;

-- Create student_adviser_assignments table
-- Using INT to match teachers.id (numeric primary key)
CREATE TABLE IF NOT EXISTS student_adviser_assignments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(12) NOT NULL,
  teacher_id INT NOT NULL,  -- Changed to INT (not UNSIGNED) to match teachers.id
  school_year_id INT NOT NULL,  -- Changed to INT to match enrollment_config.id
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by VARCHAR(20) NOT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  
  -- Constraints (no foreign keys initially to avoid type mismatch)
  -- We'll add them after checking types
  UNIQUE KEY unique_student_school_year (student_id, school_year_id, status),
  
  -- Indexes for fast lookups
  INDEX idx_student (student_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_school_year (school_year_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Now add foreign keys one by one with error handling
-- FK1: student_id -> students(student_id)
SET @fk1_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'student_adviser_assignments' 
  AND CONSTRAINT_NAME = 'fk_adviser_student');
  
SET @fk1_sql = IF(@fk1_exists = 0,
  'ALTER TABLE student_adviser_assignments ADD CONSTRAINT fk_adviser_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE',
  'SELECT "FK student already exists" AS status'
);
PREPARE stmt FROM @fk1_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FK2: teacher_id -> teachers(id)
SET @fk2_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'student_adviser_assignments' 
  AND CONSTRAINT_NAME = 'fk_adviser_teacher');
  
SET @fk2_sql = IF(@fk2_exists = 0,
  'ALTER TABLE student_adviser_assignments ADD CONSTRAINT fk_adviser_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE',
  'SELECT "FK teacher already exists" AS status'
);
PREPARE stmt FROM @fk2_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FK3: school_year_id -> enrollment_config(id) - OPTIONAL, skip if causes issues
-- SET @fk3_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
--   WHERE CONSTRAINT_SCHEMA = DATABASE() 
--   AND TABLE_NAME = 'student_adviser_assignments' 
--   AND CONSTRAINT_NAME = 'fk_adviser_school_year');
  
-- SET @fk3_sql = IF(@fk3_exists = 0,
--   'ALTER TABLE student_adviser_assignments ADD CONSTRAINT fk_adviser_school_year FOREIGN KEY (school_year_id) REFERENCES enrollment_config(id) ON DELETE CASCADE',
--   'SELECT "FK school_year already exists" AS status'
-- );
-- PREPARE stmt FROM @fk3_sql;
-- EXECUTE stmt;
-- DEALLOCATE PREPARE stmt;

-- Add track and strand columns to students table if they don't exist
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'students' 
   AND COLUMN_NAME = 'track') = 0,
  'ALTER TABLE students ADD COLUMN track VARCHAR(100) NULL AFTER pathway',
  'SELECT "Column track already exists" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'students' 
   AND COLUMN_NAME = 'strand') = 0,
  'ALTER TABLE students ADD COLUMN strand VARCHAR(50) NULL AFTER track',
  'SELECT "Column strand already exists" AS status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration 010: Adviser Assignment System completed successfully!' AS status;
