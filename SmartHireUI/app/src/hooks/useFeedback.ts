/**
 * useFeedback — custom hook for feedback form lifecycle
 */
import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@store/store'
import {
  fetchTemplate,
  submitFeedback,
  fetchFeedback,
  revisitFeedback,
  setForm,
  updateForm,
  setAllowSubmit,
  clearForm,
  clearError,
} from '@store/slices/feedbackSlice'
import {
  selectFeedbackTemplate,
  selectFeedbackForm,
  selectCurrentFeedback,
  selectFeedbackIsLoading,
  selectFeedbackIsSubmitting,
  selectFeedbackIsRevisiting,
  selectFeedbackError,
  selectAllowSubmit,
} from '@store/selectors/feedbackSelectors'
import type { FeedbackForm, SkillRating, BehavioralEval } from '@appTypes/feedback'
import { FeedbackStatus } from '@appTypes/feedback'

interface UseFeedbackOptions {
  technology?: string
  feedbackId?: string
  candidateId?: string
  slotId?: string
}

export function useFeedback({ technology, feedbackId, candidateId, slotId }: UseFeedbackOptions) {
  const dispatch = useDispatch<AppDispatch>()
  const template = useSelector(selectFeedbackTemplate)
  const form = useSelector(selectFeedbackForm)
  const current = useSelector(selectCurrentFeedback)
  const isLoading = useSelector(selectFeedbackIsLoading)
  const isSubmitting = useSelector(selectFeedbackIsSubmitting)
  const isRevisiting = useSelector(selectFeedbackIsRevisiting)
  const error = useSelector(selectFeedbackError)
  const allowSubmit = useSelector(selectAllowSubmit)

  // Load template when technology changes
  useEffect(() => {
    if (technology) {
      dispatch(fetchTemplate(technology))
    }
  }, [dispatch, technology])

  // Load existing feedback record in revisit mode
  useEffect(() => {
    if (feedbackId) {
      dispatch(fetchFeedback(feedbackId))
    }
  }, [dispatch, feedbackId])

  // Initialize form when template loads
  useEffect(() => {
    if (template && candidateId && slotId && !form) {
      const initialForm: FeedbackForm = {
        candidateId,
        slotId,
        technicalRatings: (template.technicalAreas ?? []).map((area) => ({
          skillId: area.id,
          skillName: area.name,
          rating: null,
          remark: '',
        })),
        behavioralRatings: (template.behavioralAreas ?? []).map((area) => ({
          areaId: area.id,
          areaName: area.name,
          rating: null,
          remark: '',
        })),
        overallRemark: '',
        feedbackStatus: '',
      }
      dispatch(setForm(initialForm))
    }
  }, [dispatch, template, candidateId, slotId, form])

  // Validate form and update allowSubmit
  const technicalArea1Filled = useMemo(() => {
    // If no technical areas defined in template, skip this validation
    if (!form?.technicalRatings.length) return true
    const first = form.technicalRatings[0]
    return first.rating !== null && first.remark !== ''
  }, [form])

  const statusSelected = useMemo(
    () => !!form?.feedbackStatus && (form.feedbackStatus as string) !== '',
    [form]
  )

  useEffect(() => {
    dispatch(setAllowSubmit(technicalArea1Filled && statusSelected))
  }, [dispatch, technicalArea1Filled, statusSelected])

  const handleTechnicalChange = useCallback(
    (index: number, field: keyof SkillRating, value: string | number) => {
      if (!form) return
      const updated = form.technicalRatings.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      )
      dispatch(updateForm({ technicalRatings: updated }))
    },
    [dispatch, form]
  )

  const handleBehavioralChange = useCallback(
    (index: number, field: keyof BehavioralEval, value: string | number) => {
      if (!form) return
      const updated = form.behavioralRatings.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      )
      dispatch(updateForm({ behavioralRatings: updated }))
    },
    [dispatch, form]
  )

  const handleAddTechnicalRow = useCallback(() => {
    if (!form) return
    const newRow: SkillRating = {
      skillId: `custom_${Date.now()}`,
      skillName: `Area ${form.technicalRatings.length + 1}`,
      rating: null,
      remark: '',
    }
    dispatch(updateForm({ technicalRatings: [...form.technicalRatings, newRow] }))
  }, [dispatch, form])

  const handleSubmit = useCallback(async () => {
    if (!form || !allowSubmit) return
    return dispatch(submitFeedback(form))
  }, [dispatch, form, allowSubmit])

  const handleRevisit = useCallback(
    async (id: string) => {
      if (!form) return
      return dispatch(revisitFeedback({ id, data: form }))
    },
    [dispatch, form]
  )

  const handleClear = useCallback(() => {
    dispatch(clearForm())
  }, [dispatch])

  const handleClearError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // Determine editability
  const isEditable = useMemo(() => {
    if (!current) return true
    return (
      current.feedbackStatus !== FeedbackStatus.SUBMITTED &&
      current.feedbackStatus !== FeedbackStatus.ON_HOLD
    )
  }, [current])

  return {
    template,
    form,
    current,
    isLoading,
    isSubmitting,
    isRevisiting,
    error,
    allowSubmit,
    isEditable,
    handleTechnicalChange,
    handleBehavioralChange,
    handleAddTechnicalRow,
    handleSubmit,
    handleRevisit,
    handleClear,
    handleClearError,
  }
}
