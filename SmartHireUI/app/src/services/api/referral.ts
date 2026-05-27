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
  return res.data
}

/** Get all referrals (admin) with filtering */
export async function getAllReferrals(
  filter?: ReferralFilter & { page?: number; pageSize?: number }
): Promise<PaginatedResponse<ReferralCandidate>> {
  const res = await apiClient.get<PaginatedResponse<ReferralCandidate>>('/referral/all', { params: filter })
  return res.data
}

/** Get analytics for referrals */
export async function getReferralAnalytics(): Promise<ReferralAnalytics> {
  const res = await apiClient.get<ReferralAnalytics>('/referral/analytics')
  return res.data
}

/** Export referrals to Excel (returns blob URL) */
export async function exportReferrals(filter?: ReferralFilter): Promise<Blob> {
  const res = await apiClient.get('/referral/export', {
    params: filter,
    responseType: 'blob',
  })
  return res.data
}
