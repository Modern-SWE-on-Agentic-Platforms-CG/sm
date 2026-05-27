/**
 * Candidate Redux slice
 */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { Candidate, CandidateFilter, UploadResult, CandidateStatus } from '@appTypes/candidate'
import type { PaginatedResponse } from '@services/api/types'
import {
  searchCandidates,
  getCandidateById,
  updateCandidateStatus as apiUpdateStatus,
  uploadCandidates as apiUpload,
  exportCandidates as apiExport,
} from '@services/api/candidates'

export interface CandidateState {
  list: Candidate[]
  selected: Candidate | null
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  isUploading: boolean
  isExporting: boolean
  error: string | null
  uploadResult: UploadResult | null
  filter: CandidateFilter
}

const initialState: CandidateState = {
  list: [],
  selected: null,
  total: 0,
  page: 0,
  pageSize: 20,
  isLoading: false,
  isUploading: false,
  isExporting: false,
  error: null,
  uploadResult: null,
  filter: {},
}

/** Fetch candidate list */
export const fetchCandidates = createAsyncThunk(
  'candidates/fetchCandidates',
  async (filter: CandidateFilter, { rejectWithValue }) => {
    try {
      return await searchCandidates(filter)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch candidates')
    }
  }
)

/** Fetch a single candidate */
export const fetchCandidateById = createAsyncThunk(
  'candidates/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await getCandidateById(id)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch candidate')
    }
  }
)

/** Update candidate status */
export const updateCandidateStatus = createAsyncThunk(
  'candidates/updateStatus',
  async (
    { id, status, remarks }: { id: string; status: CandidateStatus; remarks?: string },
    { rejectWithValue }
  ) => {
    try {
      return await apiUpdateStatus(id, status, remarks)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update status')
    }
  }
)

/** Upload candidates via Excel */
export const uploadCandidates = createAsyncThunk(
  'candidates/upload',
  async (file: File, { rejectWithValue }) => {
    try {
      return await apiUpload(file)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Upload failed')
    }
  }
)

/** Export candidates to Excel */
export const exportCandidates = createAsyncThunk(
  'candidates/export',
  async (filter: CandidateFilter, { rejectWithValue }) => {
    try {
      const blob = await apiExport(filter)
      // Trigger browser download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `candidates-${new Date().toISOString().split('T')[0]}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Export failed')
    }
  }
)

const candidateSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<CandidateFilter>) => {
      state.filter = action.payload
      state.page = 0
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload
      state.page = 1
    },
    clearSelected: (state) => {
      state.selected = null
    },
    clearUploadResult: (state) => {
      state.uploadResult = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCandidates
      .addCase(fetchCandidates.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(
        fetchCandidates.fulfilled,
        (state, action: PayloadAction<PaginatedResponse<Candidate>>) => {
          state.isLoading = false
          state.list = action.payload.items
          state.total = action.payload.total
          state.page = action.payload.page
          state.pageSize = action.payload.pageSize
        }
      )
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // fetchCandidateById
      .addCase(fetchCandidateById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCandidateById.fulfilled, (state, action: PayloadAction<Candidate>) => {
        state.isLoading = false
        state.selected = action.payload
      })
      .addCase(fetchCandidateById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // updateCandidateStatus
      .addCase(updateCandidateStatus.fulfilled, (state, action: PayloadAction<Candidate>) => {
        const idx = state.list.findIndex((c) => c.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.selected?.id === action.payload.id) state.selected = action.payload
      })
      .addCase(updateCandidateStatus.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // uploadCandidates
      .addCase(uploadCandidates.pending, (state) => {
        state.isUploading = true
        state.uploadResult = null
        state.error = null
      })
      .addCase(uploadCandidates.fulfilled, (state, action: PayloadAction<UploadResult>) => {
        state.isUploading = false
        state.uploadResult = action.payload
      })
      .addCase(uploadCandidates.rejected, (state, action) => {
        state.isUploading = false
        state.error = action.payload as string
      })
      // exportCandidates
      .addCase(exportCandidates.pending, (state) => {
        state.isExporting = true
      })
      .addCase(exportCandidates.fulfilled, (state) => {
        state.isExporting = false
      })
      .addCase(exportCandidates.rejected, (state, action) => {
        state.isExporting = false
        state.error = action.payload as string
      })
  },
})

export const {
  setFilter,
  setPage,
  setPageSize,
  clearSelected,
  clearUploadResult,
  clearError,
} = candidateSlice.actions

export default candidateSlice.reducer
