/**
 * Scheduling / Booking API client — mapped to actual backend paths
 */
import { apiClient } from './client'
import type { PaginatedResponse } from './types'
import type {
  BookingSlot,
  BookingEvent,
  BookingForm,
  CalendarMonth,
  PanelAvailability,
  SlotFilter,
  SlotStatus,
} from '@appTypes/booking'

/**
 * Get calendar slots for a given month
 * Backend: GET /calendar/getAvailableSlots/{interviewer_id} (nearest equivalent)
 */
export const getCalendarMonth = async (_year: number, _month: number): Promise<CalendarMonth> => {
  // No direct backend equivalent for calendar month view — return empty structure
  return { year: _year, month: _month, days: [] } as unknown as CalendarMonth
}

/**
 * Get slots (paginated list view)
 * Backend: POST /recruiter/getDirectRecruiterSlots
 */
export const getSlots = async (filter: SlotFilter): Promise<PaginatedResponse<BookingSlot>> => {
  const res = await apiClient.post<{ data: BookingSlot[] }>('/recruiter/getDirectRecruiterSlots', filter)
  const raw = res.data as unknown as { data?: BookingSlot[] }
  const items = raw.data ?? []
  return { items, total: items.length, page: 0, pageSize: items.length }
}

/**
 * Get a single slot by ID
 * Backend: GET /calendar/getAvailableSlots/{id}
 */
export const getSlotById = async (id: string): Promise<BookingSlot> => {
  const res = await apiClient.get<{ data: BookingSlot[] }>(`/calendar/getAvailableSlots/${id}`)
  const raw = res.data as unknown as { data?: BookingSlot[] }
  return raw.data?.[0] ?? (res.data as unknown as BookingSlot)
}

/**
 * Create availability slot (Interviewer)
 * Backend: POST /calendar/addSlot
 */
export const createSlot = async (
  data: Omit<BookingForm, 'candidateId' | 'interviewType' | 'technology' | 'comments'>
): Promise<BookingSlot> => {
  // Transform frontend form shape to backend schema
  const slotStart = `${data.date}T${data.startTime}:00`
  const slotEnd = `${data.date}T${data.endTime}:00`
  const payload: Record<string, unknown> = {
    interviewerId: data.interviewerId ? parseInt(data.interviewerId, 10) : 1,
    slotStart,
    slotEnd,
  }
  const response = await apiClient.post<BookingSlot>('/calendar/addSlot', payload)
  return response.data
}

/**
 * Book a candidate into an existing slot (Recruiter)
 * Backend: POST /calendar/bookSlot
 */
export const bookCandidate = async (
  slotId: string,
  booking: Omit<BookingEvent, 'slotId'>
): Promise<BookingSlot> => {
  const response = await apiClient.post<BookingSlot>('/calendar/bookSlot', {
    ...booking,
    slotId,
  })
  return response.data
}

/**
 * Reschedule a slot
 * Backend: POST /calendar/rescheduleSlot
 */
export const rescheduleSlot = async (
  slotId: string,
  data: Partial<BookingForm>
): Promise<BookingSlot> => {
  const response = await apiClient.post<BookingSlot>('/calendar/rescheduleSlot', {
    ...data,
    slotId,
  })
  return response.data
}

/**
 * Cancel a slot
 * Backend: POST /recruiter/rescheduleSlot (closest)
 */
export const cancelSlot = async (slotId: string): Promise<void> => {
  await apiClient.post('/recruiter/rescheduleSlot', { slotId, status: 'CANCELLED' })
}

/**
 * Get panel availability by date
 * Backend: POST /recruiter/getDirectRecruiterSlots (filter by date)
 */
export const getPanelAvailability = async (date: string, _technology?: string): Promise<PanelAvailability[]> => {
  try {
    const res = await apiClient.post<{ data: BookingSlot[] }>('/recruiter/getDirectRecruiterSlots', { date })
    const raw = res.data as unknown as { data?: BookingSlot[]; response?: BookingSlot[] }
    const slots = raw.data ?? raw.response ?? []
    return [{ date, slots } as unknown as PanelAvailability]
  } catch {
    return []
  }
}

/**
 * Update a slot status
 * Backend: POST /calendar/rescheduleSlot
 */
export const updateSlotStatus = async (slotId: string, status: SlotStatus): Promise<BookingSlot> => {
  const response = await apiClient.post<BookingSlot>('/calendar/rescheduleSlot', { slotId, status })
  return response.data
}


/**
 * Reschedule an existing booking
 * Backend: POST /calendar/rescheduleSlot
 */
export const rescheduleBooking = async (
  slotId: string,
  data: Pick<BookingForm, 'date' | 'startTime' | 'endTime'>
): Promise<BookingSlot> => {
  const response = await apiClient.post<BookingSlot>('/calendar/rescheduleSlot', { slotId, ...data })
  return response.data
}

/**
 * Delete / cancel a slot
 * Backend: POST /calendar/rescheduleSlot with CANCELLED status
 */
export const deleteSlot = async (slotId: string): Promise<void> => {
  await apiClient.post('/calendar/rescheduleSlot', { slotId, status: 'CANCELLED' })
}
