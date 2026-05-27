/**
 * T139 - Referral API unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  registerReferralUser,
  submitReferral,
  getMyCandidates,
  getAllReferrals,
  getReferralAnalytics,
  exportReferrals,
} from '@services/api/referral'

vi.mock('@services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { apiClient } from '@services/api/client'

const mockCandidate = {
  id: 'c1',
  referrerId: 'emp1',
  referrerName: 'Alice',
  name: 'Bob',
  contact: '9999999999',
  email: 'bob@test.com',
  totalExperience: 5,
  relevantExperience: 3,
  skill: 'Java',
  source: 'Referral' as const,
  status: 'Applied',
  referralDate: '2026-05-01T00:00:00Z',
  lastModified: '2026-05-02T00:00:00Z',
}

const mockPage = {
  items: [mockCandidate],
  total: 1,
  page: 1,
  pageSize: 20,
  hasMore: false,
}

describe('Referral API Client', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should register a referral user', async () => {
    const user = { employeeId: 'E001', name: 'Alice', email: 'alice@test.com', role: 'SPOC' as const, bu: 'Java' }
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: user })
    const result = await registerReferralUser(user)
    expect(result.email).toBe('alice@test.com')
    expect(apiClient.post).toHaveBeenCalledWith('/referral/register', user)
  })

  it('should submit a referral', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockCandidate })
    const result = await submitReferral({
      name: 'Bob', contact: '9999999999', email: 'bob@test.com',
      totalExperience: 5, relevantExperience: 3, skill: 'Java',
    })
    expect(result.name).toBe('Bob')
    expect(apiClient.post).toHaveBeenCalledWith('/referral/submit', expect.any(FormData), expect.any(Object))
  })

  it('should get my candidates', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage })
    const result = await getMyCandidates()
    expect(result.items).toHaveLength(1)
    expect(apiClient.get).toHaveBeenCalledWith('/referral/my-candidates', expect.any(Object))
  })

  it('should get all referrals with filter', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage })
    const result = await getAllReferrals({ bu: 'Java' })
    expect(result.total).toBe(1)
    expect(apiClient.get).toHaveBeenCalledWith('/referral/all', expect.any(Object))
  })

  it('should get referral analytics', async () => {
    const analytics = { totalReferrals: 10, totalConverted: 3, byBU: [], byAccount: [] }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: analytics })
    const result = await getReferralAnalytics()
    expect(result.totalReferrals).toBe(10)
    expect(apiClient.get).toHaveBeenCalledWith('/referral/analytics')
  })

  it('should export referrals as blob', async () => {
    const blob = new Blob(['data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: blob })
    const result = await exportReferrals()
    expect(result).toBeInstanceOf(Blob)
    expect(apiClient.get).toHaveBeenCalledWith('/referral/export', expect.objectContaining({ responseType: 'blob' }))
  })
})
