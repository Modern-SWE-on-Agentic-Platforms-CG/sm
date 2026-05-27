/**
 * T126 - Admin API unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchCategory,
  addRecord,
  updateRecord,
  deleteRecord,
  getDemandSupply,
} from '@services/api/admin'
import { DataCategory } from '@appTypes/admin'
import type { MasterRecord, DemandSupplyRow } from '@appTypes/admin'

vi.mock('@services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@services/api/client'

const mockRecord: MasterRecord = {
  id: 'r1',
  category: DataCategory.TOWER,
  data: { name: 'Java Tower', description: 'Java practice' },
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
}

describe('Admin API Client', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should fetch category records', async () => {
    const mockPage = { items: [mockRecord], total: 1, page: 1, pageSize: 20, hasMore: false }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage })

    const result = await fetchCategory(DataCategory.TOWER)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].data.name).toBe('Java Tower')
    expect(apiClient.get).toHaveBeenCalledWith('/admin/tower', expect.any(Object))
  })

  it('should add a new record', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRecord })

    const result = await addRecord(DataCategory.TOWER, { name: 'Java Tower', description: '' })
    expect(result.id).toBe('r1')
    expect(apiClient.post).toHaveBeenCalledWith('/admin/tower', expect.any(Object))
  })

  it('should update a record', async () => {
    const updated = { ...mockRecord, data: { name: 'Updated Tower', description: '' } }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: updated })

    const result = await updateRecord(DataCategory.TOWER, 'r1', { name: 'Updated Tower', description: '' })
    expect(result.data.name).toBe('Updated Tower')
    expect(apiClient.patch).toHaveBeenCalledWith('/admin/tower/r1', expect.any(Object))
  })

  it('should delete a record', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null })
    await expect(deleteRecord(DataCategory.TOWER, 'r1')).resolves.not.toThrow()
    expect(apiClient.delete).toHaveBeenCalledWith('/admin/tower/r1')
  })

  it('should get demand supply data', async () => {
    const mockDemand: DemandSupplyRow[] = [
      { bu: 'Delivery', practice: 'Java', skill: 'Spring Boot', openDemand: 5, activeCandidates: 3, gap: 2 },
    ]
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockDemand })

    const result = await getDemandSupply()
    expect(result).toHaveLength(1)
    expect(result[0].gap).toBe(2)
    expect(apiClient.get).toHaveBeenCalledWith('/admin/demand-supply')
  })
})
