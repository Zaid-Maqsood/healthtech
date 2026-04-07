const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { isDoctor } = require('../middleware/roles');

/**
 * GET /api/doctor/appointments
 * Doctor only: all appointments assigned to this doctor.
 */
router.get('/appointments', auth, isDoctor, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         a.id,
         a.datetime,
         a.status,
         a.medical_condition,
         a.prescription,
         a.notes,
         a.created_at,
         a.updated_at,
         p.id   AS patient_id,
         p.name AS patient_name,
         p.email AS patient_email,
         pp.age  AS patient_age,
         pp.phone AS patient_phone
       FROM health.appointments a
       JOIN health.users p ON p.id = a.patient_id
       LEFT JOIN health.patient_profiles pp ON pp.user_id = p.id
       WHERE a.doctor_id = $1
       ORDER BY a.datetime DESC`,
      [req.user.id]
    );

    return res.json({ appointments: result.rows });
  } catch (err) {
    console.error('GET /doctor/appointments error:', err);
    return res.status(500).json({ error: 'Server error fetching doctor appointments' });
  }
});

module.exports = router;
