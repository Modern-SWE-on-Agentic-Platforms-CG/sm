/**
 * ReferralFormScreen — SPOC submits a referred candidate
 */
import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import type { AppDispatch, RootState } from '@store/store'
import { submitReferral } from '@store/slices/referralSlice'
import type { ReferralSubmission } from '@appTypes/referral'

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

const ReferralFormScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const isSubmitting = useSelector((s: RootState) => s.referral.isSubmitting)
  const apiError = useSelector((s: RootState) => s.referral.error)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<Omit<ReferralSubmission, 'resume'>>({
    name: '', contact: '', email: '',
    totalExperience: 0, relevantExperience: 0, skill: '', bu: '',
  })
  const [resume, setResume] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fileError, setFileError] = useState('')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.contact.trim()) e.contact = 'Contact is required'
    else if (!/^\d+$/.test(form.contact)) e.contact = 'Contact must be numeric'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.skill.trim()) e.skill = 'Skill is required'
    if (form.totalExperience < 0) e.totalExperience = 'Must be ≥ 0'
    if (form.relevantExperience < 0) e.relevantExperience = 'Must be ≥ 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file && !ALLOWED_TYPES.includes(file.type)) {
      setFileError('Only PDF or DOC files allowed')
      setResume(null)
    } else {
      setFileError('')
      setResume(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const result = await dispatch(submitReferral({ ...form, resume }))
    if (submitReferral.fulfilled.match(result)) {
      navigate('/referral-portal/ref-candidate-details')
    }
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({
      ...prev,
      [key]: key === 'totalExperience' || key === 'relevantExperience'
        ? parseFloat(e.target.value) || 0
        : e.target.value,
    }))

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Submit Referral</h1>

      {apiError && (
        <div role="alert" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{apiError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {([
          ['name', 'Candidate Name', 'text'],
          ['contact', 'Contact Number', 'text'],
          ['email', 'Email', 'email'],
          ['skill', 'Skill / Technology', 'text'],
          ['bu', 'BU (optional)', 'text'],
        ] as [keyof typeof form, string, string][]).map(([key, label, type]) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
              {label} {key !== 'bu' && <span className="text-red-500">*</span>}
            </label>
            <input
              id={key}
              type={type}
              value={String(form[key])}
              onChange={set(key)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="totalExp" className="block text-sm font-medium text-gray-700 mb-1">Total Exp (yrs) <span className="text-red-500">*</span></label>
            <input id="totalExp" type="number" min={0} step={0.5} value={form.totalExperience}
              onChange={(e) => setForm((p) => ({ ...p, totalExperience: parseFloat(e.target.value) || 0 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            {errors.totalExperience && <p className="mt-1 text-xs text-red-600">{errors.totalExperience}</p>}
          </div>
          <div>
            <label htmlFor="relExp" className="block text-sm font-medium text-gray-700 mb-1">Relevant Exp (yrs) <span className="text-red-500">*</span></label>
            <input id="relExp" type="number" min={0} step={0.5} value={form.relevantExperience}
              onChange={(e) => setForm((p) => ({ ...p, relevantExperience: parseFloat(e.target.value) || 0 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            {errors.relevantExperience && <p className="mt-1 text-xs text-red-600">{errors.relevantExperience}</p>}
          </div>
        </div>

        {/* Resume upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF/DOC)</label>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange}
            className="block text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
          {resume && <p className="mt-1 text-xs text-green-600">{resume.name}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Referral'}
        </button>
      </form>
    </div>
  )
}

export default ReferralFormScreen
