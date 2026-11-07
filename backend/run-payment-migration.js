require('dotenv').config();
const mysql = require('mysql2/promise');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_student_service'
  });

  try {
    console.log('🔄 Running payment migration...');
    
    // Check if payment_method column exists
    const [paymentMethodCheck] = await connection.query(`
      SHOW COLUMNS FROM payments WHERE Field = 'payment_method'
    `);
    
    if (paymentMethodCheck.length === 0) {
      // Add payment_method column
      await connection.query(`
        ALTER TABLE payments 
        ADD COLUMN payment_method VARCHAR(100) NULL AFTER admin_timestamp
      `);
      console.log('✅ Added payment_method column');
    } else {
      console.log('ℹ️  payment_method column already exists');
    }
    
    // Check if notes column exists
    const [notesCheck] = await connection.query(`
      SHOW COLUMNS FROM payments WHERE Field = 'notes'
    `);
    
    if (notesCheck.length === 0) {
      // Add notes column
      await connection.query(`
        ALTER TABLE payments 
        ADD COLUMN notes TEXT NULL AFTER payment_method
      `);
      console.log('✅ Added notes column');
    } else {
      console.log('ℹ️  notes column already exists');
    }
    
    // Verify the columns were added
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM payments WHERE Field IN ('payment_method', 'notes')
    `);
    
    console.log('\n📋 Verification:');
    columns.forEach(col => {
      console.log(`  ✅ ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(console.error);
