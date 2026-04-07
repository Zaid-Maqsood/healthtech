const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const auth = require('../middleware/auth');

/**
 * Helper: sign a JWT for a given user object.
 */
function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/register
 * Patient registration only.
 * Body: { name, email, password, age?, phone? }
 */
router.post('/register', async (req, res) => {
  const { name, email, password, age, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }

  try {
    // Check if email already exists
    const existing = await pool.query(
      'SELECT id FROM health.users WHERE email = $1',
      [email]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user with role = 'patient'
    const userResult = await pool.query(
      `INSERT INTO health.users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'patient')
       RETURNING id, name, email, role, created_at`,
      [name, email, password_hash]
    );
    const user = userResult.rows[0];

    // Insert patient_profile
    await pool.query(
      `INSERT INTO health.patient_profiles (user_id, age, phone)
       VALUES ($1, $2, $3)`,
      [user.id, age || null, phone || null]
    );

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * POST /api/auth/login
 * All roles. Body: { email, password }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, password_hash FROM health.users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * GET /api/auth/me
 * Returns current user info + profile based on role.
 */
router.get('/me', auth, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, name, email, role, created_at FROM health.users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    let profile = null;

    if (user.role === 'patient') {
      const profileResult = await pool.query(
        'SELECT id, age, phone FROM health.patient_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = profileResult.rows[0] || null;
    } else if (user.role === 'doctor') {
      const profileResult = await pool.query(
        'SELECT id, specialization FROM health.doctor_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = profileResult.rows[0] || null;
    }

    return res.json({ user, profile });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Server error fetching user info' });
  }
});

module.exports = router;
