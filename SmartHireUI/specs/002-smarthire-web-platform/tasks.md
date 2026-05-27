# Implementation Tasks: SmartHire Web Platform

**Feature Branch**: `002-smarthire-web-platform` | **Date**: 2026-05-22

**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Phase 1: Project Setup & Infrastructure

### 1.1 Project Initialization

- [X] T001 Initialize React + Vite project with TypeScript strict mode (`app/` root directory)
- [X] T002 Configure TypeScript (`app/tsconfig.json`) with strict: true, resolveJsonModule, baseUrl paths
- [X] T003 [P] Configure ESLint + Prettier (`app/.eslintrc.json`, `app/.prettierrc.json`)
- [X] T004 [P] Configure Tailwind CSS (`app/tailwind.config.js`, `app/src/theme/globals.css`)
- [X] T005 [P] Create directory structure per plan (`app/src/screens`, `app/src/components`, `app/src/services`, `app/src/store`, `app/src/hooks`, `app/src/types`, `app/src/__tests__`)

### 1.2 Dependencies & Environment

- [X] T006 [P] Install primary dependencies: React Router v7, Redux Toolkit, React Query, Axios, Zod, React Hook Form, Recharts, React Table v8, React Window
- [X] T007 [P] Install testing dependencies: Vitest, @testing-library/react, @testing-library/user-event, msw (Mock Service Worker), @playwright/test
- [X] T008 [P] Create `.env.example` template with Keycloak URL, API base URL, and feature flags
- [X] T009 [P] Configure Vite (`app/vite.config.ts`) with code splitting, lazy loading, bundle analysis

### 1.3 Testing Infrastructure

- [X] T010 [P] Configure Vitest (`app/vitest.config.ts`) with jsdom environment, globals setup
- [X] T011 [P] Create test setup file (`app/src/__tests__/setup.ts`) with RTL configuration
- [X] T012 [P] Configure Mock Service Worker (`app/src/__tests__/mocks/handlers.ts`, `app/src/__tests__/mocks/server.ts`)
- [X] T013 [P] Configure Playwright (`playwright.config.ts`) for E2E smoke tests with Chrome, Firefox, Safari

---

## Phase 2: Foundation Layer (Shared Infrastructure)

### 2.1 API Client & HTTP Interceptors

- [X] T014 Create Axios client with interceptors (`app/src/services/api/client.ts`): auth header injection, error handling, token refresh logic
- [X] T015 [P] Create API type definitions (`app/src/services/api/types.ts`): request/response DTOs, error types, pagination meta
- [X] T016 Test Axios client (`app/src/__tests__/unit/services/api/client.test.ts`): interceptor attachment, header injection, error propagation

### 2.2 Authentication & Keycloak Integration

- [X] T017 Create Keycloak service (`app/src/services/auth/keycloak.ts`): SSO initialization, token exchange, user profile fetch
- [X] T018 [P] Create token manager (`app/src/services/auth/tokenManager.ts`): token storage, expiry validation, refresh logic
- [X] T019 [P] Create role service (`app/src/services/auth/roleService.ts`): role mapping from JWT claims, role-based permission checks
- [X] T020 Test authentication services (`app/src/__tests__/unit/services/auth/`): token validation, role extraction, expiry handling

### 2.3 Redux Store Setup

- [X] T021 Create Redux store configuration (`app/src/store/store.ts`): combine slices, middleware setup, dev tools
- [X] T022 [P] Create auth slice (`app/src/store/slices/authSlice.ts`): user state, token, roles, login/logout reducers
- [X] T023 [P] Create UI slice (`app/src/store/slices/uiSlice.ts`): modals, toasts, sidebar state, theme
- [X] T024 [P] Create filters slice (`app/src/store/slices/filtersSlice.ts`): global filter state (candidates, bookings, reports)
- [X] T025 [P] Create auth selectors (`app/src/store/selectors/authSelectors.ts`): memoized selectors for user, roles, isAuthenticated
- [X] T026 [P] Create UI selectors (`app/src/store/selectors/uiSelectors.ts`): modal state, toast list, sidebar toggle
- [X] T027 Test Redux store (`app/src/__tests__/unit/store/`): reducer logic, selectors memoization, middleware

### 2.4 Custom Hooks (Foundation)

- [X] T028 Create useAuth hook (`app/src/hooks/useAuth.ts`): login, logout, token refresh, current user
- [X] T029 [P] Create useRole hook (`app/src/hooks/useRole.ts`): check user role, permission validation
- [X] T030 [P] Create useApi hook (`app/src/hooks/useApi.ts`): generic API call wrapper with loading/error state
- [X] T031 [P] Create useLocalStorage hook (`app/src/hooks/useLocalStorage.ts`): safe localStorage access with encryption
- [X] T032 [P] Create useDebounce hook (`app/src/hooks/useDebounce.ts`): debounce values for search/filter inputs
- [X] T033 [P] Create usePagination hook (`app/src/hooks/usePagination.ts`): pagination state management
- [X] T034 Test custom hooks (`app/src/__tests__/unit/hooks/`): hook behavior, state updates, side effects

### 2.5 Common UI Components

