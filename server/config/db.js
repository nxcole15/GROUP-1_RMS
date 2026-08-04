/**
 * config/db.js
 * mysql2 promise-based connection pool.
 * Import this wherever you need to run queries.
 */

const mysql = require("mysql2/promise");
const env   = require("./env");

const pool = mysql.createPool({
  host:               env.DB_HOST,
  port:               env.DB_PORT,
  user:               env.DB_USER,
  password:           env.DB_PASSWORD,
  database:           env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           "+00:00",
});

module.exports = pool;
