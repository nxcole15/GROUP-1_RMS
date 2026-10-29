-- ============================================================
-- Migration 008: Add default_amount to fee_items
-- Allows Accounting to set standard amounts for each fee item
-- ============================================================

USE smart_student_service;

-- Add default_amount column to fee_items
ALTER TABLE fee_items 
ADD COLUMN default_amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER description;

