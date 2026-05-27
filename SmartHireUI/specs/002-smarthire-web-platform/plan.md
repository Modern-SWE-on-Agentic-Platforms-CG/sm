# Implementation Plan: SmartHire Web Platform

**Branch**: `002-smarthire-web-platform` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-smarthire-web-platform/spec.md` with constraint: **Frontend-only implementation in React**

## Summary

Build a production-ready React web application that unifies all SmartHire recruiting modules into a single cross-platform desktop/web experience. The frontend consumes backend REST APIs (Keycloak for SSO, backend endpoints for candidate management, scheduling, feedback, approvals, and analytics). Implementation focuses on component-driven architecture, TypeScript strict mode, role-based access control, and performance optimization with lazy-loaded routes, virtualized lists, and memoized components.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.x

**Primary Dependencies**: React Router v7 (routing), Redux Toolkit (state management), React Query (API data fetching), Axios (HTTP client), Zod (form validation), Recharts or Chart.js (analytics visualizations), React Hook Form (form management), React Table v8 (advanced tables)

**Storage**: Browser localStorage (JWT token, user preferences), client-side caching via React Query (SWR, stale-while-revalidate)

**Testing**: Vitest (unit tests), React Testing Library (component tests), Mock Service Worker (API mocking), Playwright (E2E smoke tests)

**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge); desktop/laptop form factors; Responsive design (1024px+ primary, tablet support secondary)

**Project Type**: Single-Page Application (SPA) / Web frontend consuming backend REST APIs

**Performance Goals**: 60 FPS interactions and smooth scrolling; initial app shell (after authentication) interactive in ≤2.5s on standard network; table/grid rendering with 1000+ rows in ≤1.5s; report charts render with data in ≤3s

**Constraints**: Strict TypeScript (strict mode enabled); no synchronous localStorage access on render; all API calls debounced/throttled to prevent duplicate requests; role-based route guards prevent unauthorized access; no PII/tokens logged to console; mandatory comments on workflow rejection actions

**Scale/Scope**: ~10 feature modules (auth, candidate, scheduling, feedback, workflow, admin, referral, reports, weekend-drive, details); ~60 legacy routes mapped to React Router structure; 12+ user roles with role-specific navigation; 100k+ candidate records with server-side pagination/filtering

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Pre-Phase 0 gates (adapted for web React):

1. **Component-Driven Architecture**: PASS. All screens decomposed into reusable functional components with custom hooks; PropTypes/TypeScript interfaces for type safety; independent unit tests per component.

2. **Web Performance First**: PASS. Code splitting via React Router lazy loading; React.memo for expensive list/table components; virtual scrolling for large datasets (React Window or React Table virtualization); image lazy loading; CSS-in-JS or Tailwind for performance.

3. **TDD Mandatory**: PASS. Plan includes unit (Vitest + RTL) + integration (RTL) + E2E (Playwright) coverage targets; all new features require tests before merge.

4. **Type Safety & Code Quality**: PASS. TypeScript strict mode enforced; ESLint + Prettier configured; no `any` types without documented exception.

5. **Single-Page App Consistency**: PASS. React Router enforces URL consistency; centralized routing config; all navigation state preserved in URL (bookmarkable).

6. **API Integration & State Management**: PASS. Centralized Axios service layer + Redux Toolkit for app state; React Query for server state; error handling standardized with user-facing toastr notifications.

7. **Security & Data Protection**: PASS. JWT stored securely (not as cookie due to CORS); no PII logging; Zod validation on all forms; DOMPurify for HTML content rendering; HTTPS-only API calls.

Post-Phase 1 re-check:

1. All entities typed and role-aware: PASS.
2. Web performance optimization and lazy loading applied: PASS.
3. No constitution violations introduced by design artifacts: PASS.

## Project Structure

### Documentation (this feature)

```text
specs/002-smarthire-web-platform/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root) - Frontend-Only Structure

