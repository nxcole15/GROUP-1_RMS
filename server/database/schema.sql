-- ============================================================
-- Smart Student Service – MySQL Schema
-- Run once to create all tables.
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_student_service
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE smart_student_service;

-- ── Students ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id      VARCHAR(12)  NOT NULL UNIQUE,
  password        VARCHAR(255) NOT NULL,
  full_name       VARCHAR(100) NOT NULL,
  pathway         VARCHAR(50)  NOT NULL,
  grade_level     TINYINT UNSIGNED NOT NULL DEFAULT 11,
  term            VARCHAR(50)  NOT NULL,
  email           VARCHAR(100) NOT NULL,
  device_token    TEXT         NULL,                                                                                                                                           
  failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until    DATETIME     NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Teachers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_id  VARCHAR(20)  NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  full_name   VARCHAR(100) NOT NULL,
  department  VARCHAR(100) NOT NULL,
  email       VARCHAR(100) NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Admins ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id   VARCHAR(20)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  full_name  VARCHAR(100) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'admin',
  email      VARCHAR(100) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Subjects ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(20)  NOT NULL UNIQUE,
  name            VARCHAR(100) NOT NULL,
  units           TINYINT UNSIGNED NOT NULL DEFAULT 3,
  teacher_id      INT UNSIGNED NOT NULL,
  max_capacity    SMALLINT UNSIGNED NOT NULL DEFAULT 40,
  enrolled_count  SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- ── Enrollments ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id       VARCHAR(12)  NOT NULL,
  term             VARCHAR(50)  NOT NULL,
  status           ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT         NULL,
  admin_id         VARCHAR(20)  NULL,
  admin_timestamp  DATETIME     NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_term (student_id, term),
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ── Enrollment subjects (many-to-many) ───────────────────────
CREATE TABLE IF NOT EXISTS enrollment_subjects (
  enrollment_id INT UNSIGNED NOT NULL,
  subject_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (enrollment_id, subject_id),
  FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id)    REFERENCES subjects(id)
);

