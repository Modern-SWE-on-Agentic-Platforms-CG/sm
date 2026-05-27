/**
 * Candidate selectors
 */
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@store/store'

const selectCandidateState = (state: RootState) => state.candidates

export const selectCandidateList = createSelector(
  [selectCandidateState],
  (s) => s.list
)

export const selectSelectedCandidate = createSelector(
  [selectCandidateState],
  (s) => s.selected
)

export const selectCandidateTotal = createSelector(
  [selectCandidateState],
  (s) => s.total
)

export const selectCandidatePage = createSelector(
  [selectCandidateState],
  (s) => s.page
)

export const selectCandidatePageSize = createSelector(
  [selectCandidateState],
  (s) => s.pageSize
)

export const selectCandidateTotalPages = createSelector(
  [selectCandidateState],
  (s) => Math.ceil(s.total / s.pageSize)
)

export const selectCandidateIsLoading = createSelector(
  [selectCandidateState],
  (s) => s.isLoading
)

export const selectCandidateIsUploading = createSelector(
  [selectCandidateState],
  (s) => s.isUploading
)

export const selectCandidateIsExporting = createSelector(
  [selectCandidateState],
  (s) => s.isExporting
)

export const selectCandidateError = createSelector(
  [selectCandidateState],
  (s) => s.error
)

export const selectUploadResult = createSelector(
  [selectCandidateState],
  (s) => s.uploadResult
)

export const selectCandidateFilter = createSelector(
  [selectCandidateState],
  (s) => s.filter
)
