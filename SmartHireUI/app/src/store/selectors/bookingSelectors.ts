/**
 * Booking selectors
 */
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@store/store'
import { SlotStatus } from '@appTypes/booking'

const selectBookingState = (state: RootState) => state.booking

export const selectCalendar = createSelector([selectBookingState], (s) => s.calendar)

export const selectCalendarDays = createSelector(
  [selectBookingState],
  (s) => s.calendar?.days ?? []
)

export const selectSlots = createSelector([selectBookingState], (s) => s.slots)

export const selectSelectedSlot = createSelector([selectBookingState], (s) => s.selected)

export const selectPanelAvailability = createSelector([selectBookingState], (s) => s.panelAvailability)

export const selectCurrentMonth = createSelector([selectBookingState], (s) => s.currentMonth)

export const selectBookingIsLoading = createSelector([selectBookingState], (s) => s.isLoading)

export const selectBookingIsSubmitting = createSelector([selectBookingState], (s) => s.isSubmitting)

export const selectBookingError = createSelector([selectBookingState], (s) => s.error)

export const selectBookingTotal = createSelector([selectBookingState], (s) => s.total)

export const selectBookingPage = createSelector([selectBookingState], (s) => s.page)

export const selectBookingPageSize = createSelector([selectBookingState], (s) => s.pageSize)

export const selectBookingTotalPages = createSelector(
  [selectBookingState],
  (s) => Math.ceil(s.total / s.pageSize)
)

/** Slots filtered by status */
export const selectSlotsByStatus = (status: SlotStatus) =>
  createSelector([selectSlots], (slots) => slots.filter((s) => s.status === status))

/** Available slots */
export const selectAvailableSlots = createSelector([selectSlots], (slots) =>
  slots.filter((s) => s.status === SlotStatus.AVAILABLE)
)

/** Booked slots */
export const selectBookedSlots = createSelector([selectSlots], (slots) =>
  slots.filter((s) => s.status === SlotStatus.BOOKED)
)

/** Get day aggregate counts from calendar */
export const selectDayAggregates = createSelector([selectCalendarDays], (days) =>
  days.map((day) => ({
    date: day.date,
    total: day.totalSlots,
    available: day.availableCount,
    booked: day.bookedCount,
    interviewed: day.interviewedCount,
    na: day.naCount,
  }))
)
