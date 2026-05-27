# Feature Specification: SmartHire Web Platform

**Feature Branch**: `002-smarthire-web-platform`

**Created**: 2026-05-22

**Status**: Draft

**Input**: Comprehensive synthesis of 10 requirement modules covering authentication, candidate management, interview scheduling, feedback, workflow, referrals, administration, and analytics for a unified web-based recruiting platform.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Employee Authentication and Role-Based Dashboard (Priority: P1)

Employees access the SmartHire platform through Keycloak SSO, receive JWT tokens, and are routed to role-specific dashboards. The system enforces role-based access control across all workflows.

**Why this priority**: Authentication is the foundation—without it, no other feature is accessible. Role-based routing ensures users see only relevant features for their roles.

**Independent Test**: Can be fully tested by: (1) Login with SSO credentials, (2) Verify JWT token in localStorage, (3) Verify redirect to correct role-specific dashboard, and (4) Verify navigation guards block unauthorized access. Delivers working authentication + role gating.

**Acceptance Scenarios**:

1. **Given** employee visits `/home`, **When** SSO is enabled, **Then** Keycloak login is triggered, JWT token is stored in localStorage, user roles are fetched from `panel/fetchEmpRoles`, and user is redirected to role-specific dashboard (e.g., `/todolist` for Recruiter, `/work-flow` for Tower Lead, `/master-data` for Admin)
2. **Given** employee has valid JWT in localStorage, **When** they navigate to a protected route, **Then** AuthGuard validates token and allows access
3. **Given** employee's JWT is expired or missing, **When** they try to access a protected route, **Then** they are redirected to `/home` for re-authentication
4. **Given** employee is logged in with Interviewer role, **When** they try to access Admin routes, **Then** access is denied and they remain on their Interviewer dashboard

---

### User Story 2 - Recruiter/PMO Candidate Pipeline Management (Priority: P1)

Recruiters and PMO staff manage a paginated candidate pipeline table with filtering, bulk Excel upload, status management, and candidate detail viewing. This is the core hiring intake flow.

**Why this priority**: This is the primary workflow for recruiting team—managing incoming candidates. Without this, the entire hiring process cannot begin.

**Independent Test**: Can be fully tested by: (1) Upload candidate Excel file, (2) View candidate table with filters applied, (3) Change candidate status via dropdown, (4) Navigate to candidate details, (5) Export filtered candidates to Excel. Delivers a functional candidate intake system.

**Acceptance Scenarios**:

1. **Given** Recruiter is on `/upload`, **When** they upload a valid candidate Excel file, **Then** candidates are imported, table refreshes, and import success is confirmed via toastr
2. **Given** candidate table is displayed, **When** Recruiter applies filters (Technology, BU, Source, Status, Date Range), **Then** table is filtered and only matching candidates are shown
3. **Given** candidate row is displayed, **When** Recruiter clicks "Schedule Interview", **Then** they navigate to `/dashboard` with candidate pre-filled
4. **Given** candidate status is "Applied", **When** Recruiter changes it to "In Review", **Then** status updates in database and table is refreshed
5. **Given** candidate row is displayed, **When** Recruiter clicks "View Details", **Then** full candidate profile page opens with personal info, skills, documents, and lifecycle history

---

### User Story 3 - Interviewer Calendar and Slot Management (Priority: P1)

Interviewers manage their availability on a monthly calendar, creating time slots in 30-minute increments between 8 AM and 8 PM. Recruiters book candidates into available slots. The calendar color-codes slots by status (available, booked, interviewed, NA).

**Why this priority**: Interview scheduling is critical to the hiring workflow. Without slot management, candidate interviews cannot be scheduled.

**Independent Test**: Can be fully tested by: (1) Interviewer creates availability slots on calendar, (2) Recruiter searches and books a candidate into a slot, (3) Calendar updates to show booked status, (4) Interviewer completes feedback on the interview. Delivers a working interview scheduling system.

**Acceptance Scenarios**:

