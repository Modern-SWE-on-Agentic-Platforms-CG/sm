/**
 * T113 - WorkflowQueue component tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkflowQueue } from '@components/tables/WorkflowQueue'
import { ApprovalStage, ApprovalDecision } from '@appTypes/workflow'
import type { WorkflowCandidate } from '@appTypes/workflow'

const mockCandidates: WorkflowCandidate[] = [
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
  {
    candidateId: 'c2',
    candidateName: 'Bob Jones',
    technology: 'Python',
    bu: 'Analytics',
    experience: 3,
    currentStage: ApprovalStage.SL_BU_LEAD,
    currentDecision: ApprovalDecision.APPROVED,
    submittedAt: '2026-06-02T10:00:00Z',
    submittedBy: 'recruiter2',
  },
]

const defaultProps = {
  candidates: mockCandidates,
  selected: [],
  isLoading: false,
  onToggleSelect: vi.fn(),
  onSelectAll: vi.fn(),
  onClearAll: vi.fn(),
  onViewHistory: vi.fn(),
}

describe('WorkflowQueue', () => {
  it('should show loading spinner', () => {
    const { container } = render(<WorkflowQueue {...defaultProps} isLoading={true} />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should show empty message when no candidates', () => {
    render(<WorkflowQueue {...defaultProps} candidates={[]} />)
    expect(screen.getByText('No candidates pending approval')).toBeInTheDocument()
  })

  it('should render candidate names', () => {
    render(<WorkflowQueue {...defaultProps} />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('should render technology and BU columns', () => {
    render(<WorkflowQueue {...defaultProps} />)
    expect(screen.getByText('Java')).toBeInTheDocument()
    expect(screen.getByText('Delivery')).toBeInTheDocument()
  })

  it('should show decision badge for each candidate', () => {
    render(<WorkflowQueue {...defaultProps} />)
    expect(screen.getByText('PENDING')).toBeInTheDocument()
    expect(screen.getByText('APPROVED')).toBeInTheDocument()
  })

  it('should call onToggleSelect when row checkbox is clicked', () => {
    const onToggleSelect = vi.fn()
    render(<WorkflowQueue {...defaultProps} onToggleSelect={onToggleSelect} />)
    fireEvent.click(screen.getByLabelText('Select Alice Smith'))
    expect(onToggleSelect).toHaveBeenCalledWith('c1')
  })

  it('should call onSelectAll when header checkbox is clicked', () => {
    const onSelectAll = vi.fn()
    render(<WorkflowQueue {...defaultProps} onSelectAll={onSelectAll} />)
    fireEvent.click(screen.getByLabelText('Select all'))
    expect(onSelectAll).toHaveBeenCalled()
  })

  it('should call onViewHistory when History button is clicked', () => {
    const onViewHistory = vi.fn()
    render(<WorkflowQueue {...defaultProps} onViewHistory={onViewHistory} />)
    fireEvent.click(screen.getAllByText('History')[0])
    expect(onViewHistory).toHaveBeenCalledWith('c1')
  })

  it('should check all checkboxes when all are selected', () => {
    render(<WorkflowQueue {...defaultProps} selected={['c1', 'c2']} />)
    const headerCheckbox = screen.getByLabelText('Select all') as HTMLInputElement
    expect(headerCheckbox.checked).toBe(true)
  })
})
