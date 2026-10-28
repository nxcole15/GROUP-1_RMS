-- Migration 005: Fix Document Status Column to Support All Status Values
-- This fixes the "Data truncated for column 'status'" error

USE smart_student_service;

-- Check if status column is ENUM and convert it to VARCHAR
-- This allows for flexible status values without being limited by ENUM

SET @dbname = DATABASE();
SET @tablename = 'documents';
SET @columnname = 'status';

-- Get current column type
SELECT DATA_TYPE INTO @col_type
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = @columnname;

-- If it's an ENUM, convert to VARCHAR(50)
-- If it's already VARCHAR but too short, increase the size
SET @query = CONCAT('ALTER TABLE documents MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT ''student_requested''');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the column can hold all our status values:
-- Valid statuses:
-- - student_requested (17 chars)
-- - teacher_approved (16 chars)
-- - registrar_forwarded (20 chars)
-- - principal_approved (19 chars)
-- - principal_rejected (19 chars)
-- - pending_payment (15 chars)
-- - payment_verified (17 chars)
-- - ready_for_pickup (17 chars)
-- - released (8 chars)

SELECT 'Status column has been updated to VARCHAR(50)' AS message;
