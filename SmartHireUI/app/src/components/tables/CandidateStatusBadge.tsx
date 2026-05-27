import React from 'react'
import type { CandidateStatus } from '@appTypes/candidate'

const STATUS_STYLES: Record<CandidateStatus, string> = {
  APPLIED: 'bg-blue-100 text-blue-700',
  SHORTLISTED: 'bg-indigo-100 text-indigo-700',
  INTERVIEW_SCHEDULED: 'bg-yellow-100 text-yellow-700',
  INTERVIEWED: 'bg-purple-100 text-purple-700',
  SELECTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  HOLD: 'bg-orange-100 text-orange-700',
  WITHDRAWN: 'bg-gray-100 text-gray-600',
}

interface CandidateStatusBadgeProps {
  status: CandidateStatus
}

export const CandidateStatusBadge: React.FC<CandidateStatusBadgeProps> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
  >
    {status.replace(/_/g, ' ')}
  </span>
)
