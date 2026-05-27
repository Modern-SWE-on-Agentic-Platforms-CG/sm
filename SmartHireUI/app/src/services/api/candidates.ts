/**
 * Candidate API client — mapped to actual backend paths
 */
import { apiClient } from './client'
import type { PaginatedResponse } from './types'
import type { Candidate, CandidateFilter, UploadResult, CandidateComment, CandidateStatus } from '@appTypes/candidate'

// Maps backend status_master.name to frontend CandidateStatus enum values
const BACKEND_STATUS_TO_FRONTEND: Record<string, string> = {
  ACTIVE: 'APPLIED',
  SHORTLISTED: 'SHORTLISTED',
  L1_SCHEDULED: 'INTERVIEW_SCHEDULED',
  L1_SELECTED: 'INTERVIEWED',
  L1_REJECTED: 'REJECTED',
  L2_SCHEDULED: 'INTERVIEW_SCHEDULED',
  L2_SELECTED: 'INTERVIEWED',
  L2_REJECTED: 'REJECTED',
  HR_SCHEDULED: 'INTERVIEW_SCHEDULED',
  HR_SELECTED: 'SELECTED',
  OFFERED: 'SELECTED',
  JOINED: 'SELECTED',
  WITHDRAWN: 'WITHDRAWN',
  ON_HOLD: 'HOLD',
}

// Maps raw backend candidate record to frontend Candidate shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCandidate(raw: Record<string, any>): Candidate {
  const backendStatus: string = raw.status ?? ''
  const frontendStatus = BACKEND_STATUS_TO_FRONTEND[backendStatus.toUpperCase()] 
    ?? (raw.active_flag === false ? 'WITHDRAWN' : 'APPLIED')
  return {
    id: String(raw.id ?? ''),
    name: raw.candidate_name ?? raw.name ?? '',
    email: raw.email_id ?? raw.email ?? '',
    contact: raw.mobile_number ?? raw.contact ?? '',
    technology: raw.technology ?? raw.primary_skill ?? '',
    experience: parseFloat(raw.total_exp ?? raw.experience ?? 0),
    bu: raw.bu ?? raw.business_unit ?? '',
    source: raw.source ?? 'OTHER',
    status: frontendStatus as Candidate['status'],
    remarks: raw.remarks,
    agingDays: raw.aging_days,
    lastModified: raw.updated_date ?? raw.last_modified ?? raw.created_date ?? '',
    createdAt: raw.created_date ?? raw.created_at ?? '',
    updatedAt: raw.updated_date ?? raw.updated_at ?? raw.created_date ?? '',
    // Preserve all extra fields from backend for detail views
    ...Object.fromEntries(
      Object.entries(raw).filter(([k]) => !['id','name','email','contact'].includes(k))
    ),
  } as Candidate
}

// Maps frontend status names to backend status_master IDs
const FRONTEND_STATUS_TO_ID: Record<string, number> = {
  APPLIED: 1,
  SHORTLISTED: 2,
  'INTERVIEW SCHEDULED': 3,
  INTERVIEW_SCHEDULED: 3,
  INTERVIEWED: 4,
  SELECTED: 10,
  REJECTED: 5,
  HOLD: 14,
  ON_HOLD: 14,
  WITHDRAWN: 13,
}

/**
 * Search candidates with filters and pagination
 * Backend: POST /candidateData/searchCandidates
 */
