/**
 * T072 - Candidate API client integration tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { searchCandidates, getCandidateById, updateCandidateStatus, uploadCandidates } from '@services/api/candidates'
import { CandidateStatus, CandidateSource } from '@appTypes/candidate'
import type { Candidate } from '@appTypes/candidate'

// Mock apiClient
vi.mock('@services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@services/api/client'

describe('Candidate API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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
  }

  it('should search candidates with filters', async () => {
    const mockResponse = {
      data: {
        items: [mockCandidate],
        total: 1,
        page: 1,
        pageSize: 10,
        hasMore: false,
      },
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

    const result = await searchCandidates({
      technology: ['Java'],
      page: 1,
      pageSize: 10,
    })

    expect(result.items).toEqual([mockCandidate])
    expect(apiClient.get).toHaveBeenCalledWith('/candidates', expect.any(Object))
  })

  it('should get candidate by ID', async () => {
    const mockResponse = { data: mockCandidate }
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

    const result = await getCandidateById('1')

    expect(result).toEqual(mockCandidate)
    expect(apiClient.get).toHaveBeenCalledWith('/candidates/1')
  })

  it('should update candidate status', async () => {
    const updatedCandidate = { ...mockCandidate, status: CandidateStatus.INTERVIEWED }
    const mockResponse = { data: updatedCandidate }
    vi.mocked(apiClient.patch).mockResolvedValueOnce(mockResponse)

    const result = await updateCandidateStatus('1', CandidateStatus.INTERVIEWED, 'Good fit')

    expect(result.status).toBe(CandidateStatus.INTERVIEWED)
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/candidates/1/status',
      expect.objectContaining({ status: CandidateStatus.INTERVIEWED })
    )
  })

  it('should upload candidates from file', async () => {
    const mockUploadResult = {
      totalRows: 10,
      successCount: 9,
      failureCount: 1,
      errors: [],
    }
    const mockResponse = { data: mockUploadResult }
    vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

    const file = new File(['content'], 'candidates.xlsx')
    const result = await uploadCandidates(file)

    expect(result.successCount).toBe(9)
    expect(apiClient.post).toHaveBeenCalledWith('/candidates/upload', expect.any(FormData), expect.any(Object))
  })

  it('should handle API errors gracefully', async () => {
    const error = new Error('Network error')
    vi.mocked(apiClient.get).mockRejectedValueOnce(error)

    await expect(searchCandidates({})).rejects.toThrow('Network error')
  })
})
