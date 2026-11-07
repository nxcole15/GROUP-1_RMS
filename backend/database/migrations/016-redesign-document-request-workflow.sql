-- ============================================================
-- Migration 016: Redesign Document Request Workflow
-- Description: Update document workflow to remove teacher approval
-- New workflow: Student → Registrar → Principal → Registrar → 
--               Accounting (if paid) → Registrar → Student
-- ============================================================

USE smart_student_service;

-- 1. Add new columns for pickup instructions
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'pickup_instructions';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN pickup_instructions TEXT NULL AFTER pickup_location',
  'SELECT "Column pickup_instructions already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Add column for tracking when pickup was scheduled
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'pickup_scheduled_at';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN pickup_scheduled_at DATETIME NULL AFTER pickup_instructions',
  'SELECT "Column pickup_scheduled_at already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add column for tracking pickup scheduler
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'pickup_scheduled_by';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN pickup_scheduled_by VARCHAR(20) NULL AFTER pickup_scheduled_at',
  'SELECT "Column pickup_scheduled_by already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Add flag for free documents (no payment required)
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND COLUMN_NAME = 'requires_payment';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE documents ADD COLUMN requires_payment TINYINT(1) NOT NULL DEFAULT 1 AFTER payment_amount',
  'SELECT "Column requires_payment already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Update existing documents: if payment_amount is 0 or NULL, set requires_payment to 0
UPDATE documents 
SET requires_payment = 0 
WHERE payment_amount IS NULL OR payment_amount = 0;

-- 6. Update any existing old statuses to new workflow statuses
-- Map old statuses to new ones:
-- 'pending' → 'pending_registrar_review'
-- 'student_requested' → 'pending_registrar_review' (current initial status)
-- 'teacher_approved' → 'pending_registrar_review'
-- 'registrar_forwarded' → 'pending_principal_approval'
-- 'principal_approved' → 'approved'
-- 'principal_rejected' → 'rejected'
-- 'pending_payment' → 'pending_payment_verification' (if payment required)
-- 'payment_verified' → 'payment_verified' (keep)
-- 'released' → 'released' (keep)

UPDATE documents SET status = 'pending_registrar_review' 
WHERE status IN ('pending', 'student_requested', 'teacher_approved');

UPDATE documents SET status = 'pending_principal_approval' 
WHERE status = 'registrar_forwarded';

UPDATE documents SET status = 'approved' 
WHERE status = 'principal_approved';

UPDATE documents SET status = 'rejected' 
WHERE status = 'principal_rejected';

UPDATE documents SET status = 'pending_payment_verification' 
WHERE status = 'pending_payment';

-- Note: Keep 'payment_verified' and 'released' as-is

-- 7. Add indexes for better query performance
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'documents' 
  AND INDEX_NAME = 'idx_documents_requires_payment';

SET @query = IF(@index_exists = 0,
  'CREATE INDEX idx_documents_requires_payment ON documents(requires_payment)',
  'SELECT "Index idx_documents_requires_payment already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration 016: Document request workflow redesigned successfully!' as status;
