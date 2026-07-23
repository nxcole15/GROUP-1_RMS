/**
 * database/seed.js
 * Run with: node database/seed.js
 */
const bcrypt = require("bcryptjs");
const db     = require("../config/db");

async function seed() {
  console.log("Starting seed...");

  try {
    // ── Admin ──────────────────────────────────────────────
    const adminPassword = await bcrypt.hash("Admin@2026", 10);
    await db.query(`
      INSERT IGNORE INTO admins (admin_id, password, full_name, role, email)
      VALUES (?, ?, 'System Administrator', 'admin', 'admin@cfei.edu')
    `, ["ADMIN001", adminPassword]);
    console.log("  ✓ Admin inserted");

    // ── Teachers ───────────────────────────────────────────
    const teachers = [
      ["T001", "Maria Santos",     "Science",     "maria.santos@cfei.edu",     "password"],
      ["T002", "Juan Dela Cruz",   "English",     "juan.delacruz@cfei.edu",    "Juan@2026"],
      ["T003", "Ana Reyes",        "Mathematics", "ana.reyes@cfei.edu",        "Ana@2026"],
      ["T004", "Carlos Fernandez", "History",     "carlos.fernandez@cfei.edu", "Carlos@2026"],
    ];

    for (const [teacher_id, full_name, department, email, plainPassword] of teachers) {
      const hashed = await bcrypt.hash(plainPassword, 10);
      await db.query(`
        INSERT IGNORE INTO teachers (teacher_id, password, full_name, department, email)
        VALUES (?, ?, ?, ?, ?)
      `, [teacher_id, hashed, full_name, department, email]);
    }

    console.log("  ✓ Teachers inserted");

    // ── Students ───────────────────────────────────────────
    const students = [
      ["20240001", "Jamie Santos",   "STEM",  11, "1st Semester 2025-2026", "jamie.santos@student.cfei.edu",  "Jamie@2026"],
      ["20240002", "Maria Reyes",    "HUMSS", 11, "1st Semester 2025-2026", "maria.reyes@student.cfei.edu",   "Maria@2026"],
      ["20240003", "Carlo Bautista", "ABM",   12, "1st Semester 2025-2026", "carlo.bautista@student.cfei.edu","Carlo@2026"],
    ];

    for (const [student_id, full_name, pathway, grade_level, term, email, plainPassword] of students) {
      const hashed = await bcrypt.hash(plainPassword, 10);
      await db.query(`
        INSERT IGNORE INTO students (student_id, password, full_name, pathway, grade_level, term, email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [student_id, hashed, full_name, pathway, grade_level, term, email]);
    }

    console.log("  ✓ Students inserted");

    // ── Subjects ───────────────────────────────────────────────
    const [teacherRows] = await db.query(
    "SELECT id, teacher_id FROM teachers WHERE teacher_id IN ('T001','T002','T003','T004')"
    );
    
    const teacherMap = {};
    for (const t of teacherRows) {
    teacherMap[t.teacher_id] = t.id;
    }

    const subjects = [
        ["SCI101", "General Biology 1",        3, "T001", 40],
        ["SCI102", "Earth Science",            3, "T001", 40],
        ["ENG101", "Reading & Writing",        3, "T002", 40],
        ["ENG102", "Oral Communication",       3, "T002", 40],
        ["MATH101","General Mathematics",      3, "T003", 40],
        ["MATH102","Statistics & Probability", 3, "T003", 35],
        ["HIST101","Philippine History",       3, "T004", 40],
    ];

    for (const [code, name, units, teacher_code, max_capacity] of subjects) {
    await db.query(`
        INSERT IGNORE INTO subjects (code, name, units, teacher_id, max_capacity)
        VALUES (?, ?, ?, ?, ?)
    `, [code, name, units, teacherMap[teacher_code], max_capacity]);
    }

    console.log("  ✓ Subjects inserted");

    // ── Enrollment Config ──────────────────────────────────────
    await db.query(`
    INSERT IGNORE INTO enrollment_config (active_term, deadline)
    VALUES ('1st Semester 2025-2026', '2025-12-31 23:59:59')
    `);

    console.log("  ✓ Enrollment config inserted");


    // ── Enrollments, Grades & Attendance ──────────────────────
    // Get subject IDs from DB
    const [subjectRows] = await db.query(
    "SELECT id, code FROM subjects"
    );
    const subjectMap = {};
    for (const s of subjectRows) {
    subjectMap[s.code] = s.id;
    }

    const term = "1st Semester 2025-2026";

    // Each student enrolls in 2 subjects
    const enrollments = [
    { student_id: "20240001", subjects: ["SCI101", "MATH101"] },
    { student_id: "20240002", subjects: ["ENG101", "HIST101"] },
    { student_id: "20240003", subjects: ["SCI102", "MATH102"] },
    ];

    for (const { student_id, subjects: subjectCodes } of enrollments) {
    // Create enrollment record
    const [result] = await db.query(`
        INSERT IGNORE INTO enrollments (student_id, term, status, created_at)
        VALUES (?, ?, 'approved', NOW())
    `, [student_id, term]);

    if (result.insertId) {
        // Link subjects
        for (const code of subjectCodes) {
        await db.query(`
            INSERT IGNORE INTO enrollment_subjects (enrollment_id, subject_id)
            VALUES (?, ?)
        `, [result.insertId, subjectMap[code]]);

        // Update enrolled_count
        await db.query(
            "UPDATE subjects SET enrolled_count = enrolled_count + 1 WHERE id = ?",
            [subjectMap[code]]
        );

        // Insert grade
        await db.query(`
            INSERT IGNORE INTO grades (student_id, subject_id, teacher_id, percentage, term)
            SELECT ?, ?, teacher_id, ?, ? FROM subjects WHERE id = ?
        `, [student_id, subjectMap[code], Math.floor(Math.random() * 26) + 75, term, subjectMap[code]]);

        // Insert attendance
        await db.query(`
            INSERT IGNORE INTO attendance (student_id, subject_id, total_meetings, days_present, term)
            VALUES (?, ?, 20, ?, ?)
        `, [student_id, subjectMap[code], Math.floor(Math.random() * 5) + 16, term]);
        }
    }
    }
    console.log("  ✓ Enrollments, grades & attendance inserted");

    console.log("✅ Seed complete!");

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    process.exit();
  }
}

seed();