1. **Given** Interviewer is on `/dashboard`, **When** they click a date, **Then** Booking Form opens with date pre-filled
2. **Given** Booking Form is open, **When** Interviewer selects time slot 9:00 AM - 9:30 AM and clicks "Create Slot", **Then** slot is created, calendar updates, and slot appears in grey (available)
3. **Given** available slot exists on calendar, **When** Recruiter navigates to `/booking-form` and selects a candidate + the slot, **Then** slot is booked and changes to pink (booked)
4. **Given** booked slot exists, **When** Interviewer submits feedback via `/feedback`, **Then** slot changes to green (interviewed)
5. **Given** Interviewer is on `/dashboard`, **When** they toggle "Multiple Slots", **Then** consecutive slots can be booked in one operation (4 or 8 hours)

---

### User Story 4 - Interviewer Feedback Submission (Priority: P1)

Interviewers complete post-interview feedback forms with dynamic technical evaluations and behavioral assessments. Form is based on customizable feedback templates per BU/practice. Feedback can be revisited and edited before finalization.

**Why this priority**: Feedback is critical for candidate evaluation and pipeline progression. Without it, hiring decisions cannot be made.

**Independent Test**: Can be fully tested by: (1) Interviewer navigates to feedback form, (2) Form pre-populates with candidate and slot info, (3) Interviewer fills skill ratings and remarks, (4) Form submits successfully, (5) Interviewer can revisit and re-edit. Delivers working feedback collection.

**Acceptance Scenarios**:

1. **Given** Interviewer clicks pending feedback in `/todolist`, **When** they navigate to `/feedback`, **Then** form is pre-populated with candidate name, technology, slot time, and dynamic feedback template fields
2. **Given** feedback form is displayed, **When** Interviewer fills Technical Skill ratings and selects remarks, **Then** form validates that at least Technical Area 1 is filled
3. **Given** feedback form is filled, **When** Interviewer selects Feedback Status (Select/Reject/Hold) and clicks Submit, **Then** feedback is saved and they navigate to `/dashboard`
4. **Given** previously submitted feedback exists, **When** Interviewer clicks revisit, **Then** form opens with existing data pre-filled and is editable

---

### User Story 5 - Workflow Approval Chain (Priority: P2)

Multi-step approval workflow routes candidates through Tower Lead → SL-BU Lead → NA Lead → Recruiter Lead gates. Each approver can approve, reject, or hold candidates. Rejection requires mandatory comments.

**Why this priority**: Workflow approval ensures governance over hiring pipeline. Critical for large enterprises with approval chains, but secondary to basic hiring intake.

**Independent Test**: Can be fully tested by: (1) Tower Lead approves candidate, (2) Candidate moves to next approval stage, (3) SL-BU Lead rejects with comment, (4) Candidate status updates to rejected. Delivers working multi-step approval system.

**Acceptance Scenarios**:

1. **Given** Tower Lead is on `/work-flow`, **When** they view their approval queue, **Then** only candidates submitted to their role are shown
2. **Given** candidate is in approval queue, **When** Tower Lead clicks Approve, **Then** candidate moves to next stage (SL-BU Lead approval)
3. **Given** candidate is in approval queue, **When** Tower Lead clicks Reject and must enter comments, **Then** comments are saved and candidate is moved to Rejected status
4. **Given** candidate is held, **When** Tower Lead revisits approval queue, **Then** held candidates are visible for further action

---

### User Story 6 - Master Data Administration (Priority: P2)

Admin and BU Admins manage system reference data (towers, skills, sources, vendors, feedback forms, role comments, PMO mappings, etc.). Role-based access controls limit what each admin tier can manage. CRUD operations on all categories with grid-based UI.

**Why this priority**: Master data management ensures data consistency across the platform. Important for configuration but secondary to user-facing workflows.

**Independent Test**: Can be fully tested by: (1) Admin navigates to `/master-data`, (2) Selects "Skills" category, (3) Creates new skill, (4) Edits existing skill, (5) Deletes skill (if not in use). Delivers working admin configuration panel.

**Acceptance Scenarios**:

1. **Given** Admin is on `/master-data`, **When** they select a category (e.g., Tower), **Then** grid displays all towers with Add, Edit, Delete buttons
2. **Given** category grid is displayed, **When** Admin clicks Add, **Then** popup opens with form fields for the category
3. **Given** Admin fills form fields and clicks Save, **Then** new record is added, grid refreshes, and success is confirmed via toastr
4. **Given** skill is used by existing candidates, **When** Admin tries to delete it, **Then** deletion is blocked with error "Cannot delete, record is in use"
5. **Given** BU Admin is logged in, **When** they access master data, **Then** only categories for their own BU are visible

