const { Pool } = require('pg');
require('dotenv').config();

// Strip sslmode from the URL so pg doesn't override our ssl config below.
// DO auto-injects sslmode=require which pg v8+ treats as verify-full (cert check fails).
const connectionString = (process.env.DATABASE_URL || '').replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '');

const pool = new Pool({
  connectionString: connectionString || process.env.DATABASE_URL,
  ssl: connectionString.includes('ondigitalocean.com') ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
