/**
 * database/migrate.js
 * Creates all tables and seeds initial data.
 * Run once:  node database/migrate.js
 */

require("dotenv").config();
const mysql  = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const env    = require("../config/env");

async function migrate() {
  // Connect without a database first so we can CREATE it
  const conn = await mysql.createConnection({
    host:               env.DB_HOST,
    port:               env.DB_PORT,
    user:               env.DB_USER,
    password:           env.DB_PASSWORD,
    multipleStatements: true,
  });

  console.log("✅  Connected to MySQL");

  // ── Drop & recreate database (guaranteed clean slate) ───────
  await conn.query(`DROP DATABASE IF EXISTS \`${env.DB_NAME}\``);
  await conn.query(
    `CREATE DATABASE \`${env.DB_NAME}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.query(`USE \`${env.DB_NAME}\``);
  console.log(`✅  Recreated database: ${env.DB_NAME}`);

  // ── Create tables ────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE students (
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
    )
  `);

  await conn.query(`
    CREATE TABLE teachers (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      teacher_id  VARCHAR(20)  NOT NULL UNIQUE,
      password    VARCHAR(255) NOT NULL,
      full_name   VARCHAR(100) NOT NULL,
      department  VARCHAR(100) NOT NULL,
      email       VARCHAR(100) NOT NULL,
      created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE admins (
      id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      admin_id   VARCHAR(20)  NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      full_name  VARCHAR(100) NOT NULL,
      role       VARCHAR(20)  NOT NULL DEFAULT 'admin',
      email      VARCHAR(100) NOT NULL,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE subjects (
      id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      code           VARCHAR(20)  NOT NULL UNIQUE,
      name           VARCHAR(100) NOT NULL,
      units          TINYINT UNSIGNED NOT NULL DEFAULT 3,
      teacher_id     INT UNSIGNED NOT NULL,
      max_capacity   SMALLINT UNSIGNED NOT NULL DEFAULT 40,
      enrolled_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
      created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    )
  `);

  await conn.query(`
    CREATE TABLE enrollments (
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
    )
  `);

  await conn.query(`
    CREATE TABLE enrollment_subjects (
      enrollment_id INT UNSIGNED NOT NULL,
      subject_id    INT UNSIGNED NOT NULL,
      PRIMARY KEY (enrollment_id, subject_id),
      FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id)    REFERENCES subjects(id)
    )
  `);

  await conn.query(`
    CREATE TABLE grades (
      id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(12)  NOT NULL,
      subject_id INT UNSIGNED NOT NULL,
      teacher_id INT UNSIGNED NOT NULL,
      percentage DECIMAL(5,2) NOT NULL,
      term       VARCHAR(50)  NOT NULL,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_grade (student_id, subject_id, term),
      FOREIGN KEY (student_id) REFERENCES students(student_id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    )
  `);

  await conn.query(`
    CREATE TABLE attendance (
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
    )
  `);

  await conn.query(`
    CREATE TABLE payments (
      id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      student_id      VARCHAR(12)   NOT NULL,
      fee_item        VARCHAR(100)  NOT NULL,
      amount          DECIMAL(12,2) NOT NULL,
      status          ENUM('pending','verified') NOT NULL DEFAULT 'pending',
      paid_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
      admin_id        VARCHAR(20)   NULL,
      admin_timestamp DATETIME      NULL,
      FOREIGN KEY (student_id) REFERENCES students(student_id)
    )
  `);

  await conn.query(`
    CREATE TABLE documents (
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
    )
  `);

  await conn.query(`
    CREATE TABLE notifications (
      id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(12)  NOT NULL,
      message    TEXT         NOT NULL,
      type       ENUM('enrollment','payment','document','grade','system') NOT NULL,
      is_read    TINYINT(1)   NOT NULL DEFAULT 0,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(student_id)
    )
  `);

  await conn.query(`
    CREATE TABLE audit_log (
      id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      admin_id          VARCHAR(20)  NOT NULL,
      action            VARCHAR(50)  NOT NULL,
      target_request_id INT UNSIGNED NOT NULL,
      created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE enrollment_config (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      active_term VARCHAR(50)  NOT NULL,
      deadline    DATETIME     NOT NULL
    )
  `);

  console.log("✅  All tables created");

  await conn.query(`
  CREATE TABLE schedule (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_id  INT UNSIGNED NOT NULL,
    day         ENUM('Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL,
    time_start  TIME NOT NULL,
    time_end    TIME NOT NULL,
    room        VARCHAR(50) NOT NULL DEFAULT 'TBA',
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
  )
`);
console.log("✅  Schedule table created");

await conn.query(`
  CREATE TABLE grade_requests (
    id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id         VARCHAR(12)  NOT NULL,
    subject_id         INT UNSIGNED NOT NULL,
    teacher_id         INT UNSIGNED NOT NULL,
    term               VARCHAR(50)  NOT NULL,
    status             ENUM(
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
    score              DECIMAL(5,2) NULL,
    letter_grade       VARCHAR(5)   NULL,
    remarks            TEXT         NULL,
    rejection_reason   TEXT         NULL,
    rejected_by        VARCHAR(20)  NULL,
    principal_note     TEXT         NULL,
    registrar_note     TEXT         NULL,
    created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
  )
`);
console.log("✅  Grade requests table created");

await conn.query(`
  CREATE TABLE grade_request_config (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    term        VARCHAR(50) NOT NULL UNIQUE,
    is_open     TINYINT(1)  NOT NULL DEFAULT 0,
    opened_by   VARCHAR(20) NULL,
    opened_at   DATETIME    NULL,
    closed_by   VARCHAR(20) NULL,
    closed_at   DATETIME    NULL
  )
`);
console.log("✅  Grade request config table created");

await conn.query(`
  CREATE TABLE staff_notifications (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    recipient   VARCHAR(20)  NOT NULL COMMENT 'teacher_id or admin_id',
    role        ENUM('teacher','registrar','principal') NOT NULL,
    title       VARCHAR(100) NOT NULL,
    message     TEXT         NOT NULL,
    type        VARCHAR(40)  NOT NULL DEFAULT 'grade_request',
    is_read     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);
console.log("✅  Staff notifications table created");


  const teachers = [
    ["T001", await bcrypt.hash("teacher001", 10), "Dr. Rosa Mendoza",   "Computer Science", "r.mendoza@inform.edu"],
    ["T002", await bcrypt.hash("teacher002", 10), "Prof. Ben Aquino",   "General Mathworld",      "b.aquino@inform.edu"],
    ["T003", await bcrypt.hash("teacher003", 10), "Ms. Clara Tan",      "English 101",          "c.tan@inform.edu"],
    ["T004", await bcrypt.hash("teacher004", 10), "Mr. Carlos Reyes",   "Science",          "c.reyes@inform.edu"],
  ];
  for (const t of teachers) {
    await conn.query(
      `INSERT INTO teachers (teacher_id, password, full_name, department, email)
       VALUES (?, ?, ?, ?, ?)`, t
    );
  }
  console.log("✅  Teachers seeded");

  // ── Seed: Admins ─────────────────────────────────────────────
  const admins = [
    ["ADMIN001", await bcrypt.hash("principal2026",  10), "School Principal",  "principal",  "principal@cfei.edu"],
    ["ADMIN002", await bcrypt.hash("registrar2026",  10), "Registrar Office",  "registrar",  "registrar@cfei.edu"],
    ["ADMIN003", await bcrypt.hash("accounting2026", 10), "Accounting Office", "accounting", "accounting@cfei.edu"],
  ];
  for (const a of admins) {
    await conn.query(
      `INSERT INTO admins (admin_id, password, full_name, role, email)
       VALUES (?, ?, ?, ?, ?)`, a
    );
  }
  console.log("✅  Admins seeded");

  // ── Seed: Students ───────────────────────────────────────────
  const TERM = "2nd Semester SY 2025-2026";
  const students = [
    ["202500001", await bcrypt.hash("jamie123",  10), "Jamie Santos",    "STEM",        11, TERM, "jamie@student.inform.edu"],
    ["202500002", await bcrypt.hash("maria456",  10), "Maria Reyes",     "HUMMS",       11, TERM, "maria@student.inform.edu"],
    ["202500003", await bcrypt.hash("carlo789",  10), "Carlo Dela Cruz", "ABM",         12, TERM, "carlo@student.inform.edu"],
    ["202500004", await bcrypt.hash("ana2025",   10), "Ana Villanueva",  "TVL-TechPro", 11, TERM, "ana@student.inform.edu"],
    ["202500005", await bcrypt.hash("luis2025",  10), "Luis Fernandez",  "STEM",        12, TERM, "luis@student.inform.edu"],
    ["202500006", await bcrypt.hash("craig2025", 10), "Craig Cabahug O", "TVL-TechPro", 12, TERM, "craig@student.inform.edu"], 
  ];
  for (const s of students) {
    await conn.query(
      `INSERT INTO students
         (student_id, password, full_name, pathway, grade_level, term, email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, s
    );
  }
  console.log("✅  Students seeded");

  // ── Seed: Subjects (teacher PKs are 1-4) ─────────────────────
  const subjects = [
    ["CS401",   "Software Engineering",   3, 1, 40, 38],
    ["CS402",   "Database Systems",       3, 1, 40, 40],
    ["MATH301", "Discrete Mathematics",   3, 2, 35, 20],
    ["ENG201",  "Technical Writing",      3, 3, 30, 15],
    ["CS403",   "Operating Systems",      3, 1, 40, 10],
    ["SCI301",  "General Biology",        3, 4, 35,  8],
  ];
  for (const s of subjects) {
    await conn.query(
      `INSERT INTO subjects (code, name, units, teacher_id, max_capacity, enrolled_count)
       VALUES (?, ?, ?, ?, ?, ?)`, s
    );
  }
  console.log("✅  Subjects seeded");

  // ── Seed: Schedule ────────────────────────────────────────────
const scheduleEntries = [
  // subject pk 1 = CS401 (Dr. Rosa Mendoza)
  [1, "Monday",    "07:30:00", "09:00:00", "Room 301"],
  [1, "Wednesday", "07:30:00", "09:00:00", "Room 301"],
  [1, "Friday",    "07:30:00", "09:00:00", "Room 301"],
  // subject pk 2 = CS402
  [2, "Tuesday",   "09:00:00", "10:30:00", "Room 302"],
  [2, "Thursday",  "09:00:00", "10:30:00", "Room 302"],
  // subject pk 3 = MATH301
  [3, "Monday",    "10:00:00", "11:30:00", "Room 205"],
  [3, "Wednesday", "10:00:00", "11:30:00", "Room 205"],
  // subject pk 4 = ENG201
  [4, "Tuesday",   "13:00:00", "14:30:00", "Room 108"],
  [4, "Thursday",  "13:00:00", "14:30:00", "Room 108"],
  // subject pk 5 = CS403
  [5, "Friday",    "10:00:00", "11:30:00", "ICT Lab"],
  // subject pk 6 = SCI301
  [6, "Monday",    "14:00:00", "15:30:00", "Sci. Lab"],
  [6, "Wednesday", "14:00:00", "15:30:00", "Sci. Lab"],
];
for (const [subject_id, day, time_start, time_end, room] of scheduleEntries) {
  await conn.query(
    `INSERT INTO schedule (subject_id, day, time_start, time_end, room) VALUES (?, ?, ?, ?, ?)`,
    [subject_id, day, time_start, time_end, room]
  );
}
console.log("✅  Schedule seeded");


  // ── Seed: Enrollments ────────────────────────────────────────
  // Student 202500001 — approved
  await conn.query(
    `INSERT INTO enrollments (id, student_id, term, status, admin_id, admin_timestamp, created_at)
     VALUES (1, '202500001', ?, 'approved', 'ADMIN001', '2026-01-10 08:00:00', '2026-01-05 10:00:00')`,
    [TERM]
  );
  await conn.query(`INSERT INTO enrollment_subjects VALUES (1,1),(1,3),(1,4)`);

  // Student 202500002 — pending
  await conn.query(
    `INSERT INTO enrollments (id, student_id, term, status, created_at)
     VALUES (2, '202500002', ?, 'pending', '2026-01-06 09:30:00')`,
    [TERM]
  );
  await conn.query(`INSERT INTO enrollment_subjects VALUES (2,3),(2,4)`);

  // Student 202500003 — approved
  await conn.query(
    `INSERT INTO enrollments (id, student_id, term, status, admin_id, admin_timestamp, created_at)
     VALUES (3, '202500003', ?, 'approved', 'ADMIN001', '2026-01-11 08:00:00', '2026-01-07 11:00:00')`,
    [TERM]
  );
  await conn.query(`INSERT INTO enrollment_subjects VALUES (3,1),(3,5)`);
  console.log("✅  Enrollments seeded");

  // ── Seed: Grades ─────────────────────────────────────────────
  const grades = [
    ["202500001", 1, 1, 92.00, TERM],
    ["202500001", 3, 2, 85.00, TERM],
    ["202500001", 4, 3, 78.00, TERM],
    ["202500003", 1, 1, 70.00, TERM],
    ["202500003", 5, 1, 95.00, TERM],
  ];
  for (const g of grades) {
    await conn.query(
      `INSERT INTO grades (student_id, subject_id, teacher_id, percentage, term)
       VALUES (?, ?, ?, ?, ?)`, g
    );
  }
  console.log("✅  Grades seeded");

  // ── Seed: Attendance ─────────────────────────────────────────
  const attendance = [
    ["202500001", 1, 20, 18, TERM],
    ["202500001", 3, 20, 14, TERM],
    ["202500001", 4, 20, 20, TERM],
    ["202500003", 1, 20, 10, TERM],
    ["202500003", 5, 20, 19, TERM],
  ];
  for (const a of attendance) {
    await conn.query(
      `INSERT INTO attendance (student_id, subject_id, total_meetings, days_present, term)
       VALUES (?, ?, ?, ?, ?)`, a
    );
  }
  console.log("✅  Attendance seeded");

  // ── Seed: Payments ───────────────────────────────────────────
  const payments = [
    ["202500001", "Tuition Fee",       15000, "verified", "2026-01-08 10:00:00", "ADMIN002", "2026-01-09 08:00:00"],
    ["202500001", "Miscellaneous Fee",  2500, "verified", "2026-01-08 10:05:00", "ADMIN002", "2026-01-09 08:05:00"],
    ["202500001", "Laboratory Fee",     1500, "pending",  "2026-05-20 14:00:00", null, null],
    ["202500003", "Tuition Fee",       15000, "pending",  "2026-05-19 09:00:00", null, null],
  ];
  for (const p of payments) {
    await conn.query(
      `INSERT INTO payments (student_id, fee_item, amount, status, paid_at, admin_id, admin_timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, p
    );
  }
  console.log("✅  Payments seeded");

  // ── Seed: Documents ──────────────────────────────────────────
  await conn.query(`
    INSERT INTO documents
      (reference_number, student_id, document_type, purpose, copies,
       status, expected_release_date, admin_id, admin_timestamp, created_at)
    VALUES
      ('DOC-20260101-0001', '202500001', 'Certificate of Enrollment',
       'For scholarship application', 2, 'approved', '2026-01-15',
       'ADMIN001', '2026-01-12 10:00:00', '2026-01-10 09:00:00'),
      ('DOC-20260520-0002', '202500001', 'Transcript of Records',
       'For job application', 1, 'pending', NULL,
       NULL, NULL, '2026-05-20 11:00:00')
  `);
  console.log("✅  Documents seeded");

  // ── Seed: Notifications ──────────────────────────────────────
  await conn.query(`
    INSERT INTO notifications (student_id, message, type, is_read, created_at)
    VALUES
      ('202500001', 'Your enrollment for 2nd Semester SY 2025-2026 has been approved.',
       'enrollment', 1, '2026-01-10 08:01:00'),
      ('202500001', 'Your payment of 15,000 (Tuition Fee) has been verified.',
       'payment', 1, '2026-01-09 08:01:00'),
      ('202500001', 'Your document request (Certificate of Enrollment) has been approved. Expected release: January 15, 2026.',
       'document', 0, '2026-01-12 10:01:00')
  `);
  console.log("✅  Notifications seeded");

  // ── Seed: Audit log ──────────────────────────────────────────
  await conn.query(`
    INSERT INTO audit_log (admin_id, action, target_request_id, created_at)
    VALUES
      ('ADMIN001', 'APPROVE_ENROLLMENT', 1, '2026-01-10 08:00:00'),
      ('ADMIN002', 'VERIFY_PAYMENT',     1, '2026-01-09 08:00:00')
  `);
  console.log("✅  Audit log seeded");

  // ── Seed: Enrollment config ──────────────────────────────────
  await conn.query(
    `INSERT INTO enrollment_config (active_term, deadline)
     VALUES (?, '2026-08-15 23:59:59')`,
    [TERM]
  );
  console.log("✅  Enrollment config seeded");

  await conn.query(`
  INSERT INTO grade_request_config (term, is_open) VALUES
  ('Term 1', 0),
  ('Term 2', 0),
  ('Term 3', 0)
`);
console.log("✅  Grade request config seeded");

  // ── Enrollment Applications table ─────────────────────────
  await conn.query(`
    CREATE TABLE enrollment_applications (
      id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
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
      student_status          ENUM('new','returning') NOT NULL DEFAULT 'new',
      existing_student_id     VARCHAR(20)  NULL,
      pathway                 VARCHAR(60)  NOT NULL,
      grade_level             TINYINT UNSIGNED NOT NULL,
      learning_modality       VARCHAR(40)  NOT NULL,
      father_name             VARCHAR(100) NULL,
      father_occupation       VARCHAR(100) NULL,
      mother_name             VARCHAR(100) NULL,
      mother_occupation       VARCHAR(100) NULL,
      guardian_name           VARCHAR(100) NULL,
      guardian_relation       VARCHAR(60)  NULL,
      guardian_phone          VARCHAR(30)  NULL,
      previous_school         VARCHAR(150) NULL,
      previous_school_address TEXT         NULL,
      years_attended          VARCHAR(30)  NULL,
      status                  ENUM('submitted','registrar_review','principal_review','approved','rejected')
                              NOT NULL DEFAULT 'submitted',
      registrar_note          TEXT         NULL,
      principal_note          TEXT         NULL,
      rejection_reason        TEXT         NULL,
      reviewed_by_registrar   VARCHAR(20)  NULL,
      reviewed_by_principal   VARCHAR(20)  NULL,
      registrar_reviewed_at   DATETIME     NULL,
      principal_reviewed_at   DATETIME     NULL,
      generated_student_id    VARCHAR(20)  NULL,
      temp_password           VARCHAR(20)  NULL,
      credentials_sent_at     DATETIME     NULL,
      created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log("✅  Enrollment applications table created");


  console.log("\n🎉  Migration complete — database is ready!");
  console.log("\n📋  Demo credentials:");
  console.log("   Students  : 202500001 / jamie123  |  202500002 / maria456  |  202500003 / carlo789");
  console.log("   Students  : 202500004 / ana2025   |  202500005 / luis2025  |  202500006 / craig2025");
  console.log("   Teachers  : T001 / teacher001  |  T002 / teacher002  |  T003 / teacher003  |  T004 / teacher004");
  console.log("   Admins    : ADMIN001 / principal2026  |  ADMIN002 / registrar2026 | ADMIN003 / accounting2026");

  await conn.end();
}

migrate().catch((err) => {
  console.error("❌  Migration failed:", err.message);
  process.exit(1);
});
