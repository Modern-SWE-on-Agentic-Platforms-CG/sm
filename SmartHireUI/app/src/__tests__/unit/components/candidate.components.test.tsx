/**
 * T074 - Candidate components unit tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CandidateTable } from '@components/tables/CandidateTable'
import { SearchInput } from '@components/forms/SearchInput'
import { FilterPanel } from '@components/forms/FilterPanel'
import { FileUpload } from '@components/forms/FileUpload'
import { CandidateForm } from '@components/forms/CandidateForm'
import { CandidateStatusBadge } from '@components/tables/CandidateStatusBadge'
import { CandidateStatus, CandidateSource } from '@appTypes/candidate'
import type { Candidate } from '@appTypes/candidate'

const mockCandidate: Candidate = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  contact: '+91 9999999999',
  technology: 'Java',
  experience: 5,
  bu: 'EAS',
  source: CandidateSource.LINKEDIN,
  status: CandidateStatus.SHORTLISTED,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastModified: '2024-01-01T00:00:00Z',
  agingDays: 5,
}

describe('CandidateStatusBadge', () => {
  it('should render status badge', () => {
    render(<CandidateStatusBadge status={CandidateStatus.SHORTLISTED} />)
    expect(screen.getByText('SHORTLISTED')).toBeInTheDocument()
  })

  it('should render correct styling for different statuses', () => {
    const { rerender } = render(<CandidateStatusBadge status={CandidateStatus.SELECTED} />)
    let badge = screen.getByText('SELECTED')
    expect(badge).toHaveClass('bg-green-100')

    rerender(<CandidateStatusBadge status={CandidateStatus.REJECTED} />)
    badge = screen.getByText('REJECTED')
    expect(badge).toHaveClass('bg-red-100')
  })
})

describe('CandidateTable', () => {
  it('should render table with candidates', () => {
    render(<CandidateTable candidates={[mockCandidate]} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<CandidateTable candidates={[]} isLoading={true} />)
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument() // spinner
  })

  it('should show empty state', () => {
    render(<CandidateTable candidates={[]} />)
    expect(screen.getByText('No candidates found')).toBeInTheDocument()
  })

  it('should call onRowClick when row is clicked', async () => {
    const onRowClick = vi.fn()
    render(<CandidateTable candidates={[mockCandidate]} onRowClick={onRowClick} />)
    fireEvent.click(screen.getByText('John Doe'))
    expect(onRowClick).toHaveBeenCalledWith(mockCandidate)
  })

  it('should render status dropdown when onStatusChange provided', () => {
    const onStatusChange = vi.fn()
    render(<CandidateTable candidates={[mockCandidate]} onStatusChange={onStatusChange} />)
    const select = screen.getByDisplayValue('SHORTLISTED')
    expect(select).toBeInTheDocument()
  })
})

describe('SearchInput', () => {
  it('should render search input', () => {
    render(<SearchInput onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText(/search candidates/i)).toBeInTheDocument()
  })

  it('should call onSearch with debounced value', async () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    const user = userEvent.setup({ delay: null })
    render(<SearchInput onSearch={onSearch} debounceMs={400} />)

    const input = screen.getByPlaceholderText(/search candidates/i) as HTMLInputElement
    await user.type(input, 'Java')
    expect(onSearch).not.toHaveBeenCalled()

    vi.advanceTimersByTime(400)
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('Java'))
    vi.useRealTimers()
  })

  it('should clear search on clear button click', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchInput onSearch={onSearch} />)

    const input = screen.getByPlaceholderText(/search candidates/i) as HTMLInputElement
    await user.type(input, 'test')
    vi.useFakeTimers()
    vi.advanceTimersByTime(400)
    vi.useRealTimers()

    const clearBtn = screen.getByLabelText('Clear search')
    await user.click(clearBtn)
    expect(input.value).toBe('')
  })
})

describe('FileUpload', () => {
  it('should render upload area', () => {
    render(<FileUpload onUpload={vi.fn()} />)
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument()
  })

  it('should accept Excel files', async () => {
    const onUpload = vi.fn()
    const user = userEvent.setup()
    render(<FileUpload onUpload={onUpload} />)

    const file = new File(['content'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const input = screen.getByDisplayValue('') as HTMLInputElement
    await user.upload(input, file)
    expect(onUpload).toHaveBeenCalledWith(file)
  })

  it('should reject non-Excel files', async () => {
    render(<FileUpload onUpload={vi.fn()} />)
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const input = screen.getByDisplayValue('') as HTMLInputElement
    await userEvent.upload(input, file)
    expect(screen.getByText(/Only Excel files/i)).toBeInTheDocument()
  })
})

describe('FilterPanel', () => {
  it('should render filter panel', () => {
    render(
      <FilterPanel
        filter={{}}
        onApply={vi.fn()}
        onReset={vi.fn()}
      />
    )
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

  it('should call onApply with selected filters', async () => {
    const onApply = vi.fn()
    const user = userEvent.setup()
    render(
      <FilterPanel
        filter={{}}
        onApply={onApply}
        onReset={vi.fn()}
      />
    )

    const javaCheckbox = screen.getByLabelText('Java') as HTMLInputElement
    await user.click(javaCheckbox)

    const applyBtn = screen.getByRole('button', { name: /apply/i })
    await user.click(applyBtn)

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ technology: ['Java'] })
    )
  })

  it('should call onReset', async () => {
    const onReset = vi.fn()
    const user = userEvent.setup()
    render(
      <FilterPanel
        filter={{ technology: ['Java'] }}
        onApply={vi.fn()}
        onReset={onReset}
      />
    )

    const resetBtn = screen.getByRole('button', { name: /reset/i })
    await user.click(resetBtn)
    expect(onReset).toHaveBeenCalled()
  })
})

describe('CandidateForm', () => {
  it('should render form fields', () => {
    render(
      <CandidateForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(
      <CandidateForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    const submitBtn = screen.getByRole('button', { name: /save/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  it('should call onSubmit with form data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <CandidateForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    )

    const nameInput = screen.getByPlaceholderText('John Doe') as HTMLInputElement
    const emailInput = screen.getByPlaceholderText('john@example.com') as HTMLInputElement
    const contactInput = screen.getByPlaceholderText(/\+91/) as HTMLInputElement

    await user.type(nameInput, 'Jane Doe')
    await user.type(emailInput, 'jane@example.com')
    await user.type(contactInput, '+91 8888888888')

    const techSelect = screen.getByDisplayValue('Select technology') as HTMLSelectElement
    await user.selectOptions(techSelect, 'Python')

    const submitBtn = screen.getByRole('button', { name: /save/i })
    await user.click(submitBtn)

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Jane Doe',
        email: 'jane@example.com',
      })
    )
  })

  it('should call onCancel', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(
      <CandidateForm
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    )

    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelBtn)
    expect(onCancel).toHaveBeenCalled()
  })
})