---

### User Story 7 - Referral Portal (Priority: P2)

Separate referral authentication system (localStorage-based, independent of main SSO) allows Referral SPOCs to submit and track referred candidates. Candidates can also self-register as referrals. Admin views all referrals and can export to Excel.

**Why this priority**: Referral program is important for sourcing but operates independently from core recruiting workflow.

**Independent Test**: Can be fully tested by: (1) SPOC registers/logs into referral portal, (2) SPOC submits candidate referral with resume, (3) SPOC can view their referred candidates, (4) Admin can view all referrals, (5) Data exports to Excel. Delivers working referral subsystem.

**Acceptance Scenarios**:

1. **Given** new SPOC visits `/referral-portal/referralRegister`, **When** they fill registration form and submit, **Then** `localStorage["refrole"]` and `localStorage["refname"]` are set and they are redirected to `/referral-portal/ref-candidate-details`
2. **Given** SPOC is on `/referral-form`, **When** they fill candidate info and upload resume, **Then** referral is submitted and source is automatically set to "Referral"
3. **Given** duplicate candidate email is submitted, **When** SPOC tries to submit referral, **Then** error "Candidate already referred" is shown
4. **Given** Admin is on `/candidate-referral`, **When** they view all referred candidates, **Then** data shows candidate name, referrer, skill, status, and date referred
5. **Given** referral list is displayed, **When** Admin clicks Export, **Then** Excel file is downloaded with all referral data

---

### User Story 8 - Reports and Analytics (Priority: P2)

Dashboard-style reports provide hiring pipeline insights via Highcharts visualizations: rejection ratios, feedback submission rates, panel performance, sourcing channel analytics, L2 aging analysis, and trend charts. Reports support filtering and Excel export.

**Why this priority**: Analytics are critical for management visibility and process optimization but secondary to the core hiring operations.

**Independent Test**: Can be fully tested by: (1) User navigates to `/select-reject` report, (2) Pie charts render showing selection/rejection data, (3) Filters apply and charts update, (4) Excel export downloads. Delivers working reporting system.

**Acceptance Scenarios**:

1. **Given** user navigates to `/select-reject`, **When** page loads, **Then** pie charts display rejection/selection ratios and breakdown charts render via Highcharts
2. **Given** report is displayed, **When** user applies filter (e.g., Source = "LinkedIn"), **Then** charts update to show only filtered data
3. **Given** L2 Aging report is accessed, **When** data is displayed, **Then** candidates stuck at L2 are color-coded by aging severity (red for oldest)
4. **Given** `/trend-chart` is loaded, **When** page renders, **Then** line chart shows time-series data (interviewed / selected / rejected) over time
5. **Given** report data is displayed, **When** user clicks Export Excel, **Then** data is downloaded as Excel file

---

### User Story 9 - Weekend Drive / Instant Interview Entry (Priority: P3)

Recruiters directly enter walk-in or instant interview candidates via `/weekend-drive` form with dynamic fields based on BU and role. Form includes conditional fields for SAP capabilities, GCCA account/region mapping, and referral tracking. Supports multiple interview types (L1, L2, L1-L2, L3) and skill selection.

**Why this priority**: Instant interview entry is a convenient workflow for ad-hoc hiring needs but not essential to the core pipeline.

**Independent Test**: Can be fully tested by: (1) Recruiter navigates to `/weekend-drive`, (2) Fills form for a walk-in candidate, (3) Selects interview type and time slot, (4) Submits form, (5) Candidate appears in pipeline. Delivers quick candidate intake.

**Acceptance Scenarios**:

1. **Given** Recruiter is on `/weekend-drive`, **When** page loads, **Then** form fields are displayed and Skill field is pre-filtered to recruiter's registered skills
2. **Given** recruiter selects BU = "SAP", **When** form updates, **Then** SAP Capability and SAP Skills fields appear conditionally
3. **Given** recruiter selects BU = "GCCA" and Interview Type = "L1", **When** form updates, **Then** Account Name, Region, Is Referral, and Is Rehire fields appear
4. **Given** Recruiter fills all required fields and clicks Submit, **When** request is POST'd to `/weekend-drive` endpoint, **Then** candidate is created and added to pipeline

---

### User Story 10 - Candidate Details and Document Management (Priority: P3)

