import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, Calendar, ClipboardList, Users, ClipboardCheck,
  ChevronLeft, ChevronRight, LogOut, Activity
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'motion/react'

const NAV_ITEMS = {
  patient: [
    { to: '/patient/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/patient/book', icon: Calendar, label: 'Book Appointment' },
    { to: '/patient/appointments', icon: ClipboardList, label: 'My Appointments' },
  ],
  doctor: [
    { to: '/doctor/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/admin/requests', icon: ClipboardCheck, label: 'Requests' },
    { to: '/admin/patients', icon: Users, label: 'Patients' },
    { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  ],
}

const ROLE_COLORS = {
  patient: 'from-sky-500 to-sky-600',
  doctor: 'from-emerald-500 to-emerald-600',
  admin: 'from-violet-500 to-violet-600',
}

const ROLE_LABELS = {
  patient: 'Patient Portal',
  doctor: 'Doctor Portal',
  admin: 'Admin Panel',
}

export default function Layout({ children, role }) {
  const [open, setOpen] = useState(true)
  const { user, logout } = useAuth()

  const navItems = NAV_ITEMS[role] || []
  const gradient = ROLE_COLORS[role] || 'from-sky-500 to-sky-600'
  const portalLabel = ROLE_LABELS[role] || 'ClinicFlow'

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <motion.nav
        animate={{ width: open ? 240 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative flex flex-col shrink-0 bg-white border-r border-gray-200 shadow-sm overflow-hidden"
        style={{ minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className={`shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Activity className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-bold text-gray-900 whitespace-nowrap">ClinicFlow</p>
                <p className="text-xs text-gray-500 whitespace-nowrap">{portalLabel}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav links */}
        <div className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </div>

        {/* User + logout */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 px-1 mb-2">
            <div className={`shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-xs font-bold text-white">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setOpen(!open)}
          className="absolute top-1/2 -right-3 transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          {open ? <ChevronLeft className="w-3 h-3 text-gray-600" /> : <ChevronRight className="w-3 h-3 text-gray-600" />}
        </button>
      </motion.nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}
