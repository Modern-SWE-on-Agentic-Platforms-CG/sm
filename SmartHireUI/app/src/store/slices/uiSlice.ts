import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

export interface Modal {
  id: string
  isOpen: boolean
  title?: string
  content?: React.ReactNode
}

export interface UIState {
  toasts: Toast[]
  modals: Record<string, Modal>
  isSidebarOpen: boolean
  isDarkMode: boolean
  isLoading: boolean
}

const initialState: UIState = {
  toasts: [],
  modals: {},
  isSidebarOpen: true,
  isDarkMode: false,
  isLoading: false,
}

/**
 * UI slice
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * Add a toast notification
     */
    addToast: (
      state,
      action: PayloadAction<{
        type: ToastType
        message: string
        duration?: number
      }>
    ) => {
      const id = `${Date.now()}-${Math.random()}`
      state.toasts.push({
        id,
        type: action.payload.type,
        message: action.payload.message,
        duration: action.payload.duration || 5000,
      })
    },

    /**
     * Remove a toast by ID
     */
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },

    /**
     * Clear all toasts
     */
    clearToasts: (state) => {
      state.toasts = []
    },

    /**
     * Open a modal
     */
    openModal: (
      state,
      action: PayloadAction<{
        id: string
        title?: string
        content?: React.ReactNode
      }>
    ) => {
      state.modals[action.payload.id] = {
        id: action.payload.id,
        isOpen: true,
        title: action.payload.title,
        content: action.payload.content,
      }
    },

    /**
     * Close a modal
     */
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false
      }
    },

    /**
     * Remove a modal
     */
    removeModal: (state, action: PayloadAction<string>) => {
      delete state.modals[action.payload]
    },

    /**
     * Toggle sidebar
     */
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    },

    /**
     * Set sidebar open state
     */
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload
    },

    /**
     * Toggle dark mode
     */
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode
    },

    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const {
  addToast,
  removeToast,
  clearToasts,
  openModal,
  closeModal,
  removeModal,
  toggleSidebar,
  setSidebarOpen,
  toggleDarkMode,
  setLoading,
} = uiSlice.actions

export default uiSlice.reducer