Candidates have detailed profile pages showing personal info, skill match analysis against demand, uploaded documents (resume, email, feedback forms), profile photo, and lifecycle status history. Users can download/upload documents via pre-signed S3 URLs.

**Why this priority**: Candidate detail view is important for deep candidate evaluation but secondary to the main pipeline workflows.

**Independent Test**: Can be fully tested by: (1) Navigate to candidate details page, (2) View personal info and skills, (3) Download resume, (4) Upload new resume, (5) View status history. Delivers complete candidate profiles.

**Acceptance Scenarios**:

1. **Given** user clicks candidate name in pipeline, **When** `/candidate-details` opens, **Then** personal info (name, email, contact, grade, location) is displayed
2. **Given** candidate details page is loaded, **When** skill section renders, **Then** matching skills vs demand are highlighted and lagging skills are noted
3. **Given** Resume button is clicked, **When** system fetches presigned S3 URL, **Then** resume file is downloaded
4. **Given** user clicks Upload Resume button, **When** PDF/DOC file is selected and uploaded, **Then** system validates file type and uploads to S3
5. **Given** candidate details page is displayed, **When** Lifecycle section renders, **Then** status transition history is shown with timestamps

---

### User Story 11 - To-Do List / Task Dashboard (Priority: P3)

Role-specific task dashboards show pending actions: Interviewers see today's scheduled interviews and pending feedbacks with slot count warning; Recruiters/PMO/Leads see candidate pipeline with status dropdown for quick updates.

**Why this priority**: To-do list is a convenience feature for role-specific task management but not essential to core workflows.

**Independent Test**: Can be fully tested by: (1) Interviewer logs in and sees today's interviews on dashboard, (2) Pending feedbacks are listed, (3) Warning shows if fewer than 5 free slots available, (4) Recruiter sees candidate pipeline in same view. Delivers quick-access task board.

**Acceptance Scenarios**:

1. **Given** Interviewer logs in and is routed to `/todolist`, **When** page loads, **Then** today's scheduled interviews are displayed in a table
2. **Given** pending feedbacks exist, **When** Interviewer views `/todolist`, **Then** Pending Feedbacks section shows candidates needing feedback with interview time and skills
3. **Given** Interviewer has fewer than 5 free slots booked, **When** page loads, **Then** warning popup is shown: "Insufficient slots booked"
4. **Given** Recruiter is on `/todolist`, **When** page loads, **Then** candidate pipeline table is displayed with status dropdown for each row

---

### Edge Cases

- What happens when a Recruiter tries to book a candidate into a slot already booked by another recruiter? → Slot is locked; error is shown: "Slot is no longer available"
- How does the system handle feedback template versioning when admin uploads new feedback form? → New version replaces current one; previously submitted feedback forms are retained
- What happens if employee record exists in Keycloak but not in the database? → User is prompted to register via `/register`; registration creates employee record and BU/practice mappings
- How does the system handle cascading deletions (e.g., deleting a skill used by existing candidates)? → Deletion is blocked; error message: "Cannot delete, record is in use"
- What happens when Referral SPOC tries to submit duplicate candidate email? → Duplicate check prevents submission; error: "Candidate already referred"
- How does the system handle API failures during candidate status change? → Optimistic UI revert; toastr error with backend message

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Authorization
- **FR-001**: System MUST support Keycloak SSO (realm: SmartHire, clientId: Smarthireui) with JWT token storage in localStorage
- **FR-002**: System MUST enforce JWT token expiration validation on protected routes via AuthGuard
- **FR-003**: System MUST implement role-based access control (RBAC) with 14 distinct roles: Interviewer, Recruiter, PMO, Lead, Tower Lead, SL-BU Lead, NA Lead, Recruiter Lead, Practice Lead, BU Admin, Practice Admin, Admin, SuperUser, Referral SPOC
- **FR-004**: System MUST enforce role-specific route guards; unauthorized role access redirects to role-specific home route
- **FR-005**: System MUST add Authorization header (`Bearer <JWT>`) to all HTTP requests via interceptor
- **FR-006**: System MUST maintain separate referral portal authentication (localStorage["refrole"], ReferralAuthGuard) independent from main SSO

