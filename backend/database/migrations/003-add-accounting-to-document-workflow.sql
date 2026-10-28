-- Migration 003: Add Accounting Step to Document Workflow
-- Run after: 002-enhance-document-workflow.sql

USE smart_student_service;

-- Add accounting-related columns to documents table (if they don't exist)
-- Note: This migration is idempotent - it will skip columns that already exist

SET @dbname = DATABASE();
SET @tablename = 'documents';

-- Add accounting_verified_at column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'accounting_verified_at';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN accounting_verified_at DATETIME NULL',
  'SELECT "Column accounting_verified_at already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add accounting_verified_by column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'accounting_verified_by';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN accounting_verified_by VARCHAR(20) NULL',
  'SELECT "Column accounting_verified_by already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add payment_amount column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'payment_amount';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN payment_amount DECIMAL(10,2) NULL',
  'SELECT "Column payment_amount already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add payment_reference column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'payment_reference';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN payment_reference VARCHAR(100) NULL',
  'SELECT "Column payment_reference already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for accounting queries (if it doesn't exist)
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND INDEX_NAME = 'idx_accounting_status';

SET @query = IF(@index_exists = 0,
  'ALTER TABLE documents ADD INDEX idx_accounting_status (status, accounting_verified_at)',
  'SELECT "Index idx_accounting_status already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- The new workflow will be:
-- 1. student_requested → Student submits request
-- 2. teacher_approved → Teacher approves
-- 3. registrar_forwarded → Registrar forwards to Principal
-- 4. principal_approved → Principal approves
-- 5. pending_payment → Registrar sets ready, waiting for accounting payment verification
-- 6. payment_verified → Accounting verifies payment
-- 7. ready_for_pickup → Document ready to be picked up (not used anymore)
-- 8. released → Student picked up the document (registrar marks after payment_verified)
-- 9. principal_rejected → Principal rejected the request
