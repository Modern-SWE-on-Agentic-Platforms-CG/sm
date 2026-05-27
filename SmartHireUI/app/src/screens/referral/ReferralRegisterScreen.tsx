/**
 * ReferralRegisterScreen — SPOC / Candidate self-registration (localStorage-based auth)
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { setReferralSession } from '@services/auth/referralAuth'
import type { ReferralUser } from '@appTypes/referral'

const BU_OPTIONS = ['Delivery', 'Java', 'Python', 'SAP', 'GCCA', 'Invent', 'Other']

const ReferralRegisterScreen: React.FC = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<Omit<ReferralUser, 'employeeId'> & { employeeId: string }>({
    employeeId: '',
    name: '',
    email: '',
    role: 'SPOC',
    bu: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!form.employeeId.trim()) newErrors.employeeId = 'Employee ID is required'
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Invalid email'
    if (!form.bu) newErrors.bu = 'BU is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    // Store in localStorage (referral-specific auth — no Keycloak)
    setReferralSession(form as ReferralUser)
    navigate('/referral-portal/ref-candidate-details')
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Referral Portal — Register</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee ID */}
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">Employee ID <span className="text-red-500">*</span></label>
            <input id="employeeId" type="text" value={form.employeeId} onChange={set('employeeId')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            {errors.employeeId && <p className="mt-1 text-xs text-red-600">{errors.employeeId}</p>}
          </div>

          {/* Name */}
          <div>
            <label htmlFor="refName" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input id="refName" type="text" value={form.name} onChange={set('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="refEmail" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input id="refEmail" type="email" value={form.email} onChange={set('email')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="refRole" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select id="refRole" value={form.role} onChange={set('role')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="SPOC">SPOC</option>
              <option value="Candidate">Candidate</option>
            </select>
          </div>

          {/* BU */}
          <div>
            <label htmlFor="refBU" className="block text-sm font-medium text-gray-700 mb-1">BU <span className="text-red-500">*</span></label>
            <select id="refBU" value={form.bu} onChange={set('bu')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select BU</option>
              {BU_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.bu && <p className="mt-1 text-xs text-red-600">{errors.bu}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 mt-2"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReferralRegisterScreen
