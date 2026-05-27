/**
 * T099 - Feedback API unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getTemplate,
  submitFeedback,
  getFeedback,
  listFeedback,
  revisitFeedback,
} from '@services/api/feedback'
import { FeedbackStatus } from '@appTypes/feedback'
import type { FeedbackTemplate, FeedbackRecord } from '@appTypes/feedback'

vi.mock('@services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

import { apiClient } from '@services/api/client'

const mockTemplate: FeedbackTemplate = {
  id: 'tmpl1',
  technology: 'Java',
  technicalAreas: [
    { id: 'ta1', name: 'Core Java' },
    { id: 'ta2', name: 'Spring Boot' },
  ],
  behavioralAreas: [
    { id: 'ba1', name: 'Communication' },
  ],
  overallRemarkOptions: ['Highly Recommended', 'Recommended', 'Not Recommended'],
  statusOptions: [
    { value: FeedbackStatus.SELECTED, label: 'Select' },
    { value: FeedbackStatus.REJECTED, label: 'Reject' },
  ],
}

const mockRecord: FeedbackRecord = {
  id: 'fb1',
  candidateId: 'c1',
  slotId: 's1',
  technicalRatings: [],
  behavioralRatings: [],
  overallRemark: 'Recommended',
  feedbackStatus: FeedbackStatus.SELECTED,
  submittedAt: '2026-06-01T12:00:00Z',
  submittedBy: 'interviewer1',
}

describe('Feedback API Client', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should fetch feedback template by technology', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockTemplate })
    const result = await getTemplate('Java')
    expect(result.technology).toBe('Java')
    expect(result.technicalAreas).toHaveLength(2)
    expect(apiClient.get).toHaveBeenCalledWith('/feedback/template', { params: { technology: 'Java' } })
  })

  it('should submit new feedback', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRecord })
    const result = await submitFeedback({
      candidateId: 'c1',
      slotId: 's1',
      technicalRatings: [],
      behavioralRatings: [],
      overallRemark: 'Recommended',
      feedbackStatus: FeedbackStatus.SELECTED,
    })
    expect(result.id).toBe('fb1')
    expect(apiClient.post).toHaveBeenCalledWith('/feedback', expect.any(Object))
  })

  it('should fetch a single feedback record', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockRecord })
    const result = await getFeedback('fb1')
    expect(result.feedbackStatus).toBe(FeedbackStatus.SELECTED)
    expect(apiClient.get).toHaveBeenCalledWith('/feedback/fb1')
  })

  it('should list feedback with pagination', async () => {
    const mockPage = { items: [mockRecord], total: 1, page: 1, pageSize: 20, hasMore: false }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage })
    const result = await listFeedback({ candidateId: 'c1' })
    expect(result.items).toHaveLength(1)
    expect(apiClient.get).toHaveBeenCalledWith('/feedback', { params: { candidateId: 'c1' } })
  })

  it('should revisit/update existing feedback', async () => {
    const updated = { ...mockRecord, overallRemark: 'Not Recommended' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: updated })
    const result = await revisitFeedback('fb1', { overallRemark: 'Not Recommended' })
    expect(result.overallRemark).toBe('Not Recommended')
    expect(apiClient.patch).toHaveBeenCalledWith('/feedback/fb1', expect.any(Object))
  })
})
