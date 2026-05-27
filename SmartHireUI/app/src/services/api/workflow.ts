/**
 * Workflow / approval chain HTTP API client
 */
import { apiClient } from './client'
import type {
  WorkflowCandidate,
  ApprovalHistory,
  ApprovalAction,
  WorkflowFilter,
} from '@appTypes/workflow'
import type { PaginatedResponse } from './types'

/** Get candidates pending approval for the current approver's stage */
export async function getCandidates(filter: WorkflowFilter): Promise<PaginatedResponse<WorkflowCandidate>> {
  const res = await apiClient.get('/workflow/candidates', { params: filter })
  const raw = res.data as unknown as { response?: Array<{ items?: WorkflowCandidate[]; total?: number }>; items?: WorkflowCandidate[]; total?: number }
  // Backend wraps in { response: [{ items, total, page, pageSize }] }
  const inner = raw.response?.[0] ?? raw
  const items = inner.items ?? []
  const total = inner.total ?? items.length
  return { items, total, page: 0, pageSize: 20 }
}

/** Approve one or more candidates */
export async function approveCandidates(action: ApprovalAction): Promise<void> {
  await apiClient.post('/workflow/approve', action)
}

/** Reject one or more candidates (comments required) */
export async function rejectCandidates(action: ApprovalAction): Promise<void> {
  await apiClient.post('/workflow/reject', action)
}

/** Hold one or more candidates */
export async function holdCandidates(action: ApprovalAction): Promise<void> {
  await apiClient.post('/workflow/hold', action)
}

/** Fetch full approval history for a candidate */
export async function getHistory(candidateId: string): Promise<ApprovalHistory> {
  const res = await apiClient.get<ApprovalHistory>(`/workflow/history/${candidateId}`)
  return res.data
}
