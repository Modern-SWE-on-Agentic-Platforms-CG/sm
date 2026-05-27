/**
 * T163 - WeekendDriveForm component tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WeekendDriveForm } from '@components/forms/WeekendDriveForm'

describe('WeekendDriveForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('should render all base form fields', () => {
    render(<WeekendDriveForm onSubmit={mockOnSubmit} />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contact/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/business unit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/skill/i)).toBeInTheDocument()
  })

  it('should show SAP fields when SAP BU is selected', async () => {
    render(<WeekendDriveForm onSubmit={mockOnSubmit} />)
    const buSelect = screen.getByLabelText(/business unit/i)
    fireEvent.change(buSelect, { target: { value: 'SAP' } })
    await waitFor(() => {
      expect(screen.getByLabelText(/sap capabilities/i)).toBeInTheDocument()
    })
  })

  it('should show GCCA fields when GCCA BU is selected', async () => {
    render(<WeekendDriveForm onSubmit={mockOnSubmit} />)
    const buSelect = screen.getByLabelText(/business unit/i)
    fireEvent.change(buSelect, { target: { value: 'GCCA' } })
    await waitFor(() => {
      expect(screen.getByLabelText(/gcca account/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/gcca region/i)).toBeInTheDocument()
    })
  })

  it('should show Invent fields when Invent BU is selected', async () => {
    render(<WeekendDriveForm onSubmit={mockOnSubmit} />)
    const buSelect = screen.getByLabelText(/business unit/i)
    fireEvent.change(buSelect, { target: { value: 'Invent' } })
    await waitFor(() => {
      expect(screen.getByLabelText(/meeting link/i)).toBeInTheDocument()
    })
  })

  it('should validate contact as numeric', async () => {
    render(<WeekendDriveForm onSubmit={mockOnSubmit} />)
    const submitButton = screen.getByRole('button', { name: /submit/i })
    const nameInput = screen.getByLabelText(/name/i)
    const contactInput = screen.getByLabelText(/contact/i)
    const emailInput = screen.getByLabelText(/email/i)
    const buSelect = screen.getByLabelText(/business unit/i)
    const skillInput = screen.getByLabelText(/skill/i)

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(contactInput, { target: { value: 'abc' } })
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
    fireEvent.change(buSelect, { target: { value: 'Java' } })
    fireEvent.change(skillInput, { target: { value: 'Spring' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/contact must be a valid number/i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    render(<WeekendDriveForm onSubmit={mockOnSubmit} />)
    const submitButton = screen.getByRole('button', { name: /submit/i })
    const nameInput = screen.getByLabelText(/name/i)
    const contactInput = screen.getByLabelText(/contact/i)
    const emailInput = screen.getByLabelText(/email/i)
    const buSelect = screen.getByLabelText(/business unit/i)
    const skillInput = screen.getByLabelText(/skill/i)

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(contactInput, { target: { value: '9876543210' } })
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(buSelect, { target: { value: 'Java' } })
    fireEvent.change(skillInput, { target: { value: 'Spring' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email must be valid/i)).toBeInTheDocument()
    })
  })

  it('should require SAP capabilities for SAP BU submission', async () => {
    render(<WeekendDriveForm onSubmit={mockOnSubmit} />)
    const submitButton = screen.getByRole('button', { name: /submit/i })
    const nameInput = screen.getByLabelText(/name/i)
    const contactInput = screen.getByLabelText(/contact/i)
    const emailInput = screen.getByLabelText(/email/i)
    const buSelect = screen.getByLabelText(/business unit/i)
    const skillInput = screen.getByLabelText(/skill/i)
    const slotSelect = screen.getByLabelText(/preferred interview slot/i)
    const typeSelect = screen.getByLabelText(/interview type/i)

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(contactInput, { target: { value: '9876543210' } })
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
    fireEvent.change(buSelect, { target: { value: 'SAP' } })
    fireEvent.change(skillInput, { target: { value: 'SAP' } })
    fireEvent.change(slotSelect, { target: { value: '09:00 AM' } })
    fireEvent.change(typeSelect, { target: { value: 'Technical' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/SAP capabilities required/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    render(<WeekendDriveForm onSubmit={mockOnSubmit} />)
    const submitButton = screen.getByRole('button', { name: /submit/i })
    const nameInput = screen.getByLabelText(/name/i)
    const contactInput = screen.getByLabelText(/contact/i)
    const emailInput = screen.getByLabelText(/email/i)
    const buSelect = screen.getByLabelText(/business unit/i)
    const skillInput = screen.getByLabelText(/skill/i)
    const slotSelect = screen.getByLabelText(/preferred interview slot/i)
    const typeSelect = screen.getByLabelText(/interview type/i)

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(contactInput, { target: { value: '9876543210' } })
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } })
    fireEvent.change(buSelect, { target: { value: 'Java' } })
    fireEvent.change(skillInput, { target: { value: 'Spring' } })
    fireEvent.change(slotSelect, { target: { value: '09:00 AM' } })
    fireEvent.change(typeSelect, { target: { value: 'Technical' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })
  })
})
