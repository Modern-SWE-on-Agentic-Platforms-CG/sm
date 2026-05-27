/**
 * FeedbackFormScreen — post-interview evaluation form for Interviewers
 * Route: /feedback?candidateId=&slotId=&technology=&feedbackId=
 */
import React, { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@store/store'
import { updateForm } from '@store/slices/feedbackSlice'
import { FeedbackTemplate } from '@components/feedback/FeedbackTemplate'
import { useFeedback } from '@hooks/useFeedback'
import { FeedbackStatus } from '@appTypes/feedback'

const STATUS_OPTIONS = [
  { value: FeedbackStatus.SELECTED, label: 'Select' },
  { value: FeedbackStatus.REJECTED, label: 'Reject' },
  { value: FeedbackStatus.ON_HOLD, label: 'Hold' },
]

const OVERALL_REMARKS = ['Highly Recommended', 'Recommended', 'Neutral', 'Not Recommended', 'Rejected']

const FeedbackFormScreen: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [params] = useSearchParams()

  const candidateId = params.get('candidateId') ?? ''
  const slotId = params.get('slotId') ?? ''
  const technology = params.get('technology') ?? ''
  const feedbackId = params.get('feedbackId') ?? undefined

  const candidateInfo = {
    candidateName: params.get('candidateName') ?? '—',
    technology,
    interviewType: params.get('interviewType') ?? '—',
    interviewerName: params.get('interviewerName') ?? '—',
    slotDate: params.get('date') ?? '—',
    startTime: params.get('start') ?? '—',
    endTime: params.get('end') ?? '—',
  }

  const {
    template,
    form,
    isLoading,
    isSubmitting,
    isRevisiting,
    error,
    allowSubmit,
    isEditable,
    handleTechnicalChange,
    handleBehavioralChange,
    handleAddTechnicalRow,
    handleSubmit,
    handleRevisit,
    handleClearError,
  } = useFeedback({ technology, feedbackId, candidateId, slotId })

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (feedbackId) {
        await handleRevisit(feedbackId)
      } else {
        await handleSubmit()
      }
      navigate('/dashboard')
    },
    [feedbackId, handleRevisit, handleSubmit, navigate]
  )

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Interview Feedback</h1>

      {error && (
        <div role="alert" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between text-sm">
          <span>{error}</span>
          <button onClick={handleClearError} className="font-bold">&times;</button>
        </div>
      )}

      {/* Candidate Info (read-only) */}
      <section className="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Candidate Info</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{candidateInfo.candidateName}</dd></div>
          <div><dt className="text-gray-500">Technology</dt><dd className="font-medium">{candidateInfo.technology}</dd></div>
          <div><dt className="text-gray-500">Interview Type</dt><dd className="font-medium">{candidateInfo.interviewType}</dd></div>
          <div><dt className="text-gray-500">Interviewer</dt><dd className="font-medium">{candidateInfo.interviewerName}</dd></div>
          <div><dt className="text-gray-500">Date</dt><dd className="font-medium">{candidateInfo.slotDate}</dd></div>
          <div><dt className="text-gray-500">Time</dt><dd className="font-medium">{candidateInfo.startTime} – {candidateInfo.endTime}</dd></div>
        </dl>
      </section>

      {/* Dynamic feedback form */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {template && form && (
          <FeedbackTemplate
            technicalRatings={form.technicalRatings}
            behavioralRatings={form.behavioralRatings}
            onTechnicalChange={handleTechnicalChange}
            onBehavioralChange={handleBehavioralChange}
            onAddTechnicalRow={handleAddTechnicalRow}
            readOnly={!isEditable}
          />
        )}

        {/* Overall section */}
        <section className="space-y-4">
          <h3 className="text-base font-semibold text-gray-800">Overall</h3>

          <div>
            <label htmlFor="overallRemark" className="block text-sm font-medium text-gray-700 mb-1">
              Overall Remark <span className="text-red-500">*</span>
            </label>
            <select
              id="overallRemark"
              value={form?.overallRemark ?? ''}
              onChange={(e) => dispatch(updateForm({ overallRemark: e.target.value }))}
              disabled={!isEditable}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50"
            >
              <option value="">Select remark</option>
              {(template?.overallRemarkOptions ?? OVERALL_REMARKS).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="feedbackStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Status <span className="text-red-500">*</span>
            </label>
            <select
              id="feedbackStatus"
              value={form?.feedbackStatus ?? ''}
              onChange={(e) => dispatch(updateForm({ feedbackStatus: e.target.value as FeedbackStatus }))}
              disabled={!isEditable}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50"
            >
              <option value="">Select status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Actions */}
        {isEditable && (
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!allowSubmit || isSubmitting || isRevisiting}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isRevisiting ? 'Submitting…' : feedbackId ? 'Update Feedback' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default FeedbackFormScreen
