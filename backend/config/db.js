const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smartshops',
  ssl: process.env.DB_SSL === 'true' ? {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create promise wrapper
const promisePool = pool.promise();

// Export both promise and regular query methods
// Note: TiDB requires pool.query for queries with LIMIT ? OFFSET ? instead of prepared statement binary protocol (execute)
module.exports = {
  promise: promisePool,
  execute: (...args) => promisePool.query(...args),
  query: (...args) => pool.query(...args)
};