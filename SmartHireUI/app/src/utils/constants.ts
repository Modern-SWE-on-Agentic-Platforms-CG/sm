/**
 * Application constants
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_PROFILE: '/auth/profile',
  AUTH_REFRESH_TOKEN: '/auth/refresh-token',

  // Candidates
  CANDIDATES_LIST: '/candidates',
  CANDIDATES_GET: '/candidates/:id',
  CANDIDATES_CREATE: '/candidates',
  CANDIDATES_UPDATE: '/candidates/:id',
  CANDIDATES_DELETE: '/candidates/:id',
  CANDIDATES_UPLOAD: '/candidates/upload',
  CANDIDATES_EXPORT: '/candidates/export',

  // Scheduling
  SCHEDULING_SLOTS: '/scheduling/slots',
  SCHEDULING_CREATE_SLOT: '/scheduling/slots',
  SCHEDULING_BOOK: '/scheduling/bookings',
  SCHEDULING_UPDATE: '/scheduling/bookings/:id',
  SCHEDULING_DELETE: '/scheduling/bookings/:id',

  // Feedback
  FEEDBACK_TEMPLATE: '/feedback/template',
  FEEDBACK_SUBMIT: '/feedback',
  FEEDBACK_GET: '/feedback/:id',

  // Workflow
  WORKFLOW_QUEUE: '/workflow/queue',
  WORKFLOW_APPROVE: '/workflow/approve',
  WORKFLOW_REJECT: '/workflow/reject',

  // Reports
  REPORTS_REJECTION_RATIO: '/reports/rejection-ratio',
  REPORTS_PANEL_INSIGHTS: '/reports/panel-insights',
  REPORTS_TRENDS: '/reports/trends',
} as const

// Role names
export const ROLES = {
  RECRUITER: 'RECRUITER',
  PMO: 'PMO',
  TOWER_LEAD: 'TOWER_LEAD',
  SL_BU_LEAD: 'SL_BU_LEAD',
  NA_LEAD: 'NA_LEAD',
  RECRUITER_LEAD: 'RECRUITER_LEAD',
  INTERVIEWER: 'INTERVIEWER',
  BU_ADMIN: 'BU_ADMIN',
  ADMIN: 'ADMIN',
  SPOC: 'SPOC',
  CANDIDATE: 'CANDIDATE',
} as const

// Candidate status
export const CANDIDATE_STATUS = {
  APPLIED: 'APPLIED',
  IN_REVIEW: 'IN_REVIEW',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  INTERVIEWED: 'INTERVIEWED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ON_HOLD: 'ON_HOLD',
} as const

// Interview status
export const INTERVIEW_STATUS = {
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  INTERVIEWED: 'INTERVIEWED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const

// Feedback status
export const FEEDBACK_STATUS = {
  SELECT: 'SELECT',
  REJECT: 'REJECT',
  HOLD: 'HOLD',
} as const

// Slot status colors
export const SLOT_COLORS = {
  AVAILABLE: '#D1D5DB', // Gray
  BOOKED: '#EC4899',    // Pink
  INTERVIEWED: '#10B981', // Green
  NA: '#FBBF24',        // Yellow
} as const

// Business units
export const BUSINESS_UNITS = [
  'Banking & Finance',
  'Insurance',
  'Healthcare',
  'Technology',
  'Manufacturing',
  'Retail',
] as const

// Skills
export const SKILLS = [
  'Java',
  'Python',
  'JavaScript',
  'React',
  'Angular',
  'Node.js',
  'SQL',
  'AWS',
  'DevOps',
  'Kubernetes',
] as const

// Interview types
export const INTERVIEW_TYPES = [
  'Technical',
  'HR',
  'Manager',
  'Client',
  'Panel',
] as const

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 10,
  DEFAULT_PAGE: 1,
  MAX_PAGE_SIZE: 100,
} as const

// Date/Time formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  EU: 'DD/MM/YYYY',
  READABLE: 'MMMM DD, YYYY',
  TIME: 'HH:mm',
} as const

// Time ranges for slot creation
export const SLOT_TIME_RANGE = {
  START_HOUR: 8,   // 8 AM
  END_HOUR: 20,    // 8 PM
  SLOT_DURATION: 30, // 30 minutes
} as const

// Feature flags
export const FEATURES = {
  WEEKEND_DRIVE: Boolean(import.meta.env.VITE_FEATURE_WEEKEND_DRIVE),
  REFERRAL_PORTAL: Boolean(import.meta.env.VITE_FEATURE_REFERRAL_PORTAL),
  ANALYTICS: Boolean(import.meta.env.VITE_FEATURE_ANALYTICS),
} as const

export default {
  API_ENDPOINTS,
  ROLES,
  CANDIDATE_STATUS,
  INTERVIEW_STATUS,
  FEEDBACK_STATUS,
  SLOT_COLORS,
  BUSINESS_UNITS,
  SKILLS,
  INTERVIEW_TYPES,
  PAGINATION_DEFAULTS,
  DATE_FORMATS,
  SLOT_TIME_RANGE,
  FEATURES,
}
