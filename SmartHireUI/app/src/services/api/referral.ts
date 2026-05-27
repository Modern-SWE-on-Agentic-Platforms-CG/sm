/**
 * Referral portal API client
 */
import { apiClient } from './client'
import type {
  ReferralUser,
  ReferralCandidate,
  ReferralSubmission,
  ReferralAnalytics,
  ReferralFilter,
} from '@appTypes/referral'
import type { PaginatedResponse } from './types'

interface BackendEnvelope<T> {
  response?: T[] | T | null
  result?: T | null
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const unwrapBackendPayload = <T>(data: unknown): T | null => {
  if (!isObject(data)) {
    return data as T
  }

  const envelope = data as BackendEnvelope<T>
  if (Array.isArray(envelope.response)) {
    return (envelope.response[0] ?? null) as T | null
  }
  if (envelope.response !== undefined) {
    return envelope.response as T
  }
  if (envelope.result !== undefined) {
    return envelope.result
  }

  return data as T
}

const normalizePagedReferrals = (
  data: unknown
): PaginatedResponse<ReferralCandidate> => {
  const unwrapped = unwrapBackendPayload<PaginatedResponse<ReferralCandidate>>(data)
  return {
    items: unwrapped?.items ?? [],
    total: unwrapped?.total ?? 0,
    page: unwrapped?.page ?? 1,
    pageSize: unwrapped?.pageSize ?? 20,
    hasMore: unwrapped?.hasMore ?? false,
  }
}

const normalizeAnalytics = (data: unknown): ReferralAnalytics => {
  const unwrapped = unwrapBackendPayload<unknown>(data)
  if (!isObject(unwrapped)) {
    return { totalReferrals: 0, totalConverted: 0, byBU: [], byAccount: [] }
  }

  const totalReferrals =
    typeof unwrapped.totalReferrals === 'number'
      ? unwrapped.totalReferrals
      : typeof unwrapped.total === 'number'
        ? unwrapped.total
        : 0

  const totalConverted =
    typeof unwrapped.totalConverted === 'number'
      ? unwrapped.totalConverted
      : typeof unwrapped.selected === 'number'
        ? unwrapped.selected
        : 0

  const byBU = Array.isArray(unwrapped.byBU) ? unwrapped.byBU : []
  const byAccount = Array.isArray(unwrapped.byAccount) ? unwrapped.byAccount : []

  return {
    totalReferrals,
    totalConverted,
    byBU,
    byAccount,
  }
}

/** Register a new SPOC / Candidate user */
export async function registerReferralUser(
  user: Omit<ReferralUser, 'employeeId'> & { employeeId: string }
): Promise<ReferralUser> {
  const res = await apiClient.post<ReferralUser>('/referral/register', user)
  return res.data
}

/** Submit a candidate referral (multipart if resume attached) */
export async function submitReferral(submission: ReferralSubmission): Promise<ReferralCandidate> {
  const formData = new FormData()
  Object.entries(submission).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      if (val instanceof File) {
        formData.append(key, val)
      } else {
        formData.append(key, String(val))
      }
    }
  })
  const res = await apiClient.post<ReferralCandidate>('/referral/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

/** Get referrals for current SPOC */
export async function getMyCandidates(params?: {
  page?: number
  pageSize?: number
}): Promise<PaginatedResponse<ReferralCandidate>> {
  const res = await apiClient.get<PaginatedResponse<ReferralCandidate>>('/referral/my-candidates', { params })
  return normalizePagedReferrals(res.data)
}

/** Get all referrals (admin) with filtering */
export async function getAllReferrals(
  filter?: ReferralFilter & { page?: number; pageSize?: number }
): Promise<PaginatedResponse<ReferralCandidate>> {
  const res = await apiClient.get<PaginatedResponse<ReferralCandidate>>('/referral/all', { params: filter })
  return normalizePagedReferrals(res.data)
}

/** Get analytics for referrals */
export async function getReferralAnalytics(): Promise<ReferralAnalytics> {
  const res = await apiClient.get<ReferralAnalytics>('/referral/analytics')
  return normalizeAnalytics(res.data)
}

/** Export referrals to Excel (returns blob URL) */
export async function exportReferrals(filter?: ReferralFilter): Promise<Blob> {
  const res = await apiClient.get('/referral/export', {
    params: filter,
    responseType: 'blob',
  })
  return res.data
}