#### Candidate Pipeline Management
- **FR-007**: System MUST support bulk Excel file upload for candidates with validation and error reporting
- **FR-008**: System MUST display candidates in paginated table with columns: Name, Contact, Email, Skill, Grade, Status, Source, Last Modified, Profile Aging Days
- **FR-009**: System MUST support filtering by: Technology, BU, Source, Vendor, Status, Date Range, Duration (1-6 months)
- **FR-010**: System MUST allow status change via dropdown with immediate database persistence and table refresh
- **FR-011**: System MUST support candidate deletion with soft-delete confirmation
- **FR-012**: System MUST support table export to Excel with applied filters
- **FR-013**: System MUST download resume, email attachment, and feedback form PDFs via presigned S3 URLs

#### Interview Scheduling
- **FR-014**: System MUST display interview calendar (month view, angular-calendar) with color-coded slot statuses: Green (interviewed), Pink (booked), Grey (available), Yellow (panel-NA/candidate-NA)
- **FR-015**: System MUST allow Interviewers to create availability slots in 30-minute increments between 8:00 AM - 8:00 PM on future dates only
- **FR-016**: System MUST allow multiple consecutive slots (4 or 8 hours) in single booking operation
- **FR-017**: System MUST allow recurring slot booking across multiple days within a date range
- **FR-018**: System MUST allow Recruiters to book candidates into available slots with candidate name, interview type (L1/L2/L1-L2/L3), technology, and comments
- **FR-019**: System MUST prevent past-dated slot bookings with error: "Bookings not allowed for past dates"
- **FR-020**: System MUST prevent bookings outside 8:00 AM - 8:00 PM window with error: "Only allowed 8:00 AM to 8:00 PM"
- **FR-021**: System MUST display day-level aggregates on calendar: available count, booked count, interviewed count, panel-NA count, candidate-NA count
- **FR-022**: System MUST allow rescheduling of existing bookings via pre-filled Booking Form

#### Feedback Management
- **FR-023**: System MUST load dynamic feedback templates from backend per BU/practice with technical evaluation and behavioral sections
- **FR-024**: System MUST allow Interviewers to rate each skill 1-5 with remarks dropdown
- **FR-025**: System MUST allow adding extra technical evaluation rows via "Add Row" button
- **FR-026**: System MUST require at least Technical Area 1 to be filled before submission
- **FR-027**: System MUST require Feedback Status selection before submission
- **FR-028**: System MUST prevent form submission if both conditions not met
- **FR-029**: System MUST support feedback revisit mode where previously submitted feedback can be re-opened and edited (before finalization)
- **FR-030**: System MUST validate that form is only editable when feedbackStatus !== 0 AND feedbackStatus !== 3

#### Workflow & Approvals
- **FR-031**: System MUST route candidates through 4-step approval chain: Tower Lead → SL-BU Lead → NA Lead → Recruiter Lead
- **FR-032**: System MUST allow each lead to Approve, Reject (with mandatory comments), or Hold candidates
- **FR-033**: System MUST prevent rejected candidates from being re-submitted without Recruiter action
- **FR-034**: System MUST display only candidates submitted to the current approver's role (server-side filtering)
- **FR-035**: System MUST persist approval timestamps and approver names in workflow history

#### Master Data Administration
- **FR-036**: System MUST provide CRUD operations for: Tower, Skill, Skill Group, Source, Vendor, Role Comment, Feedback Form, PMO DL Skill Mapping, Approver DL Mapping, BU Account, Demand Type Master, Account Region Mapping
- **FR-037**: System MUST enforce category list in left sidebar with Add/Edit/Delete popups per category
- **FR-038**: System MUST prevent deletion of records in active use (e.g., skill referenced by candidate) with error: "Cannot delete, record is in use"
- **FR-039**: System MUST enforce role-based access: BU Admin can only manage their BU data, Practice Admin can only manage their practice data, Admin/SuperUser can manage all
- **FR-040**: System MUST support feedback template versioning (new upload replaces current)
- **FR-041**: System MUST validate required fields with inline form validation errors

