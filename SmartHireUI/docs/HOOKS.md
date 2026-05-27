# Custom Hooks API Documentation

**Last Updated**: May 26, 2026

## Overview

SmartHire provides custom hooks for common operations: authentication, filtering, pagination, form handling, and data fetching. This document describes each hook and how to use them.

## Authentication Hooks

### useAuth

**Location**: `src/hooks/useAuth.ts`

Get current authenticated user and auth status.

```typescript
import { useAuth } from '@hooks/useAuth'

export function MyComponent() {
  const { user, isAuthenticated, roles, logout } = useAuth()

  if (!isAuthenticated) return <div>Please login</div>

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <p>Roles: {roles.join(', ')}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

**Returns**:
```typescript
{
  user: UserProfile | null
  isAuthenticated: boolean
  roles: string[]
  logout: () => void
  login: (credentials) => Promise<void>
  hasRole: (role: string) => boolean
}
```

### useCanAccess

**Location**: `src/hooks/useCanAccess.ts`

Check if user has permission to access a feature.

```typescript
import { useCanAccess } from '@hooks/useCanAccess'

export function AdminPanel() {
  const canAccess = useCanAccess()

  // Check single role
  if (!canAccess('ADMIN')) return <div>Access Denied</div>

  // Check multiple roles (OR logic)
  if (!canAccess(['ADMIN', 'SUPERUSER'])) return <div>Access Denied</div>

  return <div>Admin Panel</div>
}
```

**Returns**:
```typescript
(role: string | string[]) => boolean
```

## Data Fetching Hooks

### useCandidates

**Location**: `src/hooks/useCandidates.ts`

Fetch and manage candidate list with filters and pagination.

```typescript
import { useCandidates } from '@hooks/useCandidates'

export function CandidatePipeline() {
  const {
    candidates,
    totalCount,
    isLoading,
    error,
    page,
    pageSize,
    setPage,
    setFilters,
    refetch
  } = useCandidates()

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const handleFilter = () => {
    setFilters({
      technology: 'Java',
      status: 'APPLIED'
    })
  }

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <table>
        {candidates.map(c => <tr key={c.id}><td>{c.name}</td></tr>)}
      </table>
      <Pagination page={page} total={totalCount} onChange={handlePageChange} />
    </div>
  )
}
```

**Returns**:
```typescript
{
  candidates: Candidate[]
  totalCount: number
  page: number
  pageSize: number
  isLoading: boolean
  error: string | null
  setPage: (page: number) => void
  setFilters: (filters: CandidateFilters) => void
  refetch: () => Promise<void>
}
```

### useBookingSlots

**Location**: `src/hooks/useBookingSlots.ts`

Fetch interviewer's available slots for calendar view.

```typescript
import { useBookingSlots } from '@hooks/useBookingSlots'
import { Calendar } from '@components/calendar/Calendar'

export function InterviewerDashboard() {
  const {
    slots,
    calendarEvents,
    isLoading,
    createSlot,
    rescheduleSlot,
    deleteSlot
  } = useBookingSlots()

  return (
    <Calendar
      events={calendarEvents}
      onCreateSlot={createSlot}
      onReschedule={rescheduleSlot}
    />
  )
}
```

**Returns**:
```typescript
{
  slots: InterviewSlot[]
  calendarEvents: CalendarEvent[]
  isLoading: boolean
  createSlot: (date: string, time: string) => Promise<void>
  rescheduleSlot: (slotId: string, newDate: string) => Promise<void>
  deleteSlot: (slotId: string) => Promise<void>
}
```

### useFeedback

**Location**: `src/hooks/useFeedback.ts`

Manage feedback form state and submission.

```typescript
import { useFeedback } from '@hooks/useFeedback'

