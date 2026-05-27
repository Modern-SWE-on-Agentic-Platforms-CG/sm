/**
 * Candidate domain types
 */

export enum CandidateStatus {
  APPLIED = 'APPLIED',
  SHORTLISTED = 'SHORTLISTED',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  INTERVIEWED = 'INTERVIEWED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  HOLD = 'HOLD',
  WITHDRAWN = 'WITHDRAWN',
}

export enum CandidateSource {
  NAUKRI = 'NAUKRI',
  LINKEDIN = 'LINKEDIN',
  REFERRAL = 'REFERRAL',
  DIRECT = 'DIRECT',
  INTERNAL = 'INTERNAL',
  CAMPUS = 'CAMPUS',
  VENDOR = 'VENDOR',
  CONSULTANT = 'CONSULTANT',
  WALK_IN = 'WALK_IN',
  OTHER = 'OTHER',
}

export enum InterviewType {
  TECHNICAL = 'TECHNICAL',
  HR = 'HR',
  MANAGER = 'MANAGER',
  CLIENT = 'CLIENT',
  PANEL = 'PANEL',
}

export interface Candidate {
  id: string
  name: string
  email: string
  contact: string
  technology: string
  experience: number
  bu: string
  source: CandidateSource
  status: CandidateStatus
  remarks?: string
  interviewType?: InterviewType
  agingDays?: number
  lastModified: string
  createdAt: string
  updatedAt: string
}

export interface CandidateFilter {
  technology?: string[]
  bu?: string[]
  source?: string[]
  status?: string[]
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface UploadResult {
  totalRows: number
  successCount: number
  failureCount: number
  errors: UploadError[]
}

export interface UploadError {
  row: number
  field: string
  message: string
}

export interface CandidateComment {
  id: string
  candidateId: string
  text: string
  createdBy: string
  createdAt: string
}

export interface CandidateSummary {
  total: number
  applied: number
  shortlisted: number
  interviewed: number
  selected: number
  rejected: number
}

/**
 * T166 - Extended types for candidate details, skill matching, and documents
 */

export interface SkillMatch {
  matchingSkills: string[]
  laggingSkills: string[]
  resumeExtractedSkills: string[]
  matchPercentage: number
}

export interface CandidateDocument {
  id: string
  candidateId: string
  type: 'RESUME' | 'EMAIL' | 'FEEDBACK' | 'OTHER'
  fileName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  uploadedBy?: string
  s3Key?: string
}

export interface LifecycleEvent {
  id: string
  candidateId: string
  status: CandidateStatus
  timestamp: string
  changedBy: string
  comments?: string
}

export interface CandidateDetailView extends Candidate {
  photo?: string // base64-encoded
  location?: string
  grade?: string
  skillMatch: SkillMatch
  documents: CandidateDocument[]
  lifecycleHistory: LifecycleEvent[]
}