#### Referral Portal
- **FR-042**: System MUST provide separate referral authentication without Keycloak (localStorage["refrole"], ReferralAuthGuard)
- **FR-043**: System MUST allow SPOC registration with: Employee ID, Name, Email, Role (SPOC/Candidate), BU
- **FR-044**: System MUST allow SPOC to submit candidate referrals with: Name, Contact, Email, Experience, Skill, Resume upload (PDF/DOC only), auto-populated Referred By (SPOC) fields
- **FR-045**: System MUST validate duplicate candidate email with error: "Candidate already referred"
- **FR-046**: System MUST set Source to "Referral" automatically on referral submission
- **FR-047**: System MUST allow SPOC to view their own referred candidates with status and last modified date
- **FR-048**: System MUST allow Admin to view all referrals across all SPOCs with filtering and Excel export
- **FR-049**: System MUST support bulk referral upload via Excel template
- **FR-050**: System MUST display referral analytics: referral count by BU (pie/bar chart), conversion rate by BU, referral count by account

#### Reports & Analytics
- **FR-051**: System MUST display rejection/selection ratio via Highcharts pie charts
- **FR-052**: System MUST display panel performance analytics: interview count per panel member, panel utilization rate
- **FR-053**: System MUST display candidate status distribution: pie/bar/funnel visualization of pipeline stages
- **FR-054**: System MUST display source channel analytics: candidate count per source, conversion rate by source
- **FR-055**: System MUST display trend chart: time-series line graph (interviewed, selected, rejected over time)
- **FR-056**: System MUST display L2 Report: candidates at L2 stage with aging days
- **FR-057**: System MUST display L2 Aging: candidates stuck at L2 with color-coding by severity
- **FR-058**: System MUST display Date of Joining report: expected/confirmed DOJ for offer tracking
- **FR-059**: System MUST display ARC Deviation: demand vs actual supply per BU/practice
- **FR-060**: System MUST support filtering on all reports: Technology, BU, Date Range, Source, etc.
- **FR-061**: System MUST support Excel export from all reports
- **FR-062**: System MUST display Dashboard Reports: executive summary with key metrics and navigation shortcuts

#### Weekend Drive / Instant Interview
- **FR-063**: System MUST provide `/weekend-drive` form for direct candidate entry with fields: Name, Contact, Email, Gender, Total/Relevant Experience, Skill, Time Slot From/To, Interview Type, Source, Vendor, Current Company
- **FR-064**: System MUST conditionally display BU-specific fields: SAP Capability/Skills (SAP BU), Account Name/Region (GCCA BU), Is Referral/Is Rehire (GCCA L1/L1-L2)
- **FR-065**: System MUST conditionally display Interviewer Email dropdown for Recruiter/PMO/Lead roles
- **FR-066**: System MUST conditionally display Meeting Link field for Invent BU + Recruiter role
- **FR-067**: System MUST validate numeric contact number and email format
- **FR-068**: System MUST validate time slot To Date >= From Date
- **FR-069**: System MUST validate Experience fields as non-negative decimals

#### Candidate Details
- **FR-070**: System MUST display candidate personal info: Name, Email, Contact, Grade, Location, Source, Photo (base64-decoded)
- **FR-071**: System MUST display skill match analysis: matching skills vs demand, lagging skills, resume-extracted skills
- **FR-072**: System MUST provide document downloads: Resume (PDF/DOC), Email attachment (.msg), Feedback forms (PDF) via presigned S3 URLs
- **FR-073**: System MUST provide document uploads: Resume (PDF/DOC only), Email (.msg only)
- **FR-074**: System MUST display lifecycle status history with timestamps and status transitions
- **FR-075**: System MUST validate file type (PDF/DOC for resume, .msg for email, single dot in filename)
- **FR-076**: System MUST display role-based action visibility (different actions for different user roles)

#### To-Do List / Task Dashboard
- **FR-077**: System MUST display role-specific task views per user role
- **FR-078**: System MUST display Interviewer view: Today's Interviews table (Name, Contact, Time, Total Exp, Skills) + Pending Feedbacks table
- **FR-079**: System MUST display warning popup if Interviewer has fewer than 5 free slots booked
- **FR-080**: System MUST display Recruiter/PMO/Lead view: Candidate pipeline table with status dropdown for quick updates
- **FR-081**: System MUST prevent status change to same value with error shown
- **FR-082**: System MUST filter candidates by Duration (1-6 months) based on status_change_date
- **FR-083**: System MUST display `trivialFlag` marked statuses differently in UI
- **FR-084**: System MUST disable status dropdown for terminal statuses when `disableDropdown` flag is set

