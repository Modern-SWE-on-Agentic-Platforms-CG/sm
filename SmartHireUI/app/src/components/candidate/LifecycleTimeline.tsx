/**
 * T171 - LifecycleTimeline: Status transition history with timestamps
 */
import React from 'react'
import type { LifecycleEvent } from '@appTypes/candidate'

interface LifecycleTimelineProps {
  events: LifecycleEvent[]
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  APPLIED: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-600' },
  SHORTLISTED: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-600' },
  INTERVIEW_SCHEDULED: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-600' },
  INTERVIEWED: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-600' },
  SELECTED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-600' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-600' },
  HOLD: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-600' },
  WITHDRAWN: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-600' },
}

export const LifecycleTimeline: React.FC<LifecycleTimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifecycle History</h3>
        <p className="text-sm text-gray-500">No lifecycle events recorded</p>
      </div>
    )
  }

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Lifecycle History</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Events */}
        <div className="space-y-6">
          {sortedEvents.map((event, idx) => {
            const colors = STATUS_COLORS[event.status] || STATUS_COLORS.APPLIED
            const date = new Date(event.timestamp)
            const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

            return (
              <div key={event.id} className="relative pl-16">
                {/* Dot */}
                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full ${colors.dot} border-4 border-white`} />

                {/* Content */}
                <div className={`p-3 rounded-lg border ${colors.bg} ${colors.text}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{event.status.replace(/_/g, ' ')}</p>
                      <p className="text-xs mt-1 opacity-75">{formattedDate} at {formattedTime}</p>
                      <p className="text-xs mt-1 opacity-75">Changed by: {event.changedBy}</p>
                    </div>
                    {idx === 0 && <span className="inline-block px-2 py-1 bg-white text-xs font-semibold rounded opacity-75">Latest</span>}
                  </div>
                  {event.comments && <p className="text-sm mt-2 opacity-90">{event.comments}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
