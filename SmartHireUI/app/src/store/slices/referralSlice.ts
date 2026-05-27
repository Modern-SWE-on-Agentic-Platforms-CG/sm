/**
 * Referral slice — manages referral portal state
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getMyCandidates,
  getAllReferrals,
  getReferralAnalytics,
  submitReferral as apiSubmitReferral,
} from '@services/api/referral'
import type {
  ReferralCandidate,
  ReferralAnalytics,
  ReferralFilter,
  ReferralSubmission,
} from '@appTypes/referral'

interface ReferralState {
  myCandidates: ReferralCandidate[]
  allCandidates: ReferralCandidate[]
  analytics: ReferralAnalytics | null
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filter: ReferralFilter
}

const initialState: ReferralState = {
  myCandidates: [],
  allCandidates: [],
  analytics: null,
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filter: {},
}

export const fetchMyCandidates = createAsyncThunk(
  'referral/fetchMyCandidates',
  async (params: { page?: number; pageSize?: number } | undefined, { rejectWithValue }) => {
    try {
      return await getMyCandidates(params)
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch referrals')
    }
  }
)

export const fetchAllReferrals = createAsyncThunk(
  'referral/fetchAllReferrals',
  async (
    payload: (ReferralFilter & { page?: number; pageSize?: number }) | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await getAllReferrals(payload)
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch all referrals')
    }
  }
)

export const fetchAnalytics = createAsyncThunk(
  'referral/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      return await getReferralAnalytics()
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch analytics')
    }
  }
)

export const submitReferral = createAsyncThunk(
  'referral/submitReferral',
  async (submission: ReferralSubmission, { rejectWithValue }) => {
    try {
      return await apiSubmitReferral(submission)
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Submission failed')
    }
  }
)

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload
      state.page = 1
    },
    setPage(state, action) {
      state.page = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // My candidates
    builder.addCase(fetchMyCandidates.pending, (state) => { state.isLoading = true; state.error = null })
    builder.addCase(fetchMyCandidates.fulfilled, (state, action) => {
      state.isLoading = false
      state.myCandidates = action.payload.items
      state.total = action.payload.total
    })
    builder.addCase(fetchMyCandidates.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // All referrals
    builder.addCase(fetchAllReferrals.pending, (state) => { state.isLoading = true; state.error = null })
    builder.addCase(fetchAllReferrals.fulfilled, (state, action) => {
      state.isLoading = false
      state.allCandidates = action.payload.items
      state.total = action.payload.total
    })
    builder.addCase(fetchAllReferrals.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Analytics
    builder.addCase(fetchAnalytics.pending, (state) => { state.isLoading = true })
    builder.addCase(fetchAnalytics.fulfilled, (state, action) => {
      state.isLoading = false
      state.analytics = action.payload
    })
    builder.addCase(fetchAnalytics.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Submit
    builder.addCase(submitReferral.pending, (state) => { state.isSubmitting = true; state.error = null })
    builder.addCase(submitReferral.fulfilled, (state, action) => {
      state.isSubmitting = false
      state.myCandidates = [action.payload, ...state.myCandidates]
    })
    builder.addCase(submitReferral.rejected, (state, action) => {
      state.isSubmitting = false
      state.error = action.payload as string
    })
  },
})

export const { setFilter, setPage, clearError } = referralSlice.actions
export default referralSlice.reducer