- [X] T035 Create Header component (`app/src/components/common/Header.tsx`): logo, user profile, logout button
- [X] T036 [P] Create Sidebar component (`app/src/components/common/Sidebar.tsx`): role-based navigation menu, collapsible
- [X] T037 [P] Create RoleBasedNav component (`app/src/components/common/RoleBasedNav.tsx`): route links per user role
- [X] T038 [P] Create ToastNotification component (`app/src/components/common/ToastNotification.tsx`): display error/success messages
- [X] T039 [P] Create ConfirmDialog component (`app/src/components/common/ConfirmDialog.tsx`): reusable confirmation modal
- [X] T040 [P] Create Layout wrapper (`app/src/components/common/Layout.tsx`): Header + Sidebar + main content area
- [X] T041 Test common components (`app/src/__tests__/unit/components/common/`): render, props validation, accessibility

### 2.6 React Router & Navigation Guards

- [X] T042 Create route configuration (`app/src/navigation/routes.ts`): lazy-loaded route definitions, path mapping
- [X] T043 [P] Create PrivateRoute guard (`app/src/navigation/PrivateRoute.tsx`): auth check, redirect to login if unauthorized
- [X] T044 [P] Create RoleRoute guard (`app/src/navigation/RoleRoute.tsx`): role check, redirect if role mismatch
- [X] T045 [P] Create AppRouter component (`app/src/navigation/AppRouter.tsx`): router structure, nested routes per feature
- [X] T046 Test routing (`app/src/__tests__/integration/navigation/`): guard behavior, redirects, protected routes

### 2.7 Form Validation & Schemas

- [X] T047 Create Zod validators (`app/src/services/utils/validators.ts`): schemas for candidate form, booking, feedback, etc.
- [X] T048 [P] Create formatters (`app/src/services/utils/formatters.ts`): date format, currency, experience display
- [X] T049 [P] Create error handler (`app/src/utils/errorHandler.ts`): standardize error messages for UI display
- [X] T050 [P] Create constants (`app/src/utils/constants.ts`): API endpoints, role names, status values, business rules
- [X] T051 Test validation schemas (`app/src/__tests__/unit/services/utils/`): schema validation, error messages

---

## Phase 3: Authentication & Onboarding (User Story 1)

### User Story 1: Employee Authentication and Role-Based Dashboard (Priority: P1)

**Goal**: Employees log in via Keycloak SSO, receive JWT tokens, and are routed to role-specific dashboards.

**Independent Test**: SSO login → JWT stored → role-based redirect → guard prevents unauthorized access

**Acceptance Criteria**:
1. Keycloak SSO redirects to `/home`
2. JWT token stored in localStorage + Redux
3. User roles fetched and mapped
4. Role-specific dashboard displayed (e.g., `/todolist` for Recruiter, `/work-flow` for Tower Lead)
5. Unauthorized role access redirected to home

#### Tasks

- [X] T052 Create types for auth domain (`app/src/types/auth.ts`): Employee, JwtPayload, Role enum, RoleMapping
- [X] T053 [P] Create auth API client (`app/src/services/api/auth.ts`): login, getProfile, fetchEmpRoles, logout, refreshToken endpoints
- [X] T054 [P] Extend auth slice with thunks (`app/src/store/slices/authSlice.ts`): loginUser, logoutUser, fetchRoles async thunks
- [X] T055 Create useAuth hook advanced logic (`app/src/hooks/useAuth.ts`): login, logout, check token expiry on app init
- [X] T056 Create LoginScreen (`app/src/screens/auth/LoginScreen.tsx`): Keycloak redirect trigger, loading state
- [X] T057 Create role-specific dashboard routing (`app/src/navigation/routes.ts`): map role → home route (e.g., Recruiter → `/todolist`)
- [X] T058 Create APP_INITIALIZER equivalent (`app/src/App.tsx`): initialize Keycloak on app load, fetch current user
- [X] T059 Test authentication flow (`app/src/__tests__/integration/auth/`): SSO redirect, token storage, role fetch, dashboard redirect
- [X] T060 E2E test: User can login with SSO and be redirected to role dashboard (`__tests__/e2e/auth.spec.ts`)

---

## Phase 4: Candidate Pipeline Management (User Story 2)

### User Story 2: Recruiter/PMO Candidate Pipeline Management (Priority: P1)

**Goal**: Recruiters manage paginated candidate table with filtering, bulk Excel upload, status changes, and detail viewing.

**Independent Test**: Upload candidates → apply filters → change status → view details → export to Excel

**Acceptance Criteria**:
1. Upload Excel file with candidate batch
2. Table displays candidates with pagination
3. Filters applied (Technology, BU, Source, Status, Date)
4. Status dropdown changes candidate status
5. Navigate to candidate details
6. Export filtered table to Excel

#### Tasks

