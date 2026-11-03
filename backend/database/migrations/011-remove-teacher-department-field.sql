-- Migration: Remove unused department field from teachers table
-- Date: 2024-11-03
-- Description: The department field is unused and always shows "Unassigned"

-- Remove department column from teachers table
ALTER TABLE teachers 
DROP COLUMN IF EXISTS department;
