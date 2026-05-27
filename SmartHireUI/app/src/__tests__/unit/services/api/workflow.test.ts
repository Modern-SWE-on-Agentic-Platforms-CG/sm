/**
 * T112 - Workflow API unit tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getCandidates,
  approveCandidates,
  rejectCandidates,
  holdCandidates,
  getHistory,
} from '@services/api/workflow'
import { ApprovalStage, ApprovalDecision } from '@appTypes/workflow'
import type { WorkflowCandidate, ApprovalHistory } from '@appTypes/workflow'

vi.mock('@services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { apiClient } from '@services/api/client'

const mockCandidate: WorkflowCandidate = {
  candidateId: 'c1',
  candidateName: 'John Doe',
  technology: 'Java',
  bu: 'Delivery',
  experience: 5,
  currentStage: ApprovalStage.TOWER_LEAD,
  currentDecision: ApprovalDecision.PENDING,
  submittedAt: '2026-06-01T10:00:00Z',
  submittedBy: 'recruiter1',
}

const mockHistory: ApprovalHistory = {
  candidateId: 'c1',
  candidateName: 'John Doe',
  stages: [
    {
      id: 'a1',
      candidateId: 'c1',
      stage: ApprovalStage.TOWER_LEAD,
      approverId: 'tl1',
      approverName: 'Tower Lead',
      decision: ApprovalDecision.APPROVED,
      timestamp: '2026-06-01T11:00:00Z',
    },
  ],
}

describe('Workflow API Client', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('should fetch candidates for approval queue', async () => {
    const mockPage = { items: [mockCandidate], total: 1, page: 1, pageSize: 20, hasMore: false }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage })

    const result = await getCandidates({})
    expect(result.items).toHaveLength(1)
    expect(result.items[0].candidateName).toBe('John Doe')
    expect(apiClient.get).toHaveBeenCalledWith('/workflow/candidates', expect.any(Object))
  })

  it('should approve candidates', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: null })
    await expect(
      approveCandidates({ candidateIds: ['c1'], decision: ApprovalDecision.APPROVED })
    ).resolves.not.toThrow()
    expect(apiClient.post).toHaveBeenCalledWith('/workflow/approve', expect.any(Object))
  })

  it('should reject candidates with comments', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: null })
    await expect(
      rejectCandidates({ candidateIds: ['c1'], decision: ApprovalDecision.REJECTED, comments: 'Not suitable' })
    ).resolves.not.toThrow()
    expect(apiClient.post).toHaveBeenCalledWith('/workflow/reject', expect.objectContaining({ comments: 'Not suitable' }))
  })

  it('should hold candidates', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: null })
    await expect(
      holdCandidates({ candidateIds: ['c1'], decision: ApprovalDecision.HELD })
    ).resolves.not.toThrow()
    expect(apiClient.post).toHaveBeenCalledWith('/workflow/hold', expect.any(Object))
  })

  it('should fetch approval history for a candidate', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHistory })
    const result = await getHistory('c1')
    expect(result.stages).toHaveLength(1)
    expect(result.stages[0].decision).toBe(ApprovalDecision.APPROVED)
    expect(apiClient.get).toHaveBeenCalledWith('/workflow/history/c1')
  })
})
