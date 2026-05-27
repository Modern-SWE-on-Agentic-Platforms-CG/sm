/**
 * T088 - InterviewCalendar component tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InterviewCalendar } from '@components/calendar/InterviewCalendar'
import { SlotCell } from '@components/calendar/SlotCell'
import { SlotStatus } from '@appTypes/booking'
import type { CalendarMonth, BookingSlot } from '@appTypes/booking'

const mockSlot: BookingSlot = {
  id: 'slot1',
  interviewerId: 'iv1',
  interviewerName: 'Alice',
  date: '2026-06-10',
  startTime: '09:00',
  endTime: '09:30',
  durationMinutes: 30,
  status: SlotStatus.AVAILABLE,
  createdAt: '2026-06-10T09:00:00Z',
  updatedAt: '2026-06-10T09:00:00Z',
}

const mockCalendar: CalendarMonth = {
  year: 2026,
  month: 6,
  days: [
    {
      date: '2026-06-10',
      slots: [mockSlot],
      totalSlots: 1,
      availableCount: 1,
      bookedCount: 0,
      interviewedCount: 0,
      naCount: 0,
    },
  ],
}

describe('SlotCell', () => {
  it('should render slot time', () => {
    render(<SlotCell slot={mockSlot} />)
    expect(screen.getByText('09:00')).toBeInTheDocument()
  })

  it('should render Available label for available slot', () => {
    render(<SlotCell slot={mockSlot} />)
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('should render candidate name for booked slot', () => {
    const booked: BookingSlot = {
      ...mockSlot,
      status: SlotStatus.BOOKED,
      candidateName: 'Bob Smith',
    }
    render(<SlotCell slot={booked} />)
    expect(screen.getByText('Bob Smith')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    render(<SlotCell slot={mockSlot} onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledWith(mockSlot)
  })

  it('should have correct styling for INTERVIEWED (green)', () => {
    const interviewedSlot: BookingSlot = { ...mockSlot, status: SlotStatus.INTERVIEWED }
    const { container } = render(<SlotCell slot={interviewedSlot} />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('should have correct styling for BOOKED (pink)', () => {
    const bookedSlot: BookingSlot = { ...mockSlot, status: SlotStatus.BOOKED }
    const { container } = render(<SlotCell slot={bookedSlot} />)
    expect(container.firstChild).toHaveClass('bg-pink-100')
  })

  it('should have correct styling for NA (yellow)', () => {
    const naSlot: BookingSlot = { ...mockSlot, status: SlotStatus.NA }
    const { container } = render(<SlotCell slot={naSlot} />)
    expect(container.firstChild).toHaveClass('bg-yellow-100')
  })
})

describe('InterviewCalendar', () => {
  it('should show loading spinner when isLoading', () => {
    const { container } = render(
      <InterviewCalendar calendar={null} isLoading={true} />
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should render calendar month name', () => {
    render(<InterviewCalendar calendar={mockCalendar} />)
    expect(screen.getByText(/June 2026/i)).toBeInTheDocument()
  })

  it('should render all 7 weekday headers', () => {
    render(<InterviewCalendar calendar={mockCalendar} />)
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Sat')).toBeInTheDocument()
  })

  it('should render a slot in the correct day', () => {
    render(
      <InterviewCalendar calendar={mockCalendar} onSlotClick={vi.fn()} />
    )
    expect(screen.getByText('09:00')).toBeInTheDocument()
  })

  it('should call onMonthChange when navigating', () => {
    const onMonthChange = vi.fn()
    render(
      <InterviewCalendar calendar={mockCalendar} onMonthChange={onMonthChange} />
    )
    fireEvent.click(screen.getByLabelText('Next month'))
    expect(onMonthChange).toHaveBeenCalledWith(2026, 7)
  })

  it('should call onMonthChange to previous month', () => {
    const onMonthChange = vi.fn()
    render(
      <InterviewCalendar calendar={mockCalendar} onMonthChange={onMonthChange} />
    )
    fireEvent.click(screen.getByLabelText('Previous month'))
    expect(onMonthChange).toHaveBeenCalledWith(2026, 5)
  })
})
