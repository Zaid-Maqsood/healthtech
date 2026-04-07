const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const { isAdmin, isPatient } = require('../middleware/roles');

/**
 * GET /api/appointments
 * Admin only: all appointments with patient name and doctor name.
 */
router.get('/', auth, isAdmin, async (req, res) => {
  const { status } = req.query;
  try {
    const params = [];
    let whereClause = '';
    if (status) {
      params.push(status);
      whereClause = `WHERE a.status = $1`;
    }

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
         d.id   AS doctor_id,
         d.name AS doctor_name,
         d.email AS doctor_email
       FROM health.appointments a
       JOIN health.users p ON p.id = a.patient_id
       LEFT JOIN health.users d ON d.id = a.doctor_id
       ${whereClause}
       ORDER BY a.created_at DESC`,
      params
    );

    return res.json({ appointments: result.rows });
  } catch (err) {
    console.error('GET /appointments error:', err);
    return res.status(500).json({ error: 'Server error fetching appointments' });
  }
});

/**
 * POST /api/appointments
 * Patient only: create a new appointment.
 * Body: { datetime, notes? }
 */
router.post('/', auth, isPatient, async (req, res) => {
  const { datetime, notes } = req.body;

  if (!datetime) {
    return res.status(400).json({ error: 'datetime is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO health.appointments (patient_id, datetime, notes, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [req.user.id, datetime, notes || null]
    );

    return res.status(201).json({ appointment: result.rows[0] });
  } catch (err) {
    console.error('POST /appointments error:', err);
    return res.status(500).json({ error: 'Server error creating appointment' });
  }
});

/**
 * GET /api/appointments/my
 * Patient: own appointments.
 * Doctor: assigned appointments only.
 */
router.get('/my', auth, async (req, res) => {
  const { role, id } = req.user;

  try {
    let result;

    if (role === 'patient') {
      result = await pool.query(
        `SELECT
           a.id,
           a.datetime,
           a.status,
           a.medical_condition,
           a.prescription,
           a.notes,
           a.created_at,
           a.updated_at,
           d.id   AS doctor_id,
           d.name AS doctor_name,
           dp.specialization AS doctor_specialization
         FROM health.appointments a
         LEFT JOIN health.users d ON d.id = a.doctor_id
         LEFT JOIN health.doctor_profiles dp ON dp.user_id = d.id
         WHERE a.patient_id = $1
         ORDER BY a.datetime DESC`,
        [id]
      );
    } else if (role === 'doctor') {
      result = await pool.query(
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
        [id]
      );
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ appointments: result.rows });
  } catch (err) {
    console.error('GET /appointments/my error:', err);
    return res.status(500).json({ error: 'Server error fetching appointments' });
  }
});

/**
 * GET /api/appointments/:id
 * Auth required. Role-based access:
 *   - Admin: any appointment
 *   - Patient: only own appointments
 *   - Doctor: only assigned appointments
 */
router.get('/:id', auth, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  const { role, id: userId } = req.user;

  if (isNaN(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment id' });
  }

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
         pp.phone AS patient_phone,
         d.id   AS doctor_id,
         d.name AS doctor_name,
         d.email AS doctor_email,
         dp.specialization AS doctor_specialization
       FROM health.appointments a
       JOIN health.users p ON p.id = a.patient_id
       LEFT JOIN health.patient_profiles pp ON pp.user_id = p.id
       LEFT JOIN health.users d ON d.id = a.doctor_id
       LEFT JOIN health.doctor_profiles dp ON dp.user_id = d.id
       WHERE a.id = $1`,
      [appointmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = result.rows[0];

    // Role-based access check
    if (role === 'patient' && appointment.patient_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (role === 'doctor' && appointment.doctor_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ appointment });
  } catch (err) {
    console.error('GET /appointments/:id error:', err);
    return res.status(500).json({ error: 'Server error fetching appointment' });
  }
});

/**
 * PATCH /api/appointments/:id
 * Admin only. Edit appointment datetime and/or notes.
 * Body: { datetime?, notes? }
 */
router.patch('/:id', auth, isAdmin, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  const { datetime, notes } = req.body;

  if (isNaN(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment id' });
  }

  if (!datetime && notes === undefined) {
    return res.status(400).json({ error: 'At least one of datetime or notes is required' });
  }

  try {
    const existing = await pool.query(
      'SELECT id, status FROM health.appointments WHERE id = $1',
      [appointmentId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (['completed', 'cancelled'].includes(existing.rows[0].status)) {
      return res.status(400).json({ error: 'Cannot edit a completed or cancelled appointment' });
    }

    const fields = [];
    const params = [];
    if (datetime) { params.push(datetime); fields.push(`datetime = $${params.length}`); }
    if (notes !== undefined) { params.push(notes); fields.push(`notes = $${params.length}`); }
    params.push(appointmentId);

    const result = await pool.query(
      `UPDATE health.appointments SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
      params
    );

    return res.json({ appointment: result.rows[0] });
  } catch (err) {
    console.error('PATCH /appointments/:id error:', err);
    return res.status(500).json({ error: 'Server error updating appointment' });
  }
});

/**
 * PATCH /api/appointments/:id/approve
 * Admin only. Sets status to 'approved'. Requires a doctor to be assigned first.
 */
router.patch('/:id/approve', auth, isAdmin, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);

  if (isNaN(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment id' });
  }

  try {
    const existing = await pool.query(
      'SELECT id, doctor_id FROM health.appointments WHERE id = $1',
      [appointmentId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (!existing.rows[0].doctor_id) {
      return res.status(400).json({ error: 'Assign a doctor before approving this appointment' });
    }

    const result = await pool.query(
      `UPDATE health.appointments
       SET status = 'approved', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [appointmentId]
    );

    return res.json({ appointment: result.rows[0] });
  } catch (err) {
    console.error('PATCH /appointments/:id/approve error:', err);
    return res.status(500).json({ error: 'Server error approving appointment' });
  }
});

/**
 * PATCH /api/appointments/:id/reject
 * Admin only. Sets status to 'rejected'.
 */
router.patch('/:id/reject', auth, isAdmin, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);

  if (isNaN(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment id' });
  }

  try {
    const result = await pool.query(
      `UPDATE health.appointments
       SET status = 'rejected', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [appointmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    return res.json({ appointment: result.rows[0] });
  } catch (err) {
    console.error('PATCH /appointments/:id/reject error:', err);
    return res.status(500).json({ error: 'Server error rejecting appointment' });
  }
});

/**
 * PATCH /api/appointments/:id/cancel
 * Admin only. Cancels any non-completed appointment.
 */
router.patch('/:id/cancel', auth, isAdmin, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);

  if (isNaN(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment id' });
  }

  try {
    const existing = await pool.query(
      'SELECT id, status FROM health.appointments WHERE id = $1',
      [appointmentId]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (existing.rows[0].status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed appointment' });
    }
    if (existing.rows[0].status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    const result = await pool.query(
      `UPDATE health.appointments
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [appointmentId]
    );

    return res.json({ appointment: result.rows[0] });
  } catch (err) {
    console.error('PATCH /appointments/:id/cancel error:', err);
    return res.status(500).json({ error: 'Server error cancelling appointment' });
  }
});

/**
 * PATCH /api/appointments/:id/assign-doctor
 * Admin only. Body: { doctor_id }. Sets doctor_id; status becomes 'approved' if currently 'pending'.
 */
router.patch('/:id/assign-doctor', auth, isAdmin, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  const { doctor_id } = req.body;

  if (isNaN(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment id' });
  }

  if (!doctor_id) {
    return res.status(400).json({ error: 'doctor_id is required' });
  }

  try {
    // Verify the doctor exists and has the doctor role
    const doctorCheck = await pool.query(
      "SELECT id FROM health.users WHERE id = $1 AND role = 'doctor'",
      [doctor_id]
    );
    if (doctorCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get current appointment
    const apptCheck = await pool.query(
      'SELECT id, status FROM health.appointments WHERE id = $1',
      [appointmentId]
    );
    if (apptCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const currentStatus = apptCheck.rows[0].status;
    // If pending, upgrade to approved on doctor assignment
    const newStatus = currentStatus === 'pending' ? 'approved' : currentStatus;

    const result = await pool.query(
      `UPDATE health.appointments
       SET doctor_id = $1, status = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [doctor_id, newStatus, appointmentId]
    );

    return res.json({ appointment: result.rows[0] });
  } catch (err) {
    console.error('PATCH /appointments/:id/assign-doctor error:', err);
    return res.status(500).json({ error: 'Server error assigning doctor' });
  }
});

/**
 * PATCH /api/appointments/:id/complete
 * Assigned doctor only.
 * Body: { medical_condition, prescription }. Both required.
 * Sets status to 'completed'.
 */
router.patch('/:id/complete', auth, async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  const { medical_condition, prescription } = req.body;
  const { role, id: userId } = req.user;

  if (isNaN(appointmentId)) {
    return res.status(400).json({ error: 'Invalid appointment id' });
  }

  if (role !== 'doctor') {
    return res.status(403).json({ error: 'Access denied. Doctor role required.' });
  }

  if (!medical_condition || !prescription) {
    return res.status(400).json({ error: 'medical_condition and prescription are both required' });
  }

  try {
    // Verify the doctor is assigned to this appointment
    const apptCheck = await pool.query(
      'SELECT id, doctor_id, status FROM health.appointments WHERE id = $1',
      [appointmentId]
    );

    if (apptCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = apptCheck.rows[0];

    if (appointment.doctor_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You are not assigned to this appointment.' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'Appointment is already completed' });
    }

    const result = await pool.query(
      `UPDATE health.appointments
       SET status = 'completed',
           medical_condition = $1,
           prescription = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [medical_condition, prescription, appointmentId]
    );

    return res.json({ appointment: result.rows[0] });
  } catch (err) {
    console.error('PATCH /appointments/:id/complete error:', err);
    return res.status(500).json({ error: 'Server error completing appointment' });
  }
});

module.exports = router;
