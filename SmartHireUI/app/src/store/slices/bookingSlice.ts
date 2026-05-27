/**
 * Booking / Scheduling Redux slice
 */
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { BookingSlot, CalendarMonth, PanelAvailability, SlotFilter, SlotStatus } from '@appTypes/booking'
import type { PaginatedResponse } from '@services/api/types'
import {
  getCalendarMonth as apiGetCalendar,
  getSlots as apiGetSlots,
  getSlotById as apiGetSlotById,
  createSlot as apiCreateSlot,
  bookCandidate as apiBookCandidate,
  updateSlotStatus as apiUpdateSlotStatus,
  rescheduleBooking as apiReschedule,
  deleteSlot as apiDeleteSlot,
  getPanelAvailability as apiGetPanel,
} from '@services/api/scheduling'
import type { BookingForm, BookingEvent } from '@appTypes/booking'

export interface BookingState {
  slots: BookingSlot[]
  selected: BookingSlot | null
  calendar: CalendarMonth | null
  panelAvailability: PanelAvailability[]
  currentMonth: { year: number; month: number }
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  filter: SlotFilter
}

const now = new Date()
const initialState: BookingState = {
  slots: [],
  selected: null,
  calendar: null,
  panelAvailability: [],
  currentMonth: { year: now.getFullYear(), month: now.getMonth() + 1 },
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  isSubmitting: false,
  error: null,
  filter: {},
}

// ── Async Thunks ────────────────────────────────────────────────

export const fetchCalendar = createAsyncThunk(
  'booking/fetchCalendar',
  async ({ year, month }: { year: number; month: number }, { rejectWithValue }) => {
    try {
      return await apiGetCalendar(year, month)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch calendar')
    }
  }
)

export const fetchSlots = createAsyncThunk(
  'booking/fetchSlots',
  async (filter: SlotFilter, { rejectWithValue }) => {
    try {
      return await apiGetSlots(filter)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch slots')
    }
  }
)

export const fetchSlotById = createAsyncThunk(
  'booking/fetchSlotById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await apiGetSlotById(id)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch slot')
    }
  }
)

export const createAvailabilitySlot = createAsyncThunk(
  'booking/createSlot',
  async (
    data: Omit<BookingForm, 'candidateId' | 'interviewType' | 'technology' | 'comments'>,
    { rejectWithValue }
  ) => {
    try {
      return await apiCreateSlot(data)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to create slot')
    }
  }
)

export const bookCandidateIntoSlot = createAsyncThunk(
  'booking/bookCandidate',
  async (
    { slotId, booking }: { slotId: string; booking: Omit<BookingEvent, 'slotId'> },
    { rejectWithValue }
  ) => {
    try {
      return await apiBookCandidate(slotId, booking)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to book candidate')
    }
  }
)

export const changeSlotStatus = createAsyncThunk(
  'booking/changeStatus',
  async (
    { slotId, status, remarks }: { slotId: string; status: SlotStatus; remarks?: string },
    { rejectWithValue }
  ) => {
    try {
      return await apiUpdateSlotStatus(slotId, status, remarks)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update status')
    }
  }
)

export const rescheduleSlot = createAsyncThunk(
  'booking/reschedule',
  async (
    { slotId, date, startTime, endTime }: { slotId: string; date: string; startTime: string; endTime: string },
    { rejectWithValue }
  ) => {
    try {
      return await apiReschedule(slotId, { date, startTime, endTime })
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to reschedule')
    }
  }
)

export const cancelSlot = createAsyncThunk(
  'booking/cancelSlot',
  async (slotId: string, { rejectWithValue }) => {
    try {
      await apiDeleteSlot(slotId)
      return slotId
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to cancel slot')
    }
  }
)

export const fetchPanelAvailability = createAsyncThunk(
  'booking/fetchPanel',
  async ({ date, technology }: { date: string; technology?: string }, { rejectWithValue }) => {
    try {
      return await apiGetPanel(date, technology)
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch panel')
    }
  }
)

// ── Helper to update a slot in both lists ────────────────────────

function updateSlotInState(state: BookingState, updated: BookingSlot) {
  const idx = state.slots.findIndex((s) => s.id === updated.id)
  if (idx !== -1) state.slots[idx] = updated
  if (state.selected?.id === updated.id) state.selected = updated
  // Also update in calendar
  if (state.calendar) {
    for (const day of state.calendar.days) {
      const si = day.slots.findIndex((s) => s.id === updated.id)
      if (si !== -1) {
        day.slots[si] = updated
        break
      }
    }
  }
}

// ── Slice ─────────────────────────────────────────────────────────

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCurrentMonth: (state, action: PayloadAction<{ year: number; month: number }>) => {
      state.currentMonth = action.payload
    },
    setFilter: (state, action: PayloadAction<SlotFilter>) => {
      state.filter = action.payload
      state.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    clearSelected: (state) => {
      state.selected = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCalendar
      .addCase(fetchCalendar.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchCalendar.fulfilled, (state, action: PayloadAction<CalendarMonth>) => {
        state.isLoading = false
        state.calendar = action.payload
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // fetchSlots
      .addCase(fetchSlots.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchSlots.fulfilled, (state, action: PayloadAction<PaginatedResponse<BookingSlot>>) => {
        state.isLoading = false
        state.slots = action.payload.items
        state.total = action.payload.total
        state.page = action.payload.page
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchSlots.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // fetchSlotById
      .addCase(fetchSlotById.fulfilled, (state, action: PayloadAction<BookingSlot>) => {
        state.selected = action.payload
      })
      // createAvailabilitySlot
      .addCase(createAvailabilitySlot.pending, (state) => { state.isSubmitting = true })
      .addCase(createAvailabilitySlot.fulfilled, (state, action: PayloadAction<BookingSlot>) => {
        state.isSubmitting = false
        state.slots.unshift(action.payload)
      })
      .addCase(createAvailabilitySlot.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      // bookCandidateIntoSlot
      .addCase(bookCandidateIntoSlot.pending, (state) => { state.isSubmitting = true })
      .addCase(bookCandidateIntoSlot.fulfilled, (state, action: PayloadAction<BookingSlot>) => {
        state.isSubmitting = false
        updateSlotInState(state, action.payload)
      })
      .addCase(bookCandidateIntoSlot.rejected, (state, action) => {
        state.isSubmitting = false
        state.error = action.payload as string
      })
      // changeSlotStatus
      .addCase(changeSlotStatus.fulfilled, (state, action: PayloadAction<BookingSlot>) => {
        updateSlotInState(state, action.payload)
      })
      .addCase(changeSlotStatus.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // rescheduleSlot
      .addCase(rescheduleSlot.fulfilled, (state, action: PayloadAction<BookingSlot>) => {
        updateSlotInState(state, action.payload)
      })
      // cancelSlot
      .addCase(cancelSlot.fulfilled, (state, action: PayloadAction<string>) => {
        state.slots = state.slots.filter((s) => s.id !== action.payload)
        if (state.selected?.id === action.payload) state.selected = null
      })
      // fetchPanelAvailability
      .addCase(fetchPanelAvailability.fulfilled, (state, action: PayloadAction<PanelAvailability[]>) => {
        state.panelAvailability = action.payload
      })
  },
})

export const { setCurrentMonth, setFilter, setPage, clearSelected, clearError } = bookingSlice.actions
export default bookingSlice.reducer