```text
app/                                    # React SPA root
├── src/
│   ├── screens/                       # Route-level screen components (feature-based)
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── candidate/
│   │   │   ├── PipelineScreen.tsx
│   │   │   ├── CandidateDetailsScreen.tsx
│   │   │   ├── WeekendDriveScreen.tsx
│   │   │   └── TodoListScreen.tsx
│   │   ├── scheduling/
│   │   │   ├── DashboardScreen.tsx (calendar)
│   │   │   ├── BookingFormScreen.tsx
│   │   │   ├── BookingViewScreen.tsx
│   │   │   └── PanelAvailabilityScreen.tsx
│   │   ├── feedback/
│   │   │   ├── FeedbackFormScreen.tsx
│   │   │   └── FeedbackReportScreen.tsx
│   │   ├── workflow/
│   │   │   ├── WorkflowScreen.tsx
│   │   │   └── WorkflowInfoScreen.tsx
│   │   ├── admin/
│   │   │   ├── MasterDataScreen.tsx
│   │   │   ├── ChangeRolesScreen.tsx
│   │   │   └── DemandSupplyScreen.tsx
│   │   ├── referral/
│   │   │   ├── ReferralRegisterScreen.tsx
│   │   │   ├── ReferralFormScreen.tsx
│   │   │   ├── RefCandidateDetailsScreen.tsx
│   │   │   └── CandidateReferralScreen.tsx
│   │   └── reports/
│   │       ├── SelectRejectScreen.tsx
│   │       ├── PanelInsightsScreen.tsx
│   │       ├── TrendChartScreen.tsx
│   │       └── [... other reports]
│   │
│   ├── components/                    # Reusable UI components (non-screen)
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── RoleBasedNav.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── ToastNotification.tsx
│   │   ├── forms/
│   │   │   ├── CandidateForm.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   ├── FeedbackForm.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   └── FilterPanel.tsx
│   │   ├── tables/
│   │   │   ├── CandidateTable.tsx
│   │   │   ├── BookingTable.tsx
│   │   │   ├── WorkflowQueue.tsx
│   │   │   └── VirtualizedList.tsx (React Window wrapper)
│   │   ├── calendar/
│   │   │   ├── InterviewCalendar.tsx
│   │   │   └── SlotCell.tsx
│   │   ├── charts/
│   │   │   ├── RejectionRatioPie.tsx
│   │   │   ├── TrendLineChart.tsx
│   │   │   ├── PanelPerformanceBar.tsx
│   │   │   └── ChartWrapper.tsx
│   │   └── feedback/
│   │       └── FeedbackTemplate.tsx
│   │
│   ├── services/                      # API & external service layer
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance with interceptors
│   │   │   ├── auth.ts               # Authentication endpoints
│   │   │   ├── candidates.ts         # Candidate pipeline endpoints
│   │   │   ├── scheduling.ts         # Interview scheduling endpoints
│   │   │   ├── feedback.ts           # Feedback endpoints
│   │   │   ├── workflow.ts           # Workflow/approval endpoints
│   │   │   ├── admin.ts              # Admin/master data endpoints
│   │   │   ├── referral.ts           # Referral portal endpoints
│   │   │   ├── reports.ts            # Analytics/reports endpoints
│   │   │   └── types.ts              # API response/request types
│   │   ├── auth/
│   │   │   ├── keycloak.ts          # Keycloak SSO integration
│   │   │   ├── tokenManager.ts      # JWT token lifecycle
│   │   │   └── roleService.ts       # Role-based logic
│   │   ├── storage/
│   │   │   ├── localStorage.ts      # Wrapper for secure localStorage
│   │   │   └── sessionStorage.ts
│   │   └── utils/
│   │       ├── validators.ts        # Zod schemas for forms
│   │       ├── formatters.ts        # Date, number, string formatting
│   │       └── fileUpload.ts        # S3 presigned URL handling
│   │
│   ├── store/                         # Redux Toolkit state management
│   │   ├── slices/
│   │   │   ├── authSlice.ts         # Auth state (user, roles, token)
│   │   │   ├── candidateSlice.ts    # Candidate pipeline state
│   │   │   ├── bookingSlice.ts      # Booking/calendar state
│   │   │   ├── feedbackSlice.ts     # Feedback form state
│   │   │   ├── workflowSlice.ts     # Workflow/approval state
│   │   │   ├── adminSlice.ts        # Master data state
│   │   │   ├── referralSlice.ts     # Referral portal state
│   │   │   ├── uiSlice.ts           # UI state (modals, toasts)
│   │   │   └── filtersSlice.ts      # Global filter state
│   │   ├── selectors/                # Redux selectors (memoized)
│   │   │   ├── authSelectors.ts
│   │   │   ├── candidateSelectors.ts
│   │   │   └── [... other selectors]
│   │   └── store.ts                  # Redux store configuration
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── useAuth.ts               # Authentication hook
│   │   ├── useRole.ts               # Role-based logic hook
│   │   ├── useCandidates.ts         # Candidate data fetching (React Query)
│   │   ├── useBooking.ts            # Booking operations
│   │   ├── useFeedback.ts           # Feedback form logic
│   │   ├── useWorkflow.ts           # Workflow approval logic
│   │   ├── useApi.ts                # Generic API call wrapper
│   │   ├── useDebounce.ts           # Debounce hook
│   │   ├── useLocalStorage.ts       # localStorage hook
│   │   └── usePagination.ts         # Pagination state
│   │
│   ├── navigation/                    # React Router configuration
│   │   ├── routes.ts                # Route definitions (lazy-loaded)
│   │   ├── PrivateRoute.tsx          # Auth guard component
│   │   ├── RoleRoute.tsx             # Role-based route guard
│   │   └── AppRouter.tsx             # Router structure
│   │
│   ├── theme/                         # Design tokens & styling
│   │   ├── colors.ts                # Color palette
│   │   ├── typography.ts            # Font sizes, weights
│   │   ├── spacing.ts               # Margin/padding scale
│   │   ├── breakpoints.ts           # Responsive breakpoints
│   │   ├── theme.ts                 # Tailwind/CSS-in-JS config
│   │   └── globals.css              # Global styles
│   │
│   ├── types/                         # Shared TypeScript interfaces
│   │   ├── auth.ts                  # Auth-related types
│   │   ├── candidate.ts             # Candidate domain types
│   │   ├── booking.ts               # Booking domain types
│   │   ├── feedback.ts              # Feedback domain types
│   │   ├── workflow.ts              # Workflow domain types
│   │   ├── common.ts                # Common types (pagination, errors)
│   │   └── index.ts                 # Type exports
│   │
│   ├── utils/                         # Utility functions
│   │   ├── constants.ts             # App-wide constants
│   │   ├── errorHandler.ts          # Centralized error handling
│   │   ├── logger.ts                # Logging utility
│   │   ├── dateHelpers.ts           # Date manipulation
│   │   └── string.ts                # String utilities
│   │
│   ├── __tests__/                     # Test suite
│   │   ├── unit/                     # Unit tests per component/hook
│   │   ├── integration/              # Screen-level integration tests
│   │   └── mocks/                    # Mock data, MSW handlers
│   │
│   ├── App.tsx                        # Root component
│   └── main.tsx                       # Entry point (Vite)
│
├── index.html                         # HTML template
├── vite.config.ts                     # Vite build config
├── tsconfig.json                      # TypeScript config (strict mode)
├── tailwind.config.js                 # Tailwind CSS config (if used)
├── .eslintrc.json                     # ESLint config
├── .prettierrc.json                   # Prettier config
├── jest.config.js                     # Jest/Vitest config
├── package.json                       # Dependencies
└── .env.example                       # Environment variables template

__tests__/
├── e2e/
│   ├── auth.spec.ts                 # Auth flow E2E tests
│   ├── candidate-pipeline.spec.ts   # Candidate pipeline E2E tests
│   ├── scheduling.spec.ts           # Scheduling E2E tests
│   └── feedback.spec.ts             # Feedback E2E tests
│
└── setup/
    ├── db.ts                        # Test database fixtures
    └── mocks.ts                     # MSW setup
```

