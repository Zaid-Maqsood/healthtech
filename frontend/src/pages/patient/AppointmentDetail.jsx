import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, FileText, Pill, Stethoscope } from 'lucide-react'
import { motion } from 'motion/react'
import Layout from '../../components/Layout'
import api from '../../api/client'

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-sky-50 text-sky-700 border-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default function PatientAppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/appointments/${id}`)
      .then(res => setAppointment(res.data.appointment || res.data))
      .catch(() => setError('Failed to load appointment details.'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <Layout role="patient">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/patient/appointments')}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-gray-500 text-sm mt-0.5">Full information about your appointment</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {appointment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Main card */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Appointment Info</h2>
                <span className={`text-sm font-medium px-3 py-1 rounded-full border ${STATUS_STYLES[appointment.status] || STATUS_STYLES.pending}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="font-medium">
                      {new Date(appointment.datetime).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Time</p>
                    <p className="font-medium">
                      {new Date(appointment.datetime).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {appointment.doctor_name && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Doctor</p>
                      <p className="font-medium">Dr. {appointment.doctor_name}</p>
                    </div>
                  </div>
                )}

                {appointment.notes && (
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Your Notes</p>
                      <p className="font-medium">{appointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Medical condition */}
            {appointment.medical_condition && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Medical Condition</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">
                  {appointment.medical_condition}
                </p>
              </motion.div>
            )}

            {/* Prescription */}
            {appointment.prescription && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <Pill className="w-4 h-4 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Prescription</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">
                  {appointment.prescription}
                </p>
              </motion.div>
            )}

            {/* Status info for pending */}
            {appointment.status === 'pending' && (
              <div className="card p-4 bg-amber-50 border-amber-100">
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">Awaiting approval:</span> Your appointment request is being reviewed by our admin team. You'll see an update here once it's processed.
                </p>
              </div>
            )}

            {appointment.status === 'rejected' && (
              <div className="card p-4 bg-red-50 border-red-100">
                <p className="text-xs text-red-700">
                  <span className="font-semibold">Appointment rejected:</span> This appointment was not approved. Please book a new appointment or contact the clinic for more information.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  )
}
