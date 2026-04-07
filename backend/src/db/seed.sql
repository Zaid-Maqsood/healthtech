-- ============================================================
-- ClinicFlow Seed Data
-- Database: graphite | Schema: health
--
-- Passwords: all users have password 'password123'
-- Pre-computed bcrypt hash (cost 10):
--   $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uHwHQAHim
--
-- Run schema.sql first before running this file.
-- ============================================================

-- Clear existing seed data in reverse FK order
DELETE FROM health.appointments;
DELETE FROM health.patient_profiles;
DELETE FROM health.doctor_profiles;
DELETE FROM health.users;

-- Reset sequences
ALTER SEQUENCE health.users_id_seq RESTART WITH 1;
ALTER SEQUENCE health.patient_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE health.doctor_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE health.appointments_id_seq RESTART WITH 1;

-- ============================================================
-- Users
-- 1 admin, 2 doctors, 3 patients
-- ============================================================
INSERT INTO health.users (name, email, password_hash, role) VALUES
    ('Admin User',      'admin@clinicflow.com',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uHwHQAHim', 'admin'),
    ('Dr. Sarah Chen',  'sarah.chen@clinic.com',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uHwHQAHim', 'doctor'),
    ('Dr. James Okafor','james.okafor@clinic.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uHwHQAHim', 'doctor'),
    ('Alice Morgan',    'alice@example.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uHwHQAHim', 'patient'),
    ('Bob Williams',    'bob@example.com',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uHwHQAHim', 'patient'),
    ('Carol Davis',     'carol@example.com',      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uHwHQAHim', 'patient');

-- ============================================================
-- Doctor Profiles
-- Users: id=2 (Dr. Sarah Chen), id=3 (Dr. James Okafor)
-- ============================================================
INSERT INTO health.doctor_profiles (user_id, specialization) VALUES
    (2, 'Cardiology'),
    (3, 'General Practice');

-- ============================================================
-- Patient Profiles
-- Users: id=4 (Alice), id=5 (Bob), id=6 (Carol)
-- ============================================================
INSERT INTO health.patient_profiles (user_id, age, phone) VALUES
    (4, 32, '+1-555-0101'),
    (5, 45, '+1-555-0102'),
    (6, 28, '+1-555-0103');

-- ============================================================
-- Appointments
-- 6 appointments covering all statuses:
--   pending, approved, completed (x2), rejected, pending
-- ============================================================

-- Appointment 1: Alice → pending (unassigned, future)
INSERT INTO health.appointments (patient_id, doctor_id, datetime, status, notes)
VALUES (
    4,
    NULL,
    NOW() + INTERVAL '3 days',
    'pending',
    'Chest pain and shortness of breath for the past week.'
);

-- Appointment 2: Bob → approved, assigned to Dr. Sarah Chen (future)
INSERT INTO health.appointments (patient_id, doctor_id, datetime, status, notes)
VALUES (
    5,
    2,
    NOW() + INTERVAL '1 day',
    'approved',
    'Annual checkup and blood pressure review.'
);

-- Appointment 3: Alice → completed by Dr. James Okafor (past)
INSERT INTO health.appointments (patient_id, doctor_id, datetime, status, medical_condition, prescription, notes)
VALUES (
    4,
    3,
    NOW() - INTERVAL '7 days',
    'completed',
    'Seasonal allergies with rhinitis.',
    'Cetirizine 10mg once daily for 14 days. Nasal saline rinse twice daily.',
    'Patient reports sneezing and itchy eyes for 2 weeks.'
);

-- Appointment 4: Carol → completed by Dr. Sarah Chen (past)
INSERT INTO health.appointments (patient_id, doctor_id, datetime, status, medical_condition, prescription, notes)
VALUES (
    6,
    2,
    NOW() - INTERVAL '14 days',
    'completed',
    'Hypertension Stage 1.',
    'Amlodipine 5mg once daily. Reduce sodium intake. Follow up in 4 weeks.',
    'Blood pressure reading 145/92. No prior medication history.'
);

-- Appointment 5: Bob → rejected (admin rejected, no doctor assigned)
INSERT INTO health.appointments (patient_id, doctor_id, datetime, status, notes)
VALUES (
    5,
    NULL,
    NOW() - INTERVAL '2 days',
    'rejected',
    'Requested emergency slot — rescheduling required.'
);

-- Appointment 6: Carol → pending (new request, future)
INSERT INTO health.appointments (patient_id, doctor_id, datetime, status, notes)
VALUES (
    6,
    NULL,
    NOW() + INTERVAL '5 days',
    'pending',
    'Follow-up for hypertension management.'
);