- [x] T061 Create types for candidate domain (`app/src/types/candidate.ts`): Candidate, CandidateFilter, CandidateStatus enum, UploadResult
- [x] T062 [P] Create candidate API client (`app/src/services/api/candidates.ts`): search, getById, create, updateStatus, addComment, delete, upload, export endpoints
- [x] T063 Create candidate slice (`app/src/store/slices/candidateSlice.ts`): list, selected, pagination, loading, error, async thunks
- [x] T064 Create candidate selectors (`app/src/store/selectors/candidateSelectors.ts`): filteredList, selected, totalPages, isLoading
- [x] T065 Create CandidateTable component (`app/src/components/tables/CandidateTable.tsx`): virtualized list with React Table, columns: Name, Contact, Email, Skill, Status, LastModified, AgingDays
- [x] T066 [P] Create FilterPanel component (`app/src/components/forms/FilterPanel.tsx`): Technology, BU, Source, Status, Date range filters with apply/reset buttons
- [x] T067 [P] Create SearchInput component (`app/src/components/forms/SearchInput.tsx`): debounced search with autocomplete
- [x] T068 Create FileUploadComponent (`app/src/components/forms/FileUpload.tsx`): drag-drop Excel file upload, validation, error feedback
- [x] T069 Create PipelineScreen (`app/src/screens/candidate/PipelineScreen.tsx`): layout with FilterPanel, FileUpload, CandidateTable, ExportButton
- [x] T070 [P] Create CandidateForm component (`app/src/components/forms/CandidateForm.tsx`): form for candidate fields (name, email, contact, skill, etc.)
- [x] T071 Create candidate API integration tests (`app/src/__tests__/unit/services/api/candidates.test.ts`): mock API calls
- [x] T072 Create CandidateTable component tests (`app/src/__tests__/unit/components/tables/CandidateTable.test.tsx`): render columns, sorting, pagination
- [x] T073 Create FilterPanel component tests (`app/src/__tests__/unit/components/forms/FilterPanel.test.tsx`): filter state changes, apply/reset
- [x] T074 Create PipelineScreen integration test (`app/src/__tests__/integration/screens/candidate/PipelineScreen.test.tsx`): upload, filter, status change workflow
- [x] T075 E2E test: Upload candidates, filter, change status, export (`__tests__/e2e/candidate-pipeline.spec.ts`)

---

## Phase 5: Interview Scheduling (User Story 3)

### User Story 3: Interviewer Calendar and Slot Management (Priority: P1)

**Goal**: Interviewers create availability slots (30-min increments, 8 AM - 8 PM); Recruiters book candidates into slots; calendar color-codes by status.

**Independent Test**: Create slots → book candidate → feedback submission → calendar color updates

**Acceptance Criteria**:
1. Interviewer creates availability slots on calendar
2. Recruiter books candidate into available slot
3. Calendar color-codes: Green (interviewed), Pink (booked), Grey (available), Yellow (NA)
4. Multi-slot booking (4 or 8 hours)
5. Reschedule existing booking

#### Tasks

- [x] T076 Create types for booking domain (`app/src/types/booking.ts`): BookingEvent, SlotStatus enum, InterviewType enum, BookingForm, CalendarMonth
- [x] T077 [P] Create scheduling API client (`app/src/services/api/scheduling.ts`): getSlots, createSlot, bookCandidate, updateBooking, deleteBooking, getPanelAvailability endpoints
- [x] T078 Create booking slice (`app/src/store/slices/bookingSlice.ts`): slots, selected, currentMonth, loading, error, async thunks
- [x] T079 Create booking selectors (`app/src/store/selectors/bookingSelectors.ts`): getSlotsByMonth, getSlot, getSlotsByStatus, getDayAggregates
- [x] T080 Create InterviewCalendar component (`app/src/components/calendar/InterviewCalendar.tsx`): month view with color-coded slots, day-level counts
- [x] T081 [P] Create SlotCell component (`app/src/components/calendar/SlotCell.tsx`): individual slot display with color, candidate name, status
- [x] T082 Create BookingFormScreen (`app/src/screens/scheduling/BookingFormScreen.tsx`): Interviewer booking form (date, time, multi-slot toggle, participation type) + Recruiter booking form (candidate, interview type, tech, comments)
- [x] T083 [P] Create BookingForm component (`app/src/components/forms/BookingForm.tsx`): form with fields per role (interviewer vs recruiter)
- [x] T084 Create BookingViewScreen (`app/src/screens/scheduling/BookingViewScreen.tsx`): tabs for Available, Booked, Interviewed, Panel Availability
- [x] T085 Create DashboardScreen (Calendar view) (`app/src/screens/scheduling/DashboardScreen.tsx`): route to `/dashboard`, render InterviewCalendar + filter
- [x] T086 [P] Create PanelAvailabilityScreen (`app/src/screens/scheduling/PanelAvailabilityScreen.tsx`): grid of interviewers with availability
- [x] T087 Create scheduling API tests (`app/src/__tests__/unit/services/api/scheduling.test.ts`): API call mocking
- [x] T088 Create calendar component tests (`app/src/__tests__/unit/components/calendar/InterviewCalendar.test.tsx`): render slots, color coding, day counts
- [x] T089 Create booking form tests (`app/src/__tests__/unit/components/forms/BookingForm.test.tsx`): form validation, multi-slot logic, date range
- [x] T090 Create DashboardScreen integration test (`app/src/__tests__/integration/screens/scheduling/DashboardScreen.test.tsx`): calendar load, slot interaction
- [x] T091 E2E test: Create slot, book candidate, change interview status (`__tests__/e2e/scheduling.spec.ts`)

---

## Phase 6: Feedback Submission (User Story 4)

### User Story 4: Interviewer Feedback Submission (Priority: P1)

