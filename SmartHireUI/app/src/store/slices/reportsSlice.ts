/**
 * Reports slice — manages reporting state
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  getRejectionRatio,
  getTrendChart,
  getPanelPerformance,
  getL2Aging,
  getDateOfJoining,
  getARCDeviation,
  getDashboardMetrics,
} from '@services/api/reports'
import type {
  RejectionRatioReport,
  TrendChartReport,
  PanelPerformanceReport,
  L2AgingReport,
  DateOfJoiningRecord,
  ARCDeviationRecord,
  ReportFilters,
  DashboardReportMetrics,
} from '@appTypes/reports'

interface ReportsState {
  rejectionRatio: RejectionRatioReport | null
  trendChart: TrendChartReport | null
  panelPerformance: PanelPerformanceReport | null
  l2Aging: L2AgingReport | null
  dateOfJoining: DateOfJoiningRecord[]
  arcDeviation: ARCDeviationRecord[]
  dashboardMetrics: DashboardReportMetrics | null
  filters: ReportFilters
  isLoading: boolean
  error: string | null
}

const initialState: ReportsState = {
  rejectionRatio: null,
  trendChart: null,
  panelPerformance: null,
  l2Aging: null,
  dateOfJoining: [],
  arcDeviation: [],
  dashboardMetrics: null,
  filters: {},
  isLoading: false,
  error: null,
}

export const fetchRejectionRatio = createAsyncThunk(
  'reports/fetchRejectionRatio',
  async (filters: ReportFilters | undefined, { rejectWithValue }) => {
    try {
      return await getRejectionRatio(filters)
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load rejection ratio')
    }
  }
)

export const fetchTrendChart = createAsyncThunk(
  'reports/fetchTrendChart',
  async (filters: ReportFilters | undefined, { rejectWithValue }) => {
    try {
      return await getTrendChart(filters)
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load trend chart')
    }
  }
)

export const fetchPanelPerformance = createAsyncThunk(
  'reports/fetchPanelPerformance',
  async (filters: ReportFilters | undefined, { rejectWithValue }) => {
    try {
      return await getPanelPerformance(filters)
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load panel performance')
    }
  }
)

export const fetchL2Aging = createAsyncThunk(
  'reports/fetchL2Aging',
  async (filters: ReportFilters | undefined, { rejectWithValue }) => {
    try {
      return await getL2Aging(filters)
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load L2 aging')
    }
  }
)

export const fetchDateOfJoining = createAsyncThunk(
  'reports/fetchDateOfJoining',
  async (filters: ReportFilters | undefined, { rejectWithValue }) => {
    try {
      return await getDateOfJoining(filters)
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load DOJ report')
    }
  }
)

export const fetchARCDeviation = createAsyncThunk(
  'reports/fetchARCDeviation',
  async (filters: ReportFilters | undefined, { rejectWithValue }) => {
    try {
      return await getARCDeviation(filters)
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load ARC deviation')
    }
  }
)

export const fetchDashboardMetrics = createAsyncThunk(
  'reports/fetchDashboardMetrics',
  async (_, { rejectWithValue }) => {
    try {
      return await getDashboardMetrics()
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load dashboard metrics')
    }
  }
)

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Rejection ratio
    builder
      .addCase(fetchRejectionRatio.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchRejectionRatio.fulfilled, (state, action) => { state.isLoading = false; state.rejectionRatio = action.payload })
      .addCase(fetchRejectionRatio.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })

    // Trend chart
    builder
      .addCase(fetchTrendChart.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchTrendChart.fulfilled, (state, action) => { state.isLoading = false; state.trendChart = action.payload })
      .addCase(fetchTrendChart.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })

    // Panel performance
    builder
      .addCase(fetchPanelPerformance.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchPanelPerformance.fulfilled, (state, action) => { state.isLoading = false; state.panelPerformance = action.payload })
      .addCase(fetchPanelPerformance.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })

    // L2 aging
    builder
      .addCase(fetchL2Aging.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchL2Aging.fulfilled, (state, action) => { state.isLoading = false; state.l2Aging = action.payload })
      .addCase(fetchL2Aging.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })

    // Date of joining
    builder
      .addCase(fetchDateOfJoining.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchDateOfJoining.fulfilled, (state, action) => { state.isLoading = false; state.dateOfJoining = action.payload })
      .addCase(fetchDateOfJoining.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })

    // ARC deviation
    builder
      .addCase(fetchARCDeviation.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchARCDeviation.fulfilled, (state, action) => { state.isLoading = false; state.arcDeviation = action.payload })
      .addCase(fetchARCDeviation.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })

    // Dashboard metrics
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => { state.isLoading = false; state.dashboardMetrics = action.payload })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })
  },
})

export const { setFilters, clearError } = reportsSlice.actions
export default reportsSlice.reducer
