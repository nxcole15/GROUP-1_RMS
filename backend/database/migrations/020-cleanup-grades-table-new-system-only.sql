-- ============================================================
-- Migration 020: Cleanup Grades Table - New System Only (Emergency Pre-Defense)
-- Description: Remove old subject_id system, keep only teacher_schedule_id
-- This eliminates the triple-state confusion in grades table
-- ============================================================

USE smart_student_service;

-- ============================================================
-- PHASE 1: VERIFY NEW SYSTEM IS BEING USED
-- ============================================================

-- Check if grades are using new system
SELECT 
  'Total grades' AS metric,
  COUNT(*) AS count
FROM grades

UNION ALL

SELECT 
  'Using teacher_schedule_id (NEW)' AS metric,
  COUNT(*) AS count
FROM grades 
WHERE teacher_schedule_id IS NOT NULL

UNION ALL

SELECT 
  'Using subject_id only (OLD)' AS metric,
  COUNT(*) AS count
FROM grades 
WHERE subject_id IS NOT NULL AND teacher_schedule_id IS NULL

UNION ALL

SELECT 
  'Using subject_name only (HYBRID)' AS metric,
  COUNT(*) AS count
FROM grades 
WHERE subject_name IS NOT NULL AND teacher_schedule_id IS NULL;

-- ============================================================
-- PHASE 2: DROP OLD FOREIGN KEY CONSTRAINTS
-- ============================================================

-- Drop old subject_id foreign key constraint first (if exists)
SET @old_fk = (
  SELECT CONSTRAINT_NAME 
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'grades'
    AND COLUMN_NAME = 'subject_id'
    AND REFERENCED_TABLE_NAME = 'subjects'
  LIMIT 1
);

SET @query = IF(@old_fk IS NOT NULL,
  CONCAT('ALTER TABLE grades DROP FOREIGN KEY ', @old_fk),
  'SELECT "No old FK to drop" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Phase 2 complete: Old foreign key dropped' AS status;

-- ============================================================
-- PHASE 3: DROP OLD UNIQUE CONSTRAINT
-- ============================================================

-- Now drop the unique constraint (was blocked by FK before)
SET @old_constraint = (
  SELECT CONSTRAINT_NAME 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'grades'
    AND CONSTRAINT_NAME = 'uq_grade'
  LIMIT 1
);

SET @query = IF(@old_constraint IS NOT NULL,
  CONCAT('ALTER TABLE grades DROP INDEX ', @old_constraint),
  'SELECT "No old constraint to drop" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Phase 3 complete: Old unique constraint dropped' AS status;

-- ============================================================
-- PHASE 4: ADD TEACHER_SCHEDULE_ID FOREIGN KEY (if not exists)
-- ============================================================

-- Check if FK already exists
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'grades'
  AND COLUMN_NAME = 'teacher_schedule_id'
  AND REFERENCED_TABLE_NAME = 'teacher_schedules';

-- Add FK if it doesn't exist
SET @query = IF(@fk_exists = 0,
  'ALTER TABLE grades 
   ADD CONSTRAINT fk_grades_teacher_schedule 
   FOREIGN KEY (teacher_schedule_id) REFERENCES teacher_schedules(id) ON DELETE CASCADE',
  'SELECT "FK already exists" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Phase 4 complete: New foreign key added' AS status;

-- ============================================================
-- PHASE 5: DROP OLD SYSTEM COLUMNS
-- ============================================================

-- Drop subject_id column (old system) - safe check
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'grades'
  AND COLUMN_NAME = 'subject_id';

SET @query = IF(@col_exists > 0,
  'ALTER TABLE grades DROP COLUMN subject_id',
  'SELECT "subject_id already dropped" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop subject_name column (redundant - can get from teacher_schedules)
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'grades'
  AND COLUMN_NAME = 'subject_name';

SET @query = IF(@col_exists > 0,
  'ALTER TABLE grades DROP COLUMN subject_name',
  'SELECT "subject_name already dropped" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop strand column (redundant - can get from teacher_schedules)
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'grades'
  AND COLUMN_NAME = 'strand';

SET @query = IF(@col_exists > 0,
  'ALTER TABLE grades DROP COLUMN strand',
  'SELECT "strand already dropped" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Phase 5 complete: Old columns removed' AS status;

-- ============================================================
-- PHASE 6: MAKE TEACHER_SCHEDULE_ID REQUIRED
-- ============================================================

-- Now that old system is gone, make the new system required
ALTER TABLE grades 
MODIFY COLUMN teacher_schedule_id INT UNSIGNED NOT NULL;

SELECT 'Phase 6 complete: teacher_schedule_id is now required' AS status;

-- ============================================================
-- PHASE 7: ADD NEW UNIQUE CONSTRAINT (based on new system)
-- ============================================================

-- Add new constraint: student + teacher_schedule + term = unique
-- This prevents duplicate grades for same student in same class

SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'grades'
  AND INDEX_NAME = 'uq_grade_new_system';

SET @query = IF(@idx_exists = 0,
  'ALTER TABLE grades ADD UNIQUE KEY uq_grade_new_system (student_internal_id, teacher_schedule_id, term)',
  'SELECT "Unique constraint already exists" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if index exists
SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'grades'
  AND INDEX_NAME = 'idx_grades_teacher_schedule';

-- Add index if it doesn't exist
SET @query = IF(@idx_exists = 0,
  'CREATE INDEX idx_grades_teacher_schedule ON grades(teacher_schedule_id)',
  'SELECT "Index already exists" AS message'
);
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Phase 7 complete: Indexes added' AS status;

-- ============================================================
-- PHASE 8: VERIFY FINAL STATE
-- ============================================================

-- Show current grades table structure
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_KEY,
  EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'grades'
  AND COLUMN_NAME IN ('student_internal_id', 'teacher_schedule_id', 'percentage', 'term')
ORDER BY ORDINAL_POSITION;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

SELECT '✅ Migration 020 complete!' AS status;
SELECT 'Grades table now uses ONLY teacher_schedules (new system)' AS info;
SELECT 'Old subject_id, subject_name, strand columns removed' AS cleanup;
SELECT 'No more triple-state confusion!' AS benefit;
