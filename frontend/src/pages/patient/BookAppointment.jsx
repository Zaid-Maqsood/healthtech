import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Calendar, CheckCircle, ArrowLeft } from 'lucide-react'
import Layout from '../../components/Layout'
import api from '../../api/client'

export default function BookAppointment() {
  const navigate = useNavigate()
  const [datetime, setDatetime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Compute min datetime (now)
  const minDatetime = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!datetime) { setError('Please select a date and time.'); return }
    setLoading(true)
    try {
      await api.post('/appointments', {
        datetime,
        ...(notes.trim() && { notes: notes.trim() }),
      })
      setSuccess(true)
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object' && data !== null) {
        const messages = Object.entries(data)
          .map(([k, v]) => `${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' ')
        setError(messages)
      } else {
        setError('Failed to book appointment. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Layout role="patient">
        <div className="max-w-md mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-8 text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Appointment Requested!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your appointment request has been submitted. An admin will review and approve it shortly.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/patient/dashboard')}
                className="btn-primary w-full"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => { setSuccess(false); setDatetime(''); setNotes('') }}
                className="btn-secondary w-full"
              >
                Book Another
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout role="patient">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
            <p className="text-gray-500 text-sm mt-0.5">Choose a date and time that works for you</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Date & Time <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="datetime-local"
                className="input"
                value={datetime}
                min={minDatetime}
                onChange={e => setDatetime(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Select a future date and time for your appointment</p>
            </div>

            <div>
              <label className="label">
                Notes <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Describe your symptoms or reason for visit..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">{notes.length}/500 characters</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Request Appointment
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <div className="mt-4 card p-4 bg-sky-50 border-sky-100">
          <p className="text-xs text-sky-700">
            <span className="font-semibold">How it works:</span> After you submit your request, our admin team will review and approve it. You'll be able to check the status in "My Appointments".
          </p>
        </div>
      </div>
    </Layout>
  )
}
