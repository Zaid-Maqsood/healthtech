import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Users, UserCheck, Calendar, ClipboardCheck, Check, X, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import api from '../../api/client'

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-sky-50 text-sky-700 border-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState({})

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleReject(id) {
    setActionLoading(prev => ({ ...prev, [id]: 'reject' }))
    try {
      await api.patch(`/appointments/${id}/reject`)
      loadData()
    } catch (err) {
      const msg = err.response?.data?.error
      alert(msg || 'Failed to reject appointment.')
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  return (
    <Layout role="admin">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of the entire clinic</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Users} label="Total Patients" value={data.total_patients ?? 0} color="sky" />
              <StatCard icon={UserCheck} label="Total Doctors" value={data.total_doctors ?? 0} color="emerald" />
              <StatCard icon={Calendar} label="Total Appointments" value={data.total_appointments ?? 0} color="violet" />
              <StatCard icon={ClipboardCheck} label="Pending Requests" value={data.pending_requests ?? 0} color="amber" />
            </div>

            {/* Pending requests */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
                <Link
                  to="/admin/requests"
                  className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {data.pending_appointments?.length > 0 ? (
                <div className="space-y-3">
                  {data.pending_appointments.slice(0, 5).map(apt => {
                    const dt = new Date(apt.datetime)
                    const isLoading = actionLoading[apt.id]
                    return (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {apt.patient_name || 'Patient'}
                            </p>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES.pending}`}>
                              Pending
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {' '}at{' '}
                            {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {apt.notes && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate italic">"{apt.notes}"</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4 shrink-0">
                          <button
                            onClick={() => navigate('/admin/requests')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            Assign & Approve
                          </button>
                          <button
                            onClick={() => handleReject(apt.id)}
                            disabled={!!isLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isLoading === 'reject' ? (
                              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            Reject
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No pending requests</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
