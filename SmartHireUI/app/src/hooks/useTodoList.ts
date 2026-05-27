/**
 * T179 - useTodoList: Hook for fetching today's interviews and pending feedbacks
 */
import { useState, useEffect } from 'react'
import type { TodayInterview } from '@components/tables/TodayInterviewsTable'
import type { PendingFeedback } from '@components/tables/PendingFeedbacksTable'

export interface TodoListData {
  todayInterviews: TodayInterview[]
  pendingFeedbacks: PendingFeedback[]
  availableSlots: number
  isLoading: boolean
  error: string | null
}

/**
 * Mock API calls - replace with actual API in real implementation
 */
const fetchTodayInterviews = async (): Promise<TodayInterview[]> => {
  return [
    {
      id: 'int1',
      candidateName: 'John Smith',
      contact: '9876543210',
      time: '10:00 AM',
      totalExperience: 5,
      skills: ['Java', 'Spring'],
      interviewType: 'Technical',
    },
    {
      id: 'int2',
      candidateName: 'Jane Doe',
      contact: '9876543211',
      time: '11:30 AM',
      totalExperience: 3,
      skills: ['Python', 'Django'],
      interviewType: 'Technical',
    },
  ]
}

const fetchPendingFeedbacks = async (): Promise<PendingFeedback[]> => {
  return [
    {
      id: 'fb1',
      candidateName: 'Bob Wilson',
      technology: 'Java',
      interviewTime: 'Today 9:00 AM',
      interviewType: 'L1',
      status: 'PENDING',
    },
  ]
}

const fetchAvailableSlots = async (): Promise<number> => {
  return 3 // Mock: 3 slots available
}

export const useTodoList = (): TodoListData => {
  const [data, setData] = useState<TodoListData>({
    todayInterviews: [],
    pendingFeedbacks: [],
    availableSlots: 0,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const loadData = async () => {
      setData((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const [interviews, feedbacks, slots] = await Promise.all([
          fetchTodayInterviews(),
          fetchPendingFeedbacks(),
          fetchAvailableSlots(),
        ])
        setData({
          todayInterviews: interviews,
          pendingFeedbacks: feedbacks,
          availableSlots: slots,
          isLoading: false,
          error: null,
        })
      } catch (err: unknown) {
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load todo list',
        }))
      }
    }
    loadData()
  }, [])

  return data
}
