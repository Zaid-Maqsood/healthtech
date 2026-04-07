-- ============================================================
-- ClinicFlow Database Schema
-- Database: graphite
-- Schema: health
-- All statements are idempotent (IF NOT EXISTS)
-- ============================================================

-- Create the schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS health;

-- ============================================================
-- Table: health.users
-- Central user table for all roles (admin, doctor, patient)
-- ============================================================
CREATE TABLE IF NOT EXISTS health.users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('admin', 'doctor', 'patient')),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Table: health.patient_profiles
-- Additional profile data for patients
-- ============================================================
CREATE TABLE IF NOT EXISTS health.patient_profiles (
    id      SERIAL  PRIMARY KEY,
    user_id INT     UNIQUE NOT NULL REFERENCES health.users(id) ON DELETE CASCADE,
    age     INT,
    phone   VARCHAR(50)
);

-- ============================================================
-- Table: health.doctor_profiles
-- Additional profile data for doctors
-- ============================================================
CREATE TABLE IF NOT EXISTS health.doctor_profiles (
    id             SERIAL  PRIMARY KEY,
    user_id        INT     UNIQUE NOT NULL REFERENCES health.users(id) ON DELETE CASCADE,
    specialization VARCHAR(255)
);

-- ============================================================
-- Table: health.appointments
-- Core entity representing clinic appointments
-- Lifecycle: pending → approved → completed (or rejected)
-- ============================================================
CREATE TABLE IF NOT EXISTS health.appointments (
    id                SERIAL  PRIMARY KEY,
    patient_id        INT     NOT NULL REFERENCES health.users(id) ON DELETE CASCADE,
    doctor_id         INT     REFERENCES health.users(id) ON DELETE SET NULL,
    datetime          TIMESTAMP NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'completed', 'rejected', 'cancelled')),
    medical_condition TEXT,
    prescription      TEXT,
    notes             TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes for common query patterns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON health.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id  ON health.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status     ON health.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime   ON health.appointments(datetime);
