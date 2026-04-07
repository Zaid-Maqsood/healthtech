import React, { useEffect, useState, useCallback } from 'react'
import { X, UserCog, ChevronDown, Calendar, ClipboardCheck, Pencil, Ban } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import Layout from '../../components/Layout'
import api from '../../api/client'

export default function AppointmentRequests() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState({})
  const [assignOpen, setAssignOpen] = useState({})
  const [selectedDoctor, setSelectedDoctor] = useState({})
  const [editOpen, setEditOpen] = useState({})
  const [editData, setEditData] = useState({})

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [aptsRes, docsRes] = await Promise.all([
        api.get('/appointments?status=pending'),
        api.get('/admin/doctors'),
      ])
      setAppointments(Array.isArray(aptsRes.data) ? aptsRes.data : aptsRes.data.appointments || [])
      setDoctors(Array.isArray(docsRes.data) ? docsRes.data : docsRes.data.doctors || [])
    } catch {
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleAction(id, action) {
    setActionLoading(prev => ({ ...prev, [`${id}-${action}`]: true }))
    try {
      await api.patch(`/appointments/${id}/${action}`)
      loadData()
    } catch (err) {
      const msg = err.response?.data?.error
      if (msg) alert(msg)
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[`${id}-${action}`]; return n })
    }
  }

  async function handleAssignDoctor(id) {
    const doctorId = selectedDoctor[id]
    if (!doctorId) return
    setActionLoading(prev => ({ ...prev, [`${id}-assign`]: true }))
    try {
      await api.patch(`/appointments/${id}/assign-doctor`, { doctor_id: doctorId })
      setAssignOpen(prev => ({ ...prev, [id]: false }))
      loadData()
    } catch {
      // refresh
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[`${id}-assign`]; return n })
    }
  }

  function openEdit(apt) {
    const local = new Date(apt.datetime)
    const pad = n => String(n).padStart(2, '0')
    const localStr = `${local.getFullYear()}-${pad(local.getMonth()+1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`
    setEditData(prev => ({ ...prev, [apt.id]: { datetime: localStr, notes: apt.notes || '' } }))
    setEditOpen(prev => ({ ...prev, [apt.id]: true }))
  }

  async function handleEdit(id) {
    const data = editData[id]
    if (!data?.datetime) return
    setActionLoading(prev => ({ ...prev, [`${id}-edit`]: true }))
    try {
      await api.patch(`/appointments/${id}`, { datetime: data.datetime, notes: data.notes })
      setEditOpen(prev => ({ ...prev, [id]: false }))
      loadData()
    } catch (err) {
      const msg = err.response?.data?.error
      if (msg) alert(msg)
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[`${id}-edit`]; return n })
    }
  }

  return (
    <Layout role="admin">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Appointment Requests</h1>
          <p className="text-gray-500 mt-1">Review and manage pending appointment requests</p>
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
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map(apt => {
                  const dt = new Date(apt.datetime)
                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-5"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-semibold text-gray-900">{apt.patient_name || 'Unknown Patient'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{apt.patient_email || ''}</p>
                        </div>
                        <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                          Pending
                        </span>
                      </div>

                      {/* Info row */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <span>{dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {apt.doctor_name && (
                          <div className="flex items-center gap-1.5 text-sm text-sky-600">
                            <UserCog className="w-4 h-4" />
                            <span>Dr. {apt.doctor_name}</span>
                          </div>
                        )}
                      </div>

                      {apt.notes && (
                        <p className="text-sm text-gray-500 italic mb-4 bg-gray-50 rounded-lg px-3 py-2">
                          "{apt.notes}"
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleAction(apt.id, 'reject')}
                          disabled={!!actionLoading[`${apt.id}-reject`]}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading[`${apt.id}-reject`]
                            ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <X className="w-3.5 h-3.5" />
                          }
                          Reject
                        </button>
                        <button
                          onClick={() => setAssignOpen(prev => ({ ...prev, [apt.id]: !prev[apt.id] }))}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                          Assign Doctor
                          <ChevronDown className={`w-3 h-3 transition-transform ${assignOpen[apt.id] ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                          onClick={() => openEdit(apt)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => { if (window.confirm('Cancel this appointment?')) handleAction(apt.id, 'cancel') }}
                          disabled={!!actionLoading[`${apt.id}-cancel`]}
                          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading[`${apt.id}-cancel`]
                            ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : <Ban className="w-3.5 h-3.5" />
                          }
                          Cancel
                        </button>
                      </div>

                      {/* Assign doctor dropdown */}
                      <AnimatePresence>
                        {assignOpen[apt.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 overflow-hidden"
                          >
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <select
                                className="flex-1 input text-sm py-1.5"
                                value={selectedDoctor[apt.id] || ''}
                                onChange={e => setSelectedDoctor(prev => ({ ...prev, [apt.id]: e.target.value }))}
                              >
                                <option value="">Select a doctor...</option>
                                {doctors.map(doc => (
                                  <option key={doc.id} value={doc.id}>
                                    Dr. {doc.name} {doc.specialization ? `— ${doc.specialization}` : ''}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssignDoctor(apt.id)}
                                disabled={!selectedDoctor[apt.id] || !!actionLoading[`${apt.id}-assign`]}
                                className="px-4 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                              >
                                {actionLoading[`${apt.id}-assign`]
                                  ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  : null
                                }
                                Assign & Approve
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Edit form */}
                      <AnimatePresence>
                        {editOpen[apt.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 overflow-hidden"
                          >
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Edit Appointment</p>
                              <div>
                                <label className="label text-xs">Date & Time</label>
                                <input
                                  type="datetime-local"
                                  className="input text-sm py-1.5"
                                  value={editData[apt.id]?.datetime || ''}
                                  onChange={e => setEditData(prev => ({ ...prev, [apt.id]: { ...prev[apt.id], datetime: e.target.value } }))}
                                />
                              </div>
                              <div>
                                <label className="label text-xs">Notes</label>
                                <textarea
                                  className="input text-sm py-1.5 resize-none"
                                  rows={2}
                                  value={editData[apt.id]?.notes || ''}
                                  onChange={e => setEditData(prev => ({ ...prev, [apt.id]: { ...prev[apt.id], notes: e.target.value } }))}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(apt.id)}
                                  disabled={!!actionLoading[`${apt.id}-edit`]}
                                  className="px-4 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {actionLoading[`${apt.id}-edit`]
                                    ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    : null
                                  }
                                  Save Changes
                                </button>
                                <button
                                  onClick={() => setEditOpen(prev => ({ ...prev, [apt.id]: false }))}
                                  className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <ClipboardCheck className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No pending requests</p>
                <p className="text-gray-400 text-sm mt-1">All appointment requests have been processed</p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
