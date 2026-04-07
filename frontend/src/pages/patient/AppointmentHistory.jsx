import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Plus } from 'lucide-react'
import { motion } from 'motion/react'
import Layout from '../../components/Layout'
import AppointmentCard from '../../components/AppointmentCard'
import api from '../../api/client'

export default function AppointmentHistory() {
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/appointments/my')
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : res.data.appointments || []))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const upcoming = appointments.filter(a =>
    ['pending', 'approved'].includes(a.status) || new Date(a.datetime) >= now
  )
  const past = appointments.filter(a =>
    ['completed', 'rejected'].includes(a.status) ||
    (a.status !== 'pending' && a.status !== 'approved' && new Date(a.datetime) < now)
  )

  return (
    <Layout role="patient">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-500 mt-1">View and track all your appointments</p>
          </div>
          <button
            onClick={() => navigate('/patient/book')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Book New
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Upcoming */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-sky-600" />
                <h2 className="text-lg font-semibold text-gray-900">Upcoming & Pending</h2>
                <span className="ml-auto text-sm text-gray-400">{upcoming.length} appointment{upcoming.length !== 1 ? 's' : ''}</span>
              </div>
              {upcoming.length > 0 ? (
                <div className="space-y-3">
                  {upcoming.map(apt => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      linkTo={`/patient/appointments/${apt.id}`}
                      showDoctor
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-6 text-center">
                  <p className="text-gray-400 text-sm">No upcoming appointments</p>
                  <button
                    onClick={() => navigate('/patient/book')}
                    className="btn-primary mt-3 text-sm"
                  >
                    Book one now
                  </button>
                </div>
              )}
            </section>

            {/* Past */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Past Appointments</h2>
                <span className="ml-auto text-sm text-gray-400">{past.length} appointment{past.length !== 1 ? 's' : ''}</span>
              </div>
              {past.length > 0 ? (
                <div className="space-y-3">
                  {past.map(apt => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      linkTo={`/patient/appointments/${apt.id}`}
                      showDoctor
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-6 text-center">
                  <p className="text-gray-400 text-sm">No past appointments yet</p>
                </div>
              )}
            </section>

            {appointments.length === 0 && (
              <div className="card p-12 text-center mt-4">
                <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium mb-1">No appointments yet</p>
                <p className="text-gray-400 text-sm mb-6">Book your first appointment to get started</p>
                <button
                  onClick={() => navigate('/patient/book')}
                  className="btn-primary"
                >
                  Book Appointment
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
