/**
 * Workflow selectors
 */
import type { RootState } from '@store/store'

export const selectWorkflowQueue = (state: RootState) => state.workflow.queue
export const selectWorkflowSelected = (state: RootState) => state.workflow.selected
export const selectApprovalHistory = (state: RootState) => state.workflow.history
export const selectWorkflowIsLoading = (state: RootState) => state.workflow.isLoading
export const selectWorkflowIsApproving = (state: RootState) => state.workflow.isApproving
export const selectWorkflowError = (state: RootState) => state.workflow.error
export const selectWorkflowTotal = (state: RootState) => state.workflow.total
export const selectWorkflowPage = (state: RootState) => state.workflow.page
export const selectWorkflowPageSize = (state: RootState) => state.workflow.pageSize
export const selectWorkflowFilter = (state: RootState) => state.workflow.filter
export const selectWorkflowTotalPages = (state: RootState) =>
  Math.ceil(state.workflow.total / state.workflow.pageSize)
export const selectAllSelected = (state: RootState) =>
  state.workflow.queue.length > 0 &&
  state.workflow.selected.length === state.workflow.queue.length
