/**
 * T114 - WorkflowScreen integration tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import WorkflowScreen from '@screens/workflow/WorkflowScreen'
import { ApprovalStage, ApprovalDecision } from '@appTypes/workflow'

vi.mock('@services/api/workflow', () => ({
  getCandidates: vi.fn().mockResolvedValue({
    items: [
      {
        candidateId: 'c1',
        candidateName: 'Alice Smith',
        technology: 'Java',
        bu: 'Delivery',
        experience: 5,
        currentStage: ApprovalStage.TOWER_LEAD,
        currentDecision: ApprovalDecision.PENDING,
        submittedAt: '2026-06-01T10:00:00Z',
        submittedBy: 'recruiter1',
      },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
    hasMore: false,
  }),
  approveCandidates: vi.fn().mockResolvedValue(undefined),
  rejectCandidates: vi.fn().mockResolvedValue(undefined),
  holdCandidates: vi.fn().mockResolvedValue(undefined),
  getHistory: vi.fn(),
}))

function renderScreen() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <WorkflowScreen />
      </MemoryRouter>
    </Provider>
  )
}

describe('WorkflowScreen', () => {
  it('should render heading', () => {
    renderScreen()
    expect(screen.getByText('Approval Queue')).toBeInTheDocument()
  })

  it('should load candidates from API', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    })
  })

  it('should disable Take Action button when nothing selected', async () => {
    renderScreen()
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    const btn = screen.getByRole('button', { name: /Take Action/ })
    expect(btn).toBeDisabled()
  })

  it('should enable Take Action after selecting a candidate', async () => {
    renderScreen()
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText('Select Alice Smith'))
    const btn = screen.getByRole('button', { name: /Take Action \(1\)/ })
    expect(btn).not.toBeDisabled()
  })

  it('should open action form when Take Action is clicked', async () => {
    renderScreen()
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText('Select Alice Smith'))
    fireEvent.click(screen.getByRole('button', { name: /Take Action/ }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('should close action form on cancel', async () => {
    renderScreen()
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument())
    fireEvent.click(screen.getByLabelText('Select Alice Smith'))
    fireEvent.click(screen.getByRole('button', { name: /Take Action/ }))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
