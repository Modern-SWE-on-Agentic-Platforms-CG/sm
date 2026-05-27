/**
 * Booking / Interview Scheduling domain types
 */

export enum SlotStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  INTERVIEWED = 'INTERVIEWED',
  NA = 'NA',
  CANCELLED = 'CANCELLED',
}

export enum InterviewType {
  TECHNICAL = 'TECHNICAL',
  HR = 'HR',
  MANAGER = 'MANAGER',
  CLIENT = 'CLIENT',
  PANEL = 'PANEL',
}

export enum ParticipationType {
  IN_PERSON = 'IN_PERSON',
  VIRTUAL = 'VIRTUAL',
}

export interface BookingSlot {
  id: string
  interviewerId: string
  interviewerName: string
  date: string           // ISO date string (YYYY-MM-DD)
  startTime: string      // HH:mm
  endTime: string        // HH:mm
  durationMinutes: number
  status: SlotStatus
  candidateId?: string
  candidateName?: string
  interviewType?: InterviewType
  technology?: string
  participationType?: ParticipationType
  comments?: string
  createdAt: string
  updatedAt: string
}

export interface BookingEvent {
  slotId: string
  candidateId: string
  candidateName: string
  interviewType: InterviewType
  technology: string
  comments?: string
  interviewerId: string
  date: string
  startTime: string
  endTime: string
}

export interface BookingForm {
  interviewerId?: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  isMultiSlot: boolean
  multiSlotHours?: 4 | 8
  participationType: ParticipationType
  candidateId?: string
  interviewType?: InterviewType
  technology?: string
  comments?: string
}

export interface CalendarDay {
  date: string           // YYYY-MM-DD
  slots: BookingSlot[]
  totalSlots: number
  availableCount: number
  bookedCount: number
  interviewedCount: number
  naCount: number
}

export interface CalendarMonth {
  year: number
  month: number          // 1-12
  days: CalendarDay[]
}

export interface PanelAvailability {
  interviewerId: string
  interviewerName: string
  technology: string[]
  bu: string
  availableSlots: BookingSlot[]
}

export interface SlotFilter {
  interviewerId?: string
  date?: string
  month?: number
  year?: number
  status?: SlotStatus[]
  technology?: string
  page?: number
  pageSize?: number
}
