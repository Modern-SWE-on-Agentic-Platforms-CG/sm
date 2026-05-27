/**
 * T159 - WeekendDriveScreen: Form for walk-in candidates with BU-specific fields
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { WeekendDriveForm } from '@components/forms/WeekendDriveForm'
import { submitInstantInterview } from '@services/api/candidates'
import type { WeekendDriveFormData } from '@components/forms/WeekendDriveForm'

const WeekendDriveScreen: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: WeekendDriveFormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      await submitInstantInterview(data as Record<string, string | number>)
      navigate('/pipeline')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit candidate')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Weekend Drive / Instant Interview</h1>
      <p className="text-sm text-gray-600 mb-6">Register walk-in candidates with role-specific information</p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">&times;</button>
        </div>
      )}

      <WeekendDriveForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}

export default WeekendDriveScreen