#### Role Change Management
- **FR-085**: System MUST allow Admin/BU Admin to change employee roles via `/changeroles` form
- **FR-086**: System MUST provide employee email autocomplete search in change roles form
- **FR-087**: System MUST display read-only BU field (employee's current BU) in change roles form
- **FR-088**: System MUST update employee roles in database via `panel/updateRoles` API

### Key Entities

- **Employee**: Represents platform user; attributes: email, name, employee_id, BU, practice, skills, roles
- **Candidate**: Core hiring entity; attributes: name, email, contact, experience (total, relevant), current_status, source, BU, grade, location, photo (base64)
- **Skill / Tower / Source**: Reference master data for filtering and categorization
- **Interview Booking**: Represents scheduled interview slot; attributes: start_time, end_time, candidate_id, interviewer_id, interview_type, status, feedback_status
- **Feedback Form**: Dynamic form template per BU/practice; attributes: feedback_id, candidate_id, interviewer_id, ratings (per skill), remarks, behavioral scores, status
- **Workflow Approval**: Multi-step approval record; attributes: candidate_id, approver_id, approval_stage (Tower Lead / SL-BU Lead / NA Lead / Recruiter Lead), decision (Approve/Reject/Hold), comments, timestamp
- **Referral Candidate**: Candidate submitted via referral program; attributes: referrer_id (SPOC), referral_date, candidate_id, source ("Referral")
- **Demand / Supply**: Hiring demand vs candidate supply tracking; attributes: BU, practice/tower, skill, open_demand_count, active_candidate_count, gap

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete login → role-based dashboard navigation within 30 seconds on standard network conditions
- **SC-002**: Candidate pipeline table displays 100+ candidates with filtering applied in under 2 seconds
- **SC-003**: Calendar loads month view with slot aggregates within 1.5 seconds
- **SC-004**: 95% of interview booking operations complete successfully without duplicate slot conflicts
- **SC-005**: Feedback submission succeeds on first attempt 99% of the time (no required field validation failures on re-attempt)
- **SC-006**: Approval workflow processes candidate transition to next stage within 30 seconds of approver action
- **SC-007**: Master data CRUD operations complete with visual grid refresh within 2 seconds
- **SC-008**: All reports (Highcharts visualizations) render with data within 3 seconds of page load
- **SC-009**: Referral portal handles 1000+ referred candidates with filtering and export without degradation
- **SC-010**: Excel exports complete within 10 seconds for datasets up to 50,000 rows
- **SC-011**: System prevents unauthorized access: 100% of unauthenticated requests redirect to login
- **SC-012**: System enforces role-based access: 100% of unauthorized role attempts blocked and logged
- **SC-013**: Document uploads via S3 presigned URLs complete within 5 seconds for files up to 10MB
- **SC-014**: Weekend Drive form submission creates candidate in pipeline within 3 seconds
- **SC-015**: Task dashboard (To-Do List) loads with all role-specific widgets within 2 seconds

## Assumptions

- **Authentication**: Keycloak SSO is deployed and configured; JWT tokens are issued with standard claims; token expiry is enforced server-side
- **Deployment**: Application is deployed on standard web servers with HTTPS; all API endpoints are behind OAuth2/JWT protection
- **Data Volume**: System is expected to handle 100k+ candidate records with server-side pagination and filtering; real-time analytics support up to 10k concurrent users
- **File Storage**: Resume, email, and feedback form documents are stored on AWS S3 with presigned URLs for secure downloads; documents are not stored inline
- **Email / Notifications**: System assumes SMTP integration for email notifications (outside scope of this spec); no real-time push notifications required in v1
- **Reporting**: Highcharts is the primary charting library; reports are static snapshots (not real-time dashboards)
- **Master Data**: Admin can manage all reference data; data integrity is enforced via uniqueness and foreign key constraints; cascading deletes are blocked
- **Feedback Templates**: Feedback forms are stored as backend templates; dynamic rendering is client-side
- **Referral Portal**: Separate from main SSO; uses localStorage for session management (no server-side session tokens)
- **Performance**: Lazy-loading of feature modules reduces initial app shell load time; virtual scrolling for large tables is implemented
- **Browser Support**: Supports modern browsers (Chrome, Firefox, Safari, Edge); mobile browsers are not prioritized in v1
- **API Rate Limiting**: No explicit rate limiting specified; system assumes standard HTTP request volume
- **Offline Mode**: No offline support required; all operations are online
