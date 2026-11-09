-- ════════════════════════════════════════════════════════════════════════════════
-- QUICK FIX: Add Missing Columns to staff_notifications Table
-- Copy and paste this entire block into Railway MySQL Query tab
-- ════════════════════════════════════════════════════════════════════════════════

-- Add title column (check if exists first)
SET @dbname = DATABASE();
SET @tablename = 'staff_notifications';
SET @columnname = 'title';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT "Column title already exists" AS message',
  'ALTER TABLE staff_notifications ADD COLUMN title VARCHAR(255) DEFAULT NULL AFTER message'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add reference_id column (check if exists first)
SET @columnname = 'reference_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT "Column reference_id already exists" AS message',
  'ALTER TABLE staff_notifications ADD COLUMN reference_id INT DEFAULT NULL AFTER type'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add reference_type column (check if exists first)
SET @columnname = 'reference_type';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT "Column reference_type already exists" AS message',
  'ALTER TABLE staff_notifications ADD COLUMN reference_type VARCHAR(50) DEFAULT NULL AFTER reference_id'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add indexes (these will silently skip if they exist)
CREATE INDEX IF NOT EXISTS idx_reference_id ON staff_notifications(reference_id);
CREATE INDEX IF NOT EXISTS idx_reference_type ON staff_notifications(reference_type);

-- Verify the fix worked
SELECT '✅ Fix applied successfully!' AS status;
DESCRIBE staff_notifications;

-- ════════════════════════════════════════════════════════════════════════════════
-- After running this:
-- 1. You should see all columns listed, including the new ones
-- 2. Restart your Railway backend service
-- 3. Test enrollment application submission
-- 4. Check logs - notification errors should be gone!
-- ════════════════════════════════════════════════════════════════════════════════
