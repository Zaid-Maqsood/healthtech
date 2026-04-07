import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Activity, Eye, EyeOff, UserPlus } from 'lucide-react'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Name is required.'); return }
    if (!form.email.trim()) { setError('Email is required.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        ...(form.age && { age: parseInt(form.age) }),
        ...(form.phone && { phone: form.phone }),
      }
      const res = await api.post('/auth/register', payload)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object' && data !== null) {
        const messages = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ')
        setError(messages)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 flex-col items-center justify-center p-12 text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Join ClinicFlow</h1>
          <p className="text-sky-100 text-lg mb-8 max-w-sm">
            Create your patient account and start managing your health appointments today.
          </p>
          <div className="space-y-4 text-left">
            {[
              { title: 'Free to Join', desc: 'No cost to create a patient account' },
              { title: 'Instant Access', desc: 'Book your first appointment right away' },
              { title: 'Full History', desc: 'Keep track of all your past visits' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-sky-200 mt-2 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-sky-200 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ClinicFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
            <p className="text-gray-500 mt-1">Fill in your details to get started</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                className="input"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Email address <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="input pr-10"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Age <span className="text-gray-400 text-xs">(optional)</span></label>
                <input
                  type="number"
                  name="age"
                  className="input"
                  placeholder="25"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Phone <span className="text-gray-400 text-xs">(optional)</span></label>
                <input
                  type="tel"
                  name="phone"
                  className="input"
                  placeholder="+1 555 0000"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 font-medium hover:text-sky-700">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
