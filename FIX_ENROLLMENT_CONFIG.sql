-- ════════════════════════════════════════════════════════════════════════════════
-- FIX: Add Missing Columns to enrollment_config Table
-- Run this in Railway MySQL to fix Principal enrollment config update error
-- ════════════════════════════════════════════════════════════════════════════════

-- Add last_modified_by column (main fix for the error)
ALTER TABLE enrollment_config 
ADD COLUMN last_modified_by VARCHAR(20) DEFAULT NULL;

-- Add created_by column (also in migration, may be missing)
ALTER TABLE enrollment_config 
ADD COLUMN created_by VARCHAR(20) DEFAULT NULL;

-- Verify the fix
DESCRIBE enrollment_config;

SELECT '✅ Fix applied! Principal can now update enrollment config.' AS status;

-- ════════════════════════════════════════════════════════════════════════════════
-- NOTES:
-- - If you get "Duplicate column name" error, the column already exists (good!)
-- - After running this, restart Railway backend
-- - Principal can now update enrollment config successfully
-- - These columns track who created/modified the enrollment settings
-- ════════════════════════════════════════════════════════════════════════════════
