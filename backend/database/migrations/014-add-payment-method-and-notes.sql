-- ============================================================
-- Migration 014: Add payment_method and notes to payments table
-- Supports manual tuition payment recording by Accounting
-- ============================================================

USE smart_student_service;

-- Add payment_method column (stores "Cash", "Check", etc.)
ALTER TABLE payments 
ADD COLUMN payment_method VARCHAR(100) NULL AFTER admin_timestamp;

-- Add notes column (optional notes for manual payments)
ALTER TABLE payments 
ADD COLUMN notes TEXT NULL AFTER payment_method;

-- Migration complete
SELECT 'Migration 014 completed: payment_method and notes columns added to payments table' AS status;
