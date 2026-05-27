/**
 * useWorkflow — hook for workflow approval actions
 */
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@store/store'
import {
  fetchWorkflowCandidates,
  approveAction,
  rejectAction,
  holdAction,
  fetchApprovalHistory,
  toggleSelected,
  selectAll,
  clearSelected,
  clearError,
} from '@store/slices/workflowSlice'
import {
  selectWorkflowQueue,
  selectWorkflowSelected,
  selectApprovalHistory,
  selectWorkflowIsLoading,
  selectWorkflowIsApproving,
  selectWorkflowError,
  selectWorkflowFilter,
} from '@store/selectors/workflowSelectors'
import { ApprovalDecision } from '@appTypes/workflow'
import type { WorkflowFilter } from '@appTypes/workflow'

export function useWorkflow() {
  const dispatch = useDispatch<AppDispatch>()
  const queue = useSelector(selectWorkflowQueue)
  const selected = useSelector(selectWorkflowSelected)
  const history = useSelector(selectApprovalHistory)
  const isLoading = useSelector(selectWorkflowIsLoading)
  const isApproving = useSelector(selectWorkflowIsApproving)
  const error = useSelector(selectWorkflowError)
  const filter = useSelector(selectWorkflowFilter)

  const loadQueue = useCallback(
    (overrides?: WorkflowFilter) => dispatch(fetchWorkflowCandidates(overrides ?? filter)),
    [dispatch, filter]
  )

  const handleApprove = useCallback(
    async (comments?: string) => {
      if (!selected.length) return
      await dispatch(approveAction({ candidateIds: selected, decision: ApprovalDecision.APPROVED, comments }))
      dispatch(fetchWorkflowCandidates(filter))
    },
    [dispatch, selected, filter]
  )

  const handleReject = useCallback(
    async (comments: string) => {
      if (!selected.length) return
      await dispatch(rejectAction({ candidateIds: selected, decision: ApprovalDecision.REJECTED, comments }))
      dispatch(fetchWorkflowCandidates(filter))
    },
    [dispatch, selected, filter]
  )

  const handleHold = useCallback(
    async (comments?: string) => {
      if (!selected.length) return
      await dispatch(holdAction({ candidateIds: selected, decision: ApprovalDecision.HELD, comments }))
      dispatch(fetchWorkflowCandidates(filter))
    },
    [dispatch, selected, filter]
  )

  const loadHistory = useCallback(
    (candidateId: string) => dispatch(fetchApprovalHistory(candidateId)),
    [dispatch]
  )

  const handleToggleSelect = useCallback(
    (id: string) => dispatch(toggleSelected(id)),
    [dispatch]
  )

  const handleSelectAll = useCallback(() => dispatch(selectAll()), [dispatch])
  const handleClearAll = useCallback(() => dispatch(clearSelected()), [dispatch])
  const handleClearError = useCallback(() => dispatch(clearError()), [dispatch])

  return {
    queue,
    selected,
    history,
    isLoading,
    isApproving,
    error,
    loadQueue,
    handleApprove,
    handleReject,
    handleHold,
    loadHistory,
    handleToggleSelect,
    handleSelectAll,
    handleClearAll,
    handleClearError,
  }
}
