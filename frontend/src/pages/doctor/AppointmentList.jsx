import React, { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import Layout from '../../components/Layout'
import AppointmentCard from '../../components/AppointmentCard'
import api from '../../api/client'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
]

export default function DoctorAppointmentList() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    api.get('/appointments/my')
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : res.data.appointments || []))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeTab === 'all'
    ? appointments
    : appointments.filter(a => a.status === activeTab)

  return (
    <Layout role="doctor">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 mt-1">All patient appointments assigned to you</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1.5 text-xs text-gray-400">
                  ({appointments.filter(a => a.status === tab.key).length})
                </span>
              )}
            </button>
          ))}
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

        {!loading && !error && (
          <>
            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map(apt => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    linkTo={`/doctor/appointments/${apt.id}`}
                    showPatient
                  />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No appointments found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {activeTab === 'all' ? 'You have no appointments yet' : `No ${activeTab} appointments`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
