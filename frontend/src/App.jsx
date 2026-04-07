import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ProtectedRoute from './components/ProtectedRoute'

import PatientDashboard from './pages/patient/Dashboard'
import BookAppointment from './pages/patient/BookAppointment'
import AppointmentHistory from './pages/patient/AppointmentHistory'
import PatientAppointmentDetail from './pages/patient/AppointmentDetail'

import DoctorDashboard from './pages/doctor/Dashboard'
import DoctorAppointmentList from './pages/doctor/AppointmentList'
import DoctorAppointmentDetail from './pages/doctor/AppointmentDetail'

import AdminDashboard from './pages/admin/Dashboard'
import AppointmentRequests from './pages/admin/AppointmentRequests'
import AllPatients from './pages/admin/AllPatients'
import AllAppointments from './pages/admin/AllAppointments'

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />
  return <Navigate to="/patient/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Patient routes */}
      <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/book" element={<ProtectedRoute role="patient"><BookAppointment /></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute role="patient"><AppointmentHistory /></ProtectedRoute>} />
      <Route path="/patient/appointments/:id" element={<ProtectedRoute role="patient"><PatientAppointmentDetail /></ProtectedRoute>} />

      {/* Doctor routes */}
      <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorAppointmentList /></ProtectedRoute>} />
      <Route path="/doctor/appointments/:id" element={<ProtectedRoute role="doctor"><DoctorAppointmentDetail /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/requests" element={<ProtectedRoute role="admin"><AppointmentRequests /></ProtectedRoute>} />
      <Route path="/admin/patients" element={<ProtectedRoute role="admin"><AllPatients /></ProtectedRoute>} />
      <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><AllAppointments /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
