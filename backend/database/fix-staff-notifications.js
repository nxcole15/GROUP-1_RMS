const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' });

async function fixStaffNotifications() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Adding missing columns to staff_notifications...');
    
    // Check if columns exist first
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'staff_notifications'
    `, [process.env.DB_NAME]);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('Existing columns:', existingColumns);
    
    // Add reference_id if missing
    if (!existingColumns.includes('reference_id')) {
      await connection.execute(`
        ALTER TABLE staff_notifications 
        ADD COLUMN reference_id VARCHAR(50) DEFAULT NULL AFTER type
      `);
      console.log('✓ Added reference_id column');
    } else {
      console.log('✓ reference_id column already exists');
    }
    
    // Add reference_type if missing
    if (!existingColumns.includes('reference_type')) {
      await connection.execute(`
        ALTER TABLE staff_notifications 
        ADD COLUMN reference_type VARCHAR(50) DEFAULT NULL AFTER reference_id
      `);
      console.log('✓ Added reference_type column');
    } else {
      console.log('✓ reference_type column already exists');
    }
    
    // Add link_url if missing
    if (!existingColumns.includes('link_url')) {
      await connection.execute(`
        ALTER TABLE staff_notifications 
        ADD COLUMN link_url VARCHAR(255) DEFAULT NULL AFTER reference_type
      `);
      console.log('✓ Added link_url column');
    } else {
      console.log('✓ link_url column already exists');
    }
    
    console.log('\n✅ Staff notifications table fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing staff_notifications table:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixStaffNotifications();
