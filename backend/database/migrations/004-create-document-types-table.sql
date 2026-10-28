-- Migration 004: Create Document Types Table with Prices
-- This allows admin to manage document types and their prices

USE smart_student_service;

-- Create document_types table
CREATE TABLE IF NOT EXISTS document_types (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  document_name VARCHAR(255) NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  processing_days VARCHAR(50) NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default document types with prices (only if table is empty)
INSERT INTO document_types (document_name, price, processing_days, description)
SELECT * FROM (
  SELECT 'School Form 10 (Form 137)' as document_name, 250.00 as price, '10-15 working days' as processing_days, 'Official transcript of records' as description
  UNION ALL SELECT 'School Form 9 - Report Card (1st copy)', 0.00, '2-3 working days', 'First copy is free of charge'
  UNION ALL SELECT 'School Form 9 - Report Card (2nd copy)', 150.00, '2-3 working days', 'Additional copy of report card'
  UNION ALL SELECT 'Diploma (1st copy)', 0.00, '10-15 working days', 'Original diploma - free of charge'
  UNION ALL SELECT 'Diploma (succeeding copies)', 500.00, '10-15 working days', 'Additional diploma copies'
  UNION ALL SELECT 'Certificate of Enrollment', 100.00, '3-5 working days', 'Proof of current enrollment'
  UNION ALL SELECT 'Certificate of Graduation', 100.00, '3-5 working days', 'Proof of graduation'
  UNION ALL SELECT 'Certificate of Grades (GWA)', 100.00, '3-5 working days', 'General weighted average certificate'
  UNION ALL SELECT 'Certificate of Good Moral', 50.00, '3-5 working days', 'Good moral character certificate'
  UNION ALL SELECT 'ESC Certificate / SHS-Voucher Cert.', 100.00, '3-5 working days', 'ESC or voucher certification'
  UNION ALL SELECT 'Official Grade Slip (Employment/Any Purpose)', 100.00, '3-5 working days', 'Official grade slip for employment'
  UNION ALL SELECT 'CTC - Form 137 (scanned)', 25.00, '1 day', 'Certified true copy - scanned'
  UNION ALL SELECT 'CTC - Report Card / Grade Slip', 25.00, '1 day', 'Certified true copy of report card'
  UNION ALL SELECT 'CTC - NSO Cert. of Live Birth', 25.00, '1 day', 'Certified true copy of birth certificate'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM document_types LIMIT 1);

-- Add index for active documents (check if exists first)
SET @dbname = DATABASE();
SET @tablename = 'document_types';
SET @index_exists = 0;

SELECT COUNT(*) INTO @index_exists 
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND INDEX_NAME = 'idx_active';

SET @query = IF(@index_exists = 0,
  'ALTER TABLE document_types ADD INDEX idx_active (is_active)',
  'SELECT "Index idx_active already exists" AS message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
