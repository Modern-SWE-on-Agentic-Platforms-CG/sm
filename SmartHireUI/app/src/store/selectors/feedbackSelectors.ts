/**
 * Feedback selectors
 */
import type { RootState } from '@store/store'

export const selectFeedbackTemplate = (state: RootState) => state.feedback.template
export const selectFeedbackForm = (state: RootState) => state.feedback.form
export const selectCurrentFeedback = (state: RootState) => state.feedback.current
export const selectFeedbackRecords = (state: RootState) => state.feedback.records
export const selectFeedbackIsLoading = (state: RootState) => state.feedback.isLoading
export const selectFeedbackIsSubmitting = (state: RootState) => state.feedback.isSubmitting
export const selectFeedbackIsRevisiting = (state: RootState) => state.feedback.isRevisiting
export const selectFeedbackError = (state: RootState) => state.feedback.error
export const selectAllowSubmit = (state: RootState) => state.feedback.allowSubmit
export const selectFeedbackTotal = (state: RootState) => state.feedback.total
export const selectFeedbackPage = (state: RootState) => state.feedback.page
export const selectFeedbackPageSize = (state: RootState) => state.feedback.pageSize
export const selectFeedbackFilter = (state: RootState) => state.feedback.filter
export const selectFeedbackTotalPages = (state: RootState) =>
  Math.ceil(state.feedback.total / state.feedback.pageSize)
