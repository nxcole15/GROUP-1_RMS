-- Migration 009: Enhance Notifications System for Real-time Updates
-- This migration ensures both student and staff notification tables are properly configured

-- Ensure notifications table exists (for students)
CREATE TABLE IF NOT EXISTS notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(12)  NOT NULL,
  message    TEXT         NOT NULL,
  type       VARCHAR(50)  DEFAULT 'info',
  is_read    BOOLEAN      DEFAULT 0,
  created_at DATETIME     NOT NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure staff_notifications table exists (for admin, principal, registrar, teacher, accounting)
CREATE TABLE IF NOT EXISTS staff_notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient   VARCHAR(20)  NOT NULL,              -- staff user ID (admin_id, teacher_id, etc.)
  role        VARCHAR(20)  NOT NULL,              -- 'admin', 'principal', 'registrar', 'teacher', 'accounting'
  message     TEXT         NOT NULL,
  type        VARCHAR(50)  DEFAULT 'info',        -- 'grade_request', 'document_request', 'enrollment', 'payment', 'fee_assigned', 'info'
  reference_id VARCHAR(50) DEFAULT NULL,          -- ID of related entity (e.g., grade_request_id, document_id)
  reference_type VARCHAR(50) DEFAULT NULL,        -- 'grade_request', 'document', 'enrollment', 'payment'
  is_read     BOOLEAN      DEFAULT 0,
  created_at  DATETIME     NOT NULL,
  INDEX idx_recipient (recipient),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add link_url column (MySQL compatible way)
-- Check if column exists before adding it

SET @dbname = DATABASE();
SET @tablename = 'staff_notifications';
SET @columnname = 'link_url';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) DEFAULT NULL;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @tablename = 'notifications';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) DEFAULT NULL;')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

