# API Client Documentation

**Last Updated**: May 26, 2026

## Overview

The SmartHire platform uses a centralized API client pattern built on Axios, with dedicated service modules for each domain (candidates, auth, reports, etc.). This document describes how to use and extend the API client.

## Architecture

```
src/services/
├── api/
│   ├── auth.ts           # Authentication endpoints
│   ├── candidates.ts     # Candidate management
│   ├── booking.ts        # Interview booking
│   ├── feedback.ts       # Feedback submission
│   ├── workflow.ts       # Approval workflow
│   ├── admin.ts          # Master data
│   ├── referral.ts       # Referral portal
│   ├── reports.ts        # Analytics reports
│   └── client.ts         # Axios instance + interceptors
├── utils/
│   ├── fileUpload.ts     # File operations
│   └── formHelpers.ts    # Form validation
└── interceptors/
    └── errorHandler.ts   # Error handling
```

## Core API Client

**File**: `src/services/api/client.ts`

### Creating Requests

```typescript
import { apiClient } from '@services/api/client'

// GET request
const data = await apiClient.get<CandidateList>('/candidates', {
  params: { page: 1, limit: 50, filter: 'active' }
})

// POST request
const result = await apiClient.post<Candidate>('/candidates', {
  name: 'John',
  email: 'john@example.com'
})

// PUT request (update)
const updated = await apiClient.put<Candidate>(`/candidates/${id}`, {
  status: 'SHORTLISTED'
})

// DELETE request
await apiClient.delete(`/candidates/${id}`)
```

### Request/Response Pattern

All API responses follow a consistent pattern:

```typescript
// Success response
{
  statusCode: 200,
  message: 'Success',
  data: { /* actual response data */ }
}

// Error response
{
  statusCode: 400,
  message: 'Validation failed',
  errors: [{ field: 'email', message: 'Invalid format' }]
}
```

### Interceptors

The client includes automatic:
- **JWT Token Injection**: Authorization header added to all requests
- **Error Handling**: Errors parsed and user-friendly messages shown via toastr
- **Token Expiry**: Automatic redirect to login if token expired (401/403)
- **HTTPS Validation**: All requests verified over secure channels

## Authentication API

**File**: `src/services/api/auth.ts`

```typescript
import { loginWithSSO, fetchUserRoles, verifyToken } from '@services/api/auth'

// SSO Login (via Keycloak)
const login = () => {
  window.location.href = keycloakLoginUrl
}

// Fetch user roles after JWT received
const roles = await fetchUserRoles()

// Verify JWT is still valid
const isValid = await verifyToken()

// Logout
const logout = () => {
  localStorage.removeItem('token')
  window.location.href = keycloakLogoutUrl
}
```

## Candidate API

**File**: `src/services/api/candidates.ts`

```typescript
import {
  getCandidates,
  getCandidateById,
  uploadCandidates,
  updateCandidateStatus,
  deleteCandidates
} from '@services/api/candidates'

// Get paginated candidates
const list = await getCandidates({
  page: 1,
  pageSize: 50,
  filters: { technology: 'Java', status: 'APPLIED' }
})

// Get single candidate by ID
const candidate = await getCandidateById('c123')

// Bulk upload candidates
const result = await uploadCandidates(excelFile)

// Update single candidate status
await updateCandidateStatus('c123', 'SHORTLISTED')

// Delete candidates (soft delete)
await deleteCandidates(['c123', 'c124'])

// Weekend Drive / Instant Interview
const newCandidate = await submitInstantInterview({
  name: 'John',
  contact: '9876543210',
  email: 'john@example.com',
  bu: 'Delivery',
  skill: 'Java'
})

// Get today's interviews
const interviews = await getTodayInterviews()

// Get pending feedbacks
const feedbacks = await getPendingFeedbacks()
```

## Booking API

**File**: `src/services/api/booking.ts`

```typescript
import {
  getAvailableSlots,
  createSlots,
  bookSlot,
  rescheduleBooking
} from '@services/api/booking'

// Get interviewer's available slots for a date range
const slots = await getAvailableSlots(interviewerId, {
  startDate: '2026-05-01',
  endDate: '2026-06-01'
})

// Create new availability slots
await createSlots(interviewerId, {
  date: '2026-05-25',
  slots: [
    { startTime: '09:00', endTime: '09:30' },
    { startTime: '10:00', endTime: '10:30' }
  ]
})

// Book a candidate into a slot
const booking = await bookSlot({
  slotId: 'slot123',
  candidateId: 'c123',
  interviewType: 'L1',
  comments: 'Java technical'
})

// Reschedule existing booking
await rescheduleBooking('booking123', {
  newSlotId: 'slot456'
})
```

## Feedback API

**File**: `src/services/api/feedback.ts`

```typescript
import {
  getFeedbackTemplate,
  submitFeedback,
  getFeedback,
  revisitFeedback
} from '@services/api/feedback'

// Get dynamic feedback template for a BU/practice
const template = await getFeedbackTemplate({
  bu: 'Delivery',
  practice: 'Java'
})

// Submit new feedback
const feedback = await submitFeedback({
  candidateId: 'c123',
  bookingId: 'b123',
  technicalScores: [{ area: 'OOP', rating: 4 }],
  behavioralScores: [{ area: 'Communication', rating: 5 }],
  feedbackStatus: 'SELECT',
  comments: 'Strong technical skills'
})

// Get previously submitted feedback
const prevFeedback = await getFeedback('feedback123')

// Revisit and edit feedback (if not finalized)
const updated = await revisitFeedback('feedback123', {
  technicalScores: [{ area: 'OOP', rating: 5 }],
  comments: 'Excellent technical skills'
})
```

## Workflow API

