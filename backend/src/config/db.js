const { Pool } = require('pg');
require('dotenv').config();

// Local: postgresql://postgres:zaid@localhost:5432/grayphite
// Production: Digital Ocean managed Postgres (sslmode=require, self-signed CA)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