**Structure Decision**: Single monolithic React SPA with feature-based screen organization and shared component/service/store layers. This structure aligns with the spec's 10+ feature modules and supports lazy-loading per route for performance. No separate backend in scope—frontend consumes existing backend APIs. Tailwind CSS + TypeScript + Vite for fast development experience.

## Complexity Tracking

No constitutional violations requiring justification. All core principles can be met with standard React + TypeScript patterns:
- Component-driven: Functional components, custom hooks, reusable component library
- Performance: Code splitting, lazy loading, memoization, virtualization for lists
- TDD: Vitest + RTL for unit/component tests; Playwright for E2E; 80%+ coverage targets
- Type Safety: TypeScript strict mode; Zod for runtime validation; Redux types fully typed
- SPA Consistency: React Router provides URL-driven state management
- API & State: Redux Toolkit + React Query for unified state; centralized Axios service
- Security: JWT stored in memory/secure storage; no PII logging; input validation

No additional patterns or workarounds needed.

---

## Phase 0: Research & Clarification *(To be executed during /speckit.plan)*

### Research Tasks

1. **Keycloak SSO Integration Best Practices**
   - Explore oidc-client-ts vs keycloak-js SDK
   - Token refresh flow and expiration handling
   - PKCE flow for SPAs
   - Mapping JWT claims to app roles

2. **Large Dataset Rendering Optimization**
   - React Table v8 + TanStack Query for 100k+ candidate records
   - Virtual scrolling strategies (React Window vs react-virtual vs native browser IntersectionObserver)
   - Server-side pagination vs client-side caching trade-offs
   - Debouncing/throttling search and filter inputs

3. **Highcharts / Recharts / Chart.js Comparison**
   - Performance with large datasets (1000+ data points)
   - Interactivity (zooming, legends, drill-down)
   - Customization for SmartHire branding
   - License considerations (open-source vs commercial)

