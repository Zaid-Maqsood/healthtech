const { Pool } = require('pg');
require('dotenv').config();

const isDO = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ondigitalocean.com');

// Local: postgresql://postgres:zaid@localhost:5432/grayphite
// Production: Digital Ocean managed Postgres (sslmode=require, self-signed CA)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isDO && { ssl: { rejectUnauthorized: false } }),
});

module.exports = pool;
