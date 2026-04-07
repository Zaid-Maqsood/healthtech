const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

/**
 * GET /api/admin/doctors
 * Admin only: list all doctors with profile info.
 */
router.get('/doctors', auth, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.created_at,
         dp.specialization
       FROM health.users u
       LEFT JOIN health.doctor_profiles dp ON dp.user_id = u.id
       WHERE u.role = 'doctor'
       ORDER BY u.name ASC`
    );

    return res.json({ doctors: result.rows });
  } catch (err) {
    console.error('GET /admin/doctors error:', err);
    return res.status(500).json({ error: 'Server error fetching doctors' });
  }
});

/**
 * GET /api/admin/patients
 * Admin only: list all patients with profile info.
 */
router.get('/patients', auth, isAdmin, async (req, res) => {
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
       WHERE u.role = 'patient'
       ORDER BY u.name ASC`
    );

    return res.json({ patients: result.rows });
  } catch (err) {
    console.error('GET /admin/patients error:', err);
    return res.status(500).json({ error: 'Server error fetching patients' });
  }
});

module.exports = router;
