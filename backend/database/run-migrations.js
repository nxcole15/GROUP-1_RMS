/**
 * Migration Runner Script
 * 
 * Usage:
 *   node run-migrations.js
 * 
 * This will automatically run all pending migrations on your local database.
 * Make sure .env is configured with your database credentials.
 */

require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  // Create database connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  console.log(`✅ Connected to database: ${process.env.DB_NAME}\n`);

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '001-add-new-scheduling-system-simple.sql');
    const sql = await fs.readFile(migrationPath, 'utf8');

    console.log('📝 Running migration: 001-add-new-scheduling-system-simple.sql');
    console.log('⏳ This may take a moment...\n');

    // Split by semicolons and run each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));

    let successCount = 0;
    let skipCount = 0;

    for (const statement of statements) {
      try {
        await connection.query(statement);
        successCount++;
      } catch (error) {
        // Ignore "duplicate column" and "can't drop" errors
        if (
          error.message.includes('Duplicate column') ||
          error.message.includes('Duplicate key') ||
          error.message.includes("Can't DROP") ||
          error.message.includes('already exists')
        ) {
          skipCount++;
        } else {
          console.error(`❌ Error in statement: ${statement.substring(0, 50)}...`);
          console.error(`   ${error.message}\n`);
        }
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   - ${successCount} statements executed successfully`);
    console.log(`   - ${skipCount} statements skipped (already existed)`);

    // Verify tables exist
    console.log('\n🔍 Verifying new tables...');
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('teacher_schedules', 'student_schedule_enrollments', 'grade_submission_config', 'grade_audit_log')
    `, [process.env.DB_NAME]);

    console.log(`\n📊 Found ${tables.length}/4 new tables:`);
    tables.forEach(row => console.log(`   ✓ ${row.TABLE_NAME}`));

    if (tables.length < 4) {
      console.log('\n⚠️  Warning: Not all tables were created. Check for errors above.');
    } else {
      console.log('\n🎉 All new tables created successfully!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
    console.log('\n👋 Database connection closed.');
  }
}

// Run migrations
runMigrations().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
