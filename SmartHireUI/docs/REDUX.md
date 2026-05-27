# Redux Store Documentation

**Last Updated**: May 26, 2026

## Overview

The SmartHire platform uses Redux Toolkit for centralized state management. This document describes the store structure, slices, selectors, and how to dispatch actions.

## Store Architecture

```
src/store/
├── store.ts              # Configure store with all slices
├── slices/
│   ├── authSlice.ts      # Authentication state
│   ├── uiSlice.ts        # UI state (loading, modals, notifications)
│   ├── filterSlice.ts    # Applied filters
│   ├── candidatesSlice.ts # Candidate list and details
│   ├── bookingSlice.ts   # Interview booking state
│   ├── feedbackSlice.ts  # Feedback forms
│   ├── workflowSlice.ts  # Approval workflow
│   ├── adminSlice.ts     # Master data
│   ├── referralSlice.ts  # Referral portal
│   └── reportsSlice.ts   # Analytics reports
└── selectors/
    ├── authSelectors.ts
    ├── candidateSelectors.ts
    ├── bookingSelectors.ts
    └── [others...]
```

## Store Configuration

**File**: `src/store/store.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

// Import all slices
import authReducer from './slices/authSlice'
import candidatesReducer from './slices/candidatesSlice'
import uiReducer from './slices/uiSlice'
// ... other imports

// Configure store with all slices
export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidates: candidatesReducer,
    ui: uiReducer,
    filters: filterReducer,
    booking: bookingReducer,
    feedback: feedbackReducer,
    workflow: workflowReducer,
    admin: adminReducer,
    referral: referralReducer,
    reports: reportsReducer,
  },
})

// Export types for use throughout app
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export hooks for convenient use in components
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

## Authentication Slice

**File**: `src/store/slices/authSlice.ts`

### State Structure

```typescript
interface AuthState {
  user: UserProfile | null
  token: string | null
  roles: string[]
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
```

### Actions & Thunks

```typescript
import { useAppDispatch, useAppSelector } from '@store/store'
import { loginUser, logoutUser, verifyToken } from '@store/slices/authSlice'

// In component:
const dispatch = useAppDispatch()
const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth)

// Login (dispatches thunk)
await dispatch(loginUser({
  email: 'user@example.com',
  password: 'password'
}))

// Check if authenticated
if (isAuthenticated) {
  console.log('User:', user.name)
  console.log('Roles:', user.roles)
}

// Logout
dispatch(logoutUser())

