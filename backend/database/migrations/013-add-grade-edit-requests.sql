-- ============================================================
-- Migration 013: Grade Edit Requests System
-- Description: Allow teachers to request permission to edit 
-- already-submitted grades with Principal approval
-- ============================================================

-- Create grade_edit_requests table
CREATE TABLE IF NOT EXISTS grade_edit_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- Request identification
  teacher_id INT UNSIGNED NOT NULL,
  student_id VARCHAR(12) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  strand VARCHAR(100) NULL,
  term ENUM('Term 1', 'Term 2', 'Term 3') NOT NULL,
  
  -- Grade information
  original_grade DECIMAL(5,2) NOT NULL,
  proposed_grade DECIMAL(5,2) NULL,
  reason TEXT NOT NULL,
  
  -- Approval workflow
  status ENUM('pending', 'approved', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
  approved_by VARCHAR(20) NULL,
  approved_at DATETIME NULL,
  rejected_by VARCHAR(20) NULL,
  rejected_at DATETIME NULL,
  rejection_reason TEXT NULL,
  
  -- Correction tracking
  corrected_grade DECIMAL(5,2) NULL,
  corrected_at DATETIME NULL,
  completed_at DATETIME NULL,
  
  -- Timestamps
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_teacher (teacher_id),
  INDEX idx_student (student_id),
  INDEX idx_status (status),
  INDEX idx_term (term),
  INDEX idx_created (created_at),
  
  -- Foreign keys
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create audit log for grade corrections
CREATE TABLE IF NOT EXISTS grade_edit_audit (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  
  -- Reference to the edit request
  edit_request_id INT UNSIGNED NOT NULL,
  
  -- What was changed
  student_id VARCHAR(12) NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  strand VARCHAR(100) NULL,
  term ENUM('Term 1', 'Term 2', 'Term 3') NOT NULL,
  original_grade DECIMAL(5,2) NOT NULL,
  new_grade DECIMAL(5,2) NOT NULL,
  
  -- Who made changes
  corrected_by INT UNSIGNED NOT NULL COMMENT 'Teacher ID who made the correction',
  approved_by VARCHAR(20) NOT NULL COMMENT 'Principal admin_id who approved',
  
  -- Why it was changed
  reason TEXT NOT NULL,
  
  -- When it happened
  approved_at DATETIME NOT NULL,
  corrected_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_student (student_id),
  INDEX idx_term (term),
  INDEX idx_corrected_date (corrected_at),
  
  -- Foreign keys
  FOREIGN KEY (edit_request_id) REFERENCES grade_edit_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (corrected_by) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'Migration 013: Grade Edit Requests System completed successfully!' AS status;
