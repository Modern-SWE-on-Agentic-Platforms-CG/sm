/**
 * DashboardScreen — interview calendar with month navigation and slot interaction
 */
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@store/store'
import { fetchCalendar, setCurrentMonth, clearError } from '@store/slices/bookingSlice'
import {
  selectCalendar,
  selectCurrentMonth,
  selectBookingIsLoading,
  selectBookingError,
} from '@store/selectors/bookingSelectors'
import { InterviewCalendar } from '@components/calendar/InterviewCalendar'
import { BookingForm } from '@components/forms/BookingForm'
import type { BookingSlot, BookingForm as BookingFormData } from '@appTypes/booking'
import { createAvailabilitySlot } from '@store/slices/bookingSlice'

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const calendar = useSelector(selectCalendar)
  const currentMonth = useSelector(selectCurrentMonth)
  const isLoading = useSelector(selectBookingIsLoading)
  const error = useSelector(selectBookingError)

  const [showForm, setShowForm] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null)

  useEffect(() => {
    dispatch(fetchCalendar(currentMonth))
  }, [dispatch, currentMonth])

  const handleMonthChange = useCallback(
    (year: number, month: number) => {
      dispatch(setCurrentMonth({ year, month }))
    },
    [dispatch]
  )

  const handleSlotClick = useCallback((slot: BookingSlot) => {
    setSelectedSlot(slot)
  }, [])

  const handleCreateSlot = useCallback(
    (data: BookingFormData) => {
      dispatch(createAvailabilitySlot(data)).then(() => {
        setShowForm(false)
        dispatch(fetchCalendar(currentMonth))
      })
    },
    [dispatch, currentMonth]
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-xl font-bold text-gray-900">Interview Calendar</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Slot
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-3 px-3 py-2 text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between">
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} className="font-bold">×</button>
        </div>
      )}

      <div className="flex gap-4 flex-1">
        <div className="flex-1">
          <InterviewCalendar
            calendar={calendar}
            isLoading={isLoading}
            onSlotClick={handleSlotClick}
            onMonthChange={handleMonthChange}
          />
        </div>

        {/* Slot detail panel */}
        {selectedSlot && (
          <div className="w-72 flex-shrink-0 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Slot Details</h3>
              <button onClick={() => setSelectedSlot(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500">Date</dt><dd className="font-medium">{selectedSlot.date}</dd></div>
              <div><dt className="text-gray-500">Time</dt><dd className="font-medium">{selectedSlot.startTime} – {selectedSlot.endTime}</dd></div>
              <div><dt className="text-gray-500">Status</dt><dd className="font-medium">{selectedSlot.status}</dd></div>
              {selectedSlot.interviewerName && (
                <div><dt className="text-gray-500">Interviewer</dt><dd className="font-medium">{selectedSlot.interviewerName}</dd></div>
              )}
              {selectedSlot.candidateName && (
                <div><dt className="text-gray-500">Candidate</dt><dd className="font-medium">{selectedSlot.candidateName}</dd></div>
              )}
              {selectedSlot.interviewType && (
                <div><dt className="text-gray-500">Type</dt><dd className="font-medium">{selectedSlot.interviewType}</dd></div>
              )}
              {selectedSlot.technology && (
                <div><dt className="text-gray-500">Technology</dt><dd className="font-medium">{selectedSlot.technology}</dd></div>
              )}
            </dl>
          </div>
        )}
      </div>

      {/* Create slot modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <BookingForm
              mode="interviewer"
              onSubmit={handleCreateSlot}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardScreen
