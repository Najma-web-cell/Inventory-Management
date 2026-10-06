require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// An idle-client error should be logged, not crash the whole API
pool.on('error', (err) => console.error('Unexpected database error:', err.message));

module.exports = { query: (text, params) => pool.query(text, params), pool };
