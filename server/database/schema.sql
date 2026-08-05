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

