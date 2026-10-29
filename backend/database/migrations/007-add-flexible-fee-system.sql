-- ============================================================
-- Migration 007: Add Flexible Student Fee Assessment System
-- Allows Accounting to define custom fee items and assign them to students
-- ============================================================

USE smart_student_service;

-- Fee Items Definition - Accounting defines what fee types exist
CREATE TABLE IF NOT EXISTS fee_items (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_name       VARCHAR(100)  NOT NULL UNIQUE,  -- e.g., "Tuition Fee", "Lab Fee"
  description     VARCHAR(255)  NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_by      VARCHAR(20)   NOT NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_active (is_active)
);

-- Student Fee Assessments - The total assessment assigned to a student
CREATE TABLE IF NOT EXISTS student_assessments (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id      VARCHAR(12)   NOT NULL,
  school_year     VARCHAR(20)   NOT NULL,
  term            VARCHAR(20)   NOT NULL,
  
  total_assessment DECIMAL(10,2) NOT NULL DEFAULT 0,  -- Will be sum of all line items
  
  -- Discount/Scholarship support
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_reason VARCHAR(200)  NULL,
  
  -- Net amount after discount
  net_assessment  DECIMAL(10,2) GENERATED ALWAYS AS 
    (total_assessment - discount_amount) STORED,
  
  -- Metadata
  assessed_by     VARCHAR(20)   NOT NULL,
  assessed_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notes           TEXT          NULL,
  
  UNIQUE KEY unique_student_assessment (student_id, school_year, term),
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  INDEX idx_year_term (school_year, term)
);

-- Assessment Line Items - Individual fee items for each assessment
CREATE TABLE IF NOT EXISTS assessment_line_items (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assessment_id   INT UNSIGNED  NOT NULL,
  fee_item_id     INT UNSIGNED  NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  
  FOREIGN KEY (assessment_id) REFERENCES student_assessments(id) ON DELETE CASCADE,
  FOREIGN KEY (fee_item_id) REFERENCES fee_items(id),
  INDEX idx_assessment (assessment_id)
);

-- No seed data - accounting will define fee items and create assessments via the dashboard
