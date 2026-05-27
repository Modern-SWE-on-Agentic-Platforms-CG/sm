import { z } from 'zod'

/**
 * Common validation schemas using Zod
 */

// Email validation
export const emailSchema = z.string().email('Invalid email address')

// Phone number validation (basic international format)
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[!@#$%^&*]/, 'Password must contain a special character')

// Candidate form schema
export const candidateFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phoneNumber: phoneSchema,
  technology: z.string().min(1, 'Technology is required'),
  experience: z.number().min(0, 'Experience must be positive'),
  bu: z.string().min(1, 'Business Unit is required'),
  source: z.string().min(1, 'Source is required'),
  remarks: z.string().optional(),
})

export type CandidateFormType = z.infer<typeof candidateFormSchema>

// Booking form schema
export const bookingFormSchema = z.object({
  candidateId: z.string().min(1, 'Candidate is required'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  interviewType: z.string().min(1, 'Interview type is required'),
  multiSlot: z.boolean().optional(),
  remarks: z.string().optional(),
}).refine((data) => {
  const [startHour, startMin] = data.startTime.split(':').map(Number)
  const [endHour, endMin] = data.endTime.split(':').map(Number)
  const start = startHour * 60 + startMin
  const end = endHour * 60 + endMin
  return end > start
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
})

export type BookingFormType = z.infer<typeof bookingFormSchema>

// Feedback form schema
export const feedbackFormSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  bookingId: z.string().min(1, 'Booking ID is required'),
  technicalSkillRating: z.number().min(1).max(5),
  technicalRemarks: z.string().min(10, 'Remarks must be at least 10 characters'),
  behavioralRating: z.number().min(1).max(5),
  behavioralRemarks: z.string().optional(),
  overallRemark: z.string().min(1, 'Overall remark is required'),
  feedbackStatus: z.enum(['SELECT', 'REJECT', 'HOLD']),
  rejectReason: z.string().min(10, 'Rejection reason is required').optional(),
}).refine((data) => {
  if (data.feedbackStatus === 'REJECT' && !data.rejectReason) {
    return false
  }
  return true
}, {
  message: 'Rejection reason is required when rejecting',
  path: ['rejectReason'],
})

export type FeedbackFormType = z.infer<typeof feedbackFormSchema>

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormType = z.infer<typeof loginFormSchema>

// Filter schema
export const filterSchema = z.object({
  technology: z.string().optional(),
  bu: z.string().optional(),
  source: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  searchTerm: z.string().optional(),
})

export type FilterType = z.infer<typeof filterSchema>

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().positive('Page must be positive'),
  pageSize: z.number().min(1).max(100, 'Page size cannot exceed 100'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
})

export type PaginationType = z.infer<typeof paginationSchema>
