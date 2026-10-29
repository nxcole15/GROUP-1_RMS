-- ============================================================
-- Migration 006: System Settings - Academic Year & Enrollment Config
-- Description: Update enrollment_config table for comprehensive system settings
-- Principal can manage school year, terms, and enrollment periods
-- ============================================================

-- 1. Backup existing data (if any)
CREATE TABLE IF NOT EXISTS enrollment_config_backup AS 
SELECT * FROM enrollment_config;

-- 2. Drop old table structure
DROP TABLE IF EXISTS enrollment_config;

-- 3. Create new comprehensive enrollment_config table
CREATE TABLE enrollment_config (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- Academic Year Information
  school_year VARCHAR(20) NOT NULL,                    -- "2025-2026"
  current_term ENUM('Term 1','Term 2','Term 3') NOT NULL DEFAULT 'Term 1',
  status ENUM('active','completed') NOT NULL DEFAULT 'active',
  
  -- Enrollment Period Settings
  enrollment_start_date DATE NULL,
  enrollment_end_date DATE NULL,
  enrollment_is_open TINYINT(1) NOT NULL DEFAULT 0,
  
  -- Term Completion Tracking
  term1_completed_at DATETIME NULL,
  term2_completed_at DATETIME NULL,
  term3_completed_at DATETIME NULL,
  
  -- Audit Fields
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(20) NULL,
  last_modified_by VARCHAR(20) NULL,
  
  -- Constraints
  UNIQUE KEY unique_active_year (status, school_year),
  INDEX idx_school_year (school_year),
  INDEX idx_status (status),
  INDEX idx_current_term (current_term)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Seed initial active school year
INSERT INTO enrollment_config (
  school_year, 
  current_term, 
  status, 
  enrollment_start_date,
  enrollment_end_date,
  enrollment_is_open,
  created_by
) VALUES (
  '2026-2027',
  'Term 1',
  'active',
  '2026-06-01',
  '2027-05-31',
  1,
  'SYSTEM'
);

-- 5. Add notification type support for system settings
-- (notifications and staff_notifications tables already exist)
-- Just document the new types we'll use:
-- - 'term_change' for term completion
-- - 'year_change' for school year changes
-- - 'enrollment_change' for enrollment period updates

SELECT 'Migration 006: System Settings completed successfully!' AS status;
SELECT 'New enrollment_config table created with academic year management' AS info;
