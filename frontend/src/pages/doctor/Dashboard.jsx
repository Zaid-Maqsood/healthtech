import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import AppointmentCard from '../../components/AppointmentCard'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout role="doctor">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-gray-500">{getGreeting()}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dr. {user?.name || 'Doctor'}
          </h1>
          <p className="text-gray-500 mt-1">Here's your schedule overview</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <StatCard
                icon={Clock}
                label="Today's Appointments"
                value={data.today_count ?? 0}
                color="emerald"
              />
              <StatCard
                icon={Calendar}
                label="Total Upcoming"
                value={data.upcoming_count ?? 0}
                color="sky"
              />
            </div>

            {/* Today's appointments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
                <button
                  onClick={() => navigate('/doctor/appointments')}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View all
                </button>
              </div>
              {data.today_appointments?.length > 0 ? (
                <div className="space-y-3">
                  {data.today_appointments.map(apt => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      linkTo={`/doctor/appointments/${apt.id}`}
                      showPatient
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No appointments scheduled for today</p>
                </div>
              )}
            </div>

            {/* Upcoming section if today is empty but upcoming exists */}
            {(!data.today_appointments?.length) && data.upcoming_appointments?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
                <div className="space-y-3">
                  {data.upcoming_appointments.slice(0, 5).map(apt => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      linkTo={`/doctor/appointments/${apt.id}`}
                      showPatient
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
