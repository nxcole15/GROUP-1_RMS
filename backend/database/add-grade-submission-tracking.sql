-- ============================================================
-- Grade Submission Tracking Schema
-- Implements batch submission workflow with status tracking
-- ============================================================

USE smart_student_service;

-- Add status tracking columns to existing grades table
ALTER TABLE grades 
  ADD COLUMN submission_status ENUM('draft', 'submitted', 'approved', 'returned') NOT NULL DEFAULT 'draft' AFTER percentage,
  ADD COLUMN submitted_at DATETIME NULL AFTER submission_status,
  ADD COLUMN approved_by VARCHAR(20) NULL AFTER submitted_at,
  ADD COLUMN approved_at DATETIME NULL AFTER approved_by,
  ADD COLUMN return_reason TEXT NULL AFTER approved_at,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER return_reason;

-- Create grade submission batches table to track bulk submissions
CREATE TABLE IF NOT EXISTS grade_submission_batches (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT UNSIGNED NOT NULL,
  subject_id INT UNSIGNED NOT NULL,
  term ENUM('Term 1', 'Term 2', 'Term 3') NOT NULL,
  status ENUM('draft', 'submitted', 'approved', 'returned') NOT NULL DEFAULT 'submitted',
  total_students INT UNSIGNED NOT NULL DEFAULT 0,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_by VARCHAR(20) NULL,
  approved_at DATETIME NULL,
  return_reason TEXT NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_submission (teacher_id, subject_id, term),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_term (term)
);

-- Create audit log for grade changes
CREATE TABLE IF NOT EXISTS grade_audit_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  grade_id INT UNSIGNED NOT NULL,
  student_id VARCHAR(12) NOT NULL,
  subject_id INT UNSIGNED NOT NULL,
  term VARCHAR(50) NOT NULL,
  action ENUM('created', 'updated', 'submitted', 'approved', 'returned') NOT NULL,
  old_percentage DECIMAL(5,2) NULL,
  new_percentage DECIMAL(5,2) NULL,
  old_status VARCHAR(20) NULL,
  new_status VARCHAR(20) NULL,
  changed_by_type ENUM('teacher', 'admin') NOT NULL,
  changed_by_id VARCHAR(20) NOT NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE CASCADE,
  INDEX idx_grade (grade_id),
  INDEX idx_student (student_id),
  INDEX idx_action (action)
);

-- Add index to grades table for better query performance
ALTER TABLE grades 
  ADD INDEX idx_teacher_subject_term (teacher_id, subject_id, term),
  ADD INDEX idx_status (submission_status);
