/**
 * InterviewCalendar — month grid view with color-coded availability slots
 */
import React from 'react'
import { SlotCell } from './SlotCell'
import type { CalendarMonth, BookingSlot } from '@appTypes/booking'
import { SlotStatus } from '@appTypes/booking'

interface InterviewCalendarProps {
  calendar: CalendarMonth | null
  isLoading?: boolean
  onSlotClick?: (slot: BookingSlot) => void
  onDayClick?: (date: string) => void
  onMonthChange?: (year: number, month: number) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Build a 6-week grid starting from the Sunday before the first of the month
 */
function buildGrid(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1)
  const startSunday = new Date(firstDay)
  startSunday.setDate(firstDay.getDate() - firstDay.getDay())

  const weeks: Date[][] = []
  const cursor = new Date(startSunday)
  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

const STATUS_DOT: Record<SlotStatus, string> = {
  [SlotStatus.AVAILABLE]: 'bg-gray-400',
  [SlotStatus.BOOKED]: 'bg-pink-500',
  [SlotStatus.INTERVIEWED]: 'bg-green-500',
  [SlotStatus.NA]: 'bg-yellow-500',
  [SlotStatus.CANCELLED]: 'bg-red-300',
}

export const InterviewCalendar: React.FC<InterviewCalendarProps> = ({
  calendar,
  isLoading = false,
  onSlotClick,
  onDayClick,
  onMonthChange,
}) => {
  const year = calendar?.year ?? new Date().getFullYear()
  const month = calendar?.month ?? new Date().getMonth() + 1

  const grid = buildGrid(year, month)

  // Build day lookup: date string → CalendarDay
  const dayMap = new Map(
    (calendar?.days ?? []).map((d) => [d.date, d])
  )

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1)
    onMonthChange?.(d.getFullYear(), d.getMonth() + 1)
  }

  const nextMonth = () => {
    const d = new Date(year, month, 1)
    onMonthChange?.(d.getFullYear(), d.getMonth() + 1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={prevMonth}
          className="p-1 rounded hover:bg-gray-100"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h2 className="font-semibold text-gray-800">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1 rounded hover:bg-gray-100"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
        {Object.entries(STATUS_DOT).map(([status, dotClass]) => (
          <span key={status} className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${dotClass}`} />
            {status.charAt(0) + status.slice(1).toLowerCase()}
          </span>
        ))}
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid">
        {grid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
            {week.map((date) => {
              const iso = toISO(date)
              const day = dayMap.get(iso)
              const isCurrentMonth = date.getMonth() === month - 1
              const isToday = iso === toISO(new Date())

              return (
                <div
                  key={iso}
                  className={`min-h-[90px] border-r border-gray-100 last:border-r-0 p-1 cursor-pointer hover:bg-gray-50 ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  }`}
                  onClick={() => onDayClick?.(iso)}
                >
                  {/* Date number */}
                  <div
                    className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-blue-600 text-white' : 'text-gray-700'
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {/* Slots (show up to 3, then +N more) */}
                  {day && day.slots.length > 0 && (
                    <div className="space-y-0.5">
                      {day.slots.slice(0, 3).map((slot) => (
                        <SlotCell
                          key={slot.id}
                          slot={slot}
                          onClick={onSlotClick}
                          compact
                        />
                      ))}
                      {day.slots.length > 3 && (
                        <p className="text-xs text-gray-400 pl-1">
                          +{day.slots.length - 3} more
                        </p>
                      )}
                    </div>
                  )}

                  {/* Day aggregate dot-summary when no individual slots shown */}
                  {day && day.slots.length === 0 && day.totalSlots > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {day.availableCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" title="Available" />
                      )}
                      {day.bookedCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500" title="Booked" />
                      )}
                      {day.interviewedCount > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Interviewed" />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default InterviewCalendar
