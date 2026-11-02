const mysql = require("mysql2/promise");
require("dotenv").config();

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "inform_db"
  });
  
  console.log("=== Checking student_adviser_assignments table ===");
  try {
    const [tables] = await conn.query("SHOW TABLES LIKE 'student_adviser_assignments'");
    if (tables.length === 0) {
      console.log("❌ Table 'student_adviser_assignments' does NOT exist");
      await conn.end();
      return;
    }
    console.log("✓ Table exists");
    
    const [count] = await conn.query("SELECT COUNT(*) as cnt FROM student_adviser_assignments");
    console.log(`Total assignments: ${count[0].cnt}`);
    
    if (count[0].cnt > 0) {
      const [records] = await conn.query("SELECT * FROM student_adviser_assignments LIMIT 5");
      console.log("\nSample records:");
      console.log(JSON.stringify(records, null, 2));
    }
    
    console.log("\n=== Checking enrollment_config ===");
    const [config] = await conn.query("SELECT * FROM enrollment_config WHERE status = 'active'");
    console.log("Active config:");
    console.log(JSON.stringify(config, null, 2));
    
  } catch (err) {
    console.error("Error:", err.message);
  }
  
  await conn.end();
}

check();
