/**
 * BookingFormScreen — route wrapper for slot creation / booking
 */
import React, { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@store/store'
import { createAvailabilitySlot, bookCandidateIntoSlot } from '@store/slices/bookingSlice'
import { selectBookingIsSubmitting } from '@store/selectors/bookingSelectors'
import { BookingForm } from '@components/forms/BookingForm'
import type { BookingForm as BookingFormData } from '@appTypes/booking'

const BookingFormScreen: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [params] = useSearchParams()
  const isSubmitting = useSelector(selectBookingIsSubmitting)

  const mode = (params.get('mode') as 'interviewer' | 'recruiter') ?? 'interviewer'
  const slotId = params.get('slotId') ?? undefined
  const slotDate = params.get('date') ?? undefined
  const slotStart = params.get('start') ?? undefined
  const slotEnd = params.get('end') ?? undefined

  const handleSubmit = useCallback(
    (data: BookingFormData) => {
      if (mode === 'interviewer') {
        dispatch(createAvailabilitySlot(data)).then(() => navigate('/dashboard'))
      } else if (slotId && data.candidateId) {
        dispatch(
          bookCandidateIntoSlot({
            slotId,
            booking: {
              candidateId: data.candidateId,
              candidateName: '',
              interviewType: data.interviewType!,
              technology: data.technology!,
              comments: data.comments,
              interviewerId: '',
              date: data.date,
              startTime: data.startTime,
              endTime: data.endTime,
            },
          })
        ).then(() => navigate('/booking/view'))
      }
    },
    [dispatch, mode, slotId, navigate]
  )

  return (
    <div className="max-w-lg mx-auto">
      <BookingForm
        mode={mode}
        slotDate={slotDate}
        slotStart={slotStart}
        slotEnd={slotEnd}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default BookingFormScreen
