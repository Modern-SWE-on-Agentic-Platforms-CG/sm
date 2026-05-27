/**
 * BookingViewScreen — tabbed view: Available | Booked | Interviewed | Panel
 */
import React, { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import type { AppDispatch } from '@store/store'
import { fetchSlots, changeSlotStatus } from '@store/slices/bookingSlice'
import {
  selectSlots,
  selectBookingIsLoading,
  selectAvailableSlots,
  selectBookedSlots,
  selectPanelAvailability,
} from '@store/selectors/bookingSelectors'
import { fetchPanelAvailability } from '@store/slices/bookingSlice'
import { SlotStatus } from '@appTypes/booking'
import type { BookingSlot } from '@appTypes/booking'

type Tab = 'available' | 'booked' | 'interviewed' | 'panel'

const TABS: { key: Tab; label: string }[] = [
  { key: 'available', label: 'Available' },
  { key: 'booked', label: 'Booked' },
  { key: 'interviewed', label: 'Interviewed' },
  { key: 'panel', label: 'Panel Availability' },
]

const BookingViewScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const isLoading = useSelector(selectBookingIsLoading)
  const allSlots = useSelector(selectSlots)
  const availableSlots = useSelector(selectAvailableSlots)
  const bookedSlots = useSelector(selectBookedSlots)
  const panel = useSelector(selectPanelAvailability)
  const [activeTab, setActiveTab] = useState<Tab>('available')

  useEffect(() => {
    dispatch(fetchSlots({}))
    dispatch(fetchPanelAvailability({ date: new Date().toISOString().split('T')[0] }))
  }, [dispatch])

  const interviewedSlots = allSlots.filter((s) => s.status === SlotStatus.INTERVIEWED)

  const handleMarkNA = useCallback(
    (slotId: string) => dispatch(changeSlotStatus({ slotId, status: SlotStatus.NA })),
    [dispatch]
  )

  const handleBook = useCallback(
    (slot: BookingSlot) => {
      navigate(`/booking/create?mode=recruiter&slotId=${slot.id}&date=${slot.date}&start=${slot.startTime}&end=${slot.endTime}`)
    },
    [navigate]
  )

  const tabContent: Record<Tab, React.ReactNode> = {
    available: (
      <SlotList
        slots={availableSlots}
        isLoading={isLoading}
        emptyText="No available slots"
        actions={(slot) => (
          <>
            <button
              onClick={() => handleBook(slot)}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Book
            </button>
            <button
              onClick={() => handleMarkNA(slot.id)}
              className="px-2 py-1 text-xs border border-yellow-400 text-yellow-700 rounded hover:bg-yellow-50"
            >
              Mark NA
            </button>
          </>
        )}
      />
    ),
    booked: (
      <SlotList
        slots={bookedSlots}
        isLoading={isLoading}
        emptyText="No booked slots"
      />
    ),
    interviewed: (
      <SlotList
        slots={interviewedSlots}
        isLoading={isLoading}
        emptyText="No interviewed slots"
      />
    ),
    panel: (
      <div className="overflow-x-auto">
        {panel.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">No panel data available</p>
        ) : (
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Interviewer</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">BU</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Technologies</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Available Slots</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {panel.map((p) => (
                <tr key={p.interviewerId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{p.interviewerName}</td>
                  <td className="px-4 py-3">{p.bu}</td>
                  <td className="px-4 py-3">{(p.technology ?? []).join(', ')}</td>
                  <td className="px-4 py-3">{(p.availableSlots ?? []).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    ),
  }

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl font-bold text-gray-900 pb-4">Interview Slots</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {tabContent[activeTab]}
      </div>
    </div>
  )
}

// ── Internal SlotList ────────────────────────────────────────────

interface SlotListProps {
  slots: BookingSlot[]
  isLoading: boolean
  emptyText: string
  actions?: (slot: BookingSlot) => React.ReactNode
}

const SlotList: React.FC<SlotListProps> = ({ slots, isLoading, emptyText, actions }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }
  if (slots.length === 0) {
    return <p className="text-gray-500 text-sm py-8 text-center">{emptyText}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Interviewer</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Candidate</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            {actions && <th className="px-4 py-2" />}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {slots.map((slot) => (
            <tr key={slot.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">{slot.date}</td>
              <td className="px-4 py-3">{slot.startTime} – {slot.endTime}</td>
              <td className="px-4 py-3">{slot.interviewerName}</td>
              <td className="px-4 py-3">{slot.candidateName ?? '—'}</td>
              <td className="px-4 py-3">{slot.interviewType ?? '—'}</td>
              <td className="px-4 py-3">
                <span className="text-xs font-medium">{slot.status}</span>
              </td>
              {actions && (
                <td className="px-4 py-3">
                  <div className="flex gap-2">{actions(slot)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default BookingViewScreen
