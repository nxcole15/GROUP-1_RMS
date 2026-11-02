/**
 * Run the adviser assignment migration
 * Uses the existing db.js configuration
 */
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Running adviser assignment migration...\n');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'database', 'migrations', '010-add-adviser-assignment.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons and filter out empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and SELECT statements (they're just messages)
      if (statement.toUpperCase().startsWith('SELECT \'MIGRATION')) {
        console.log(`✅ ${statement.match(/'([^']+)'/)?.[1] || 'Migration step completed'}`);
        continue;
      }

      try {
        await db.query(statement);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
      } catch (err) {
        // If error is "table already exists" or "column already exists", that's OK
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || 
            err.code === 'ER_DUP_FIELDNAME' ||
            err.message.includes('already exists')) {
          console.log(`⚠️  Statement ${i + 1}/${statements.length} - Already exists (skipped)`);
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, err.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          throw err;
        }
      }
    }

    console.log('\n✅ Migration completed successfully!\n');
    console.log('📊 Verifying table creation...\n');

    // Verify the table was created
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'student_adviser_assignments'
    `);

    if (tables.length > 0) {
      console.log('✅ Table "student_adviser_assignments" created successfully');
      
      // Show table structure
      const [columns] = await db.query('DESCRIBE student_adviser_assignments');
      console.log('\n📋 Table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})${col.Key ? ` [${col.Key}]` : ''}`);
      });
    } else {
      console.log('⚠️  Table "student_adviser_assignments" not found');
    }

    // Check if track and strand columns exist in students table
    const [studentCols] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME IN ('track', 'strand')
    `);

    console.log(`\n✅ Students table has ${studentCols.length}/2 required columns (track, strand)`);
    studentCols.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME}`);
    });

    console.log('\n🎉 All done! You can now start using the Adviser Assignment feature.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
