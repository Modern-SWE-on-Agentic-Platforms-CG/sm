/**
 * T173 - CandidateDetailsScreen integration tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import CandidateDetailsScreen from '@screens/candidate/CandidateDetailsScreen'

const mockCandidate = {
  id: 'c1',
  name: 'John Doe',
  email: 'john@test.com',
  contact: '9876543210',
  technology: 'Java',
  experience: 5,
  bu: 'Delivery',
  source: 'LINKEDIN' as const,
  status: 'INTERVIEWED' as const,
  createdAt: '2026-05-01',
  updatedAt: '2026-05-20',
  lastModified: '2026-05-20',
  grade: 'A',
  location: 'Bangalore',
  photo: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  skillMatch: {
    matchingSkills: ['Java', 'Spring'],
    laggingSkills: ['Kubernetes'],
    resumeExtractedSkills: ['Java', 'Spring', 'Docker'],
    matchPercentage: 80,
  },
  documents: [
    {
      id: 'd1',
      candidateId: 'c1',
      type: 'RESUME' as const,
      fileName: 'john-resume.pdf',
      fileSize: 102400,
      mimeType: 'application/pdf',
      uploadedAt: '2026-05-10',
      uploadedBy: 'recruiter@company.com',
    },
    {
      id: 'd2',
      candidateId: 'c1',
      type: 'FEEDBACK' as const,
      fileName: 'feedback-john.pdf',
      fileSize: 51200,
      mimeType: 'application/pdf',
      uploadedAt: '2026-05-20',
      uploadedBy: 'interviewer@company.com',
    },
  ],
  lifecycleHistory: [
    {
      id: 'l1',
      candidateId: 'c1',
      status: 'APPLIED' as const,
      timestamp: '2026-05-01T10:00:00Z',
      changedBy: 'system',
    },
    {
      id: 'l2',
      candidateId: 'c1',
      status: 'INTERVIEWED' as const,
      timestamp: '2026-05-20T14:30:00Z',
      changedBy: 'interviewer@company.com',
      comments: 'Good technical skills',
    },
  ],
}

vi.mock('@services/api/candidates', () => ({
  getCandidateById: vi.fn().mockResolvedValue(mockCandidate),
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useParams: () => ({ id: 'c1' }),
  }
})

function renderScreen() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <CandidateDetailsScreen />
      </MemoryRouter>
    </Provider>
  )
}

describe('CandidateDetailsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display candidate name and contact', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@test.com')).toBeInTheDocument()
    })
  })

  it('should display skill match section', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText(/Skill Match Analysis/i)).toBeInTheDocument()
      expect(screen.getByText(/80%/)).toBeInTheDocument()
    })
  })

  it('should display matching skills', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Java')).toBeInTheDocument()
      expect(screen.getByText('Spring')).toBeInTheDocument()
    })
  })

  it('should display lagging skills', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('Kubernetes')).toBeInTheDocument()
    })
  })

  it('should display documents section', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText(/Documents/i)).toBeInTheDocument()
      expect(screen.getByText('john-resume.pdf')).toBeInTheDocument()
      expect(screen.getByText('feedback-john.pdf')).toBeInTheDocument()
    })
  })

  it('should display lifecycle history', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText(/Lifecycle History/i)).toBeInTheDocument()
      expect(screen.getByText(/APPLIED/)).toBeInTheDocument()
      expect(screen.getByText(/INTERVIEWED/)).toBeInTheDocument()
    })
  })

  it('should display personal info section', async () => {
    renderScreen()
    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument() // Grade
      expect(screen.getByText('Bangalore')).toBeInTheDocument() // Location
      expect(screen.getByText('INTERVIEWED')).toBeInTheDocument() // Status
    })
  })
})