**Goal**: Interviewers complete post-interview feedback forms with dynamic skill ratings, behavioral assessments, and status selection. Forms can be revisited and edited.

**Independent Test**: Load form → fill ratings + remarks → select status → submit → revisit and edit

**Acceptance Criteria**:
1. Form pre-populated with candidate, slot, feedback template
2. Technical evaluation section with skill ratings (1-5) and remarks
3. Behavioral evaluation section (dynamic from template)
4. Overall remark and feedback status required
5. Revisit mode for editing previously submitted feedback

#### Tasks

- [x] T092 Create types for feedback domain (`app/src/types/feedback.ts`): FeedbackForm, FeedbackStatus enum, SkillRating, BehavioralEval, FeedbackTemplate
- [x] T093 [P] Create feedback API client (`app/src/services/api/feedback.ts`): getTemplate, submitFeedback, getFeedback, getRevisitFeedback endpoints
- [x] T094 Create feedback slice (`app/src/store/slices/feedbackSlice.ts`): form, isSubmitting, isRevisiting, template, loading, error, async thunks
- [x] T095 Create FeedbackTemplate component (`app/src/components/feedback/FeedbackTemplate.tsx`): dynamic form rendering per template structure
- [x] T096 Create FeedbackFormScreen (`app/src/screens/feedback/FeedbackFormScreen.tsx`): layout with candidate info (read-only), technical eval section, behavioral eval section, overall remark dropdown, status dropdown
- [x] T097 Create feedback form validation (`app/src/services/utils/validators.ts`): Zod schema for feedback—Technical Area 1 required, status required, comments required on reject
- [x] T098 [P] Create useFeedback hook (`app/src/hooks/useFeedback.ts`): load template, submit form, revisit logic
- [x] T099 Create feedback API tests (`app/src/__tests__/unit/services/api/feedback.test.ts`): template fetch, submit, revisit endpoints
- [x] T100 Create FeedbackTemplate tests (`app/src/__tests__/unit/components/feedback/FeedbackTemplate.test.tsx`): dynamic field rendering
- [x] T101 Create FeedbackFormScreen tests (`app/src/__tests__/integration/screens/feedback/FeedbackFormScreen.test.tsx`): form population, validation, submission, revisit
- [x] T102 E2E test: Complete feedback form, submit, revisit and edit (`__tests__/e2e/feedback.spec.ts`)

---

## Phase 7: Workflow Approval Chain (User Story 5)

### User Story 5: Workflow Approval Chain (Priority: P2)

**Goal**: Multi-step approval workflow routes candidates through Tower Lead → SL-BU Lead → NA Lead → Recruiter Lead. Each approver can approve, reject (with mandatory comments), or hold candidates.

**Independent Test**: Tower Lead approves → candidate moves to SL-BU Lead → SL-BU rejects with comment → status updates to Rejected

**Acceptance Criteria**:
1. Approver sees only candidates in their approval queue
2. Approve button moves candidate to next stage
3. Reject button requires comment before submission
4. Hold button flags candidate for later review
5. Approval history visible with approver name, decision, timestamp

#### Tasks

- [x] T103 Create types for workflow domain (`app/src/types/workflow.ts`): WorkflowApproval, ApprovalStage enum, ApprovalDecision enum, ApprovalHistory
- [x] T104 [P] Create workflow API client (`app/src/services/api/workflow.ts`): getCandidates, approveCandidates, rejectCandidates, holdCandidates, getHistory endpoints
- [x] T105 Create workflow slice (`app/src/store/slices/workflowSlice.ts`): queue, selected, isApproving, error, async thunks
- [x] T106 Create workflow selectors (`app/src/store/selectors/workflowSelectors.ts`): getApprovalQueue, getSelected, getApprovalHistory
- [x] T107 Create WorkflowQueue component (`app/src/components/tables/WorkflowQueue.tsx`): table of candidates pending approval per role
- [x] T108 Create WorkflowScreen (`app/src/screens/workflow/WorkflowScreen.tsx`): WorkflowQueue + action buttons (Approve, Reject, Hold)
- [x] T109 Create WorkflowInfoScreen (`app/src/screens/workflow/WorkflowInfoScreen.tsx`): approval chain history with approver, decision, timestamp, comments
- [x] T110 Create approval action form (`app/src/components/forms/ApprovalForm.tsx`): Approve/Reject/Hold actions with comment input (mandatory for reject)
- [x] T111 [P] Create useWorkflow hook (`app/src/hooks/useWorkflow.ts`): approve, reject, hold, fetch history logic
- [x] T112 Create workflow API tests (`app/src/__tests__/unit/services/api/workflow.test.ts`): API call mocking
- [x] T113 Create WorkflowQueue tests (`app/src/__tests__/unit/components/tables/WorkflowQueue.test.tsx`): render candidates, action buttons
- [x] T114 Create WorkflowScreen tests (`app/src/__tests__/integration/screens/workflow/WorkflowScreen.test.tsx`): queue load, approval actions, error handling
- [x] T115 E2E test: Tower Lead approves, then SL-BU Lead rejects with comment (`__tests__/e2e/workflow.spec.ts`)

---

## Phase 8: Master Data Administration (User Story 6)

### User Story 6: Master Data Administration (Priority: P2)

