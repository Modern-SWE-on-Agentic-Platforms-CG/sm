/**
 * Feedback HTTP API client — mapped to actual backend paths
 */
import { apiClient } from './client'
import type { FeedbackTemplate, FeedbackForm, FeedbackRecord, FeedbackFilter } from '@appTypes/feedback'
import type { PaginatedResponse } from './types'

/** Fetch feedback template for a given technology
 *  Backend: GET /feedback/templates (returns all templates)
 */
export async function getTemplate(technology: string): Promise<FeedbackTemplate> {
  const res = await apiClient.get('/feedback/templates')
  const raw = res.data as unknown as { response?: FeedbackTemplate[]; data?: FeedbackTemplate[] }
  const templates: FeedbackTemplate[] = raw.response ?? raw.data ?? (Array.isArray(res.data) ? (res.data as FeedbackTemplate[]) : [])
  const match = templates.find((t: FeedbackTemplate) =>
    (t as unknown as Record<string, unknown>).technology?.toString().toLowerCase() === technology.toLowerCase()
  )
  const result = match ?? templates[0]
  if (!result) {
    return {
      id: '',
      technology,
      technicalAreas: [],
      behavioralAreas: [],
    } as unknown as FeedbackTemplate
  }
  return result
}

/** Submit new feedback for a slot
 *  Backend: POST /feedback/submit
 */
export async function submitFeedback(data: FeedbackForm): Promise<FeedbackRecord> {
  const REMARK_TO_RATING: Record<string, number> = {
    'Highly Recommended': 5,
    'Recommended': 4,
    'Neutral': 3,
    'Not Recommended': 2,
    'Rejected': 1,
  }
  const payload = {
    interviewerCalendarId: parseInt(data.slotId, 10) || 1,
    rating: REMARK_TO_RATING[data.overallRemark] ?? 3,
    responseJson: {
      candidateId: data.candidateId,
      technicalRatings: data.technicalRatings,
      behavioralRatings: data.behavioralRatings,
      overallRemark: data.overallRemark,
      comments: data.comments,
    },
    feedbackStatus: data.feedbackStatus || 'Submitted',
  }
  const res = await apiClient.post<FeedbackRecord>('/feedback/submit', payload)
  return res.data
}

/** Get a single feedback record by ID
 *  Backend: GET /feedback/get/{id}
 */
export async function getFeedback(id: string): Promise<FeedbackRecord> {
  const res = await apiClient.get<FeedbackRecord>(`/feedback/get/${id}`)
  const raw = res.data as unknown as { data?: FeedbackRecord[] }
  return raw.data?.[0] ?? (res.data as unknown as FeedbackRecord)
}

/** Get all feedback records (paginated)
 *  Backend: GET /feedback/templates (closest available)
 */
export async function listFeedback(_filter: FeedbackFilter): Promise<PaginatedResponse<FeedbackRecord>> {
  const res = await apiClient.get<FeedbackRecord[]>('/feedback/templates')
  const raw = res.data as unknown as { data?: FeedbackRecord[] }
  const items = raw.data ?? (Array.isArray(res.data) ? res.data : [])
  return { items, total: items.length, page: 0, pageSize: items.length }
}

/** Revisit (update) an existing feedback record
 *  Backend: POST /feedback/submit (re-submit with updated data)
 */
export async function revisitFeedback(id: string, data: Partial<FeedbackForm>): Promise<FeedbackRecord> {
  const res = await apiClient.post<FeedbackRecord>('/feedback/submit', { ...data, id })
  return res.data
}
