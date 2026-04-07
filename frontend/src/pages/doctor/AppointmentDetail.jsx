import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, Phone, FileText, Stethoscope, Pill, CheckCircle, AlertCircle } from 'lucide-react'
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

export default function DoctorAppointmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form state
  const [medicalCondition, setMedicalCondition] = useState('')
  const [prescription, setPrescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get(`/appointments/${id}`)
      .then(res => setAppointment(res.data.appointment || res.data))
      .catch(() => setError('Failed to load appointment details.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleComplete(e) {
    e.preventDefault()
    setFormError('')
    if (!medicalCondition.trim()) { setFormError('Medical condition is required.'); return }
    if (!prescription.trim()) { setFormError('Prescription is required.'); return }
    setSubmitting(true)
    try {
      const res = await api.patch(`/appointments/${id}/complete`, {
        medical_condition: medicalCondition,
        prescription,
      })
      setAppointment(res.data.appointment || res.data)
      setSuccess(true)
    } catch (err) {
      const data = err.response?.data
      setFormError(
        typeof data === 'object'
          ? Object.values(data).flat().join(' ')
          : 'Failed to complete appointment. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout role="doctor">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-gray-500 text-sm mt-0.5">Review and complete this appointment</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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
            {/* Patient info */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
                <span className={`text-sm font-medium px-3 py-1 rounded-full border ${STATUS_STYLES[appointment.status] || STATUS_STYLES.pending}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3">
                {appointment.patient_name && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Patient Name</p>
                      <p className="text-sm font-medium text-gray-800">{appointment.patient_name}</p>
                    </div>
                  </div>
                )}
                {appointment.patient_age && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Age</p>
                      <p className="text-sm font-medium text-gray-800">{appointment.patient_age} years</p>
                    </div>
                  </div>
                )}
                {appointment.patient_phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-800">{appointment.patient_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment info */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Info</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(appointment.datetime).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Time</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(appointment.datetime).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {appointment.notes && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Patient Notes</p>
                      <p className="text-sm font-medium text-gray-800">{appointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Complete form - only for approved status */}
            {appointment.status === 'approved' && !success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Complete Appointment</h2>
                <p className="text-sm text-gray-500 mb-5">Fill in the medical details to mark this appointment as completed.</p>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                <form onSubmit={handleComplete} className="space-y-4">
                  <div>
                    <label className="label">
                      Medical Condition <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="input resize-none"
                      rows={3}
                      placeholder="Describe the patient's medical condition or diagnosis..."
                      value={medicalCondition}
                      onChange={e => setMedicalCondition(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">
                      Prescription <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="input resize-none"
                      rows={3}
                      placeholder="Enter medications, dosage, and instructions..."
                      value={prescription}
                      onChange={e => setPrescription(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Mark as Completed
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Success state */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-6 bg-emerald-50 border-emerald-200 text-center"
              >
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-semibold text-emerald-800 text-lg">Appointment Completed!</h3>
                <p className="text-emerald-600 text-sm mt-1">Medical details have been saved successfully.</p>
              </motion.div>
            )}

            {/* Read-only completed view */}
            {appointment.status === 'completed' && (
              <>
                {appointment.medical_condition && (
                  <div className="card p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-red-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Medical Condition</h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">
                      {appointment.medical_condition}
                    </p>
                  </div>
                )}
                {appointment.prescription && (
                  <div className="card p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <Pill className="w-4 h-4 text-violet-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Prescription</h3>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg p-3">
                      {appointment.prescription}
                    </p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  )
}
