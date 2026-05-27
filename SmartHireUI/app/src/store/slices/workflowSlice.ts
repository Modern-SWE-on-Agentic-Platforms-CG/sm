/**
 * Workflow Redux slice
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as workflowApi from '@services/api/workflow'
import type {
  WorkflowCandidate,
  ApprovalHistory,
  ApprovalAction,
  WorkflowFilter,
} from '@appTypes/workflow'
import type { PaginatedResponse } from '@services/api/types'

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchWorkflowCandidates = createAsyncThunk<
  PaginatedResponse<WorkflowCandidate>,
  WorkflowFilter
>('workflow/fetchCandidates', async (filter) => workflowApi.getCandidates(filter))

export const approveAction = createAsyncThunk<void, ApprovalAction>(
  'workflow/approve',
  async (action) => workflowApi.approveCandidates(action)
)

export const rejectAction = createAsyncThunk<void, ApprovalAction>(
  'workflow/reject',
  async (action) => workflowApi.rejectCandidates(action)
)

export const holdAction = createAsyncThunk<void, ApprovalAction>(
  'workflow/hold',
  async (action) => workflowApi.holdCandidates(action)
)

export const fetchApprovalHistory = createAsyncThunk<ApprovalHistory, string>(
  'workflow/fetchHistory',
  async (candidateId) => workflowApi.getHistory(candidateId)
)

// ── State ─────────────────────────────────────────────────────────────────────

interface WorkflowState {
  queue: WorkflowCandidate[]
  selected: string[]            // selected candidateIds
  history: ApprovalHistory | null
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  isApproving: boolean
  error: string | null
  filter: WorkflowFilter
}

const initialState: WorkflowState = {
  queue: [],
  selected: [],
  history: null,
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  isApproving: false,
  error: null,
  filter: {},
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    toggleSelected(state, action: PayloadAction<string>) {
      const id = action.payload
      const idx = state.selected.indexOf(id)
      if (idx >= 0) {
        state.selected.splice(idx, 1)
      } else {
        state.selected.push(id)
      }
    },
    selectAll(state) {
      state.selected = state.queue.map((c) => c.candidateId)
    },
    clearSelected(state) {
      state.selected = []
    },
    setFilter(state, action: PayloadAction<WorkflowFilter>) {
      state.filter = action.payload
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchWorkflowCandidates
    builder.addCase(fetchWorkflowCandidates.pending, (state) => {
      state.isLoading = true; state.error = null
    })
    builder.addCase(fetchWorkflowCandidates.fulfilled, (state, action) => {
      state.isLoading = false
      state.queue = action.payload.items
      state.total = action.payload.total
      state.page = action.payload.page
      state.pageSize = action.payload.pageSize
    })
    builder.addCase(fetchWorkflowCandidates.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message ?? 'Failed to load approval queue'
    })

    // approve / reject / hold — all shared shape
    const actionPending = (state: WorkflowState) => { state.isApproving = true; state.error = null }
    const actionFulfilled = (state: WorkflowState) => { state.isApproving = false; state.selected = [] }
    const actionRejected = (state: WorkflowState, action: { error: { message?: string } }) => {
      state.isApproving = false
      state.error = action.error.message ?? 'Action failed'
    }

    builder.addCase(approveAction.pending, actionPending)
    builder.addCase(approveAction.fulfilled, actionFulfilled)
    builder.addCase(approveAction.rejected, actionRejected)

    builder.addCase(rejectAction.pending, actionPending)
    builder.addCase(rejectAction.fulfilled, actionFulfilled)
    builder.addCase(rejectAction.rejected, actionRejected)

    builder.addCase(holdAction.pending, actionPending)
    builder.addCase(holdAction.fulfilled, actionFulfilled)
    builder.addCase(holdAction.rejected, actionRejected)

    // fetchApprovalHistory
    builder.addCase(fetchApprovalHistory.pending, (state) => { state.isLoading = true })
    builder.addCase(fetchApprovalHistory.fulfilled, (state, action) => {
      state.isLoading = false
      state.history = action.payload
    })
    builder.addCase(fetchApprovalHistory.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message ?? 'Failed to load history'
    })
  },
})

export const {
  toggleSelected,
  selectAll,
  clearSelected,
  setFilter,
  setPage,
  clearError,
} = workflowSlice.actions

export default workflowSlice.reducer
