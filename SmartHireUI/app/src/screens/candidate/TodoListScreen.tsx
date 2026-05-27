/**
 * T175 - TodoListScreen: Role-specific task dashboard
 */
import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@store/store'
import { TodayInterviewsTable } from '@components/tables/TodayInterviewsTable'
import { PendingFeedbacksTable } from '@components/tables/PendingFeedbacksTable'
import { SlotWarningBanner } from '@components/common/SlotWarningBanner'
import { useTodoList } from '@hooks/useTodoList'

const TodoListScreen: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const { todayInterviews, pendingFeedbacks, availableSlots, isLoading, error } = useTodoList()

  const handleSubmitFeedback = (feedbackId: string) => {
    // Navigate to feedback form for this interview
    window.location.href = `/feedback-form?feedback=${feedbackId}`
  }

  const isInterviewer = auth.user?.roles?.includes('INTERVIEWER')

  // Interviewer view: Today's interviews + pending feedbacks + slot warning
  if (isInterviewer) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">To-Do List</h1>
          <p className="text-gray-600">Your tasks for today</p>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <SlotWarningBanner availableSlots={availableSlots} />

        <div className="grid md:grid-cols-1 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Today's Interviews</h2>
            <TodayInterviewsTable interviews={todayInterviews} isLoading={isLoading} />
          </div>

          {pendingFeedbacks.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Pending Feedbacks</h2>
              <PendingFeedbacksTable
                feedbacks={pendingFeedbacks}
                isLoading={isLoading}
                onSubmit={handleSubmitFeedback}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Recruiter/PMO/Lead view: Candidate pipeline (basic for now)
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">To-Do List</h1>
        <p className="text-gray-600">Candidate pipeline overview</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-gray-600 text-sm">Candidate pipeline view coming soon</p>
      </div>
    </div>
  )
}

export default TodoListScreen

