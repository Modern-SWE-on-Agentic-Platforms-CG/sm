/**
 * Feedback Redux slice
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as feedbackApi from '@services/api/feedback'
import type {
  FeedbackForm,
  FeedbackRecord,
  FeedbackTemplate,
  FeedbackStatus,
  FeedbackFilter,
} from '@appTypes/feedback'
import type { PaginatedResponse } from '@services/api/types'

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchTemplate = createAsyncThunk<FeedbackTemplate, string>(
  'feedback/fetchTemplate',
  async (technology) => feedbackApi.getTemplate(technology)
)

export const submitFeedback = createAsyncThunk<FeedbackRecord, FeedbackForm>(
  'feedback/submitFeedback',
  async (data) => feedbackApi.submitFeedback(data)
)

export const fetchFeedback = createAsyncThunk<FeedbackRecord, string>(
  'feedback/fetchFeedback',
  async (id) => feedbackApi.getFeedback(id)
)

export const listFeedback = createAsyncThunk<PaginatedResponse<FeedbackRecord>, FeedbackFilter>(
  'feedback/listFeedback',
  async (filter) => feedbackApi.listFeedback(filter)
)

export const revisitFeedback = createAsyncThunk<
  FeedbackRecord,
  { id: string; data: Partial<FeedbackForm> }
>('feedback/revisitFeedback', async ({ id, data }) => feedbackApi.revisitFeedback(id, data))

// ── State ─────────────────────────────────────────────────────────────────────

interface FeedbackState {
  template: FeedbackTemplate | null
  form: FeedbackForm | null
  current: FeedbackRecord | null
  records: FeedbackRecord[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  isSubmitting: boolean
  isRevisiting: boolean
  error: string | null
  allowSubmit: boolean
  filter: FeedbackFilter
}

const initialState: FeedbackState = {
  template: null,
  form: null,
  current: null,
  records: [],
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  isSubmitting: false,
  isRevisiting: false,
  error: null,
  allowSubmit: false,
  filter: {},
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    setForm(state, action: PayloadAction<FeedbackForm>) {
      state.form = action.payload
    },
    updateForm(state, action: PayloadAction<Partial<FeedbackForm>>) {
      if (state.form) {
        state.form = { ...state.form, ...action.payload }
      }
    },
    setAllowSubmit(state, action: PayloadAction<boolean>) {
      state.allowSubmit = action.payload
    },
    setFilter(state, action: PayloadAction<FeedbackFilter>) {
      state.filter = action.payload
      state.page = 1
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload
    },
    clearError(state) {
      state.error = null
    },
    clearForm(state) {
      state.form = null
      state.current = null
      state.template = null
      state.allowSubmit = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // fetchTemplate
    builder.addCase(fetchTemplate.pending, (state) => { state.isLoading = true; state.error = null })
    builder.addCase(fetchTemplate.fulfilled, (state, action) => {
      state.isLoading = false
      state.template = action.payload
    })
    builder.addCase(fetchTemplate.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message ?? 'Failed to load template'
    })

    // submitFeedback
    builder.addCase(submitFeedback.pending, (state) => { state.isSubmitting = true; state.error = null })
    builder.addCase(submitFeedback.fulfilled, (state, action) => {
      state.isSubmitting = false
      state.current = action.payload
    })
    builder.addCase(submitFeedback.rejected, (state, action) => {
      state.isSubmitting = false
      state.error = action.error.message ?? 'Failed to submit feedback'
    })

    // fetchFeedback
    builder.addCase(fetchFeedback.pending, (state) => { state.isLoading = true; state.error = null })
    builder.addCase(fetchFeedback.fulfilled, (state, action) => {
      state.isLoading = false
      state.current = action.payload
    })
    builder.addCase(fetchFeedback.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message ?? 'Failed to fetch feedback'
    })

    // listFeedback
    builder.addCase(listFeedback.pending, (state) => { state.isLoading = true; state.error = null })
    builder.addCase(listFeedback.fulfilled, (state, action) => {
      state.isLoading = false
      state.records = action.payload.items
      state.total = action.payload.total
      state.page = action.payload.page
      state.pageSize = action.payload.pageSize
    })
    builder.addCase(listFeedback.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message ?? 'Failed to fetch feedback list'
    })

    // revisitFeedback
    builder.addCase(revisitFeedback.pending, (state) => { state.isRevisiting = true; state.error = null })
    builder.addCase(revisitFeedback.fulfilled, (state, action) => {
      state.isRevisiting = false
      state.current = action.payload
    })
    builder.addCase(revisitFeedback.rejected, (state, action) => {
      state.isRevisiting = false
      state.error = action.error.message ?? 'Failed to update feedback'
    })
  },
})

export const {
  setForm,
  updateForm,
  setAllowSubmit,
  setFilter,
  setPage,
  clearError,
  clearForm,
} = feedbackSlice.actions

export default feedbackSlice.reducer

// Re-export FeedbackStatus to allow direct import
export type { FeedbackStatus }
