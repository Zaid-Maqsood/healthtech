import React, { useEffect, useState } from 'react'
import { Users, Search, User } from 'lucide-react'
import { motion } from 'motion/react'
import Layout from '../../components/Layout'
import api from '../../api/client'

export default function AllPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/patients')
      .then(res => setPatients(Array.isArray(res.data) ? res.data : res.data.patients || []))
      .catch(() => setError('Failed to load patients.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  )

  return (
    <Layout role="admin">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
            <p className="text-gray-500 mt-1">
              {patients.length} registered patient{patients.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Age</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((patient, idx) => (
                        <motion.tr
                          key={patient.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-sky-600">
                                  {patient.name?.[0]?.toUpperCase() || 'P'}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">{patient.name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{patient.email || '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{patient.age ? `${patient.age} yrs` : '—'}</td>
                          <td className="px-4 py-3 text-gray-600">{patient.phone || '—'}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {patient.date_joined || patient.created_at
                              ? new Date(patient.date_joined || patient.created_at).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric'
                                })
                              : '—'
                            }
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Users className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  {search ? 'No patients match your search' : 'No patients registered yet'}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="text-sm text-violet-600 mt-2 hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