export function FeedbackForm() {
  const {
    template,
    formData,
    errors,
    isLoading,
    isSaving,
    setFormData,
    submitFeedback,
    resetForm
  } = useFeedback()

  const handleSubmit = async () => {
    await submitFeedback()
  }

  return (
    <form onSubmit={handleSubmit}>
      {template?.technicalAreas.map(area => (
        <input
          key={area.id}
          value={formData.technicalScores[area.id]}
          onChange={(e) => setFormData({
            ...formData,
            technicalScores: {
              ...formData.technicalScores,
              [area.id]: e.target.value
            }
          })}
        />
      ))}
      {errors.length > 0 && <div>{errors[0]}</div>}
      <button disabled={isSaving}>Submit</button>
    </form>
  )
}
```

**Returns**:
```typescript
{
  template: FeedbackTemplate | null
  formData: Feedback
  errors: string[]
  isLoading: boolean
  isSaving: boolean
  setFormData: (data: Feedback) => void
  submitFeedback: () => Promise<Feedback>
  resetForm: () => void
}
```

## Form Hooks

### useForm

**Location**: `src/hooks/useForm.ts`

Generic form state management with validation.

```typescript
import { useForm } from '@hooks/useForm'

export function LoginForm() {
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email().required(),
      password: Yup.string().min(8).required()
    }),
    onSubmit: async (values) => {
      await loginUser(values)
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {touched.email && errors.email && <div>{errors.email}</div>}
      <button type="submit" disabled={isSubmitting}>Login</button>
    </form>
  )
}
```

**Returns**:
```typescript
{
  values: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isDirty: boolean
  handleChange: (e: ChangeEvent) => void
  handleBlur: (e: FocusEvent) => void
  handleSubmit: (e: FormEvent) => Promise<void>
  setFieldValue: (field: string, value: any) => void
  resetForm: () => void
}
```

### useFileInput

**Location**: `src/hooks/useFileInput.ts`

Manage file input and upload state.

```typescript
import { useFileInput } from '@hooks/useFileInput'

export function ResumeUpload() {
  const {
    file,
    preview,
    error,
    isLoading,
    handleFileChange,
    uploadFile,
    clearFile
  } = useFileInput({
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword']
  })

  const handleUpload = async () => {
    await uploadFile('c123', 'RESUME')
  }

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
      />
      {error && <div className="text-red-600">{error}</div>}
      {file && (
        <>
          <p>{file.name}</p>
          <button onClick={handleUpload} disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </>
      )}
    </div>
  )
}
```

**Returns**:
```typescript
{
  file: File | null
  preview: string | null
  error: string | null
  isLoading: boolean
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  uploadFile: (candidateId: string, docType: string) => Promise<Document>
  clearFile: () => void
}
```

## Pagination & Filtering Hooks

### usePagination

**Location**: `src/hooks/usePagination.ts`

Manage pagination state.

```typescript
import { usePagination } from '@hooks/usePagination'

export function DataTable() {
  const {
    page,
    pageSize,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setPageSize
  } = usePagination({ initialPage: 1, initialPageSize: 50, total: 1000 })

  return (
    <div>
      <select value={pageSize} onChange={(e) => setPageSize(+e.target.value)}>
        <option>10</option>
        <option>50</option>
        <option>100</option>
      </select>
      <button onClick={prevPage}>Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button onClick={nextPage}>Next</button>
    </div>
  )
}
```

**Returns**:
```typescript
{
  page: number
  pageSize: number
  totalPages: number
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  setPageSize: (size: number) => void
}
```

### useFilters

**Location**: `src/hooks/useFilters.ts`

Manage filter state with URL sync.

```typescript
import { useFilters } from '@hooks/useFilters'

export function CandidateFilters() {
  const {
    filters,
    setFilter,
    clearFilters,
    clearFilter,
    hasFilters
  } = useFilters<CandidateFilters>()

  return (
    <div>
      <input
        placeholder="Technology"
        onChange={(e) => setFilter('technology', e.target.value)}
      />
      <select onChange={(e) => setFilter('status', e.target.value)}>
        <option>All</option>
        <option>APPLIED</option>
        <option>SHORTLISTED</option>
      </select>
      {hasFilters && (
        <button onClick={clearFilters}>Clear All</button>
      )}
    </div>
  )
}
```

**Returns**:
```typescript
{
  filters: T
  setFilter: (key: keyof T, value: any) => void
  clearFilter: (key: keyof T) => void
  clearFilters: () => void
  hasFilters: boolean
}
```

## Utility Hooks

### useDebounce

**Location**: `src/hooks/useDebounce.ts`

Debounce a value (useful for search inputs).

```typescript
import { useDebounce } from '@hooks/useDebounce'

