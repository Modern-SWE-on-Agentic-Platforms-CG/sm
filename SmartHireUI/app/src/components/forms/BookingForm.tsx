/**
 * BookingForm — dual-mode form for Interviewer (create slot) and Recruiter (book candidate)
 */
import React, { useState } from 'react'
import type { BookingForm as BookingFormData, InterviewType, ParticipationType } from '@appTypes/booking'

interface BookingFormProps {
  mode: 'interviewer' | 'recruiter'
  /** For recruiter mode — list of candidates to pick */
  candidates?: { id: string; name: string; technology: string }[]
  /** Prefill slot details (for recruiter mode) */
  slotDate?: string
  slotStart?: string
  slotEnd?: string
  onSubmit: (data: BookingFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

const INTERVIEW_TYPES: InterviewType[] = [
  'TECHNICAL', 'HR', 'MANAGER', 'CLIENT', 'PANEL',
] as InterviewType[]

const PARTICIPATION_TYPES: ParticipationType[] = ['IN_PERSON', 'VIRTUAL'] as ParticipationType[]

const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8
  const min = i % 2 === 0 ? '00' : '30'
  return `${String(hour).padStart(2, '0')}:${min}`
}).filter((t) => t <= '20:00')

export const BookingForm: React.FC<BookingFormProps> = ({
  mode,
  candidates = [],
  slotDate,
  slotStart,
  slotEnd,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<Partial<BookingFormData>>({
    date: slotDate ?? today,
    startTime: slotStart ?? '09:00',
    endTime: slotEnd ?? '09:30',
    durationMinutes: 30,
    isMultiSlot: false,
    participationType: 'IN_PERSON' as ParticipationType,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (field: keyof BookingFormData, value: unknown) => {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!form.date) next.date = 'Date is required'
    if (!form.startTime) next.startTime = 'Start time is required'
    if (!form.endTime) next.endTime = 'End time is required'
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      next.endTime = 'End time must be after start time'
    }
    if (mode === 'recruiter') {
      if (!form.candidateId) next.candidateId = 'Candidate is required'
      if (!form.interviewType) next.interviewType = 'Interview type is required'
      if (!form.technology) next.technology = 'Technology is required'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(form as BookingFormData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h3 className="font-semibold text-gray-800">
        {mode === 'interviewer' ? 'Create Availability Slot' : 'Book Interview Slot'}
      </h3>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={form.date ?? ''}
          min={today}
          onChange={(e) => set('date', e.target.value)}
          disabled={mode === 'recruiter' && !!slotDate}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
      </div>

      {/* Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start <span className="text-red-500">*</span>
          </label>
          <select
            value={form.startTime ?? ''}
            onChange={(e) => set('startTime', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startTime ? 'border-red-400' : 'border-gray-300'}`}
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End <span className="text-red-500">*</span>
          </label>
          <select
            value={form.endTime ?? ''}
            onChange={(e) => set('endTime', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endTime ? 'border-red-400' : 'border-gray-300'}`}
          >
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>}
        </div>
      </div>

      {/* Interviewer-specific fields */}
      {mode === 'interviewer' && (
        <>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="multiSlot"
              checked={form.isMultiSlot ?? false}
              onChange={(e) => set('isMultiSlot', e.target.checked)}
              className="accent-blue-600"
            />
            <label htmlFor="multiSlot" className="text-sm text-gray-700">
              Multi-slot booking
            </label>
          </div>
          {form.isMultiSlot && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <select
                value={form.multiSlotHours ?? 4}
                onChange={(e) => set('multiSlotHours', parseInt(e.target.value) as 4 | 8)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value={4}>4 hours</option>
                <option value={8}>8 hours</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Participation</label>
            <select
              value={form.participationType ?? 'IN_PERSON'}
              onChange={(e) => set('participationType', e.target.value as ParticipationType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {PARTICIPATION_TYPES.map((p) => (
                <option key={p} value={p}>{p.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* Recruiter-specific fields */}
      {mode === 'recruiter' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Candidate <span className="text-red-500">*</span>
            </label>
            <select
              value={form.candidateId ?? ''}
              onChange={(e) => set('candidateId', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.candidateId ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Select candidate</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.candidateId && <p className="mt-1 text-xs text-red-500">{errors.candidateId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.interviewType ?? ''}
              onChange={(e) => set('interviewType', e.target.value as InterviewType)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.interviewType ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Select type</option>
              {INTERVIEW_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.interviewType && <p className="mt-1 text-xs text-red-500">{errors.interviewType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technology <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.technology ?? ''}
              onChange={(e) => set('technology', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.technology ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="e.g. Java"
            />
            {errors.technology && <p className="mt-1 text-xs text-red-500">{errors.technology}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
            <textarea
              value={form.comments ?? ''}
              onChange={(e) => set('comments', e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes..."
            />
          </div>
        </>
      )}

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
          {isSubmitting
            ? 'Saving...'
            : mode === 'interviewer'
              ? 'Create Slot'
              : 'Book Interview'}
        </button>
      </div>
    </form>
  )
}

export default BookingForm