// Verify token on app load
dispatch(verifyToken())
```

## Candidates Slice

**File**: `src/store/slices/candidatesSlice.ts`

### State Structure

```typescript
interface CandidatesState {
  items: Candidate[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  selectedCandidate: Candidate | null
  isLoading: boolean
  isLoadingDetails: boolean
  error: string | null
}
```

### Thunks

```typescript
import { fetchCandidates, getCandidateById } from '@store/slices/candidatesSlice'

// Fetch list of candidates
const candidates = await dispatch(fetchCandidates({
  page: 1,
  pageSize: 50,
  filters: { technology: 'Java', status: 'APPLIED' }
}))

// Get candidate details
const candidate = await dispatch(getCandidateById('c123'))

// Select from state
const { items, total, isLoading } = useAppSelector(state => state.candidates)
```

### Reducers

```typescript
import { updateCandidateStatus, clearCandidateDetails } from '@store/slices/candidatesSlice'

// Update candidate status optimistically
dispatch(updateCandidateStatus({
  candidateId: 'c123',
  status: 'SHORTLISTED'
}))

// Clear selected candidate details
dispatch(clearCandidateDetails())
```

## UI Slice

**File**: `src/store/slices/uiSlice.ts`

### State Structure

```typescript
interface UIState {
  isDrawerOpen: boolean
  isModalOpen: boolean
  notificationOpen: boolean
  notificationMessage: string
  notificationType: 'success' | 'error' | 'warning' | 'info'
}
```

### Show/Hide Modals

```typescript
import {
  openModal,
  closeModal,
  openDrawer,
  closeDrawer,
  showNotification
} from '@store/slices/uiSlice'

// Open modal
dispatch(openModal({ title: 'Edit Candidate' }))
dispatch(closeModal())

// Show notification
dispatch(showNotification({
  message: 'Candidate updated successfully',
  type: 'success'
}))

// Check UI state
const { isModalOpen, notificationMessage } = useAppSelector(state => state.ui)
```

## Booking Slice

**File**: `src/store/slices/bookingSlice.ts`

### State Structure

```typescript
interface BookingState {
  slots: InterviewSlot[]
  bookings: Booking[]
  selectedSlot: InterviewSlot | null
  isLoading: boolean
  error: string | null
}
```

### Thunks & Reducers

```typescript
import {
  fetchAvailableSlots,
  createBooking,
  selectSlot
} from '@store/slices/bookingSlice'

// Fetch available slots for interviewer
const slots = await dispatch(fetchAvailableSlots({
  interviewerId: 'int123',
  month: 5,
  year: 2026
}))

// Create booking (book candidate into slot)
await dispatch(createBooking({
  slotId: 'slot123',
  candidateId: 'c123',
  interviewType: 'L1'
}))

// Select a slot for viewing details
dispatch(selectSlot('slot123'))

// Get from state
const { slots, bookings, selectedSlot } = useAppSelector(state => state.booking)
```

## Feedback Slice

**File**: `src/store/slices/feedbackSlice.ts`

### State Structure

```typescript
interface FeedbackState {
  template: FeedbackTemplate | null
  feedback: Feedback | null
  isPending: boolean
  isLoading: boolean
  error: string | null
}
```

### Thunks

```typescript
import {
  fetchFeedbackTemplate,
  submitFeedback,
  fetchFeedbackById
} from '@store/slices/feedbackSlice'

// Get feedback form template
await dispatch(fetchFeedbackTemplate({
  bu: 'Delivery',
  practice: 'Java'
}))

// Submit feedback
await dispatch(submitFeedback({
  candidateId: 'c123',
  bookingId: 'b123',
  technicalScores: [{ area: 'OOP', rating: 4 }],
  behavioralScores: [{ area: 'Communication', rating: 5 }],
  feedbackStatus: 'SELECT'
}))

// Fetch feedback to edit
await dispatch(fetchFeedbackById('fb123'))

// Get from state
const { template, feedback, isPending } = useAppSelector(state => state.feedback)
```

## Workflow Slice

**File**: `src/store/slices/workflowSlice.ts`

### State Structure

```typescript
interface WorkflowState {
  approvalQueue: Candidate[]
  currentApprovalStage: ApprovalStage
  isLoading: boolean
  error: string | null
}
```

### Thunks

```typescript
import {
  fetchApprovalQueue,
  approveCandidateWorkflow,
  rejectCandidateWorkflow,
  holdCandidateWorkflow
} from '@store/slices/workflowSlice'

// Get candidates awaiting current user's approval
const queue = await dispatch(fetchApprovalQueue())

// Approve candidate (move to next stage)
await dispatch(approveCandidateWorkflow('c123'))

// Reject with comments
await dispatch(rejectCandidateWorkflow({
  candidateId: 'c123',
  comments: 'Does not meet requirements',
  rejectReason: 'SKILL_MISMATCH'
}))

// Hold for later
await dispatch(holdCandidateWorkflow({
  candidateId: 'c123',
  holdReason: 'Pending decision'
}))

// Get from state
const { approvalQueue, currentApprovalStage } = useAppSelector(state => state.workflow)
```

## Reports Slice

**File**: `src/store/slices/reportsSlice.ts`

### State Structure

```typescript
interface ReportsState {
  rejectionRatio: RejectionRatioReport | null
  trendChart: TrendChartReport | null
  panelPerformance: PanelPerformanceReport | null
  l2Aging: L2AgingReport | null
  filters: ReportFilters
  isLoading: boolean
  error: string | null
}
```

### Thunks

```typescript
import {
  fetchRejectionRatio,
  fetchTrendChart,
  fetchPanelPerformance,
  fetchL2Aging
} from '@store/slices/reportsSlice'

// Fetch rejection/selection ratio
await dispatch(fetchRejectionRatio({
  technology: 'Java',
  dateRange: { from: '2026-01-01', to: '2026-05-31' }
}))

// Fetch trend chart data
await dispatch(fetchTrendChart({
  bu: 'Delivery',
  months: 12
}))

// Get from state
const { rejectionRatio, isLoading, error } = useAppSelector(state => state.reports)
```

## Selectors

### Using Selectors

```typescript
import { selectAuthUser, selectUserRoles } from '@store/selectors/authSelectors'
import { selectCandidates, selectTotalCandidates } from '@store/selectors/candidateSelectors'

// In component:
const user = useAppSelector(selectAuthUser)
const roles = useAppSelector(selectUserRoles)
const candidates = useAppSelector(selectCandidates)
const total = useAppSelector(selectTotalCandidates)
```

### Creating Selectors

```typescript
import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '@store/store'

// Simple selector
export const selectAuthUser = (state: RootState) => state.auth.user

// Memoized selector (computed state)
export const selectUserRoles = createSelector(
  (state: RootState) => state.auth.user?.roles,
  (roles) => roles || []
)

// Multi-input selector
export const selectFilteredCandidates = createSelector(
  (state: RootState) => state.candidates.items,
  (state: RootState) => state.filters.technology,
  (candidates, technology) =>
    candidates.filter(c => c.technology === technology)
)
```

## Async Thunks Pattern

### Creating a Thunk

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit'

export const fetchCandidates = createAsyncThunk(
  'candidates/fetchCandidates', // action type prefix
  async (filters: FilterParams, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/candidates', { params: filters })
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch')
    }
  }
)
```

### Handling Thunk Lifecycle

```typescript
const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})
```

## Best Practices

1. **Always use hooks**: `useAppDispatch` and `useAppSelector` instead of `useDispatch`/`useSelector`
   ```typescript
   const dispatch = useAppDispatch()
   const user = useAppSelector(state => state.auth.user)
   ```

2. **Create selectors for reusable queries**:
   ```typescript
   // Good: Reusable
   const selectUserRoles = (state: RootState) => state.auth.user?.roles
   
   // Avoid: Repeated in components
   useAppSelector(state => state.auth.user?.roles)
   ```

3. **Memoize expensive selectors**: Use `createSelector` for computed state
   ```typescript
   export const selectActiveCandidates = createSelector(
     (state: RootState) => state.candidates.items,
     (items) => items.filter(c => c.status !== 'REJECTED')
   )
   ```

4. **Keep slices focused**: Each slice manages one domain
   ```typescript
   ✓ authSlice: authentication only
   ✗ authSlice: authentication + candidates + reports
   ```

5. **Normalize nested data**: Use IDs instead of nested objects for performance
   ```typescript
   // Good: Normalized
   { candidateId: 'c123', feedback: { id: 'f1', rating: 4 } }
   
   // Avoid: Denormalized
   { candidate: { id: 'c123', feedback: { id: 'f1' } } }
   ```

6. **Avoid direct state mutation**: Redux Toolkit handles this with Immer
   ```typescript
   // Good: Redux Toolkit automatically uses Immer
   state.items = newItems
   state.items.push(newItem)
   
   // Not needed: return new object
   return { ...state, items: newItems }
   ```

## Debugging with Redux DevTools

Install [Redux DevTools Extension](https://chrome.google.com/webstore) to inspect state and time-travel debug:

```typescript
// In browser DevTools:
// - View current state
// - See action history
// - Dispatch actions manually
// - Time-travel to any state
// - Export/import state snapshots
```

## Common Patterns

### Loading Data on Mount

```typescript
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@store/store'
import { fetchCandidates } from '@store/slices/candidatesSlice'

export function CandidateList() {
  const dispatch = useAppDispatch()
  const { items, isLoading } = useAppSelector(state => state.candidates)

  useEffect(() => {
    dispatch(fetchCandidates({ page: 1, pageSize: 50 }))
  }, [dispatch])

  if (isLoading) return <div>Loading...</div>
  return <div>{items.map(c => <div>{c.name}</div>)}</div>
}
```

### Updating on Filter Change

```typescript
useEffect(() => {
  dispatch(fetchCandidates({
    page: currentPage,
    filters: appliedFilters
  }))
}, [currentPage, appliedFilters, dispatch])
```

### Dispatching Multiple Actions

```typescript
async function handleApprove() {
  await dispatch(approveCandidateWorkflow(candidateId))
  dispatch(fetchApprovalQueue()) // Refresh queue
  dispatch(showNotification({ message: 'Approved', type: 'success' }))
}
```

---

For more information, see [Redux Toolkit docs](https://redux-toolkit.js.org) and [Redux DevTools guide](https://github.com/reduxjs/redux-devtools).
