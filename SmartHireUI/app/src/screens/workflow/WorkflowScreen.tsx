/**
 * WorkflowScreen — approval queue with Approve / Reject / Hold actions
 */
import React, { useEffect, useState } from 'react'
import { WorkflowQueue } from '@components/tables/WorkflowQueue'
import { ApprovalForm } from '@components/forms/ApprovalForm'
import { useWorkflow } from '@hooks/useWorkflow'
import type { ApprovalDecision } from '@appTypes/workflow'
import { useNavigate } from 'react-router'

const WorkflowScreen: React.FC = () => {
  const navigate = useNavigate()
  const {
    queue,
    selected,
    isLoading,
    isApproving,
    error,
    loadQueue,
    handleApprove,
    handleReject,
    handleHold,
    handleToggleSelect,
    handleSelectAll,
    handleClearAll,
    handleClearError,
  } = useWorkflow()

  const [showActionForm, setShowActionForm] = useState(false)

  useEffect(() => { loadQueue() }, [loadQueue])

  const handleAction = async (decision: ApprovalDecision, comments?: string) => {
    const { ApprovalDecision: AD } = await import('@appTypes/workflow')
    if (decision === AD.APPROVED) await handleApprove(comments)
    else if (decision === AD.REJECTED) await handleReject(comments!)
    else await handleHold(comments)
    setShowActionForm(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-xl font-bold text-gray-900">Approval Queue</h1>
        <button
          onClick={() => setShowActionForm(true)}
          disabled={selected.length === 0}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Take Action ({selected.length})
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-3 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={handleClearError} className="font-bold">&times;</button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <WorkflowQueue
          candidates={queue}
          selected={selected}
          isLoading={isLoading}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onClearAll={handleClearAll}
          onViewHistory={(id) => navigate(`/work-flow/history?candidateId=${id}`)}
        />
      </div>

      {/* Action modal */}
      {showActionForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Approval Action</h2>
            <ApprovalForm
              candidateCount={selected.length}
              onSubmit={handleAction}
              onCancel={() => setShowActionForm(false)}
              isSubmitting={isApproving}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowScreen
