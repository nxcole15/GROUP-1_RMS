const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../.env' });

async function verifySchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Checking staff_notifications table schema...\n');
    
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'staff_notifications'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME]);
    
    console.log('Current columns in staff_notifications:');
    console.table(columns);
    
    const columnNames = columns.map(col => col.COLUMN_NAME);
    const requiredColumns = ['reference_id', 'reference_type', 'link_url'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n❌ MISSING COLUMNS:', missingColumns.join(', '));
      console.log('\n⚠️  You need to run the SQL migration first!');
      console.log('Run this in MySQL Workbench:');
      console.log('\nALTER TABLE staff_notifications ADD COLUMN reference_id VARCHAR(50) DEFAULT NULL AFTER type;');
      console.log('ALTER TABLE staff_notifications ADD COLUMN reference_type VARCHAR(50) DEFAULT NULL AFTER reference_id;');
      console.log('ALTER TABLE staff_notifications ADD COLUMN link_url VARCHAR(255) DEFAULT NULL AFTER reference_type;');
    } else {
      console.log('\n✅ All required columns exist!');
      
      // Check if there are any notifications
      const [notifs] = await connection.execute('SELECT * FROM staff_notifications ORDER BY created_at DESC LIMIT 5');
      console.log('\n📬 Recent notifications:');
      if (notifs.length === 0) {
        console.log('No notifications found.');
      } else {
        console.table(notifs);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

verifySchema();
