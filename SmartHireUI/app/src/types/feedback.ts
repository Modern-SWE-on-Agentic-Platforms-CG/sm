/**
 * Feedback domain types
 */

export enum FeedbackStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  ON_HOLD = 'ON_HOLD',
}

export enum RemarkOption {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  AVERAGE = 'Average',
  BELOW_AVERAGE = 'Below Average',
  POOR = 'Poor',
}

export interface SkillRating {
  skillId: string
  skillName: string
  rating: number | null       // 1–5
  remark: RemarkOption | ''
  comments?: string
}

export interface BehavioralEval {
  areaId: string
  areaName: string
  rating: number | null
  remark: RemarkOption | ''
  comments?: string
}

export interface FeedbackTemplate {
  id: string
  technology: string
  technicalAreas: { id: string; name: string }[]
  behavioralAreas: { id: string; name: string }[]
  overallRemarkOptions: string[]
  statusOptions: { value: FeedbackStatus; label: string }[]
}

export interface CandidateInfo {
  candidateId: string
  candidateName: string
  technology: string
  interviewType: string
  interviewerName: string
  slotDate: string
  startTime: string
  endTime: string
}

export interface FeedbackForm {
  candidateId: string
  slotId: string
  technicalRatings: SkillRating[]
  behavioralRatings: BehavioralEval[]
  overallRemark: string
  feedbackStatus: FeedbackStatus | ''
  interviewMode?: string
  comments?: string
  revisitFlag?: boolean
}

export interface FeedbackRecord extends FeedbackForm {
  id: string
  submittedAt: string
  submittedBy: string
}

export interface FeedbackFilter {
  candidateId?: string
  slotId?: string
  status?: FeedbackStatus
  page?: number
  pageSize?: number
}
