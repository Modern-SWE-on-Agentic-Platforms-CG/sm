/**
 * T160 - WeekendDriveForm: Dynamic form with BU-specific conditional fields
 */
import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'

export interface WeekendDriveFormData {
  name: string
  contact: string
  email: string
  gender: string
  bu: string
  experience: string
  skill: string
  timeSlot: string
  interviewType: string
  sapCapabilities?: string
  gccaAccount?: string
  gccaRegion?: string
  inventMeetingLink?: string
  [key: string]: string | undefined
}

interface WeekendDriveFormProps {
  onSubmit: (data: WeekendDriveFormData) => Promise<void>
  isSubmitting?: boolean
}

const BU_OPTIONS = ['Delivery', 'Java', 'Python', 'SAP', 'GCCA', 'Invent', 'Other']
const INTERVIEW_TYPES = ['Technical', 'HR', 'Manager Round']
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']

export const WeekendDriveForm: React.FC<WeekendDriveFormProps> = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<WeekendDriveFormData>({
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      gender: '',
      bu: '',
      experience: '',
      skill: '',
      timeSlot: '',
      interviewType: '',
      sapCapabilities: '',
      gccaAccount: '',
      gccaRegion: '',
      inventMeetingLink: '',
    },
  })

  const selectedBU = watch('bu')
  const [localError, setLocalError] = useState<string | null>(null)

  const showSAPFields = useMemo(() => selectedBU === 'SAP', [selectedBU])
  const showGCCAFields = useMemo(() => selectedBU === 'GCCA', [selectedBU])
  const showInventFields = useMemo(() => selectedBU === 'Invent', [selectedBU])

  const handleFormSubmit = async (data: WeekendDriveFormData) => {
    setLocalError(null)
    try {
      // Client-side validation
      if (!data.contact || !/^\d+$/.test(data.contact)) {
        setLocalError('Contact must be a valid number')
        return
      }
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        setLocalError('Email must be valid')
        return
      }
      if (showSAPFields && !data.sapCapabilities) {
        setLocalError('SAP capabilities required for SAP BU')
        return
      }
      if (showGCCAFields && !data.gccaAccount) {
        setLocalError('GCCA account required for GCCA BU')
        return
      }
      if (showInventFields && !data.inventMeetingLink) {
        setLocalError('Invent meeting link required for Invent BU')
        return
      }
      await onSubmit(data)
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Submission failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
      {localError && <div className="px-3 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded">{localError}</div>}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Name *</label>
        <input {...register('name', { required: 'Name is required' })} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      {/* Contact */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Contact (10-digit) *</label>
        <input {...register('contact', { required: 'Contact is required' })} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        {errors.contact && <p className="mt-1 text-xs text-red-600">{errors.contact.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Email *</label>
        <input {...register('email', { required: 'Email is required' })} type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Gender</label>
        <select {...register('gender')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* BU Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Business Unit *</label>
        <select {...register('bu', { required: 'BU is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Select BU</option>
          {BU_OPTIONS.map((bu) => (
            <option key={bu} value={bu}>
              {bu}
            </option>
          ))}
        </select>
        {errors.bu && <p className="mt-1 text-xs text-red-600">{errors.bu.message}</p>}
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Years of Experience</label>
        <input {...register('experience')} type="number" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
      </div>

      {/* Skill */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Primary Skill *</label>
        <input {...register('skill', { required: 'Skill is required' })} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        {errors.skill && <p className="mt-1 text-xs text-red-600">{errors.skill.message}</p>}
      </div>

      {/* Time Slot */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Preferred Interview Slot *</label>
        <select {...register('timeSlot', { required: 'Time slot is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Select time slot</option>
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        {errors.timeSlot && <p className="mt-1 text-xs text-red-600">{errors.timeSlot.message}</p>}
      </div>

      {/* Interview Type */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">Interview Type *</label>
        <select {...register('interviewType', { required: 'Interview type is required' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Select interview type</option>
          {INTERVIEW_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.interviewType && <p className="mt-1 text-xs text-red-600">{errors.interviewType.message}</p>}
      </div>

      {/* SAP-specific fields */}
      {showSAPFields && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-blue-900">SAP-specific Information</h4>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">SAP Capabilities *</label>
            <textarea {...register('sapCapabilities', { required: showSAPFields ? 'SAP capabilities required' : false })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g., ABAP, FIFO, MM" />
            {errors.sapCapabilities && <p className="mt-1 text-xs text-red-600">{errors.sapCapabilities.message}</p>}
          </div>
        </div>
      )}

      {/* GCCA-specific fields */}
      {showGCCAFields && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-green-900">GCCA-specific Information</h4>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">GCCA Account *</label>
            <input {...register('gccaAccount', { required: showGCCAFields ? 'GCCA account required' : false })} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            {errors.gccaAccount && <p className="mt-1 text-xs text-red-600">{errors.gccaAccount.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">GCCA Region</label>
            <input {...register('gccaRegion')} type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
      )}

      {/* Invent-specific fields */}
      {showInventFields && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-purple-900">Invent-specific Information</h4>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Meeting Link *</label>
            <input {...register('inventMeetingLink', { required: showInventFields ? 'Meeting link required' : false })} type="url" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="https://meet.google.com/..." />
            {errors.inventMeetingLink && <p className="mt-1 text-xs text-red-600">{errors.inventMeetingLink.message}</p>}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
        {isSubmitting ? 'Submitting...' : 'Submit Candidate'}
      </button>
    </form>
  )
}
