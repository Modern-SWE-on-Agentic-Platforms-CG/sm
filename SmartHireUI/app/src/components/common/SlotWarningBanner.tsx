/**
 * T178 - SlotWarningBanner: Display warning if fewer than 5 slots available
 */
import React from 'react'

interface SlotWarningBannerProps {
  availableSlots: number
  threshold?: number
}

export const SlotWarningBanner: React.FC<SlotWarningBannerProps> = ({
  availableSlots,
  threshold = 5,
}) => {
  if (availableSlots >= threshold) {
    return null
  }

  return (
    <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-center gap-3">
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <div className="flex-1">
        <p className="font-semibold text-sm">Limited Slot Availability</p>
        <p className="text-xs mt-0.5">
          You have only <span className="font-bold">{availableSlots}</span> free slot{availableSlots !== 1 ? 's' : ''} available. Consider creating more slots to meet scheduling demands.
        </p>
      </div>
      <button
        className="ml-2 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded hover:bg-amber-200"
        onClick={() => {
          // Would navigate to booking form
          window.location.href = '/booking-form'
        }}
      >
        Create Slots
      </button>
    </div>
  )
}
