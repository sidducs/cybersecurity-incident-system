const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'cybersecurity_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2233',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Execute parameterized SQL query safely against PostgreSQL.
 * @param {string} text - SQL statement with $1, $2 parameter placeholders.
 * @param {Array} params - Bound parameter values to prevent SQL injection.
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
}

/**
 * Obtain a dedicated client from the pool for multi-statement ACID transactions.
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = {
  query,
  getClient,
  pool,
};

