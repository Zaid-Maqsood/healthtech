const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { isPatient } = require('../middleware/roles');

/**
 * GET /api/patients/profile
 * Patient only: get own profile.
 */
router.get('/profile', auth, isPatient, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.created_at,
         pp.age,
         pp.phone
       FROM health.users u
       LEFT JOIN health.patient_profiles pp ON pp.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    return res.json({ patient: result.rows[0] });
  } catch (err) {
    console.error('GET /patients/profile error:', err);
    return res.status(500).json({ error: 'Server error fetching patient profile' });
  }
});

/**
 * PATCH /api/patients/profile
 * Patient only: update own profile (age, phone).
 */
router.patch('/profile', auth, isPatient, async (req, res) => {
  const { age, phone } = req.body;

  try {
    // Update patient_profiles (upsert-style)
    const existing = await pool.query(
      'SELECT id FROM health.patient_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (existing.rows.length === 0) {
      // Create profile if it doesn't exist
      await pool.query(
        'INSERT INTO health.patient_profiles (user_id, age, phone) VALUES ($1, $2, $3)',
        [req.user.id, age || null, phone || null]
      );
    } else {
      // Build dynamic update
      const updates = [];
      const values = [];
      let idx = 1;

      if (age !== undefined) {
        updates.push(`age = $${idx++}`);
        values.push(age);
      }
      if (phone !== undefined) {
        updates.push(`phone = $${idx++}`);
        values.push(phone);
      }

      if (updates.length > 0) {
        values.push(req.user.id);
        await pool.query(
          `UPDATE health.patient_profiles SET ${updates.join(', ')} WHERE user_id = $${idx}`,
          values
        );
      }
    }

    // Return updated profile
    const result = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.created_at,
         pp.age,
         pp.phone
       FROM health.users u
       LEFT JOIN health.patient_profiles pp ON pp.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    return res.json({ patient: result.rows[0] });
  } catch (err) {
    console.error('PATCH /patients/profile error:', err);
    return res.status(500).json({ error: 'Server error updating patient profile' });
  }
});

module.exports = router;