export const searchCandidates = async (
  filter: CandidateFilter
): Promise<PaginatedResponse<Candidate>> => {
  // Map frontend filter to backend field names
  const f = filter as Record<string, unknown>
  // Map status string array to first matching backend status ID
  const statusArr = f.status as string[] | undefined
  const statusId = statusArr && statusArr.length > 0
    ? (FRONTEND_STATUS_TO_ID[statusArr[0]] ?? null)
    : null
  const apiBody: Record<string, unknown> = {
    page: f.page ?? 0,
    size: f.pageSize ?? f.size ?? 20,
  }
  if (statusId) apiBody.status = statusId
  if (f.skill) apiBody.skill = f.skill
  if (f.tower) apiBody.tower = f.tower
  if (f.source) apiBody.source = f.source
  if (f.fromDate) apiBody.fromDate = f.fromDate
  if (f.toDate) apiBody.toDate = f.toDate
  const response = await apiClient.post<{ response: unknown[]; message: string }>(
    '/candidateData/searchCandidates',
    apiBody
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = response.data as any
  const rawItems: Record<string, unknown>[] = raw.response ?? raw.data ?? []
  const items = rawItems.map(mapCandidate)
  return {
    items,
    total: raw.total ?? items.length,
    page: Number(f.page ?? 0),
    pageSize: Number(f.pageSize ?? f.size ?? 20),
  }
}

/**
 * Get candidate by ID
 * Backend: GET /candidateData/getCandidateData/{id}
 */
export const getCandidateById = async (id: string): Promise<Candidate> => {
  const response = await apiClient.get<{ response: unknown[] }>(
    `/candidateData/getCandidateData/${id}`
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = response.data as any
  const record = raw.response?.[0] ?? raw.data?.[0] ?? raw
  return mapCandidate(record as Record<string, unknown>)
}

/**
 * Create a new candidate
 * Backend: POST /candidateData/addCandidateData
 */
export const createCandidate = async (
  data: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'agingDays'>
): Promise<Candidate> => {
  const response = await apiClient.post<Candidate>('/candidateData/addCandidateData', data)
  return response.data
}

// Maps frontend CandidateStatus enum to backend status_master integer IDs
const STATUS_NAME_TO_ID: Record<string, number> = {
  APPLIED: 1,        // ACTIVE in backend
  ACTIVE: 1,
  SHORTLISTED: 2,
  INTERVIEW_SCHEDULED: 3,  // L1_SCHEDULED
  L1_SCHEDULED: 3,
  INTERVIEWED: 4,          // L1_SELECTED (interviewed → selected for next round)
  L1_SELECTED: 4,
  SELECTED: 10,            // HR_SELECTED
  HR_SELECTED: 10,
  OFFERED: 11,
  JOINED: 12,
  REJECTED: 5,             // L1_REJECTED
  L1_REJECTED: 5,
  HOLD: 1,                 // Map HOLD back to ACTIVE (no HOLD in backend)
  WITHDRAWN: 13,
}

function toStatusId(status: string): number {
  return STATUS_NAME_TO_ID[status.toUpperCase()] ?? 1
}

/**
 * Update candidate status
 * Backend: POST /candidateData/changeCandidateStatus
 */
export const updateCandidateStatus = async (
  id: string,
  status: CandidateStatus,
  remarks?: string
): Promise<Candidate> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await apiClient.post<any>('/candidateData/changeCandidateStatus', {
    candidateId: parseInt(id, 10),
    statusId: toStatusId(status),
    remarks,
  })
  // Backend returns { response: [...], message: "Status updated" }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = response.data as any
  const record = raw.response?.[0] ?? raw.data?.[0] ?? raw
  // If we got a mapped record back, use it; otherwise return a minimal stub with new status
  if (record && typeof record === 'object' && record.id != null) {
    return mapCandidate(record as Record<string, unknown>)
  }
  // Fallback: return a stub that at least updates the status in the store
  return { id, status } as Candidate
}

/**
 * Add comment to a candidate
 * Backend: POST /candidateData/addComment (multipart form)
 */
export const addCandidateComment = async (
  candidateId: string,
  text: string
): Promise<CandidateComment> => {
  const formData = new FormData()
  formData.append('candidate_id', candidateId)
  formData.append('comment_text', text)
  const response = await apiClient.post<CandidateComment>(
    '/candidateData/addComment',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data
}

/**
 * Delete a candidate — uses status change to mark withdrawn
 * Backend: POST /candidateData/changeCandidateStatus
 */
export const deleteCandidate = async (id: string): Promise<ApiResponse<void>> => {
  await apiClient.post('/candidateData/changeCandidateStatus', {
    candidateId: id,
    statusId: 'WITHDRAWN',
  })
  return { success: true, data: undefined as void }
}

/**
 * Upload candidates via Excel file
 * Backend: POST /candidateData/addCandidateData
 */
export const uploadCandidates = async (file: File): Promise<UploadResult> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<UploadResult>(
    '/candidateData/addCandidateData',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return response.data
}

/**
 * Export candidates to Excel
 * Backend: GET /downloadExcel/exportExcel
 */
export const exportCandidates = async (filter: CandidateFilter): Promise<Blob> => {
  const response = await apiClient.get('/downloadExcel/exportExcel', {
    params: filter,
    responseType: 'blob',
  })
  return response.data as Blob
}

/**
 * Submit instant interview candidate (weekend drive walk-in)
 * Backend: POST /candidateData/addCandidateData
 */
export const submitInstantInterview = async (data: Record<string, string | number>): Promise<Candidate> => {
  const response = await apiClient.post<Candidate>('/candidateData/addCandidateData', data)
  return response.data
}

/**
 * T180 - Fetch today's interviews for interviewer
 */
export const getTodayInterviews = async (): Promise<Record<string, unknown>[]> => {
  const response = await apiClient.get<Record<string, unknown>[]>('/candidates/today-interviews')
  return response.data
}

/**
 * T180 - Fetch pending feedbacks for interviewer
 */
export const getPendingFeedbacks = async (): Promise<Record<string, unknown>[]> => {
  const response = await apiClient.get<Record<string, unknown>[]>('/candidates/pending-feedbacks')
  return response.data
}
