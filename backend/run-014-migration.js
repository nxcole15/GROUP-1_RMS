/**
 * Run migration 014: Add payment_method and notes columns to payments table
 * 
 * Usage: node run-014-migration.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_student_service',
      multipleStatements: true
    });

    console.log('✅ Connected to database');
    console.log('🔄 Running migration 014...\n');
    
    const sql = fs.readFileSync(
      path.join(__dirname, 'database', 'migrations', '014-add-payment-method-and-notes.sql'),
      'utf8'
    );

    await connection.query(sql);
    console.log('✅ Migration executed successfully\n');

    // Verify the columns were added
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM payments WHERE Field IN ('payment_method', 'notes')
    `);
    
    console.log('📋 Verification:');
    if (columns.length === 2) {
      console.log('✅ payment_method column added');
      console.log('✅ notes column added');
      console.log('\nColumn details:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    } else {
      console.log('⚠️  Warning: Expected 2 columns, found:', columns.length);
    }

    console.log('\n✅ Migration 014 completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

runMigration();
