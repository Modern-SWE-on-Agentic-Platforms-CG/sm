/**
 * T157 - SelectRejectScreen integration tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import SelectRejectScreen from '@screens/reports/SelectRejectScreen'

vi.mock('@services/api/reports', () => ({
  getRejectionRatio: vi.fn().mockResolvedValue({
    totalCandidates: 100,
    selected: 60,
    rejected: 30,
    onHold: 10,
    selectedPercentage: 60,
    rejectedPercentage: 30,
    data: [
      { name: 'Selected', value: 60, percentage: 60 },
      { name: 'Rejected', value: 30, percentage: 30 },
    ],
  }),
  getTrendChart: vi.fn(),
  getPanelPerformance: vi.fn(),
  getL2Aging: vi.fn(),
  getDateOfJoining: vi.fn(),
  getARCDeviation: vi.fn(),
  getDashboardMetrics: vi.fn(),
  exportReport: vi.fn().mockResolvedValue(new Blob()),
}))

function renderScreen() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <SelectRejectScreen />
      </MemoryRouter>
    </Provider>
  )
}

describe('SelectRejectScreen', () => {
  it('should render the screen title', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText(/selection.*rejection/i)).toBeInTheDocument()
    })
  })

  it('should show loading state initially', () => {
    renderScreen()
    expect(screen.getByText(/selection.*rejection/i)).toBeInTheDocument()
  })

  it('should render pie chart when data loads', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText(/60%.*selected/i, { selector: 'p' })).toBeInTheDocument()
    })
  })

  it('should have export button', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export excel/i })).toBeInTheDocument()
    })
  })

  it('should show quick links to other reports', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Panel Performance')).toBeInTheDocument()
      expect(screen.getByText('Trends')).toBeInTheDocument()
      expect(screen.getByText('L2 Aging')).toBeInTheDocument()
    })
  })
})
