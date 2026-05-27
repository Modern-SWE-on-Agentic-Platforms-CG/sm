/**
 * T089 - BookingForm component tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingForm } from '@components/forms/BookingForm'

describe('BookingForm - Interviewer Mode', () => {
  const defaultProps = {
    mode: 'interviewer' as const,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  it('should render interviewer form fields', () => {
    render(<BookingForm {...defaultProps} />)
    expect(screen.getByText('Create Availability Slot')).toBeInTheDocument()
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument()
  })

  it('should show multi-slot toggle', () => {
    render(<BookingForm {...defaultProps} />)
    expect(screen.getByLabelText(/Multi-slot booking/i)).toBeInTheDocument()
  })

  it('should reveal multi-slot hours when multi-slot is checked', async () => {
    const user = userEvent.setup()
    render(<BookingForm {...defaultProps} />)
    const checkbox = screen.getByLabelText(/Multi-slot booking/i)
    await user.click(checkbox)
    expect(screen.getByLabelText('Hours')).toBeInTheDocument()
  })

  it('should validate end time after start time', async () => {
    const user = userEvent.setup()
    render(<BookingForm {...defaultProps} />)

    // Set end time before start time
    const selects = screen.getAllByRole('combobox')
    // start = 10:00, end = 09:00
    await user.selectOptions(selects[0], '10:00')
    await user.selectOptions(selects[1], '09:00')

    await user.click(screen.getByRole('button', { name: /create slot/i }))
    await waitFor(() => {
      expect(screen.getByText('End time must be after start time')).toBeInTheDocument()
    })
  })

  it('should call onSubmit with valid data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<BookingForm {...defaultProps} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: /create slot/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('should call onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<BookingForm {...defaultProps} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })
})

describe('BookingForm - Recruiter Mode', () => {
  const candidates = [
    { id: 'c1', name: 'John Doe', technology: 'Java' },
    { id: 'c2', name: 'Jane Doe', technology: 'Python' },
  ]

  const defaultProps = {
    mode: 'recruiter' as const,
    candidates,
    slotDate: '2026-06-10',
    slotStart: '09:00',
    slotEnd: '09:30',
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  }

  it('should render recruiter form title', () => {
    render(<BookingForm {...defaultProps} />)
    expect(screen.getByText('Book Interview Slot')).toBeInTheDocument()
  })

  it('should show candidate dropdown', () => {
    render(<BookingForm {...defaultProps} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('should validate candidate is required', async () => {
    const user = userEvent.setup()
    render(<BookingForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /book interview/i }))
    await waitFor(() => {
      expect(screen.getByText('Candidate is required')).toBeInTheDocument()
    })
  })

  it('should call onSubmit with candidate data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<BookingForm {...defaultProps} onSubmit={onSubmit} />)

    await user.selectOptions(screen.getByDisplayValue('Select candidate'), 'c1')
    await user.selectOptions(screen.getByDisplayValue('Select type'), 'TECHNICAL')
    const techInput = screen.getByPlaceholderText('e.g. Java')
    await user.type(techInput, 'Java')

    await user.click(screen.getByRole('button', { name: /book interview/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          candidateId: 'c1',
          interviewType: 'TECHNICAL',
        })
      )
    })
  })
})
