import React, { useEffect, useState, useCallback } from 'react'
import { Calendar, Pencil, Ban, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Layout from '../../components/Layout'
import api from '../../api/client'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'cancelled', label: 'Cancelled' },
]

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-sky-50 text-sky-700 border-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default function AllAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [actionLoading, setActionLoading] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ datetime: '', notes: '' })

  const loadData = useCallback(() => {
    setLoading(true)
    api.get('/appointments')
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : res.data.appointments || []))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filtered = activeTab === 'all'
    ? appointments
    : appointments.filter(a => a.status === activeTab)

  const counts = TABS.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'all'
      ? appointments.length
      : appointments.filter(a => a.status === tab.key).length
    return acc
  }, {})

  async function handleCancel(id) {
    if (!window.confirm('Cancel this appointment?')) return
    setActionLoading(prev => ({ ...prev, [id]: 'cancel' }))
    try {
      await api.patch(`/appointments/${id}/cancel`)
      loadData()
    } catch (err) {
      const msg = err.response?.data?.error
      if (msg) alert(msg)
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  function openEdit(apt) {
    const local = new Date(apt.datetime)
    const pad = n => String(n).padStart(2, '0')
    const localStr = `${local.getFullYear()}-${pad(local.getMonth()+1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`
    setEditData({ datetime: localStr, notes: apt.notes || '' })
    setEditingId(apt.id)
  }

  async function handleEdit(id) {
    if (!editData.datetime) return
    setActionLoading(prev => ({ ...prev, [id]: 'edit' }))
    try {
      await api.patch(`/appointments/${id}`, { datetime: editData.datetime, notes: editData.notes })
      setEditingId(null)
      loadData()
    } catch (err) {
      const msg = err.response?.data?.error
      if (msg) alert(msg)
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  return (
    <Layout role="admin">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>
          <p className="text-gray-500 mt-1">Complete view of all clinic appointments</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-gray-400">({counts[tab.key]})</span>
            </button>
          ))}
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

        {!loading && !error && (
          <>
            {filtered.length > 0 ? (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Doctor</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((apt, idx) => {
                        const dt = new Date(apt.datetime)
                        const isEditing = editingId === apt.id
                        const canEdit = !['completed', 'cancelled'].includes(apt.status)
                        const canCancel = !['completed', 'cancelled'].includes(apt.status)
                        return (
                          <React.Fragment key={apt.id}>
                            <motion.tr
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-sky-600">
                                      {apt.patient_name?.[0]?.toUpperCase() || 'P'}
                                    </span>
                                  </div>
                                  <span className="font-medium text-gray-900">{apt.patient_name || '—'}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {apt.doctor_name ? `Dr. ${apt.doctor_name}` : <span className="text-gray-300">Not assigned</span>}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[apt.status] || STATUS_STYLES.pending}`}>
                                  {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-500 max-w-xs">
                                {apt.notes ? (
                                  <span className="truncate block italic text-xs">"{apt.notes}"</span>
                                ) : (
                                  <span className="text-gray-300">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  {canEdit && (
                                    <button
                                      onClick={() => isEditing ? setEditingId(null) : openEdit(apt)}
                                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                      title="Edit"
                                    >
                                      {isEditing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                                    </button>
                                  )}
                                  {canCancel && (
                                    <button
                                      onClick={() => handleCancel(apt.id)}
                                      disabled={!!actionLoading[apt.id]}
                                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-gray-400 transition-colors disabled:opacity-50"
                                      title="Cancel"
                                    >
                                      {actionLoading[apt.id] === 'cancel'
                                        ? <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                                        : <Ban className="w-3.5 h-3.5" />
                                      }
                                    </button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                            {/* Inline edit row */}
                            <AnimatePresence>
                              {isEditing && (
                                <tr>
                                  <td colSpan={6} className="px-4 pb-3 bg-violet-50/40">
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="flex flex-wrap items-end gap-3 pt-3">
                                        <div>
                                          <label className="label text-xs">Date & Time</label>
                                          <input
                                            type="datetime-local"
                                            className="input text-sm py-1.5"
                                            value={editData.datetime}
                                            onChange={e => setEditData(p => ({ ...p, datetime: e.target.value }))}
                                          />
                                        </div>
                                        <div className="flex-1 min-w-48">
                                          <label className="label text-xs">Notes</label>
                                          <input
                                            type="text"
                                            className="input text-sm py-1.5"
                                            value={editData.notes}
                                            placeholder="Notes (optional)"
                                            onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))}
                                          />
                                        </div>
                                        <button
                                          onClick={() => handleEdit(apt.id)}
                                          disabled={!!actionLoading[apt.id]}
                                          className="px-4 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                                        >
                                          {actionLoading[apt.id] === 'edit'
                                            ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            : null
                                          }
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingId(null)}
                                          className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shrink-0"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </motion.div>
                                  </td>
                                </tr>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  {activeTab === 'all' ? 'No appointments yet' : `No ${activeTab} appointments`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
