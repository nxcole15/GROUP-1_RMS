/**
 * database/migrate.js
 * Creates all tables and seeds initial data.
 * Run once:  node database/migrate.js
 */

const mysql  = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const env = {
  ...process.env,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME || 'smart_student_service',
  SUPER_ADMIN_ID: process.env.SUPER_ADMIN_ID || 'SUPERADMIN',
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2026',
};

async function migrate() {
  // Connect without a database first so we can CREATE it
  const conn = await mysql.createConnection({
    host:               env.DB_HOST || 'localhost',
    port:               parseInt(env.DB_PORT) || 3306,
    user:               env.DB_USER || 'root',
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
      account_status  ENUM('pending','active', 'suspended')
                      NOT NULL DEFAULT 'pending',
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
      is_archived TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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


  // ── Seed: Super Admin Only ─────────────────────────────────────
  const superAdminId = env.SUPER_ADMIN_ID || "SUPERADMIN";
  const superAdminPassword = env.SUPER_ADMIN_PASSWORD || "SuperAdmin@2026";

  const [existingSuperAdmin] = await conn.query(
    "SELECT id FROM admins WHERE admin_id = ? LIMIT 1",
    [superAdminId]
  );

  if (!existingSuperAdmin.length) {
    await conn.query(
      `INSERT INTO admins (admin_id, password, full_name, role, email)
       VALUES (?, ?, ?, ?, ?)`,
      [superAdminId, await bcrypt.hash(superAdminPassword, 10), "System Super Administrator", "super_admin", "superadmin@cfei.edu"]
    );
    console.log("✅  Super administrator seeded");
  } else {
    console.log("✅  Super administrator already exists");
  }

  console.log("\n🔐  Super admin login:");
  console.log(`   ${superAdminId} / ${superAdminPassword}`);
  console.log("   Keep these values in your server .env file and rotate them before production use.");

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
  console.log("\n✅  Ready for real client setup.");
  console.log("   Use the super admin credentials from your server .env file to create principal, registrar, and accounting accounts.");

  await conn.end();
}

migrate().catch((err) => {
  console.error("❌  Migration failed:", err.message);
  process.exit(1);
});
