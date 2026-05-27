/**
 * PanelAvailabilityScreen — grid view of interviewers with availability
 */
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@store/store'
import { fetchPanelAvailability } from '@store/slices/bookingSlice'
import { selectPanelAvailability, selectBookingIsLoading } from '@store/selectors/bookingSelectors'

const today = new Date().toISOString().split('T')[0]

const PanelAvailabilityScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const panel = useSelector(selectPanelAvailability)
  const isLoading = useSelector(selectBookingIsLoading)
  const [date, setDate] = useState(today)
  const [technology, setTechnology] = useState('')

  useEffect(() => {
    dispatch(fetchPanelAvailability({ date, technology: technology || undefined }))
  }, [dispatch, date, technology])

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl font-bold text-gray-900 pb-4">Panel Availability</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Technology</label>
          <input
            type="text"
            value={technology}
            onChange={(e) => setTechnology(e.target.value)}
            placeholder="e.g. Java"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : panel.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-12">No panel availability found for selected criteria</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {panel.map((p) => (
            <div key={p.interviewerId} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{p.interviewerName}</h3>
                  <p className="text-xs text-gray-500">{p.bu}</p>
                </div>
                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                  {p.availableSlots.length} slots
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {p.technology.map((tech) => (
                  <span key={tech} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
              </div>

              {p.availableSlots.length > 0 ? (
                <div className="space-y-1">
                  {p.availableSlots.slice(0, 4).map((slot) => (
                    <div key={slot.id} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                      {slot.startTime} – {slot.endTime}
                    </div>
                  ))}
                  {p.availableSlots.length > 4 && (
                    <p className="text-xs text-gray-400">+{p.availableSlots.length - 4} more</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No available slots</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PanelAvailabilityScreen
