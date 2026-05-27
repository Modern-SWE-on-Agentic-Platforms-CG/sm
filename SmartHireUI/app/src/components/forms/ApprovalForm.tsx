/**
 * ApprovalForm — Approve / Reject / Hold action form
 */
import React, { useState } from 'react'
import type { ApprovalDecision } from '@appTypes/workflow'
import { ApprovalDecision as AD } from '@appTypes/workflow'

interface ApprovalFormProps {
  candidateCount: number
  onSubmit: (decision: ApprovalDecision, comments?: string) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export const ApprovalForm: React.FC<ApprovalFormProps> = ({
  candidateCount,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [decision, setDecision] = useState<AD>(AD.APPROVED)
  const [comments, setComments] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (decision === AD.REJECTED && !comments.trim()) {
      setError('Comments are required when rejecting a candidate')
      return
    }
    setError('')
    onSubmit(decision, comments.trim() || undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-600 mb-3">
          Action will apply to <strong>{candidateCount}</strong> candidate{candidateCount !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Decision */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">Decision</legend>
        <div className="flex gap-4">
          {[
            { value: AD.APPROVED, label: 'Approve', color: 'text-green-700' },
            { value: AD.REJECTED, label: 'Reject', color: 'text-red-700' },
            { value: AD.HELD, label: 'Hold', color: 'text-yellow-700' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="decision"
                value={opt.value}
                checked={decision === opt.value}
                onChange={() => { setDecision(opt.value); setError('') }}
              />
              <span className={`text-sm font-medium ${opt.color}`}>{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Comments */}
      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
          Comments {decision === AD.REJECTED && <span className="text-red-500">*</span>}
        </label>
        <textarea
          id="comments"
          rows={3}
          value={comments}
          onChange={(e) => { setComments(e.target.value); if (error) setError('') }}
          placeholder={decision === AD.REJECTED ? 'Rejection reason is required' : 'Optional comments'}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
        />
        {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Processing…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
