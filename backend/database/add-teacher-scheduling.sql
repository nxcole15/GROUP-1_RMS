-- ============================================================
-- Teacher Scheduling & Student Enrollment System
-- Allows registrars to assign schedules to teachers and enroll students
-- ============================================================

USE smart_student_service;

-- Create teacher schedules table (class offerings)
CREATE TABLE IF NOT EXISTS teacher_schedules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT UNSIGNED NOT NULL,
  subject_name VARCHAR(100) NOT NULL,
  room VARCHAR(50) NOT NULL,
  day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  track ENUM('Academic Track', 'TechPro Track') NOT NULL,
  strand VARCHAR(50) NOT NULL COMMENT 'STEM, HUMMS, ABM, GAS, ICT, Cookery',
  term ENUM('Term 1', 'Term 2', 'Term 3') NOT NULL,
  school_year VARCHAR(20) NOT NULL COMMENT 'e.g. 2026-2027',
  max_capacity SMALLINT UNSIGNED NOT NULL DEFAULT 40,
  enrolled_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(20) NULL COMMENT 'Admin who created this schedule',
  
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
  INDEX idx_teacher (teacher_id),
  INDEX idx_term_year (term, school_year),
  INDEX idx_track_strand (track, strand),
  INDEX idx_day_time (day, time_start)
);

-- Create student schedule enrollments table
CREATE TABLE IF NOT EXISTS student_schedule_enrollments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(12) NOT NULL,
  teacher_schedule_id INT UNSIGNED NOT NULL,
  enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  enrolled_by VARCHAR(20) NULL COMMENT 'Admin who enrolled the student',
  
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_schedule_id) REFERENCES teacher_schedules(id) ON DELETE CASCADE,
  
  -- Prevent duplicate enrollments
  UNIQUE KEY uq_student_schedule (student_id, teacher_schedule_id),
  
  INDEX idx_student (student_id),
  INDEX idx_schedule (teacher_schedule_id)
);

-- Add trigger to update enrolled_count when student enrolls
DELIMITER $$

CREATE TRIGGER after_student_enrollment_insert
AFTER INSERT ON student_schedule_enrollments
FOR EACH ROW
BEGIN
  UPDATE teacher_schedules
  SET enrolled_count = enrolled_count + 1
  WHERE id = NEW.teacher_schedule_id;
END$$

CREATE TRIGGER after_student_enrollment_delete
AFTER DELETE ON student_schedule_enrollments
FOR EACH ROW
BEGIN
  UPDATE teacher_schedules
  SET enrolled_count = enrolled_count - 1
  WHERE id = OLD.teacher_schedule_id;
END$$

DELIMITER ;
