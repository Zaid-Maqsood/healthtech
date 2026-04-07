import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ClipboardList, Brain, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
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

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [aiModal, setAiModal] = useState(false)

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout role="patient">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-gray-500 mt-1">Here's an overview of your appointments</p>
          </div>
          <button
            onClick={() => navigate('/patient/book')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Book Appointment
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

        {data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard
                icon={Calendar}
                label="Upcoming Appointments"
                value={data.upcoming_count ?? 0}
                color="sky"
              />
              <StatCard
                icon={ClipboardList}
                label="Past Appointments"
                value={data.past_count ?? 0}
                color="emerald"
              />
              {/* AI Doctor card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setAiModal(true)}
                className="card p-5 cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-medium">Beta</span>
                </div>
                <p className="text-lg font-bold text-gray-900">AI Doctor</p>
                <p className="text-sm text-gray-500 mt-0.5">Get AI-powered insights</p>
              </motion.div>
            </div>

            {/* Recent appointments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  View all
                </button>
              </div>
              {data.upcoming_appointments?.length > 0 ? (
                <div className="space-y-3">
                  {data.upcoming_appointments.map(apt => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      linkTo={`/patient/appointments/${apt.id}`}
                      showDoctor
                    />
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No upcoming appointments</p>
                  <button
                    onClick={() => navigate('/patient/book')}
                    className="btn-primary mt-4 text-sm"
                  >
                    Book your first appointment
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* AI Doctor Modal */}
      <AnimatePresence>
        {aiModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setAiModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                The AI Doctor feature is currently under development. It will provide intelligent health insights and appointment recommendations powered by AI.
              </p>
              <button
                onClick={() => setAiModal(false)}
                className="btn-primary w-full mt-6"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}
