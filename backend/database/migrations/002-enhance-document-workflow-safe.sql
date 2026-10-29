-- ============================================================
-- Migration: Enhance Document Workflow (SAFE VERSION)
-- Description: Add multi-step approval workflow for documents
-- This version checks if columns exist before adding them
-- ============================================================

-- 1. Modify status column to include new workflow states
ALTER TABLE documents 
MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'student_requested';

-- 2. Add new columns for tracking workflow (only if they don't exist)

-- Check and add teacher_id
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'teacher_id';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN teacher_id VARCHAR(20) NULL AFTER student_id',
  'SELECT "Column teacher_id already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add teacher_reviewed_at
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'teacher_reviewed_at';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN teacher_reviewed_at DATETIME NULL AFTER teacher_id',
  'SELECT "Column teacher_reviewed_at already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add registrar_id
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'registrar_id';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN registrar_id VARCHAR(20) NULL AFTER teacher_reviewed_at',
  'SELECT "Column registrar_id already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add registrar_forwarded_at
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'registrar_forwarded_at';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN registrar_forwarded_at DATETIME NULL AFTER registrar_id',
  'SELECT "Column registrar_forwarded_at already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add principal_id
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'principal_id';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN principal_id VARCHAR(20) NULL AFTER registrar_forwarded_at',
  'SELECT "Column principal_id already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add principal_reviewed_at
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'principal_reviewed_at';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN principal_reviewed_at DATETIME NULL AFTER principal_id',
  'SELECT "Column principal_reviewed_at already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add pickup_date
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'pickup_date';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN pickup_date DATE NULL AFTER principal_reviewed_at',
  'SELECT "Column pickup_date already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add pickup_time
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'pickup_time';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN pickup_time TIME NULL AFTER pickup_date',
  'SELECT "Column pickup_time already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add pickup_location
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'pickup_location';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN pickup_location VARCHAR(200) NULL AFTER pickup_time',
  'SELECT "Column pickup_location already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add released_at
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'released_at';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN released_at DATETIME NULL AFTER pickup_location',
  'SELECT "Column released_at already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add released_by
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'released_by';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN released_by VARCHAR(20) NULL AFTER released_at',
  'SELECT "Column released_by already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add indexes for better query performance (safe - will skip if exists)

-- Index for teacher_id
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND INDEX_NAME = 'idx_documents_teacher';

SET @query = IF(@index_exists = 0,
  'CREATE INDEX idx_documents_teacher ON documents(teacher_id)',
  'SELECT "Index idx_documents_teacher already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index for registrar_id
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND INDEX_NAME = 'idx_documents_registrar';

SET @query = IF(@index_exists = 0,
  'CREATE INDEX idx_documents_registrar ON documents(registrar_id)',
  'SELECT "Index idx_documents_registrar already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index for principal_id
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND INDEX_NAME = 'idx_documents_principal';

SET @query = IF(@index_exists = 0,
  'CREATE INDEX idx_documents_principal ON documents(principal_id)',
  'SELECT "Index idx_documents_principal already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Index for status
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND INDEX_NAME = 'idx_documents_status';

SET @query = IF(@index_exists = 0,
  'CREATE INDEX idx_documents_status ON documents(status)',
  'SELECT "Index idx_documents_status already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration 002: Document workflow enhancement completed successfully!' as status;
