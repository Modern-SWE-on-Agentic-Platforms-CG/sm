/**
 * T181 - TodoListScreen integration tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import TodoListScreen from '@screens/candidate/TodoListScreen'

vi.mock('@hooks/useTodoList', () => ({
  useTodoList: vi.fn().mockReturnValue({
    todayInterviews: [
      {
        id: 'int1',
        candidateName: 'John Smith',
        contact: '9876543210',
        time: '10:00 AM',
        totalExperience: 5,
        skills: ['Java'],
        interviewType: 'Technical',
      },
    ],
    pendingFeedbacks: [
      {
        id: 'fb1',
        candidateName: 'Bob Wilson',
        technology: 'Java',
        interviewTime: 'Today 9:00 AM',
        interviewType: 'L1',
        status: 'PENDING',
      },
    ],
    availableSlots: 3,
    isLoading: false,
    error: null,
  }),
}))

function renderScreen() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <TodoListScreen />
      </MemoryRouter>
    </Provider>
  )
}

describe('TodoListScreen - Interviewer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display today interviews table', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText(/Today's Interviews/i)).toBeInTheDocument()
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })
  })

  it('should display pending feedbacks table', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText(/Pending Feedbacks/i)).toBeInTheDocument()
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument()
    })
  })

  it('should display slot warning when slots are low', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText(/Limited Slot Availability/i)).toBeInTheDocument()
      expect(screen.getByText(/3/)).toBeInTheDocument()
    })
  })

  it('should display interview details', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('10:00 AM')).toBeInTheDocument()
      expect(screen.getByText('9876543210')).toBeInTheDocument()
      expect(screen.getByText('5 yrs')).toBeInTheDocument()
    })
  })

  it('should have submit feedback button', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText(/Submit Feedback/i)).toBeInTheDocument()
    })
  })
})
