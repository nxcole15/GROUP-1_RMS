-- Migration: Add audit columns to grade_submission_config table
-- Date: 2024-11-03
-- Description: Add opened_at, opened_by, closed_at, closed_by columns for tracking

-- Add audit columns for tracking who opened/closed submission windows
ALTER TABLE grade_submission_config
ADD COLUMN opened_by VARCHAR(20) NULL AFTER is_open,
ADD COLUMN opened_at DATETIME NULL AFTER opened_by,
ADD COLUMN closed_by VARCHAR(20) NULL AFTER opened_at,
ADD COLUMN closed_at DATETIME NULL AFTER closed_by;

-- Update comment
ALTER TABLE grade_submission_config
COMMENT = 'Configuration table for grade submission windows with audit trail';
