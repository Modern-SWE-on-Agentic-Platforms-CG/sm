/**
 * SlotCell — individual 30-min slot in the calendar
 */
import React from 'react'
import type { BookingSlot } from '@appTypes/booking'
import { SlotStatus } from '@appTypes/booking'

interface SlotCellProps {
  slot: BookingSlot
  onClick?: (slot: BookingSlot) => void
  compact?: boolean
}

const STATUS_COLORS: Record<SlotStatus, string> = {
  [SlotStatus.AVAILABLE]: 'bg-gray-100 border-gray-300 text-gray-700',
  [SlotStatus.BOOKED]: 'bg-pink-100 border-pink-400 text-pink-800',
  [SlotStatus.INTERVIEWED]: 'bg-green-100 border-green-400 text-green-800',
  [SlotStatus.NA]: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  [SlotStatus.CANCELLED]: 'bg-red-50 border-red-300 text-red-500 line-through',
}

const STATUS_LABELS: Record<SlotStatus, string> = {
  [SlotStatus.AVAILABLE]: 'Available',
  [SlotStatus.BOOKED]: 'Booked',
  [SlotStatus.INTERVIEWED]: 'Interviewed',
  [SlotStatus.NA]: 'NA',
  [SlotStatus.CANCELLED]: 'Cancelled',
}

export const SlotCell: React.FC<SlotCellProps> = ({ slot, onClick, compact = false }) => {
  const colorClass = STATUS_COLORS[slot.status]

  return (
    <button
      type="button"
      onClick={() => onClick?.(slot)}
      className={`w-full text-left border rounded px-2 py-1 text-xs transition-opacity hover:opacity-80 ${colorClass} ${compact ? 'truncate' : ''}`}
      title={`${slot.startTime} - ${slot.endTime} | ${slot.candidateName ?? STATUS_LABELS[slot.status]}`}
    >
      <span className="font-medium">{slot.startTime}</span>
      {!compact && (
        <span className="ml-1 opacity-75">– {slot.endTime}</span>
      )}
      {slot.candidateName && (
        <span className="block truncate">{slot.candidateName}</span>
      )}
      {!slot.candidateName && (
        <span className="block text-xs opacity-60">{STATUS_LABELS[slot.status]}</span>
      )}
    </button>
  )
}

export default SlotCell