**Goal**: Admin/BU Admin manage reference data (towers, skills, sources, vendors, feedback forms, mappings) with role-based access control and grid-based CRUD UI.

**Independent Test**: Create tower → edit tower → delete tower (blocked if in use) → export to Excel

**Acceptance Criteria**:
1. Category list in left sidebar (Tower, Skill, Source, Vendor, etc.)
2. Grid displays records for selected category
3. Add/Edit/Delete popups per category
4. BU Admin limited to own BU data
5. Deletion blocked if record in use

#### Tasks

- [x] T116 Create types for admin domain (`app/src/types/admin.ts`): MasterData, DataCategory enum, CategoryFields, AdminActions
- [x] T117 [P] Create admin API client (`app/src/services/api/admin.ts`): getCategoryList, fetchCategory, addRecord, updateRecord, deleteRecord endpoints (12+ categories)
- [x] T118 Create admin slice (`app/src/store/slices/adminSlice.ts`): selectedCategory, records, loading, error, async thunks
- [x] T119 Create admin selectors (`app/src/store/selectors/adminSelectors.ts`): getRecords, getSelectedCategory, isRecordInUse
- [x] T120 Create MasterDataGrid component (`app/src/components/tables/MasterDataGrid.tsx`): generic grid for any category with Add/Edit/Delete buttons
- [x] T121 [P] Create CategorySidebar component (`app/src/components/common/CategorySidebar.tsx`): list of categories, selected highlight, click to load
- [x] T122 Create MasterDataScreen (`app/src/screens/admin/MasterDataScreen.tsx`): layout with CategorySidebar + MasterDataGrid
- [x] T123 Create generic MasterDataForm component (`app/src/components/forms/MasterDataForm.tsx`): dynamic form based on category schema
- [x] T124 [P] Create ChangeRolesScreen (`app/src/screens/admin/ChangeRolesScreen.tsx`): employee email search, new roles multi-select, update button
- [x] T125 [P] Create DemandSupplyScreen (`app/src/screens/admin/DemandSupplyScreen.tsx`): grid with BU, Practice, Skill, Open Demand, Active Candidates, Gap columns
- [x] T126 Create admin API tests (`app/src/__tests__/unit/services/api/admin.test.ts`): API mocking for all categories
- [x] T127 Create MasterDataGrid tests (`app/src/__tests__/unit/components/tables/MasterDataGrid.test.tsx`): generic grid rendering
- [x] T128 Create MasterDataScreen tests (`app/src/__tests__/integration/screens/admin/MasterDataScreen.test.tsx`): category select, grid load, CRUD operations
- [x] T129 E2E test: Create tower, edit, delete (blocked if in use), verify export (`__tests__/e2e/admin.spec.ts`)

---

## Phase 9: Referral Portal (User Story 7)

### User Story 7: Referral Portal (Priority: P2)

**Goal**: Separate authentication system for Referral SPOCs to submit and track referred candidates. Admin views all referrals with analytics and export.

**Independent Test**: SPOC registers → submits referral → views own referrals → Admin views all + exports

**Acceptance Criteria**:
1. Separate referral authentication (localStorage["refrole"])
2. SPOC registration with Employee ID, Name, Email, Role, BU
3. Referral form with candidate info + resume upload
4. SPOC views own referred candidates
5. Admin views all referrals with BU/account grouping + analytics

#### Tasks

- [x] T130 Create types for referral domain (`app/src/types/referral.ts`): ReferralUser, ReferralCandidate, ReferralAnalytics, ReferralReport
- [x] T131 [P] Create referral API client (`app/src/services/api/referral.ts`): register, submitReferral, getCandidates, getAnalytics, export endpoints
- [x] T132 Create referral slice (`app/src/store/slices/referralSlice.ts`): user, candidates, analytics, loading, error, async thunks
- [x] T133 [P] Create referral-specific auth service (`app/src/services/auth/referralAuth.ts`): separate from main auth, localStorage-based
- [x] T134 Create ReferralRegisterScreen (`app/src/screens/referral/ReferralRegisterScreen.tsx`): form for Employee ID, Name, Email, Role (SPOC/Candidate), BU
- [x] T135 Create ReferralFormScreen (`app/src/screens/referral/ReferralFormScreen.tsx`): form with candidate name, contact, email, experience, skill, resume upload
- [x] T136 [P] Create RefCandidateDetailsScreen (`app/src/screens/referral/RefCandidateDetailsScreen.tsx`): table of SPOC's referred candidates with status, date referred
- [x] T137 [P] Create CandidateReferralScreen (`app/src/screens/referral/CandidateReferralScreen.tsx`): admin view of all referrals with filtering + export
- [x] T138 Create referral analytics components (`app/src/components/charts/ReferralAnalytics.tsx`): pie chart (referrals by BU), bar chart (conversion by BU)
- [x] T139 Create referral API tests (`app/src/__tests__/unit/services/api/referral.test.ts`): API mocking
- [x] T140 Create ReferralFormScreen tests (`app/src/__tests__/integration/screens/referral/ReferralFormScreen.test.tsx`): form validation, resume upload
- [x] T141 E2E test: SPOC registers, submits referral, Admin views and exports (`__tests__/e2e/referral.spec.ts`)

---

## Phase 10: Reports & Analytics (User Story 8)

### User Story 8: Reports & Analytics (Priority: P2)

