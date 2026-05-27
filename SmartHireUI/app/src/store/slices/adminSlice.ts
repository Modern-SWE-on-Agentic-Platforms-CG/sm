/**
 * Admin Redux slice
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as adminApi from '@services/api/admin'
import type { DataCategory, MasterRecord, DemandSupplyRow } from '@appTypes/admin'
import type { PaginatedResponse } from '@services/api/types'

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const loadCategory = createAsyncThunk<
  PaginatedResponse<MasterRecord>,
  { category: DataCategory; page?: number; pageSize?: number }
>('admin/loadCategory', async ({ category, page, pageSize }) =>
  adminApi.fetchCategory(category, { page, pageSize })
)

export const createRecord = createAsyncThunk<
  MasterRecord,
  { category: DataCategory; data: Record<string, string | number> }
>('admin/createRecord', async ({ category, data }) => adminApi.addRecord(category, data))

export const editRecord = createAsyncThunk<
  MasterRecord,
  { category: DataCategory; id: string; data: Record<string, string | number> }
>('admin/editRecord', async ({ category, id, data }) => adminApi.updateRecord(category, id, data))

export const removeRecord = createAsyncThunk<
  string,
  { category: DataCategory; id: string }
>('admin/removeRecord', async ({ category, id }) => {
  await adminApi.deleteRecord(category, id)
  return id
})

export const loadDemandSupply = createAsyncThunk<DemandSupplyRow[]>(
  'admin/loadDemandSupply',
  async () => adminApi.getDemandSupply()
)

// ── State ─────────────────────────────────────────────────────────────────────

interface AdminState {
  selectedCategory: DataCategory | null
  records: MasterRecord[]
  demandSupply: DemandSupplyRow[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  isSaving: boolean
  error: string | null
}

const initialState: AdminState = {
  selectedCategory: null,
  records: [],
  demandSupply: [],
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  isSaving: false,
  error: null,
}

// ── Slice ─────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSelectedCategory(state, action: PayloadAction<DataCategory>) {
      state.selectedCategory = action.payload
      state.records = []
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
    // loadCategory
    builder.addCase(loadCategory.pending, (state) => { state.isLoading = true; state.error = null })
    builder.addCase(loadCategory.fulfilled, (state, action) => {
      state.isLoading = false
      state.records = action.payload.items
      state.total = action.payload.total
      state.page = action.payload.page
      state.pageSize = action.payload.pageSize
    })
    builder.addCase(loadCategory.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message ?? 'Failed to load records'
    })

    // createRecord
    builder.addCase(createRecord.pending, (state) => { state.isSaving = true; state.error = null })
    builder.addCase(createRecord.fulfilled, (state, action) => {
      state.isSaving = false
      state.records.unshift(action.payload)
      state.total += 1
    })
    builder.addCase(createRecord.rejected, (state, action) => {
      state.isSaving = false
      state.error = action.error.message ?? 'Failed to create record'
    })

    // editRecord
    builder.addCase(editRecord.pending, (state) => { state.isSaving = true; state.error = null })
    builder.addCase(editRecord.fulfilled, (state, action) => {
      state.isSaving = false
      const idx = state.records.findIndex((r) => r.id === action.payload.id)
      if (idx >= 0) state.records[idx] = action.payload
    })
    builder.addCase(editRecord.rejected, (state, action) => {
      state.isSaving = false
      state.error = action.error.message ?? 'Failed to update record'
    })

    // removeRecord
    builder.addCase(removeRecord.pending, (state) => { state.isSaving = true; state.error = null })
    builder.addCase(removeRecord.fulfilled, (state, action) => {
      state.isSaving = false
      state.records = state.records.filter((r) => r.id !== action.payload)
      state.total -= 1
    })
    builder.addCase(removeRecord.rejected, (state, action) => {
      state.isSaving = false
      state.error = action.error.message ?? 'Failed to delete record'
    })

    // loadDemandSupply
    builder.addCase(loadDemandSupply.pending, (state) => { state.isLoading = true })
    builder.addCase(loadDemandSupply.fulfilled, (state, action) => {
      state.isLoading = false
      state.demandSupply = action.payload
    })
    builder.addCase(loadDemandSupply.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message ?? 'Failed to load demand/supply'
    })
  },
})

export const { setSelectedCategory, setPage, clearError } = adminSlice.actions
export default adminSlice.reducer