export function CandidateSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (debouncedTerm) {
      fetchSearchResults(debouncedTerm)
    }
  }, [debouncedTerm])

  return (
    <input
      placeholder="Search candidates..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  )
}
```

### usePrevious

**Location**: `src/hooks/usePrevious.ts`

Get previous value of a prop/state.

```typescript
import { usePrevious } from '@hooks/usePrevious'

export function CandidateCard({ candidateId }) {
  const prevId = usePrevious(candidateId)

  useEffect(() => {
    if (prevId !== candidateId) {
      // Candidate changed, fetch new data
      fetchCandidateDetails(candidateId)
    }
  }, [candidateId, prevId])
}
```

### useLocalStorage

**Location**: `src/hooks/useLocalStorage.ts`

Sync state with localStorage.

```typescript
import { useLocalStorage } from '@hooks/useLocalStorage'

export function UserPreferences() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const [language, setLanguage] = useLocalStorage('language', 'en')

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option>light</option>
        <option>dark</option>
      </select>
    </div>
  )
}
```

### useAsync

**Location**: `src/hooks/useAsync.ts`

Handle async operations with loading/error/data states.

```typescript
import { useAsync } from '@hooks/useAsync'

export function CandidateDetails({ id }) {
  const { data, loading, error, execute } = useAsync(
    () => getCandidateById(id),
    []
  )

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && <div>{data.name}</div>}
    </div>
  )
}
```

## Custom Domain Hooks

### useTodoList

**Location**: `src/hooks/useTodoList.ts`

Get today's interviews and pending feedbacks for interviewer.

```typescript
import { useTodoList } from '@hooks/useTodoList'

export function InterviewerTodoList() {
  const { todayInterviews, pendingFeedbacks, availableSlots } = useTodoList()

  return (
    <div>
      <h2>Today's Interviews: {todayInterviews.length}</h2>
      <h2>Pending Feedbacks: {pendingFeedbacks.length}</h2>
      <p>Available Slots: {availableSlots}</p>
    </div>
  )
}
```

### useWorkflow

**Location**: `src/hooks/useWorkflow.ts`

Get approval queue for current user's role.

```typescript
import { useWorkflow } from '@hooks/useWorkflow'

export function ApprovalQueue() {
  const {
    queue,
    currentStage,
    approveCandidate,
    rejectCandidate,
    holdCandidate
  } = useWorkflow()

  const handleApprove = async (candidateId) => {
    await approveCandidate(candidateId)
  }

  return (
    <div>
      {queue.map(candidate => (
        <div key={candidate.id}>
          <span>{candidate.name}</span>
          <button onClick={() => handleApprove(candidate.id)}>Approve</button>
        </div>
      ))}
    </div>
  )
}
```

## Best Practices

1. **Use hooks at top level**: Always call hooks at the top level of components, not inside loops/conditions
   ```typescript
   // Good
   export function Component() {
     const { data } = useCandidates()
     return <div>{data}</div>
   }

   // Avoid
   export function Component() {
     if (condition) {
       const { data } = useCandidates() // ❌ Rules of Hooks violation
     }
   }
   ```

2. **Memoize callbacks**: Use `useCallback` when passing callbacks to hooks
   ```typescript
   const handleFilter = useCallback((filters) => {
     setFilters(filters)
   }, [])
   ```

3. **Cleanup side effects**: Always cleanup in useEffect dependencies
   ```typescript
   useEffect(() => {
     const subscription = api.subscribe(onData)
     return () => subscription.unsubscribe()
   }, [])
   ```

4. **Extract hooks into custom hooks**: Make reusable logic easier to share
   ```typescript
   // Good: Reusable hook
   export function useCandidateForm() {
     const [formData, setFormData] = useState()
     // ... form logic
     return { formData, setFormData }
   }
   ```

## Hook Naming Convention

All custom hooks should:
- Start with `use` prefix: `useCandidates`, `useForm`, `useDebounce`
- Be in `src/hooks/` directory
- Export as named exports
- Include TypeScript types for props and return values

---

For more hooks and examples, see the hooks directory: `src/hooks/`