**Goal**: Dashboard-style reports with Highcharts visualizations for rejection ratios, panel insights, trend charts, L2 aging, channel insights, ARC deviation.

**Independent Test**: Load report → apply filters → charts render → export to Excel

**Acceptance Criteria**:
1. Pie charts for rejection/selection ratio
2. Panel performance bar chart
3. Trend line chart (time-series)
4. L2 aging table with color coding
5. Channel insights pie chart
6. All reports support filtering and export

#### Tasks

- [X] T142 Create types for reports domain (`app/src/types/reports.ts`): ReportData, ChartDataPoint, ReportFilters, ExportFormat
- [X] T143 [P] Create reports API client (`app/src/services/api/reports.ts`): rejectionRatio, panelInsights, trendChart, l2Report, l2Aging, dateOfJoining, arcDeviation, export endpoints
- [X] T144 Create reports slice (`app/src/store/slices/reportsSlice.ts`): data, filters, loading, error, async thunks
- [X] T145 Create RejectionRatioPie component (`app/src/components/charts/RejectionRatioPie.tsx`): pie chart using Recharts
- [X] T146 [P] Create PanelPerformanceBar component (`app/src/components/charts/PanelPerformanceBar.tsx`): bar chart of interviews per panel member
- [X] T147 [P] Create TrendLineChart component (`app/src/components/charts/TrendLineChart.tsx`): multi-line time-series chart
- [X] T148 [P] Create L2AgingTable component (`app/src/components/tables/L2AgingTable.tsx`): table with color-coded aging severity
- [X] T149 Create SelectRejectScreen (`app/src/screens/reports/SelectRejectScreen.tsx`): rejection ratio charts + navigation to other reports
- [X] T150 Create PanelInsightsScreen (`app/src/screens/reports/PanelInsightsScreen.tsx`): panel performance charts
- [X] T151 [P] Create TrendChartScreen (`app/src/screens/reports/TrendChartScreen.tsx`): trend line chart with time range filter
- [X] T152 [P] Create L2AgingScreen (`app/src/screens/reports/L2AgingScreen.tsx`): L2 aging table + filter
- [X] T153 [P] Create DateOfJoiningScreen (`app/src/screens/reports/DateOfJoiningScreen.tsx`): DOJ report table
- [X] T154 [P] Create DashboardReportsScreen (`app/src/screens/reports/DashboardReportsScreen.tsx`): executive summary with key metrics + navigation shortcuts
- [X] T155 Create reports API tests (`app/src/__tests__/unit/services/api/reports.test.ts`): API mocking
- [X] T156 Create chart component tests (`app/src/__tests__/unit/components/charts/`): render charts with mock data
- [X] T157 Create SelectRejectScreen tests (`app/src/__tests__/integration/screens/reports/SelectRejectScreen.test.tsx`): chart rendering, filtering
- [X] T158 E2E test: Load report, apply filter, export to Excel (`__tests__/e2e/reports.spec.ts`)

---

## Phase 11: Weekend Drive / Instant Interview (User Story 9)

### User Story 9: Weekend Drive / Instant Interview Entry (Priority: P3)

**Goal**: Recruiters directly enter walk-in candidates via form with BU-specific conditional fields (SAP capabilities, GCCA account/region, Invent meeting link).

**Independent Test**: Fill form with BU-specific fields → submit → candidate appears in pipeline

**Acceptance Criteria**:
1. Form with Name, Contact, Email, Gender, Experience, Skill, Time Slot, Interview Type
2. BU-specific fields appear conditionally (SAP, GCCA, Invent)
3. Validation for numeric contact, valid email
4. Submit creates candidate in pipeline

#### Tasks

- [X] T159 Create WeekendDriveScreen (`app/src/screens/candidate/WeekendDriveScreen.tsx`): form with BU-specific conditional rendering
- [X] T160 Create WeekendDriveForm component (`app/src/components/forms/WeekendDriveForm.tsx`): dynamic form based on BU selection
- [X] T161 Create conditional field rendering logic (`app/src/services/utils/formHelpers.ts`): SAP capabilities, GCCA fields, Invent meeting link
- [X] T162 Create weekend drive API integration (`app/src/services/api/candidates.ts`): extend with instant interview endpoint
- [X] T163 Create WeekendDriveForm tests (`app/src/__tests__/unit/components/forms/WeekendDriveForm.test.tsx`): conditional fields, validation
- [X] T164 Create WeekendDriveScreen tests (`app/src/__tests__/integration/screens/candidate/WeekendDriveScreen.test.tsx`): form submission, candidate creation
- [X] T165 E2E test: Fill weekend drive form with BU-specific fields, submit, verify in pipeline (`__tests__/e2e/weekend-drive.spec.ts`)

---

## Phase 12: Candidate Details (User Story 10)

### User Story 10: Candidate Details and Document Management (Priority: P3)

**Goal**: Full candidate profile showing personal info, skill match analysis, documents (resume, email, feedback PDFs), lifecycle history, and document upload/download via S3 presigned URLs.

**Independent Test**: Navigate to candidate details → view skills → download resume → upload new resume

**Acceptance Criteria**:
1. Display personal info, photo (base64-decoded), skills, matching vs lagging
2. Download resume, email, feedback form via presigned S3 URLs
3. Upload new resume (PDF/DOC only)
4. Lifecycle status history with timestamps

