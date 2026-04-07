const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

/**
 * GET /api/dashboard
 * Role-based dashboard data:
 *   - admin:   { total_patients, total_appointments, pending_requests, recent_appointments[] }
 *   - doctor:  { todays_appointments[], upcoming_appointments[], total_completed, appointment_history[] }
 *   - patient: { upcoming_appointments[], past_appointments[] }
 */
router.get('/', auth, async (req, res) => {
  const { role, id: userId } = req.user;

  try {
    if (role === 'admin') {
      // Total patients
      const patientsCount = await pool.query(
        "SELECT COUNT(*) AS total_patients FROM health.users WHERE role = 'patient'"
      );

      // Total appointments
      const apptsCount = await pool.query(
        'SELECT COUNT(*) AS total_appointments FROM health.appointments'
      );

      // Pending requests
      const pendingCount = await pool.query(
        "SELECT COUNT(*) AS pending_requests FROM health.appointments WHERE status = 'pending'"
      );

      // Total doctors
      const doctorsCount = await pool.query(
        "SELECT COUNT(*) AS total_doctors FROM health.users WHERE role = 'doctor'"
      );

      // Pending appointments list (for dashboard preview)
      const pendingAppts = await pool.query(
        `SELECT
           a.id,
           a.datetime,
           a.status,
           a.notes,
           a.created_at,
           p.name AS patient_name,
           p.email AS patient_email
         FROM health.appointments a
         JOIN health.users p ON p.id = a.patient_id
         WHERE a.status = 'pending'
         ORDER BY a.created_at ASC`
      );

      return res.json({
        total_patients: parseInt(patientsCount.rows[0].total_patients, 10),
        total_doctors: parseInt(doctorsCount.rows[0].total_doctors, 10),
        total_appointments: parseInt(apptsCount.rows[0].total_appointments, 10),
        pending_requests: parseInt(pendingCount.rows[0].pending_requests, 10),
        pending_appointments: pendingAppts.rows,
      });
    }

    if (role === 'doctor') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Today's appointments
      const todaysAppts = await pool.query(
        `SELECT
           a.id,
           a.datetime,
           a.status,
           a.medical_condition,
           a.prescription,
           a.notes,
           p.id   AS patient_id,
           p.name AS patient_name,
           p.email AS patient_email,
           pp.age  AS patient_age,
           pp.phone AS patient_phone
         FROM health.appointments a
         JOIN health.users p ON p.id = a.patient_id
         LEFT JOIN health.patient_profiles pp ON pp.user_id = p.id
         WHERE a.doctor_id = $1
           AND a.datetime >= $2
           AND a.datetime <= $3
         ORDER BY a.datetime ASC`,
        [userId, todayStart.toISOString(), todayEnd.toISOString()]
      );

      // Upcoming appointments (future, not completed/rejected)
      const upcomingAppts = await pool.query(
        `SELECT
           a.id,
           a.datetime,
           a.status,
           a.notes,
           p.id   AS patient_id,
           p.name AS patient_name,
           p.email AS patient_email
         FROM health.appointments a
         JOIN health.users p ON p.id = a.patient_id
         WHERE a.doctor_id = $1
           AND a.datetime > $2
           AND a.status NOT IN ('completed', 'rejected')
         ORDER BY a.datetime ASC`,
        [userId, new Date().toISOString()]
      );

      // Total completed
      const completedCount = await pool.query(
        "SELECT COUNT(*) AS total_completed FROM health.appointments WHERE doctor_id = $1 AND status = 'completed'",
        [userId]
      );

      // Appointment history (completed)
      const history = await pool.query(
        `SELECT
           a.id,
           a.datetime,
           a.status,
           a.medical_condition,
           a.prescription,
           a.notes,
           a.updated_at,
           p.id   AS patient_id,
           p.name AS patient_name
         FROM health.appointments a
         JOIN health.users p ON p.id = a.patient_id
         WHERE a.doctor_id = $1
           AND a.status = 'completed'
         ORDER BY a.updated_at DESC`,
        [userId]
      );

      return res.json({
        today_appointments: todaysAppts.rows,
        today_count: todaysAppts.rows.length,
        upcoming_appointments: upcomingAppts.rows,
        upcoming_count: upcomingAppts.rows.length,
        total_completed: parseInt(completedCount.rows[0].total_completed, 10),
        appointment_history: history.rows,
      });
    }

    if (role === 'patient') {
      const now = new Date().toISOString();

      // Upcoming appointments (future, not completed/rejected)
      const upcomingAppts = await pool.query(
        `SELECT
           a.id,
           a.datetime,
           a.status,
           a.notes,
           a.created_at,
           d.id   AS doctor_id,
           d.name AS doctor_name,
           dp.specialization AS doctor_specialization
         FROM health.appointments a
         LEFT JOIN health.users d ON d.id = a.doctor_id
         LEFT JOIN health.doctor_profiles dp ON dp.user_id = d.id
         WHERE a.patient_id = $1
           AND a.datetime >= $2
           AND a.status NOT IN ('completed', 'rejected')
         ORDER BY a.datetime ASC`,
        [userId, now]
      );

      // Past appointments (completed or datetime in the past)
      const pastAppts = await pool.query(
        `SELECT
           a.id,
           a.datetime,
           a.status,
           a.medical_condition,
           a.prescription,
           a.notes,
           a.updated_at,
           d.id   AS doctor_id,
           d.name AS doctor_name,
           dp.specialization AS doctor_specialization
         FROM health.appointments a
         LEFT JOIN health.users d ON d.id = a.doctor_id
         LEFT JOIN health.doctor_profiles dp ON dp.user_id = d.id
         WHERE a.patient_id = $1
           AND (a.status = 'completed' OR a.datetime < $2)
         ORDER BY a.datetime DESC`,
        [userId, now]
      );

      return res.json({
        upcoming_appointments: upcomingAppts.rows,
        upcoming_count: upcomingAppts.rows.length,
        past_appointments: pastAppts.rows,
        past_count: pastAppts.rows.length,
      });
    }

    return res.status(400).json({ error: 'Unknown user role' });
  } catch (err) {
    console.error('GET /dashboard error:', err);
    return res.status(500).json({ error: 'Server error fetching dashboard data' });
  }
});

module.exports = router;
