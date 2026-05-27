/**
 * T127 - MasterDataGrid component tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MasterDataGrid } from '@components/tables/MasterDataGrid'
import { DataCategory } from '@appTypes/admin'
import type { MasterRecord } from '@appTypes/admin'

const records: MasterRecord[] = [
  {
    id: 'r1',
    category: DataCategory.TOWER,
    data: { name: 'Java Tower', description: 'Core Java' },
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    inUse: false,
  },
  {
    id: 'r2',
    category: DataCategory.TOWER,
    data: { name: 'Python Tower', description: 'AI/ML' },
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    inUse: true,
  },
]

const defaultProps = {
  category: DataCategory.TOWER,
  records,
  isLoading: false,
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
}

describe('MasterDataGrid', () => {
  it('should show loading spinner when loading', () => {
    const { container } = render(<MasterDataGrid {...defaultProps} isLoading={true} />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('should show empty state when no records', () => {
    render(<MasterDataGrid {...defaultProps} records={[]} />)
    expect(screen.getByText(/No records found/i)).toBeInTheDocument()
  })

  it('should render record data', () => {
    render(<MasterDataGrid {...defaultProps} />)
    expect(screen.getByText('Java Tower')).toBeInTheDocument()
    expect(screen.getByText('Python Tower')).toBeInTheDocument()
  })

  it('should render column headers from data keys', () => {
    render(<MasterDataGrid {...defaultProps} />)
    expect(screen.getByText('name')).toBeInTheDocument()
    expect(screen.getByText('description')).toBeInTheDocument()
  })

  it('should call onAdd when Add button clicked', () => {
    const onAdd = vi.fn()
    render(<MasterDataGrid {...defaultProps} onAdd={onAdd} />)
    fireEvent.click(screen.getByText('+ Add'))
    expect(onAdd).toHaveBeenCalled()
  })

  it('should call onEdit when Edit is clicked', () => {
    const onEdit = vi.fn()
    render(<MasterDataGrid {...defaultProps} onEdit={onEdit} />)
    fireEvent.click(screen.getAllByLabelText(/Edit record/)[0])
    expect(onEdit).toHaveBeenCalledWith(records[0])
  })

  it('should disable delete for in-use records', () => {
    render(<MasterDataGrid {...defaultProps} />)
    const deleteButtons = screen.getAllByLabelText(/Delete record/)
    // r1 is not inUse, r2 is inUse
    expect(deleteButtons[0]).not.toBeDisabled()
    expect(deleteButtons[1]).toBeDisabled()
  })

  it('should call onDelete when Delete is clicked for non-in-use record', () => {
    const onDelete = vi.fn()
    render(<MasterDataGrid {...defaultProps} onDelete={onDelete} />)
    fireEvent.click(screen.getAllByLabelText(/Delete record/)[0])
    expect(onDelete).toHaveBeenCalledWith(records[0])
  })
})
