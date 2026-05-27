/**
 * T090 - DashboardScreen integration tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import DashboardScreen from '@screens/scheduling/DashboardScreen'

// Mock the API
vi.mock('@services/api/scheduling', () => ({
  getCalendarMonth: vi.fn().mockResolvedValue({
    year: 2026,
    month: 6,
    days: [],
  }),
  getSlots: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, hasMore: false }),
  createSlot: vi.fn().mockResolvedValue({
    id: '1',
    interviewerId: 'iv1',
    interviewerName: 'Alice',
    date: '2026-06-10',
    startTime: '09:00',
    endTime: '09:30',
    durationMinutes: 30,
    status: 'AVAILABLE',
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-06-10T09:00:00Z',
  }),
  getPanelAvailability: vi.fn().mockResolvedValue([]),
  bookCandidate: vi.fn(),
  updateSlotStatus: vi.fn(),
  rescheduleBooking: vi.fn(),
  deleteSlot: vi.fn(),
}))

function renderDashboard() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <DashboardScreen />
      </MemoryRouter>
    </Provider>
  )
}

describe('DashboardScreen', () => {
  it('should render heading', async () => {
    renderDashboard()
    expect(screen.getByText('Interview Calendar')).toBeInTheDocument()
  })

  it('should render Add Slot button', async () => {
    renderDashboard()
    expect(screen.getByRole('button', { name: /Add Slot/i })).toBeInTheDocument()
  })

  it('should open booking form on Add Slot click', async () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /Add Slot/i }))
    await waitFor(() => {
      expect(screen.getByText('Create Availability Slot')).toBeInTheDocument()
    })
  })

  it('should close form on cancel', async () => {
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /Add Slot/i }))
    await waitFor(() => expect(screen.getByText('Create Availability Slot')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    await waitFor(() => {
      expect(screen.queryByText('Create Availability Slot')).not.toBeInTheDocument()
    })
  })

  it('should display month navigation', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument()
      expect(screen.getByLabelText('Next month')).toBeInTheDocument()
    })
  })
})
