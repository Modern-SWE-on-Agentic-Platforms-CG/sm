import { configureStore } from '@reduxjs/toolkit'
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import filtersReducer from './slices/filtersSlice'
import candidateReducer from './slices/candidateSlice'
import bookingReducer from './slices/bookingSlice'
import feedbackReducer from './slices/feedbackSlice'
import workflowReducer from './slices/workflowSlice'
import adminReducer from './slices/adminSlice'
import referralReducer from './slices/referralSlice'
import reportsReducer from './slices/reportsSlice'

/**
 * Configure Redux store with slices
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    filters: filtersReducer,
    candidates: candidateReducer,
    booking: bookingReducer,
    feedback: feedbackReducer,
    workflow: workflowReducer,
    admin: adminReducer,
    referral: referralReducer,
    reports: reportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/loginUser/fulfilled', 'ui/openModal'],
      },
    }),
  devTools: {
    // Enable Redux DevTools in development
    trace: true,
    traceLimit: 25,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/**
 * Typed hooks for using Redux
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