4. **Redux Toolkit with React Query**
   - When to use Redux vs React Query for server state
   - Cache invalidation strategies
   - Normalized state shape for candidate/booking/feedback entities
   - Performance implications of both

5. **Form Validation (React Hook Form + Zod)**
   - Async validation for candidate email uniqueness, skill lookup
   - Complex conditional validation (BU-specific fields)
   - Multi-step form patterns (Weekend Drive with dynamic fields)
   - Error messaging and retry logic

6. **Testing Strategy for Role-Based UIs**
   - Mocking different user roles (14 roles × critical flows = 140+ test scenarios)
   - MSW for API mocking; fixtures for different user states
   - E2E testing role-specific workflows with Playwright

7. **State Management for Complex Workflows**
   - Multi-step approval workflow state (candidate transitions through 4 approvers)
   - Booking form with calendar interaction (reschedule, multi-day patterns)
   - Feedback form revisit mode (editable vs finalized state)
   - Optimistic UI updates with rollback on failure

8. **S3 Presigned URL Handling**
   - Frontend fetch of presigned URLs from backend
   - Upload/download logic for documents (resume, email, feedback PDFs)
   - Error handling if URL expires
   - CORS configuration for file operations

### Output: research.md

Research document will consolidate findings with decisions:
- Selected SSO SDK (keycloak-js recommended for simplicity)
- Selected table library (React Table v8 + React Window for virtual scrolling)
- Selected charting library (Recharts for balance of features/performance/license)
- Redux + React Query layering strategy
- Zod schema approach for form validation
- Mock Service Worker (MSW) for testing
- Playwright for E2E; RTL for component tests

---

## Phase 1: Design & Contracts *(To be executed during /speckit.plan)*

### 1. Data Model Extraction → `data-model.md`

Entities and relationships from spec:

**Core Entities:**
- Employee (user profile: email, name, employee_id, BU, practice, skills, roles)
- Candidate (hiring prospect: name, email, contact, experience, status, source, grade, location, photo)
- InterviewBooking (calendar event: start_time, end_time, candidate_id, interviewer_id, interview_type, status, feedback_status)
- FeedbackForm (submission: candidate_id, interviewer_id, skill_ratings, behavioral_scores, feedback_status)
- WorkflowApproval (multi-step: candidate_id, approver_id, approval_stage, decision, comments, timestamp)
- ReferralCandidate (referral submission: referrer_id, referral_date, candidate_id, source)
- MasterData (towers, skills, sources, vendors, etc.)
- DemandSupply (hiring demand tracking: BU, practice, skill, open_demand, active_candidates, gap)

**Relationships:**
- Employee → InterviewBooking (one-to-many; interviewer creates slots)
- Employee → WorkflowApproval (one-to-many; lead approves candidates)
- Candidate ← InterviewBooking (one-to-many; candidate has many bookings)
- Candidate ← FeedbackForm (one-to-many; candidate has many feedback submissions)
- Candidate ← WorkflowApproval (one-to-many; candidate transitions through approval chain)
- ReferralCandidate → Candidate (one-to-one; referral maps to candidate record)

**Validation Rules (Zod Schemas):**
- Candidate email: unique, valid email format
- Contact: numeric, 10+ digits
- Experience: non-negative decimal, relevant ≤ total
- Interview slot time: >= 8:00 AM, <= 8:00 PM, future dates only
- Feedback status: Select | Reject | Hold; reject requires comments
- Approval decision: Approve | Reject | Hold; reject requires comments
- File upload: resume (PDF/DOC only), email (.msg only), single dot in filename

### 2. API Contract → `contracts/api-contract.md`

REST endpoints consumed by frontend, organized by domain:

**Authentication**
- POST `/auth/login` → JWT token + user roles
- GET `/auth/me` → current user profile
- POST `/auth/logout` → invalidate session
- POST `/auth/refresh` → new JWT token

**Candidate Pipeline**
- POST `/candidates/search` (body: filters, pagination) → candidate list + metadata
- GET `/candidates/{id}` → candidate detail
- POST `/candidates` → create candidate (weekend drive)
- PUT `/candidates/{id}` → update candidate
- POST `/candidates/{id}/status` → change status
- POST `/candidates/{id}/comments` → add comment
- POST `/candidates/upload` (multipart) → bulk import Excel
- DELETE `/candidates/{id}` → soft delete

