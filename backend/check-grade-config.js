const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAndSeedConfig() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Checking grade_request_config table...\n');
    
    // Check if table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'grade_request_config'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Table grade_request_config does not exist!');
      console.log('Creating table...');
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS grade_request_config (
          id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          term        ENUM('Term 1','Term 2','Term 3') NOT NULL UNIQUE,
          is_open     TINYINT(1)   NOT NULL DEFAULT 0,
          opened_by   VARCHAR(20)  NULL,
          opened_at   DATETIME     NULL,
          closed_by   VARCHAR(20)  NULL,
          closed_at   DATETIME     NULL
        )
      `);
      
      console.log('✓ Table created');
    } else {
      console.log('✓ Table exists');
    }
    
    // Check current data
    const [rows] = await connection.query('SELECT * FROM grade_request_config');
    console.log('\nCurrent data:');
    console.log(JSON.stringify(rows, null, 2));
    
    if (rows.length === 0) {
      console.log('\n⚠️  Table is empty! Inserting seed data...');
      await connection.query(`
        INSERT INTO grade_request_config (term, is_open)
        VALUES ('Term 1', 0), ('Term 2', 0), ('Term 3', 0)
      `);
      
      const [newRows] = await connection.query('SELECT * FROM grade_request_config');
      console.log('\n✓ Seed data inserted:');
      console.log(JSON.stringify(newRows, null, 2));
    } else {
      console.log(`\n✓ Table has ${rows.length} rows`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkAndSeedConfig();
