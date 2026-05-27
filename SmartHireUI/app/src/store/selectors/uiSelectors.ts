import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'

/**
 * Base selector for UI state
 */
const selectUIState = (state: RootState) => state.ui

/**
 * Select all toasts
 */
export const selectToasts = createSelector(
  [selectUIState],
  (ui) => ui.toasts
)

/**
 * Select toasts count
 */
export const selectToastsCount = createSelector(
  [selectToasts],
  (toasts) => toasts.length
)

/**
 * Select modal by ID
 */
export const selectModalById = (modalId: string) =>
  createSelector(
    [selectUIState],
    (ui) => ui.modals[modalId] || null
  )

/**
 * Select all modals
 */
export const selectAllModals = createSelector(
  [selectUIState],
  (ui) => Object.values(ui.modals)
)

/**
 * Select open modals
 */
export const selectOpenModals = createSelector(
  [selectAllModals],
  (modals) => modals.filter((modal) => modal.isOpen)
)

/**
 * Select if any modal is open
 */
export const selectIsAnyModalOpen = createSelector(
  [selectOpenModals],
  (openModals) => openModals.length > 0
)

/**
 * Select sidebar open state
 */
export const selectIsSidebarOpen = createSelector(
  [selectUIState],
  (ui) => ui.isSidebarOpen
)

/**
 * Select dark mode state
 */
export const selectIsDarkMode = createSelector(
  [selectUIState],
  (ui) => ui.isDarkMode
)

/**
 * Select global loading state
 */
export const selectIsLoading = createSelector(
  [selectUIState],
  (ui) => ui.isLoading
)

/**
 * Select last toast
 */
export const selectLastToast = createSelector(
  [selectToasts],
  (toasts) => toasts[toasts.length - 1] || null
)

/**
 * Select error toasts
 */
export const selectErrorToasts = createSelector(
  [selectToasts],
  (toasts) => toasts.filter((toast) => toast.type === 'error')
)

/**
 * Select success toasts
 */
export const selectSuccessToasts = createSelector(
  [selectToasts],
  (toasts) => toasts.filter((toast) => toast.type === 'success')
)

/**
 * Select UI state for debugging
 */
export const selectUIDebug = createSelector(
  [selectUIState],
  (ui) => ({
    toastsCount: ui.toasts.length,
    modalsCount: Object.keys(ui.modals).length,
    openModalsCount: Object.values(ui.modals).filter((m) => m.isOpen).length,
    isSidebarOpen: ui.isSidebarOpen,
    isDarkMode: ui.isDarkMode,
    isLoading: ui.isLoading,
  })
)
