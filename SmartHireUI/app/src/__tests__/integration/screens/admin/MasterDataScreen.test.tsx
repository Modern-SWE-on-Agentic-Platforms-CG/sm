/**
 * T128 - MasterDataScreen integration tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { store } from '@store/store'
import MasterDataScreen from '@screens/admin/MasterDataScreen'
import { DataCategory } from '@appTypes/admin'

vi.mock('@services/api/admin', () => ({
  fetchCategory: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'r1',
        category: DataCategory.TOWER,
        data: { name: 'Java Tower', description: 'Core Java' },
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
        inUse: false,
      },
    ],
    total: 1,
    page: 1,
    pageSize: 20,
    hasMore: false,
  }),
  addRecord: vi.fn().mockResolvedValue({ id: 'r2', category: DataCategory.TOWER, data: { name: 'New', description: '' }, createdAt: '', updatedAt: '' }),
  updateRecord: vi.fn().mockResolvedValue({ id: 'r1', category: DataCategory.TOWER, data: { name: 'Updated', description: '' }, createdAt: '', updatedAt: '' }),
  deleteRecord: vi.fn().mockResolvedValue(undefined),
  getDemandSupply: vi.fn().mockResolvedValue([]),
  searchEmployee: vi.fn().mockResolvedValue([]),
  updateEmployeeRoles: vi.fn().mockResolvedValue(undefined),
}))

function renderScreen() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <MasterDataScreen />
      </MemoryRouter>
    </Provider>
  )
}

describe('MasterDataScreen', () => {
  it('should render heading', () => {
    renderScreen()
    expect(screen.getByText('Master Data')).toBeInTheDocument()
  })

  it('should show placeholder message before category selected', () => {
    renderScreen()
    expect(screen.getByText('Select a category from the sidebar.')).toBeInTheDocument()
  })

  it('should show category sidebar', () => {
    renderScreen()
    expect(screen.getByText('Tower')).toBeInTheDocument()
    expect(screen.getByText('Skill')).toBeInTheDocument()
  })

  it('should load records when category selected', async () => {
    renderScreen()
    fireEvent.click(screen.getByText('Tower'))
    await waitFor(() => {
      expect(screen.getByText('Java Tower')).toBeInTheDocument()
    })
  })

  it('should open add form when Add is clicked', async () => {
    renderScreen()
    fireEvent.click(screen.getByText('Tower'))
    await waitFor(() => expect(screen.getByText('Java Tower')).toBeInTheDocument())
    fireEvent.click(screen.getByText('+ Add'))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Add Record')).toBeInTheDocument()
    })
  })

  it('should close form on cancel', async () => {
    renderScreen()
    fireEvent.click(screen.getByText('Tower'))
    await waitFor(() => expect(screen.getByText('+ Add')).toBeInTheDocument())
    fireEvent.click(screen.getByText('+ Add'))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