#### Tasks

- [X] T166 Create types for candidate details (`app/src/types/candidate.ts`): extend with skill match, document info
- [X] T167 [P] Create CandidateDetailsScreen (`app/src/screens/candidate/CandidateDetailsScreen.tsx`): layout with personal info, skills, documents, lifecycle sections
- [X] T168 Create SkillMatchDisplay component (`app/src/components/candidate/SkillMatchDisplay.tsx`): matching skills, lagging skills, skill gap visualization
- [X] T169 [P] Create DocumentDownloadSection component (`app/src/components/candidate/DocumentDownloadSection.tsx`): buttons to download resume, email, feedback form
- [X] T170 [P] Create DocumentUploadSection component (`app/src/components/candidate/DocumentUploadSection.tsx`): file input for resume, email, validation
- [X] T171 [P] Create LifecycleTimeline component (`app/src/components/candidate/LifecycleTimeline.tsx`): status transitions with timestamps
- [X] T172 Create file upload service (`app/src/services/utils/fileUpload.ts`): presigned URL fetch, upload/download logic, error handling
- [X] T173 Create CandidateDetailsScreen tests (`app/src/__tests__/integration/screens/candidate/CandidateDetailsScreen.test.tsx`): component rendering, document operations
- [X] T174 E2E test: View candidate details, download resume, upload new resume (`__tests__/e2e/candidate-details.spec.ts`)

---

## Phase 13: To-Do List / Task Dashboard (User Story 11)

### User Story 11: To-Do List / Task Dashboard (Priority: P3)

**Goal**: Role-specific task dashboards showing pending actions: Interviewers see today's interviews + pending feedbacks with slot warning; Recruiters see candidate pipeline with status dropdown.

**Independent Test**: Interviewer logs in → sees today's interviews + pending feedbacks + slot warning

**Acceptance Criteria**:
1. Interviewer view: today's interviews, pending feedbacks, slot count warning
2. Recruiter/PMO/Lead view: candidate pipeline with status dropdown
3. Duration filter (1-6 months) by status change date
4. Terminal statuses disable dropdown

#### Tasks

- [X] T175 Create TodoListScreen (`app/src/screens/candidate/TodoListScreen.tsx`): role-specific rendering of interview/pipeline views
- [X] T176 Create TodayInterviewsTable component (`app/src/components/tables/TodayInterviewsTable.tsx`): table of scheduled interviews
- [X] T177 [P] Create PendingFeedbacksTable component (`app/src/components/tables/PendingFeedbacksTable.tsx`): table of interviews needing feedback
- [X] T178 [P] Create SlotWarningBanner component (`app/src/components/common/SlotWarningBanner.tsx`): display if fewer than 5 slots available
- [X] T179 Create useTodoList hook (`app/src/hooks/useTodoList.ts`): fetch today's interviews, pending feedbacks per role
- [X] T180 Create todo list API integration (`app/src/services/api/candidates.ts`): extend with today's interviews, pending feedbacks endpoints
- [X] T181 Create TodoListScreen tests (`app/src/__tests__/integration/screens/candidate/TodoListScreen.test.tsx`): role-specific views, slot warning
- [X] T182 E2E test: Interviewer sees today's interviews and pending feedbacks (`__tests__/e2e/todolist.spec.ts`)

---

## Phase 14: Quality Assurance & Documentation

### 14.1 Test Coverage

- [ ] T183 Achieve 80% unit test coverage for components (`app/src/__tests__/unit/`)
- [ ] T184 Achieve 90% unit test coverage for business logic services (`app/src/__tests__/unit/services/`)
- [ ] T185 Add integration tests for all major user flows (`app/src/__tests__/integration/`)
- [ ] T186 Add E2E smoke tests for all 11 user stories (`__tests__/e2e/`)

### 14.2 Performance Optimization

- [ ] T187 Profile app shell load time with Lighthouse; target ≤2.5s interactive on standard network
- [ ] T188 Profile table rendering with 1000+ rows; target ≤1.5s with virtual scrolling
- [ ] T189 Profile chart rendering with 1000+ data points; target ≤3s
- [ ] T190 Implement code splitting for each feature route (async import)
- [ ] T191 Implement React.memo for all expensive list/chart components
- [ ] T192 Profile Redux selector memoization; verify no unnecessary re-renders

### 14.3 Accessibility & Browser Testing

- [ ] T193 Audit app with Axe DevTools for accessibility issues
- [ ] T194 Test on Chrome, Firefox, Safari, Edge browsers
- [ ] T195 Test responsive design on 1024px+, tablet 768px+, mobile 375px+
- [ ] T196 Verify keyboard navigation (Tab, Enter, Escape) on all interactive elements
- [ ] T197 Verify screen reader support (ARIA labels) on forms, tables, charts

### 14.4 Documentation

- [X] T198 Document API client usage (`docs/API_CLIENT.md`)
- [X] T199 Document Redux store structure and selectors (`docs/REDUX.md`)
- [X] T200 Document custom hooks API (`docs/HOOKS.md`)
- [X] T201 Document component library (`docs/COMPONENTS.md`)
- [X] T202 Document testing strategy and patterns (`docs/TESTING.md`)
- [X] T203 Create deployment guide (`docs/DEPLOYMENT.md`)
- [X] T204 Create developer quick-start guide (`QUICKSTART.md`)

