/**
 * T164 - WeekendDriveScreen integration tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import WeekendDriveScreen from '@screens/candidate/WeekendDriveScreen'

vi.mock('@services/api/candidates', () => ({
  submitInstantInterview: vi.fn().mockResolvedValue({
    id: 'c1',
    name: 'John Doe',
    contact: '9876543210',
    email: 'john@test.com',
    status: 'APPLIED',
  }),
}))

function renderScreen() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <WeekendDriveScreen />
      </MemoryRouter>
    </Provider>
  )
}

describe('WeekendDriveScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the screen title and form', () => {
    renderScreen()
    expect(screen.getByText(/Weekend Drive/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  })

  it('should display conditional SAP fields when SAP BU selected', async () => {
    renderScreen()
    const buSelect = screen.getByLabelText(/business unit/i)
    fireEvent.change(buSelect, { target: { value: 'SAP' } })
    await waitFor(() => {
      expect(screen.getByLabelText(/sap capabilities/i)).toBeInTheDocument()
    })
  })

  it('should display error if submission fails', async () => {
    const { submitInstantInterview } = await import('@services/api/candidates')
    vi.mocked(submitInstantInterview).mockRejectedValueOnce(new Error('Network error'))

    renderScreen()
    const submitButton = screen.getByRole('button', { name: /submit/i })
    const nameInput = screen.getByLabelText(/name/i)
    const contactInput = screen.getByLabelText(/contact/i)
    const emailInput = screen.getByLabelText(/email/i)
    const buSelect = screen.getByLabelText(/business unit/i)
    const skillInput = screen.getByLabelText(/skill/i)
    const slotSelect = screen.getByLabelText(/preferred interview slot/i)
    const typeSelect = screen.getByLabelText(/interview type/i)

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })
    fireEvent.change(contactInput, { target: { value: '9876543210' } })
    fireEvent.change(emailInput, { target: { value: 'jane@test.com' } })
    fireEvent.change(buSelect, { target: { value: 'Java' } })
    fireEvent.change(skillInput, { target: { value: 'Spring' } })
    fireEvent.change(slotSelect, { target: { value: '10:00 AM' } })
    fireEvent.change(typeSelect, { target: { value: 'Technical' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })
})