-- ── Grades ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS grades (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id  VARCHAR(12)  NOT NULL,
  subject_id  INT UNSIGNED NOT NULL,
  teacher_id  INT UNSIGNED NOT NULL,
  percentage  DECIMAL(5,2) NOT NULL,
  term        VARCHAR(50)  NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_grade (student_id, subject_id, term),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- ── Attendance ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id     VARCHAR(12)  NOT NULL,
  subject_id     INT UNSIGNED NOT NULL,
  total_meetings SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  days_present   SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  term           VARCHAR(50)  NOT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance (student_id, subject_id, term),
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ── Payments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id      VARCHAR(12)   NOT NULL,
  fee_item        VARCHAR(100)  NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  status          ENUM('pending','verified') NOT NULL DEFAULT 'pending',
  paid_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  admin_id        VARCHAR(20)   NULL,
  admin_timestamp DATETIME      NULL,
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ── Documents ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference_number      VARCHAR(30)  NOT NULL UNIQUE,
  student_id            VARCHAR(12)  NOT NULL,
  document_type         VARCHAR(60)  NOT NULL,
  purpose               TEXT         NOT NULL,
  copies                TINYINT UNSIGNED NOT NULL DEFAULT 1,
  status                ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  rejection_reason      TEXT         NULL,
  expected_release_date DATE         NULL,
  admin_id              VARCHAR(20)  NULL,
  admin_timestamp       DATETIME     NULL,
  created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ── Notifications ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(12)  NOT NULL,
  message    TEXT         NOT NULL,
  type       ENUM('enrollment','payment','document','grade','system') NOT NULL,
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

-- ── Audit Log ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id          VARCHAR(20)  NOT NULL,
  action            VARCHAR(50)  NOT NULL,
  target_request_id INT UNSIGNED NOT NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Enrollment Config ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollment_config (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  active_term     VARCHAR(50)  NOT NULL,
  deadline        DATETIME     NOT NULL
);

-- ── Schedule ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedule (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  subject_id  INT UNSIGNED NOT NULL,
  day         ENUM('Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL,
  time_start  TIME NOT NULL,
  time_end    TIME NOT NULL,
  room        VARCHAR(50) NOT NULL DEFAULT 'TBA',
  FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ── Grade Requests ───────────────────────────────────────────
-- Tracks the full grade request lifecycle:
-- student_requested → teacher_calculating → registrar_review
--   → principal_review → principal_approved → registrar_released
--   → released_to_student  (or back to teacher_calculating on rejection)
CREATE TABLE IF NOT EXISTS grade_requests (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id       VARCHAR(12)  NOT NULL,
  subject_id       INT UNSIGNED NOT NULL,
  teacher_id       INT UNSIGNED NOT NULL,
  term             ENUM('Term 1','Term 2','Term 3') NOT NULL,
  status           ENUM(
                     'student_requested',
                     'teacher_calculating',
                     'teacher_submitted',
                     'registrar_review',
                     'principal_review',
                     'principal_approved',
                     'registrar_released',
                     'teacher_released',
                     'released_to_student',
                     'rejected'
                   ) NOT NULL DEFAULT 'student_requested',
  score            DECIMAL(5,2)  NULL,
  letter_grade     VARCHAR(10)   NULL,
  remarks          TEXT          NULL,
  registrar_note   TEXT          NULL,
  principal_note   TEXT          NULL,
  rejection_reason TEXT          NULL,
  rejected_by      VARCHAR(20)   NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);

-- ── Staff Notifications ──────────────────────────────────────
-- In-app notifications for teachers, registrars, and principals
-- used by the grade request workflow.
CREATE TABLE IF NOT EXISTS staff_notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient   VARCHAR(20)  NOT NULL,              -- teacher_id or admin_id
  role        VARCHAR(20)  NOT NULL,              -- 'teacher', 'registrar', 'principal'
  title       VARCHAR(150) NOT NULL,
  message     TEXT         NOT NULL,
  type        VARCHAR(50)  NOT NULL DEFAULT 'grade_request',
  is_read     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Grade Request Config ─────────────────────────────────────
-- Controls which terms have grade requests open/closed.
-- Seed one row per term; principals toggle is_open via the dashboard.
CREATE TABLE IF NOT EXISTS grade_request_config (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  term        ENUM('Term 1','Term 2','Term 3') NOT NULL UNIQUE,
  is_open     TINYINT(1)   NOT NULL DEFAULT 0,
  opened_by   VARCHAR(20)  NULL,
  opened_at   DATETIME     NULL,
  closed_by   VARCHAR(20)  NULL,
  closed_at   DATETIME     NULL
);

-- Seed the three term rows so the config table is never empty
INSERT IGNORE INTO grade_request_config (term, is_open)
VALUES ('Term 1', 0), ('Term 2', 0), ('Term 3', 0);

-- ── Enrollment Applications ──────────────────────────────────
-- Stores public enrollment form submissions BEFORE a student
-- account is created. Flow:
--   submitted → registrar_review → principal_review
--   → approved (account + email sent) | rejected
CREATE TABLE IF NOT EXISTS enrollment_applications (
  id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  -- Student personal info
  first_name              VARCHAR(60)  NOT NULL,
  last_name               VARCHAR(60)  NOT NULL,
  middle_name             VARCHAR(60)  NULL,
  extension_name          VARCHAR(10)  NULL,
  email                   VARCHAR(100) NOT NULL,
  phone                   VARCHAR(30)  NOT NULL,
  date_of_birth           DATE         NOT NULL,
  gender                  VARCHAR(20)  NOT NULL,
  civil_status            VARCHAR(20)  NULL,
  nationality             VARCHAR(50)  NOT NULL,
  religion                VARCHAR(50)  NULL,
  address                 TEXT         NOT NULL,

  -- Academic info
  student_status          ENUM('new','returning') NOT NULL DEFAULT 'new',
  existing_student_id     VARCHAR(20)  NULL,   -- filled only for returning students
  pathway                 VARCHAR(60)  NOT NULL,
  grade_level             TINYINT UNSIGNED NOT NULL,
  learning_modality       VARCHAR(40)  NOT NULL,

  -- Family info (optional)
  father_name             VARCHAR(100) NULL,
  father_occupation       VARCHAR(100) NULL,
  mother_name             VARCHAR(100) NULL,
  mother_occupation       VARCHAR(100) NULL,
  guardian_name           VARCHAR(100) NULL,
  guardian_relation       VARCHAR(60)  NULL,
  guardian_phone          VARCHAR(30)  NULL,

  -- Previous school (optional)
  previous_school         VARCHAR(150) NULL,
  previous_school_address TEXT         NULL,
  years_attended          VARCHAR(30)  NULL,

  -- Workflow
  status                  ENUM('submitted','registrar_review','principal_review','approved','rejected')
                          NOT NULL DEFAULT 'submitted',
  registrar_note          TEXT         NULL,
  principal_note          TEXT         NULL,
  rejection_reason        TEXT         NULL,
  reviewed_by_registrar   VARCHAR(20)  NULL,
  reviewed_by_principal   VARCHAR(20)  NULL,
  registrar_reviewed_at   DATETIME     NULL,
  principal_reviewed_at   DATETIME     NULL,

  -- Generated on approval
  generated_student_id    VARCHAR(20)  NULL,
  temp_password           VARCHAR(20)  NULL,
  credentials_sent_at     DATETIME     NULL,

  created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

