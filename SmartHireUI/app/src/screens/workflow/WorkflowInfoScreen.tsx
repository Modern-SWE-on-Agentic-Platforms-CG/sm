/**
 * WorkflowInfoScreen — approval chain history for a specific candidate
 */
import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { useWorkflow } from '@hooks/useWorkflow'
import { ApprovalDecision } from '@appTypes/workflow'

const DECISION_COLORS: Record<ApprovalDecision, string> = {
  [ApprovalDecision.APPROVED]: 'bg-green-100 text-green-700',
  [ApprovalDecision.REJECTED]: 'bg-red-100 text-red-700',
  [ApprovalDecision.HELD]: 'bg-yellow-100 text-yellow-700',
  [ApprovalDecision.PENDING]: 'bg-gray-100 text-gray-600',
}

const WorkflowInfoScreen: React.FC = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const candidateId = params.get('candidateId') ?? ''
  const { history, isLoading, error, loadHistory, handleClearError } = useWorkflow()

  useEffect(() => {
    if (candidateId) loadHistory(candidateId)
  }, [candidateId, loadHistory])

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-lg">←</button>
        <h1 className="text-xl font-bold text-gray-900">Approval History</h1>
      </div>

      {error && (
        <div role="alert" className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between text-sm">
          <span>{error}</span>
          <button onClick={handleClearError} className="font-bold">&times;</button>
        </div>
      )}

      {history ? (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Candidate: <strong>{history.candidateName}</strong>
          </p>

          {history.stages.length === 0 ? (
            <p className="text-gray-500 text-sm">No approval history available</p>
          ) : (
            <ol className="relative border-l border-gray-200 ml-3 space-y-6">
              {history.stages.map((stage) => (
                <li key={stage.id} className="ml-6">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-gray-200">
                    <span className="text-xs font-bold text-gray-400">{stage.stage.charAt(0)}</span>
                  </span>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {stage.stage.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DECISION_COLORS[stage.decision]}`}>
                        {stage.decision}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      By <strong>{stage.approverName}</strong> on {new Date(stage.timestamp).toLocaleString()}
                    </p>
                    {stage.comments && (
                      <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded px-3 py-2">
                        {stage.comments}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : (
        !isLoading && <p className="text-gray-500 text-sm text-center py-12">No data found</p>
      )}
    </div>
  )
}

export default WorkflowInfoScreen
