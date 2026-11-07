-- ============================================================
-- Migration 015: Remove Adviser Functionality
-- Description: Drop student_adviser_assignments table and remove adviser-related columns
-- ============================================================

-- Drop the student_adviser_assignments table
DROP TABLE IF EXISTS student_adviser_assignments;

-- Note: track and strand columns in students table are kept as they may be used
-- for other purposes beyond adviser assignment

SELECT 'Migration 015: Adviser functionality removed successfully!' AS status;
