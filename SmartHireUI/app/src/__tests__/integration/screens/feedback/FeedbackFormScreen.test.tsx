/**
 * T101 - FeedbackFormScreen integration tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import FeedbackFormScreen from '@screens/feedback/FeedbackFormScreen'

vi.mock('@services/api/feedback', () => ({
  getTemplate: vi.fn().mockResolvedValue({
    id: 'tmpl1',
    technology: 'Java',
    technicalAreas: [{ id: 'ta1', name: 'Core Java' }],
    behavioralAreas: [{ id: 'ba1', name: 'Communication' }],
    overallRemarkOptions: ['Recommended', 'Not Recommended'],
    statusOptions: [],
  }),
  submitFeedback: vi.fn().mockResolvedValue({
    id: 'fb1',
    candidateId: 'c1',
    slotId: 's1',
    technicalRatings: [],
    behavioralRatings: [],
    overallRemark: '',
    feedbackStatus: 'SELECTED',
    submittedAt: new Date().toISOString(),
    submittedBy: 'iv1',
  }),
  getFeedback: vi.fn(),
  listFeedback: vi.fn(),
  revisitFeedback: vi.fn(),
}))

function renderScreen(searchStr = '?candidateId=c1&slotId=s1&technology=Java&candidateName=John+Doe') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/feedback${searchStr}`]}>
        <FeedbackFormScreen />
      </MemoryRouter>
    </Provider>
  )
}

describe('FeedbackFormScreen', () => {
  it('should render heading', () => {
    renderScreen()
    expect(screen.getByText('Interview Feedback')).toBeInTheDocument()
  })

  it('should show candidate info section', () => {
    renderScreen()
    expect(screen.getByText('Candidate Info')).toBeInTheDocument()
  })

  it('should show candidate name from query params', () => {
    renderScreen()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should show feedback status dropdown', () => {
    renderScreen()
    expect(screen.getByLabelText('Feedback Status *')).toBeInTheDocument()
  })

  it('should show overall remark dropdown', () => {
    renderScreen()
    expect(screen.getByLabelText('Overall Remark *')).toBeInTheDocument()
  })

  it('should load and render template fields after async load', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Core Java')).toBeInTheDocument()
    })
  })

  it('should show technical evaluation section', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Technical Evaluation')).toBeInTheDocument()
    })
  })

  it('should show behavioral evaluation section', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Behavioral Evaluation')).toBeInTheDocument()
    })
  })
})
