import React from 'react'
import { Calendar, Clock, User, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-sky-50 text-sky-700 border-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default function AppointmentCard({ appointment, linkTo, showPatient = false, showDoctor = false }) {
  const navigate = useNavigate()
  const dt = new Date(appointment.datetime)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => linkTo && navigate(linkTo)}
      className={`card p-4 ${linkTo ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[appointment.status] || STATUS_STYLES.pending}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>{dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {showPatient && appointment.patient_name && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <User className="w-4 h-4 shrink-0" />
              <span>Patient: {appointment.patient_name}</span>
            </div>
          )}
          {showDoctor && appointment.doctor_name && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <User className="w-4 h-4 shrink-0" />
              <span>Dr. {appointment.doctor_name}</span>
            </div>
          )}
          {appointment.notes && (
            <p className="text-sm text-gray-500 mt-2 italic">"{appointment.notes}"</p>
          )}
        </div>
        {linkTo && <ChevronRight className="w-4 h-4 text-gray-400 mt-1 shrink-0" />}
      </div>
    </motion.div>
  )
}