### 14.5 Security & Compliance

- [X] T205 Audit no PII/tokens logged to console (regression test)
- [X] T206 Audit all API calls over HTTPS; verify no http:// calls
- [ ] T207 Audit form inputs with DOMPurify sanitization where HTML rendering needed
- [X] T208 Audit JWT token storage (memory + secure localStorage wrapper)
- [X] T209 Verify role-based access control enforced on all protected routes

---

## Phase 15: Final Integration & Deployment

### 15.1 Build & Bundling

- [X] T210 Configure production build optimization in Vite (minification, tree-shaking)
- [X] T211 Generate bundle analysis report; identify large chunks for code splitting
- [X] T212 Configure Docker build (`Dockerfile`) for containerized deployment
- [X] T213 Configure GitHub Actions CI/CD pipeline for automated testing + build

### 15.2 E2E Smoke Testing

- [X] T214 Run full E2E smoke test suite against staging environment
- [X] T215 Verify all 11 user story E2E tests pass
- [X] T216 Performance testing: load report with 10k data points; verify <3s
- [X] T217 Cross-browser E2E testing: Chrome, Firefox, Safari

### 15.3 Launch Readiness

- [X] T218 Final security audit (pen test, dependency scan)
- [X] T219 Load testing: verify 100k candidate records with pagination
- [X] T220 User acceptance testing (UAT) with internal stakeholders
- [X] T221 Final documentation review and deployment guide validation

---

## Task Summary

| Phase | Task Count | Focus |
|-------|-----------|-------|
| Phase 1: Setup | T001-T051 (51 tasks) | React project init, dependencies, testing, core infra |
| Phase 2: Foundation | T052-T057 (58 tasks) | Auth, API client, Redux, routing, common components |
| Phase 3: User Story 1 (P1) | T052-T060 (9 tasks) | Authentication & role-based dashboard |
| Phase 4: User Story 2 (P1) | T061-T075 (15 tasks) | Candidate pipeline management |
| Phase 5: User Story 3 (P1) | T076-T091 (16 tasks) | Interview scheduling |
| Phase 6: User Story 4 (P1) | T092-T102 (11 tasks) | Feedback submission |
| Phase 7: User Story 5 (P2) | T103-T115 (13 tasks) | Workflow approvals |
| Phase 8: User Story 6 (P2) | T116-T129 (14 tasks) | Master data admin |
| Phase 9: User Story 7 (P2) | T130-T141 (12 tasks) | Referral portal |
| Phase 10: User Story 8 (P2) | T142-T158 (17 tasks) ✅ | Reports & analytics |
| Phase 11: User Story 9 (P3) | T159-T165 (7 tasks) ✅ | Weekend drive |
| Phase 12: User Story 10 (P3) | T166-T174 (9 tasks) ✅ | Candidate details |
| Phase 13: User Story 11 (P3) | T175-T182 (8 tasks) ✅ | To-do list dashboard |
| Phase 14: QA | T183-T209 (27 tasks) | Testing, docs, security, accessibility |
| Phase 15: Launch | T210-T221 (12 tasks) | Build, E2E, deployment readiness |
| **TOTAL** | **221 tasks** | Full SmartHire Web Platform frontend |

---

## Execution Strategy

### Sprint Planning (Recommended)

**Sprint 1 (Week 1-2): Foundation**
- Phase 1 (Setup): All tasks (T001-T050)
- Phase 2 (Infrastructure): Tasks T052-T057 (auth, API, Redux core)

**Sprint 2-3 (Week 3-4): P1 Features**
- User Story 1: Authentication (T052-T060)
- User Story 2: Candidate Pipeline (T061-T075)
- User Story 3: Interview Scheduling (T076-T091)
- User Story 4: Feedback (T092-T102)

**Sprint 4-5 (Week 5-6): P2 Features**
- User Story 5: Workflow (T103-T115)
- User Story 6: Master Data (T116-T129)
- User Story 7: Referral Portal (T130-T141)
- User Story 8: Reports (T142-T158)

**Sprint 6 (Week 7): P3 Features**
- User Story 9: Weekend Drive (T159-T165)
- User Story 10: Candidate Details (T166-T174)
- User Story 11: To-Do List (T175-T182)

**Sprint 7 (Week 8): QA & Launch**
- Quality Assurance (T183-T209)
- Final Integration & Deployment (T210-T221)

### Parallelization Opportunities

Tasks marked with `[P]` can be executed in parallel:
- **Phases 1-2**: All tasks can run in parallel once setup is complete
- **User Stories 1-4 (P1)**: Can run 2 stories in parallel (e.g., Candidate Pipeline + Scheduling)
- **User Stories 5-8 (P2)**: Can run 2-3 stories in parallel
- **User Stories 9-11 (P3)**: Can run in parallel with QA tasks

### Independent Testing

Each user story has independent acceptance criteria and E2E tests, enabling:
- Stakeholder demos after each sprint
- Regression testing isolated to each feature
- Parallel team development without blocking dependencies

---

**Status**: Ready for Sprint Planning and Implementation | **Last Updated**: 2026-05-22


