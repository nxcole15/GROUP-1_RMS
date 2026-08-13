/**
 * One-time script to create the student account manually
 * Run: node fix-student.js
 */
const bcrypt = require("bcryptjs");
const db = require("./config/db");

async function createStudent() {
  try {
    const studentId = "2026167716";
    const tempPass = "Cfei@q5uwnw";
    const fullName = "jasmine reyes jane ll";
    const pathway = "STEM";
    const gradeLevel = 11;
    const term = "2nd Semester SY 2025-2026";
    const email = "garinjustus@gmail.com";

    const hashedPass = await bcrypt.hash(tempPass, 10);

    // Delete if exists
    await db.query("DELETE FROM students WHERE student_id = ?", [studentId]);

    // Create new
    const result = await db.query(
      `INSERT INTO students
       (student_id, password, full_name, pathway, grade_level, term, email, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [studentId, hashedPass, fullName, pathway, gradeLevel, term, email]
    );

    console.log("✅ Student created successfully!");
    console.log("Student ID:", studentId);
    console.log("Full Name:", fullName);
    console.log("Password:", tempPass);
    console.log("Email:", email);

    await db.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

createStudent();
