const { Pool } = require('pg');
require('dotenv').config();

// Local: postgresql://postgres:zaid@localhost:5432/grayphite
// Production: Digital Ocean managed Postgres (SSL required)
const isProduction = process.env.NODE_ENV === 'production' ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ondigitalocean.com'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isProduction && { ssl: { rejectUnauthorized: false } }),
});

module.exports = pool;
