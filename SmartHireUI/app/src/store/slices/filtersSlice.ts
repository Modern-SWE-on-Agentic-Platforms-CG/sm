import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CandidateFilters {
  technology?: string
  bu?: string
  source?: string
  status?: string
  dateRange?: { startDate: string; endDate: string }
  searchTerm?: string
}

export interface BookingFilters {
  status?: string
  interviewerName?: string
  dateRange?: { startDate: string; endDate: string }
}

export interface ReportFilters {
  dateRange?: { startDate: string; endDate: string }
  bu?: string
  technology?: string
  status?: string
}

export interface FiltersState {
  candidate: CandidateFilters
  booking: BookingFilters
  report: ReportFilters
}

const initialState: FiltersState = {
  candidate: {},
  booking: {},
  report: {},
}

/**
 * Filters slice
 */
const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    /**
     * Set candidate filters
     */
    setCandidateFilters: (state, action: PayloadAction<CandidateFilters>) => {
      state.candidate = {
        ...state.candidate,
        ...action.payload,
      }
    },

    /**
     * Reset candidate filters
     */
    resetCandidateFilters: (state) => {
      state.candidate = {}
    },

    /**
     * Set booking filters
     */
    setBookingFilters: (state, action: PayloadAction<BookingFilters>) => {
      state.booking = {
        ...state.booking,
        ...action.payload,
      }
    },

    /**
     * Reset booking filters
     */
    resetBookingFilters: (state) => {
      state.booking = {}
    },

    /**
     * Set report filters
     */
    setReportFilters: (state, action: PayloadAction<ReportFilters>) => {
      state.report = {
        ...state.report,
        ...action.payload,
      }
    },

    /**
     * Reset report filters
     */
    resetReportFilters: (state) => {
      state.report = {}
    },

    /**
     * Clear all filters
     */
    clearAllFilters: (state) => {
      state.candidate = {}
      state.booking = {}
      state.report = {}
    },
  },
})

export const {
  setCandidateFilters,
  resetCandidateFilters,
  setBookingFilters,
  resetBookingFilters,
  setReportFilters,
  resetReportFilters,
  clearAllFilters,
} = filtersSlice.actions

export default filtersSlice.reducer
