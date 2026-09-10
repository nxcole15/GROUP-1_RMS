/**
 * insert-admins.js
 * Standalone script to insert admin records into the database.
 * Usage: node insert-admins.js
 * 
 * This script uses your Railway MySQL credentials to insert admin accounts.
 * Supports both Railway and local database connections.
 */

const mysql = require("mysql2/promise");

// Parse DATABASE_URL if available (Railway format)
let DB_CONFIG = {};

if (process.env.DATABASE_URL) {
  // Parse Railway DATABASE_URL
  // Format: mysql://user:password@host:port/database
  const url = new URL(process.env.DATABASE_URL);
  DB_CONFIG = {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1), // Remove leading /
  };
} else {
  DB_CONFIG = {
    host: process.env.DB_HOST || "viaduct.proxy.rlwy.net",
    port: process.env.DB_PORT || 51534,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "clEPdWyCjHWkPvWZYSBGQwChBGViCuyi",
    database: process.env.DB_NAME || "smart_student_service",
  };
}

// Bcrypt hash for password: Test@123
const PASSWORD_HASH = "$2a$10$PHEfY12Gqy3lzZQc51nWn.B9M/95nPqTFgVmHYMsWBq6On21eyXY6";

async function insertAdmins() {
  let connection;
  try {
    console.log("🔗 Connecting to MySQL database...");
    console.log(`   Host: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   Database: ${DB_CONFIG.database}`);
    console.log(`   User: ${DB_CONFIG.user}`);
    
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      database: DB_CONFIG.database,
      enableKeepAlive: true,
    });

    console.log("✓ Connected successfully!");

    // Verify connection
    const [result] = await connection.query("SELECT 1 as status");
    console.log("✓ Database verified - connection is working");

    // Check if admins already exist
    console.log("\n📋 Checking for existing admin records...");
    const [existing] = await connection.query(
      "SELECT admin_id FROM admins WHERE admin_id IN ('SUPERADMIN001', 'PRINCIPAL001', 'REGISTRAR001')"
    );

    if (existing.length > 0) {
      console.log(
        "⚠ Found existing admins:",
        existing.map((a) => a.admin_id).join(", ")
      );
      console.log("\nTo replace them, run this on Railway:");
      console.log("  DELETE FROM admins WHERE admin_id IN ('SUPERADMIN001', 'PRINCIPAL001', 'REGISTRAR001');");
      console.log("\nSkipping insert to avoid duplicates.");
    } else {
      // Insert admin records
      console.log("\n➕ Inserting admin records...");

      const adminRecords = [
        {
          admin_id: "SUPERADMIN001",
          full_name: "System Super Admin",
          role: "super_admin",
          email: "superadmin@cfei.edu",
        },
        {
          admin_id: "PRINCIPAL001",
          full_name: "School Principal",
          role: "principal",
          email: "principal@cfei.edu",
        },
        {
          admin_id: "REGISTRAR001",
          full_name: "Registrar",
          role: "registrar",
          email: "registrar@cfei.edu",
        },
      ];

      for (const admin of adminRecords) {
        try {
          await connection.query(
            "INSERT INTO admins (admin_id, password, full_name, role, email) VALUES (?, ?, ?, ?, ?)",
            [admin.admin_id, PASSWORD_HASH, admin.full_name, admin.role, admin.email]
          );
          console.log(`   ✓ Inserted ${admin.admin_id} (${admin.full_name})`);
        } catch (error) {
          if (error.code === "ER_DUP_ENTRY") {
            console.log(`   ⚠ ${admin.admin_id} already exists`);
          } else {
            throw error;
          }
        }
      }

      console.log("\n✓ Admin records inserted successfully!");
    }

    // Display all admins
    console.log("\n📊 Current admin records in database:");
    const [admins] = await connection.query(
      "SELECT admin_id, full_name, role, email FROM admins ORDER BY admin_id"
    );
    
    if (admins.length === 0) {
      console.log("   (No admin records found)");
    } else {
      console.table(admins);
    }

    console.log("\n📝 Test Login Credentials:");
    console.log("   Admin ID: PRINCIPAL001 (or SUPERADMIN001, REGISTRAR001)");
    console.log("   Password: Test@123");
    console.log("\n🌐 Test on your Vercel frontend:");
    console.log("   https://group-1rms-git-main-capri15.vercel.app/login");

    await connection.end();
    console.log("\n✓ Database connection closed");
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    
    if (error.code === "ER_ACCESS_DENIED_FOR_USER") {
      console.error("\n❌ Authentication failed. Check your credentials:");
      console.error("   User:", DB_CONFIG.user);
      console.error("   Host:", DB_CONFIG.host);
      console.error("\n💡 Option 1: Check Railway Variables");
      console.error("   Go to: Railway dashboard → Your project → Variables");
      console.error("   Look for DATABASE_URL or individual DB_* variables");
      console.error("\n💡 Option 2: Use Railway's DATABASE_URL");
      console.error("   Set DATABASE_URL environment variable first:");
      console.error("   export DATABASE_URL='mysql://root:password@host:port/database'");
    } else if (error.code === "PROTOCOL_CONNECTION_LOST" || error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      console.error("\n❌ Cannot connect to database server.");
      console.error("   Connection was refused or lost:");
      console.error(`   ${DB_CONFIG.host}:${DB_CONFIG.port}`);
      console.error("\n💡 Possible causes:");
      console.error("   1. MySQL service is not running on Railway");
      console.error("   2. Firewall or network issue blocking connection");
      console.error("   3. Connection credentials are incorrect");
      console.error("\n💡 Next steps:");
      console.error("   1. Visit Railway dashboard and check MySQL service status");
      console.error("   2. Copy the DATABASE_URL from Railway Variables");
      console.error("   3. If you have DATABASE_URL, set it: export DATABASE_URL='...'");
      console.error("   4. Try running this script again");
    }
    
    process.exit(1);
  }
}

insertAdmins();