**Interview Scheduling**
- POST `/bookings/slots` (body: month, interviewer_id) → calendar slots
- POST `/bookings/create` → create booking
- PUT `/bookings/{id}` → reschedule booking
- DELETE `/bookings/{id}` → cancel booking
- GET `/bookings/panel-availability` → all interviewers + slots
- POST `/bookings/panel-upload` (multipart) → bulk panel slot import

**Feedback**
- GET `/feedback/template/{slot_id}` → dynamic form template
- POST `/feedback/submit` → save feedback form
- GET `/feedback/{candidate_id}` → retrieve previous feedback

**Workflow / Approvals**
- POST `/workflow/candidates` (body: role, filters) → approval queue
- POST `/workflow/approve` → approve candidate
- POST `/workflow/reject` (body: candidate_id, comments) → reject with mandatory comments
- POST `/workflow/hold` → hold candidate
- GET `/workflow/history/{candidate_id}` → approval chain history

**Admin / Master Data**
- GET `/admin/categories` → list available categories (towers, skills, etc.)
- GET `/admin/towers` → all towers
- POST `/admin/towers` → create tower
- PUT `/admin/towers/{id}` → update tower
- DELETE `/admin/towers/{id}` → delete tower (blocked if in use)
- [... similar CRUD for skills, sources, vendors, feedback forms, mappings, etc.]

**Referral Portal** (separate auth context)
- POST `/referral/register` → SPOC registration
- POST `/referral/form` → submit referral candidate
- GET `/referral/candidates` → list referred candidates
- POST `/referral/upload` (multipart) → bulk referral import

**Reports / Analytics**
- POST `/reports/rejection-ratio` (body: filters) → pie chart data
- POST `/reports/panel-insights` → panel performance data
- POST `/reports/trend-chart` (body: date_range) → time-series data
- POST `/reports/l2-aging` → L2 stuck candidates
- [... other report endpoints]

### 3. Redux State Contract → `contracts/redux-contract.md`

Redux Toolkit slices and shape:

```typescript
// Redux State Shape (TypeScript)
type RootState = {
  auth: AuthState;
  candidates: CandidateState;
  booking: BookingState;
  feedback: FeedbackState;
  workflow: WorkflowState;
  admin: AdminState;
  referral: ReferralState;
  ui: UIState;
  filters: FilterState;
};

// Auth Slice
type AuthState = {
  user: Employee | null;
  roles: Role[];
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
};

// Candidate Slice
type CandidateState = {
  list: Candidate[];
  selected: Candidate | null;
  isLoading: boolean;
  pagination: { page: number; pageSize: number; total: number };
  error: string | null;
};

// Booking/Calendar Slice
type BookingState = {
  slots: InterviewBooking[];
  selected: InterviewBooking | null;
  currentMonth: Date;
  isLoading: boolean;
  error: string | null;
};

// Feedback Slice
type FeedbackState = {
  form: FeedbackForm | null;
  isSubmitting: boolean;
  isRevisiting: boolean;
  error: string | null;
};

// Workflow/Approval Slice
type WorkflowState = {
  queue: Candidate[]; // candidates awaiting approval by current user
  selected: Candidate | null;
  isApproving: boolean;
  error: string | null;
};

// UI Slice
type UIState = {
  modals: { [key: string]: boolean }; // modal open/close state
  toasts: Toast[];
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
};

// Filters Slice
type FilterState = {
  candidates: CandidateFilters; // technology, BU, source, status, date range
  bookings: BookingFilters;
  reports: ReportFilters;
};
```

Selectors (memoized with Reselect):
- `selectCurrentUser()` → Employee | null
- `selectUserRoles()` → Role[]
- `selectCandidateList()` → Candidate[]
- `selectCandidate(id)` → Candidate | null
- `selectBookingSlots(month)` → InterviewBooking[]
- `selectWorkflowQueue()` → Candidate[]

### 4. Quick Start Guide → `quickstart.md`

Instructions for local development setup (cloning, installing deps, running dev server, accessing local app)

---

## Phase 1 Outputs

✅ `research.md` — Dependency/best-practice research with decisions
✅ `data-model.md` — Entity definitions, relationships, validation schemas
✅ `contracts/api-contract.md` — REST API endpoint reference
✅ `contracts/redux-contract.md` — Redux state shape and selectors
✅ `quickstart.md` — Developer setup and local run instructions

---

## Phase 2: Task Generation

Phase 2 (handled by `/speckit.tasks` command, not executed here) will:
1. Read design artifacts from Phase 1
2. Generate actionable, dependency-ordered tasks in `tasks.md`
3. Each task maps to specific component/service/hook implementation
4. Tasks support parallel development across teams

---

**Implementation Ready**: All design artifacts completed. Proceed to `/speckit.tasks` to generate implementation tasks.
