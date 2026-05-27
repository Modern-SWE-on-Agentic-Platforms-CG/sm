/**
 * Referral portal domain types
 */

export type ReferralRole = 'SPOC' | 'Candidate'

export interface ReferralUser {
  employeeId: string
  name: string
  email: string
  role: ReferralRole
  bu: string
}

export interface ReferralCandidate {
  id: string
  referrerId: string
  referrerName: string
  name: string
  contact: string
  email: string
  totalExperience: number
  relevantExperience: number
  skill: string
  source: 'Referral'
  bu?: string
  status: string
  resumeUrl?: string
  referralDate: string
  lastModified: string
}

export interface ReferralSubmission {
  name: string
  contact: string
  email: string
  totalExperience: number
  relevantExperience: number
  skill: string
  bu?: string
  resume?: File | null
}

export interface ReferralAnalyticsBU {
  bu: string
  count: number
  converted: number
  conversionRate: number
}

export interface ReferralAnalyticsAccount {
  account: string
  count: number
}

export interface ReferralAnalytics {
  totalReferrals: number
  totalConverted: number
  byBU: ReferralAnalyticsBU[]
  byAccount: ReferralAnalyticsAccount[]
}

export interface ReferralFilter {
  bu?: string
  skill?: string
  status?: string
  search?: string
}
