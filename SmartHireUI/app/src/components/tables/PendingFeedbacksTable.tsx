/**
 * T177 - PendingFeedbacksTable: Table of interviews needing feedback
 */
import React from 'react'

export interface PendingFeedback {
  id: string
  candidateName: string
  technology: string
  interviewTime: string
  interviewType: string
  status: string
}

interface PendingFeedbacksTableProps {
  feedbacks: PendingFeedback[]
  isLoading?: boolean
  onSubmit?: (feedbackId: string) => void
}

export const PendingFeedbacksTable: React.FC<PendingFeedbacksTableProps> = ({
  feedbacks,
  isLoading,
  onSubmit,
}) => {
  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
  }

  if (feedbacks.length === 0) {
    return <div className="text-center py-8 text-sm text-gray-500">No pending feedbacks</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Candidate</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Technology</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Interview Time</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Interview Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">Action</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((feedback) => (
            <tr key={feedback.id} className="hover:bg-orange-50 border-b border-gray-200">
              <td className="px-4 py-3 font-semibold text-gray-900">{feedback.candidateName}</td>
              <td className="px-4 py-3 text-gray-600">{feedback.technology}</td>
              <td className="px-4 py-3 text-gray-600 text-sm">{feedback.interviewTime}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-medium">
                  {feedback.interviewType}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onSubmit?.(feedback.id)}
                  className="px-3 py-1 bg-orange-600 text-white text-xs rounded font-medium hover:bg-orange-700"
                >
                  Submit Feedback
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
