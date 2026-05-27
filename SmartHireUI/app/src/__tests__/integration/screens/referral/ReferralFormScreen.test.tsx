/**
 * T140 - ReferralFormScreen integration tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import ReferralFormScreen from '@screens/referral/ReferralFormScreen'

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@services/api/referral', () => ({
  submitReferral: vi.fn().mockResolvedValue({
    id: 'c1',
    referrerId: 'emp1',
    referrerName: 'Alice',
    name: 'Bob',
    contact: '9999999999',
    email: 'bob@test.com',
    totalExperience: 3,
    relevantExperience: 2,
    skill: 'Java',
    source: 'Referral',
    status: 'Applied',
    referralDate: '2026-05-01T00:00:00Z',
    lastModified: '2026-05-01T00:00:00Z',
  }),
  getMyCandidates: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, hasMore: false }),
  getAllReferrals: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20, hasMore: false }),
  getReferralAnalytics: vi.fn().mockResolvedValue({ totalReferrals: 0, totalConverted: 0, byBU: [], byAccount: [] }),
  exportReferrals: vi.fn().mockResolvedValue(new Blob()),
  registerReferralUser: vi.fn(),
}))

function renderScreen() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ReferralFormScreen />
      </MemoryRouter>
    </Provider>
  )
}

describe('ReferralFormScreen', () => {
  it('should render the form', () => {
    renderScreen()
    expect(screen.getByText('Submit Referral')).toBeInTheDocument()
    expect(screen.getByLabelText(/candidate name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('should show validation errors on empty submit', async () => {
    renderScreen()
    fireEvent.click(screen.getByRole('button', { name: /submit referral/i }))
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  it('should show email validation error', async () => {
    renderScreen()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'notanemail' } })
    fireEvent.click(screen.getByRole('button', { name: /submit referral/i }))
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  it('should show contact validation error for non-numeric', async () => {
    renderScreen()
    fireEvent.change(screen.getByLabelText(/contact/i), { target: { value: 'abc' } })
    fireEvent.click(screen.getByRole('button', { name: /submit referral/i }))
    await waitFor(() => {
      expect(screen.getByText('Contact must be numeric')).toBeInTheDocument()
    })
  })

  it('should reject invalid file types', () => {
    renderScreen()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const invalidFile = new File(['content'], 'test.exe', { type: 'application/octet-stream' })
    fireEvent.change(fileInput, { target: { files: [invalidFile] } })
    expect(screen.getByText('Only PDF or DOC files allowed')).toBeInTheDocument()
  })

  it('should submit valid form successfully', async () => {
    renderScreen()
    fireEvent.change(screen.getByLabelText(/candidate name/i), { target: { value: 'Bob Jones' } })
    fireEvent.change(screen.getByLabelText(/contact/i), { target: { value: '9876543210' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bob@example.com' } })
    fireEvent.change(screen.getByLabelText(/skill/i), { target: { value: 'Java' } })

    fireEvent.click(screen.getByRole('button', { name: /submit referral/i }))
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/referral-portal/ref-candidate-details')
    })
  })
})
