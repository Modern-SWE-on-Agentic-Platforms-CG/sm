/**
 * CandidateForm — create/edit candidate fields
 */
import React, { useState } from 'react'
import type { Candidate, CandidateSource } from '@appTypes/candidate'

type FormData = Omit<Candidate, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'agingDays' | 'lastModified' | 'comments'>

interface CandidateFormProps {
  initial?: Partial<FormData>
  onSubmit: (data: FormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

const SOURCES: CandidateSource[] = [
  'REFERRAL', 'NAUKRI', 'LINKEDIN', 'DIRECT', 'CAMPUS', 'CONSULTANT', 'OTHER',
] as CandidateSource[]

const TECHNOLOGIES = [
  'Java', 'Python', 'JavaScript', 'TypeScript', 'React', 'Angular', '.NET',
  'Node.js', 'DevOps', 'Data Engineering', 'QA', 'iOS', 'Android',
]

export const CandidateForm: React.FC<CandidateFormProps> = ({
  initial,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [form, setForm] = useState<Partial<FormData>>({
    name: '',
    email: '',
    contact: '',
    technology: '',
    experience: 0,
    bu: '',
    source: 'DIRECT' as CandidateSource,
    ...initial,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const validate = (): boolean => {
    const next: typeof errors = {}
    if (!form.name?.trim()) next.name = 'Name is required'
    if (!form.email?.trim()) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Invalid email address'
    }
    if (!form.contact?.trim()) next.contact = 'Contact number is required'
    if (!form.technology?.trim()) next.technology = 'Technology is required'
    if (form.experience == null || form.experience < 0) next.experience = 'Experience must be 0 or more'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form as FormData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name ?? ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="John Doe"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={form.email ?? ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="john@example.com"
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contact <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={form.contact ?? ''}
          onChange={(e) => handleChange('contact', e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contact ? 'border-red-400' : 'border-gray-300'}`}
          placeholder="+91 99999 99999"
        />
        {errors.contact && <p className="mt-1 text-xs text-red-500">{errors.contact}</p>}
      </div>

      {/* Technology */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Technology <span className="text-red-500">*</span>
        </label>
        <select
          value={form.technology ?? ''}
          onChange={(e) => handleChange('technology', e.target.value)}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.technology ? 'border-red-400' : 'border-gray-300'}`}
        >
          <option value="">Select technology</option>
          {TECHNOLOGIES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.technology && <p className="mt-1 text-xs text-red-500">{errors.technology}</p>}
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Experience (years)
        </label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={form.experience ?? 0}
          onChange={(e) => handleChange('experience', parseFloat(e.target.value) || 0)}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.experience ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.experience && <p className="mt-1 text-xs text-red-500">{errors.experience}</p>}
      </div>

      {/* BU */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Unit</label>
        <input
          type="text"
          value={form.bu ?? ''}
          onChange={(e) => handleChange('bu', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. EAS"
        />
      </div>

      {/* Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
        <select
          value={form.source ?? 'DIRECT'}
          onChange={(e) => handleChange('source', e.target.value as CandidateSource)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Candidate'}
        </button>
      </div>
    </form>
  )
}

export default CandidateForm
