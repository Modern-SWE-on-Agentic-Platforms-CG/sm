/**
 * T087 - Scheduling API unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCalendarMonth,
  getSlots,
  createSlot,
  bookCandidate,
  updateSlotStatus,
  deleteSlot,
} from '@services/api/scheduling'
import { SlotStatus, ParticipationType, InterviewType } from '@appTypes/booking'
import type { BookingSlot, CalendarMonth } from '@appTypes/booking'

vi.mock('@services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@services/api/client'

describe('Scheduling API Client', () => {
  beforeEach(() => { vi.clearAllMocks() })

  const mockSlot: BookingSlot = {
    id: '1',
    interviewerId: 'iv1',
    interviewerName: 'Alice',
    date: '2026-06-01',
    startTime: '09:00',
    endTime: '09:30',
    durationMinutes: 30,
    status: SlotStatus.AVAILABLE,
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  }

  it('should fetch calendar month', async () => {
    const mockCalendar: CalendarMonth = { year: 2026, month: 6, days: [] }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCalendar })

    const result = await getCalendarMonth(2026, 6)
    expect(result.year).toBe(2026)
    expect(result.month).toBe(6)
    expect(apiClient.get).toHaveBeenCalledWith('/scheduling/calendar', expect.any(Object))
  })

  it('should fetch paginated slots', async () => {
    const mockPage = { items: [mockSlot], total: 1, page: 1, pageSize: 20, hasMore: false }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage })

    const result = await getSlots({})
    expect(result.items).toHaveLength(1)
    expect(apiClient.get).toHaveBeenCalledWith('/scheduling/slots', expect.any(Object))
  })

  it('should create a slot', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockSlot })

    const result = await createSlot({
      date: '2026-06-01',
      startTime: '09:00',
      endTime: '09:30',
      durationMinutes: 30,
      isMultiSlot: false,
      participationType: ParticipationType.IN_PERSON,
    })
    expect(result.id).toBe('1')
    expect(apiClient.post).toHaveBeenCalledWith('/scheduling/slots', expect.any(Object))
  })

  it('should book a candidate into a slot', async () => {
    const booked = { ...mockSlot, status: SlotStatus.BOOKED, candidateName: 'Bob' }
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: booked })

    const result = await bookCandidate('1', {
      candidateId: 'c1',
      candidateName: 'Bob',
      interviewType: InterviewType.TECHNICAL,
      technology: 'Java',
      interviewerId: 'iv1',
      date: '2026-06-01',
      startTime: '09:00',
      endTime: '09:30',
    })
    expect(result.status).toBe(SlotStatus.BOOKED)
    expect(result.candidateName).toBe('Bob')
  })

  it('should update slot status', async () => {
    const updated = { ...mockSlot, status: SlotStatus.NA }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: updated })

    const result = await updateSlotStatus('1', SlotStatus.NA)
    expect(result.status).toBe(SlotStatus.NA)
    expect(apiClient.patch).toHaveBeenCalledWith('/scheduling/slots/1/status', expect.any(Object))
  })

  it('should delete a slot', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null })
    await expect(deleteSlot('1')).resolves.not.toThrow()
    expect(apiClient.delete).toHaveBeenCalledWith('/scheduling/slots/1')
  })
})
