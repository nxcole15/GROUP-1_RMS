-- ════════════════════════════════════════════════════════════════════════════════
-- SIMPLE FIX: Add Missing Columns (MySQL 5.7+ Compatible)
-- If columns already exist, you'll get a harmless error - that's okay!
-- ════════════════════════════════════════════════════════════════════════════════

-- Add title column
ALTER TABLE staff_notifications 
ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER message;

-- Add reference_id column
ALTER TABLE staff_notifications 
ADD COLUMN reference_id INT DEFAULT NULL AFTER type;

-- Add reference_type column
ALTER TABLE staff_notifications 
ADD COLUMN reference_type VARCHAR(50) DEFAULT NULL AFTER reference_id;

-- Add indexes for better performance
ALTER TABLE staff_notifications 
ADD INDEX idx_reference_id (reference_id);

ALTER TABLE staff_notifications 
ADD INDEX idx_reference_type (reference_type);

-- Show final table structure
DESCRIBE staff_notifications;

-- ════════════════════════════════════════════════════════════════════════════════
-- NOTES:
-- - If you get "Duplicate column name" errors, that's GOOD - it means the columns
--   already exist and you can ignore the error
-- - If you get "Duplicate key name" errors, that's also fine - indexes exist
-- - The final DESCRIBE command will show all columns successfully
-- ════════════════════════════════════════════════════════════════════════════════
