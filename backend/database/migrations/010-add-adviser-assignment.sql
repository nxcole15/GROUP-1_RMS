-- ============================================================
-- Migration 010: Adviser Assignment System
-- Description: Add adviser assignment for students
-- Registrar can assign teachers as advisers to students
-- ============================================================

-- Create student_adviser_assignments table
CREATE TABLE IF NOT EXISTS student_adviser_assignments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(12) NOT NULL,
  teacher_id INT UNSIGNED NOT NULL,
  school_year_id INT UNSIGNED NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by VARCHAR(20) NOT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  
  -- Constraints
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (school_year_id) REFERENCES enrollment_config(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES admins(admin_id),
  
  -- Unique constraint: one active adviser per student per school year/term
  UNIQUE KEY unique_student_school_year (student_id, school_year_id, status),
  
  -- Indexes for fast lookups
  INDEX idx_student (student_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_school_year (school_year_id),
  INDEX idx_status (status)
);

-- Add track and strand columns to students table if they don't exist
SET @sql = IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
   AND TABLE_NAME = 'students' 
   AND COLUMN_NAME = 'track') = 0,
  'ALTER TABLE students ADD COLUMN track VARCHAR(100) NULL AFTER pathway',
  'SELECT "Column track already exists"'
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
  'SELECT "Column strand already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration 010: Adviser Assignment System completed successfully!' AS status;