**File**: `src/services/api/workflow.ts`

```typescript
import {
  getApprovalQueue,
  approveCandidate,
  rejectCandidate,
  holdCandidate
} from '@services/api/workflow'

// Get candidates pending approval for current user's role
const queue = await getApprovalQueue()

// Approve a candidate (moves to next approval stage)
await approveCandidate('c123')

// Reject with mandatory comments
await rejectCandidate('c123', {
  comments: 'Does not meet skill requirements',
  rejectReason: 'SKILL_MISMATCH'
})

// Hold for further action
await holdCandidate('c123', {
  holdReason: 'Pending offer negotiation'
})
```

## Reports API

**File**: `src/services/api/reports.ts`

```typescript
import {
  getRejectionRatio,
  getTrendChart,
  getPanelPerformance,
  getL2Aging,
  exportReport
} from '@services/api/reports'

// Get rejection/selection ratio data
const rejectionData = await getRejectionRatio({
  technology: 'Java',
  dateRange: { from: '2026-01-01', to: '2026-05-31' }
})

// Get trend chart data (time-series)
const trends = await getTrendChart({
  bu: 'Delivery',
  months: 12
})

// Get panel performance metrics
const performance = await getPanelPerformance()

// Get L2 aging report
const agingCandidates = await getL2Aging({
  bu: 'Delivery'
})

// Export report to Excel
const blob = await exportReport('rejection-ratio', {
  technology: 'Java',
  format: 'xlsx'
})

// Download Excel file
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'rejection-ratio.xlsx'
a.click()
```

## Error Handling

### Try/Catch Pattern

```typescript
try {
  const candidate = await getCandidateById('c123')
} catch (error) {
  if (error.response?.status === 404) {
    console.log('Candidate not found')
  } else if (error.response?.status === 401) {
    // Token expired, redirect to login (automatic via interceptor)
  } else {
    console.error('API Error:', error.message)
    // Show user-friendly error via toastr
  }
}
```

### Async/Await Best Practices

```typescript
// Good: Handle errors properly
async function fetchAndDisplay() {
  try {
    const data = await getCandidates()
    setUsers(data)
  } catch (error) {
    setError(error.message)
  }
}

// Avoid: Ignoring errors
async function fetchAndDisplay() {
  const data = await getCandidates() // Could fail silently
  setUsers(data)
}
```

## File Upload API

**File**: `src/services/utils/fileUpload.ts`

```typescript
import {
  uploadDocument,
  downloadDocument,
  validateFileType,
  validateFileSize
} from '@services/utils/fileUpload'

// Upload resume with validation
const file = new File(['...'], 'resume.pdf', { type: 'application/pdf' })

// Validate file type
const typeCheck = validateFileType(file, ['application/pdf', 'application/msword'])
if (!typeCheck.valid) {
  console.error(typeCheck.error) // "Only PDF and DOC files allowed"
}

// Validate file size (10MB max for resume)
const sizeCheck = validateFileSize(file, 10 * 1024 * 1024)
if (!sizeCheck.valid) {
  console.error(sizeCheck.error) // "File size exceeds 10MB limit"
}

// Upload document
const doc = await uploadDocument('c123', file, 'RESUME')

// Download document via presigned URL
await downloadDocument(doc)
```

## Best Practices

1. **Always use TypeScript types**: Import response types from `@appTypes/*`
   ```typescript
   const candidates: Candidate[] = await getCandidates()
   ```

2. **Handle loading states**: Set loading state during async operations
   ```typescript
   const [isLoading, setIsLoading] = useState(false)
   const fetchData = async () => {
     setIsLoading(true)
     try {
       const data = await getCandidates()
     } finally {
       setIsLoading(false)
     }
   }
   ```

3. **Use React Query (if added in future)**: For caching and deduplication
   ```typescript
   // Future: const { data } = useQuery(['candidates'], getCandidates)
   ```

4. **Avoid duplicate API calls**: Cache results in Redux store or React state
   ```typescript
   if (users.length > 0) return users // Use cached data
   ```

5. **Log errors for debugging**: Include relevant context
   ```typescript
   console.error('Failed to fetch candidates:', {
     filters: appliedFilters,
     error: error.message
   })
   ```

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | SSO login (Keycloak) |
| `/candidates` | GET | List candidates with filters |
| `/candidates/:id` | GET | Get candidate details |
| `/candidates/bulk-upload` | POST | Upload candidates from Excel |
| `/candidates/:id/status` | PUT | Update candidate status |
| `/booking/slots` | GET | List available slots |
| `/booking/slots` | POST | Create new slots |
| `/booking` | POST | Book candidate into slot |
| `/feedback/template` | GET | Get feedback form template |
| `/feedback` | POST | Submit feedback |
| `/workflow/approval-queue` | GET | Get candidates for approval |
| `/reports/rejection-ratio` | GET | Rejection ratio report |
| `/reports/trend-chart` | GET | Trend chart data |
| `/documents/upload` | POST | Upload document (presigned URL) |
| `/documents/:id/download` | GET | Download document (presigned URL) |

## Troubleshooting

**Q: API request hangs indefinitely**
- A: Check network tab in DevTools; ensure backend is running and CORS is configured

**Q: 401 Unauthorized on every request**
- A: JWT token may be expired; check localStorage; clearAuth and force re-login

**Q: File upload fails**
- A: Ensure file size and type validation pass; check S3 bucket permissions

**Q: API response has unexpected structure**
- A: Verify API version matches; check backend API documentation; regenerate TypeScript types from OpenAPI spec

---

For additional help, see [TESTING.md](TESTING.md) for testing API calls and [DEPLOYMENT.md](DEPLOYMENT.md) for environment configuration.
