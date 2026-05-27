/**
 * WorkflowQueue — table of candidates pending approval
 */
import React from 'react'
import type { WorkflowCandidate } from '@appTypes/workflow'
import { ApprovalDecision } from '@appTypes/workflow'

const DECISION_COLORS: Record<ApprovalDecision, string> = {
  [ApprovalDecision.APPROVED]: 'bg-green-100 text-green-700',
  [ApprovalDecision.REJECTED]: 'bg-red-100 text-red-700',
  [ApprovalDecision.HELD]: 'bg-yellow-100 text-yellow-700',
  [ApprovalDecision.PENDING]: 'bg-gray-100 text-gray-700',
}

interface WorkflowQueueProps {
  candidates: WorkflowCandidate[]
  selected: string[]
  isLoading: boolean
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  onViewHistory: (candidateId: string) => void
}

export const WorkflowQueue: React.FC<WorkflowQueueProps> = ({
  candidates,
  selected,
  isLoading,
  onToggleSelect,
  onSelectAll,
  onClearAll,
  onViewHistory,
}) => {
  const allSelected = candidates.length > 0 && selected.length === candidates.length

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (candidates.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-12">No candidates pending approval</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 w-8">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={allSelected ? onClearAll : onSelectAll}
                aria-label="Select all"
              />
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Candidate</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Technology</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">BU</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Exp (yrs)</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Stage</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Submitted</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {candidates.map((c) => (
            <tr key={c.candidateId} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.includes(c.candidateId)}
                  onChange={() => onToggleSelect(c.candidateId)}
                  aria-label={`Select ${c.candidateName}`}
                />
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">{c.candidateName}</td>
              <td className="px-4 py-3">{c.technology}</td>
              <td className="px-4 py-3">{c.bu}</td>
              <td className="px-4 py-3">{c.experience}</td>
              <td className="px-4 py-3 text-xs">{(c.currentStage ?? '').replace(/_/g, ' ')}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DECISION_COLORS[c.currentDecision]}`}>
                  {c.currentDecision}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onViewHistory(c.candidateId)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
