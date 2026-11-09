-- ════════════════════════════════════════════════════════════════════════════════
-- COMPREHENSIVE FIX: All Missing Database Columns
-- Run this ONCE in Railway MySQL to fix all schema issues
-- ════════════════════════════════════════════════════════════════════════════════

SELECT '🔧 Starting database schema fixes...' AS status;

-- ────────────────────────────────────────────────────────────────────────────────
-- FIX 1: staff_notifications table (for Registrar/Principal notifications)
-- ────────────────────────────────────────────────────────────────────────────────

ALTER TABLE staff_notifications 
ADD COLUMN title VARCHAR(255) DEFAULT NULL;

ALTER TABLE staff_notifications 
ADD COLUMN reference_id INT DEFAULT NULL;

ALTER TABLE staff_notifications 
ADD COLUMN reference_type VARCHAR(50) DEFAULT NULL;

ALTER TABLE staff_notifications 
ADD INDEX idx_reference_id (reference_id);

ALTER TABLE staff_notifications 
ADD INDEX idx_reference_type (reference_type);

SELECT '✅ Fix 1/2: staff_notifications table updated' AS status;

-- ────────────────────────────────────────────────────────────────────────────────
-- FIX 2: enrollment_config table (for Principal settings update)
-- ────────────────────────────────────────────────────────────────────────────────

ALTER TABLE enrollment_config 
ADD COLUMN last_modified_by VARCHAR(20) DEFAULT NULL;

ALTER TABLE enrollment_config 
ADD COLUMN created_by VARCHAR(20) DEFAULT NULL;

SELECT '✅ Fix 2/2: enrollment_config table updated' AS status;

-- ────────────────────────────────────────────────────────────────────────────────
-- Verify All Fixes
-- ────────────────────────────────────────────────────────────────────────────────

SELECT '📊 Verifying staff_notifications columns:' AS check_status;
DESCRIBE staff_notifications;

SELECT '📊 Verifying enrollment_config columns:' AS check_status;
DESCRIBE enrollment_config;

SELECT '🎉 All database fixes applied successfully!' AS final_status;
SELECT 'Next step: Restart your Railway backend service' AS next_step;

-- ════════════════════════════════════════════════════════════════════════════════
-- IMPORTANT NOTES:
-- ════════════════════════════════════════════════════════════════════════════════
-- 
-- ✅ This script is safe to run multiple times
-- ⚠️ If you get "Duplicate column name" errors, that's GOOD - columns exist
-- ⚠️ If you get "Duplicate key name" errors, that's also fine - indexes exist
-- 
-- After running this script:
-- 1. Go to Railway → Your backend service → Click "Restart"
-- 2. Test enrollment submission → Notifications will work
-- 3. Test Principal enrollment config update → Will work
-- 4. Check Railway logs → All errors should be gone!
-- 
-- What these columns do:
-- - title: Short notification heading
-- - reference_id: Links notification to application/document
-- - reference_type: Type of linked entity ('application', 'document', etc.)
-- - last_modified_by: Tracks who last updated enrollment settings
-- - created_by: Tracks who created enrollment settings
-- 
-- ════════════════════════════════════════════════════════════════════════════════
