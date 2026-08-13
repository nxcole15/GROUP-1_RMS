/**
 * database/add_enrollment_applications.js
 * One-time script: adds the enrollment_applications table
 * WITHOUT touching any existing data.
 *
 * Run from the server/ directory:
 *   node database/add_enrollment_applications.js
 */

require("dotenv").config();
const mysql = require("mysql2/promise");
const env   = require("../config/env");

async function run() {
  const conn = await mysql.createConnection({
    host:     env.DB_HOST,
    port:     env.DB_PORT || 3306,
    user:     env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });

  console.log(`✅  Connected to database: ${env.DB_NAME}`);

  await conn.query(`
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
      existing_student_id     VARCHAR(20)  NULL,
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

      -- Workflow status
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
    )
  `);

  console.log("✅  Table 'enrollment_applications' created (or already exists).");
  await conn.end();
}

run().catch((err) => {
  console.error("❌  Migration failed:", err.message);
  process.exit(1);
});
