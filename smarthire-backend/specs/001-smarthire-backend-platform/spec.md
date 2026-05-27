# Feature Specification: SmartHire Backend Platform

**Feature Branch**: `001-smarthire-backend-platform`

**Created**: 2026-05-26

**Status**: Draft

**Input**: All documentation files in `/docs` describing the SmartHire internal recruitment management platform backend.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Candidate Pipeline Management (Priority: P1)

A recruiter needs to manage the complete lifecycle of a candidate from initial profile intake through offer acceptance and joining, including status transitions, skill assignments, comments, and resume downloads.

**Why this priority**: The candidate pipeline is the core business process that all other modules serve. Without it, the platform has no purpose.

**Independent Test**: A recruiter can upload a candidate profile, progress it through at least one status change, add a comment, and retrieve the candidate's history — delivering a trackable candidate record.

**Acceptance Scenarios**:

1. **Given** a recruiter is logged in, **When** they upload a candidate profile (individually or via bulk Excel), **Then** the candidate record is created with all provided fields and assigned the initial status.
2. **Given** a candidate is in an active status, **When** the recruiter changes the status to the next valid state, **Then** the old status record receives an end-date and a new status record is created.
3. **Given** a recruiter searches for candidates using filters (skill, status, tower, source, date range), **When** the query is submitted, **Then** a paginated, filtered list of matching candidates is returned.
4. **Given** a candidate has experience ≥ 10 years or holds an architect skill and reaches L2 Select, **When** the system evaluates the escalation rule, **Then** the candidate is flagged for potential L3 interview.
5. **Given** a recruiter adds a comment to a candidate, **When** the comment (with optional file attachment) is saved, **Then** it appears in the candidate's comment history with author and timestamp.

---

### User Story 2 - Interview Scheduling & Slot Management (Priority: P1)

A recruiter must schedule interviews by matching interviewer availability against candidate requirements, book slots, reschedule when needed, and cancel slots — all while maintaining a consistent calendar.

**Why this priority**: Scheduling is the second core workflow. Delays in scheduling directly impact SLA compliance and hiring velocity.

**Independent Test**: A recruiter can create an interview slot for a candidate, assign an available interviewer, reschedule it, and delete it — with each action reflected immediately in the calendar.

**Acceptance Scenarios**:

1. **Given** a recruiter specifies skill, date range, and business unit criteria, **When** they search for available interviewers, **Then** a list of interviewers with free slots matching those criteria is returned.
2. **Given** an available interviewer slot exists, **When** the recruiter books the slot for a candidate, **Then** the slot is marked as booked and linked to the candidate record.
3. **Given** a booked interview must be moved, **When** the recruiter reschedules the slot to a new time, **Then** the existing slot is updated and all parties receive updated details.
4. **Given** an interview is cancelled, **When** the recruiter deletes the slot, **Then** the slot is removed from the calendar and the interviewer's availability is restored.
5. **Given** a panel coordinator uploads an Excel file with bulk slot data, **When** the file is processed, **Then** valid rows create interviewer availability records and error rows are returned with row-level details.

---

### User Story 3 - Feedback Collection & Form Management (Priority: P2)

An interviewer must receive a technology-specific, structured feedback form after conducting an interview, fill it in, and submit — giving recruiters and leads an auditable record of interview outcomes.

**Why this priority**: Feedback drives status transitions (Select/Reject) and regulatory compliance for hiring decisions.

**Independent Test**: An interviewer can retrieve the correct feedback form for a given technology/practice, submit responses, and a recruiter can then view the resulting feedback PDF.

**Acceptance Scenarios**:

1. **Given** an interviewer has a scheduled interview, **When** they request the feedback form for the candidate's technology and practice, **Then** the correct versioned hierarchical form is returned.
2. **Given** an interviewer completes and submits a feedback form, **When** the submission is saved, **Then** the feedback is linked to the interview slot and the slot's feedback status is updated.
3. **Given** a feedback form template needs updating, **When** an admin creates a new form version, **Then** the new version becomes active for future interviews while past submissions remain unaffected.
4. **Given** a recruiter requests a PDF report for an interview, **When** the PDF is generated, **Then** it includes the interviewer's structured responses for that specific slot.

---

### User Story 4 - Automated Alerts & SLA Notifications (Priority: P2)

Stakeholders (skill leads, tower leads, interviewers, recruiters) must receive automated alerts about aging candidates, upcoming interview reminders, and pending feedback — ensuring SLA compliance without manual tracking.

**Why this priority**: Aging SLAs directly affect business compliance. Automated alerts reduce coordinator overhead and prevent pipeline stagnation.

**Independent Test**: The aging SLA alert can be triggered and sends an Excel-attached email to skill group distribution lists covering all candidates in active non-terminal statuses.

**Acceptance Scenarios**:

1. **Given** the daily aging alert runs, **When** candidates in active (non-terminal) statuses are identified, **Then** each skill group DL receives an Excel report with candidate name, email, status, last changed date, and aging (days).
2. **Given** an interview is scheduled within the next alert window, **When** the reminder job runs, **Then** the assigned interviewer receives an email reminder and the calendar entry is marked as reminded.
3. **Given** an interviewer submits a feedback status after an interview, **When** the status notification job runs, **Then** the assigned recruiter/PMO receives a status update email.
4. **Given** an interviewer has completed an interview but not submitted a feedback form, **When** the feedback reminder job runs, **Then** the interviewer receives a reminder email.
5. **Given** a tower lead oversees a skill group, **When** the tower aging SLA runs, **Then** the lead receives a tower-specific aging report.

---

### User Story 5 - Reports & Analytics (Priority: P2)

Managers and PMO coordinators need downloadable pipeline reports — both summary Excel exports for management review and detailed PDF feedback reports per interview.

**Why this priority**: Reporting is essential for management visibility, compliance, and data-driven hiring decisions.

**Independent Test**: A manager can specify date range, skill, interview type, and business unit filters and download a populated Excel report of the interview pipeline.

**Acceptance Scenarios**:

1. **Given** a manager selects filter criteria (date range, skill, interview type, BU, account), **When** they request the Excel report, **Then** a downloadable spreadsheet with matching interview pipeline data is returned.
2. **Given** a recruiter requests a PDF feedback summary for a specific interview slot, **When** the PDF is generated, **Then** the document contains the interviewer's structured feedback responses.
3. **Given** report filters produce no matching results, **When** the report is requested, **Then** an empty report is returned rather than an error.

---

### User Story 6 - User Registration & Role Management (Priority: P2)

An admin must be able to onboard new employees, assign roles (recruiter, interviewer, lead, etc.), and update their attributes — ensuring only authorised users can perform role-specific actions.

**Why this priority**: Access control and user provisioning underpin the entire platform's security model.

**Independent Test**: An admin can register a new employee, assign them the interviewer role with a specific skill, and the employee can subsequently appear in the interviewer dropdown.

**Acceptance Scenarios**:

1. **Given** a new employee record needs creating, **When** the admin submits registration with employee ID, name, email, grade, BU, roles, and skills, **Then** the employee is created, role assignments persisted, and a welcome email sent.
2. **Given** an existing employee's attributes change, **When** the admin updates the record, **Then** all changed fields (grade, skills, roles, accounts, supervisor) are updated without affecting unrelated records.
3. **Given** an admin queries users by email, **When** the query is submitted, **Then** the matching employee details and their assigned roles are returned.
4. **Given** a role is assigned to an employee, **When** that employee logs in, **Then** they see only the features and data permitted for their role(s).

---

### User Story 7 - Authentication & Session Security (Priority: P1)

All platform users must authenticate via a secure identity provider before accessing protected resources, with session validation preventing concurrent duplicate sessions.

**Why this priority**: Security is a foundational prerequisite; no other workflow is safe without it.

**Independent Test**: A user with a valid token can access protected endpoints; a user with an expired or malformed token receives a 401; public endpoints remain accessible without a token.

**Acceptance Scenarios**:

1. **Given** a user presents a valid bearer token, **When** any protected endpoint is called, **Then** the request is processed and the user's identity is available to the controller.
2. **Given** a user presents an expired or malformed token, **When** a protected endpoint is called, **Then** a 401 Unauthorized response is returned immediately.
3. **Given** a user attempts to create a second active session, **When** the login endpoint checks active sessions, **Then** the duplicate session is detected and handled per the configured policy (warn or reject).
4. **Given** a call is made to `/prescreen/**`, **When** no token is provided, **Then** the request is processed normally (public endpoint).

---

### User Story 8 - Prescreen & Referral Intake (Priority: P3)

External pre-screening systems and employees submitting referrals must be able to feed candidate data into the platform without requiring a full authenticated user session, using a lightweight intake path.

**Why this priority**: Intake channels expand the candidate pool but are not on the critical path for core scheduling workflows.

**Independent Test**: An external system can POST to the prescreen endpoint without a JWT and update a prescreen record; an authenticated user can retrieve all master data needed to render and submit a referral form.

**Acceptance Scenarios**:

1. **Given** an external system sends a prescreen update with a valid prescreen ID and recruiter details, **When** the unauthenticated endpoint is called, **Then** the prescreen record is updated and linked to the named recruiter.
2. **Given** an employee wants to refer a candidate, **When** they request referral form master data, **Then** all dropdowns (technology, location, BU, notice period, certifications) are returned in a single response.
3. **Given** a referred candidate is admitted to the pipeline, **When** their record is created, **Then** the `isReferral` flag is set and the referrer name is captured.

---

### User Story 9 - Lookup & Configuration Data (Priority: P3)

All frontend consumers need consistent, up-to-date reference data (statuses, skills, grades, roles, market units, accounts, practices) served from a single source of truth.

**Why this priority**: Lookup data is a supporting service; incorrect or missing lookup data degrades usability but does not block core workflow if already cached.

**Independent Test**: A client can retrieve all lookup dropdowns for a given screen, all skills, all market units for a BU, and practices — receiving consistent values across multiple calls.

**Acceptance Scenarios**:

1. **Given** a client requests dropdowns for a screen, **When** the lookup endpoint is called with the screen ID, **Then** the correct set of reference values for that screen is returned.
2. **Given** a client requests skills, market units, practices, or accounts, **When** the appropriate lookup endpoint is called, **Then** the current active values are returned.
3. **Given** the configuration endpoint is called, **When** runtime constants are requested, **Then** the current property values from the server configuration are returned.

---

### Edge Cases

- What happens when a bulk Excel upload contains a mix of valid and invalid rows? → Valid rows are persisted; error rows are returned with row-level error descriptions.
- What happens when a candidate's status history contains multiple open records (no end date)? → The system should detect and handle this data inconsistency without crashing.
- How does the system handle a scheduled interview where the interviewer has since been deactivated? → The slot should remain visible but flagged; the recruiter is notified to reassign.
- What happens when an aging alert finds no candidates in active statuses for a skill group? → No email is sent for that skill group.
- What happens when a PDF feedback report is requested for an interview where no feedback was submitted? → An empty or placeholder PDF is returned rather than an error.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST enforce JWT-based authentication on all endpoints except `/prescreen/**`.
- **FR-002**: The system MUST return HTTP 401 for requests with expired, malformed, or missing tokens on protected endpoints.
- **FR-003**: The system MUST detect and handle duplicate active sessions per user via the identity provider session check.
- **FR-004**: The system MUST allow recruiters to create candidate records individually and via bulk Excel import.
- **FR-005**: The system MUST maintain a single active status per candidate at all times, recording a full historical status trail.
- **FR-006**: The system MUST enforce the defined candidate status transition flow, preventing arbitrary status jumps.
- **FR-007**: The system MUST apply the experience/architect escalation rule when evaluating L2 Select outcomes.
- **FR-008**: The system MUST allow recruiters to search and filter candidates by skill, status, tower, source, and date range with paginated results.
- **FR-009**: The system MUST support adding comments (with optional file attachments) to candidate records and retrieving the full comment history.
- **FR-010**: The system MUST allow interviewers to register availability slots individually and in bulk via Excel upload.
- **FR-011**: The system MUST allow recruiters to search for available interviewers by skill, date range, and business unit.
- **FR-012**: The system MUST allow recruiters to book, reschedule, and delete interview slots.
- **FR-013**: The system MUST support direct slot booking without requiring a prior availability slot.
- **FR-014**: The system MUST provide hierarchical, versioned, technology-specific feedback form templates to interviewers.
- **FR-015**: The system MUST link submitted feedback to the corresponding interview slot and update the slot's feedback status.
- **FR-016**: The system MUST generate downloadable Excel pipeline reports filtered by date range, skill, interview type, business unit, and account.
- **FR-017**: The system MUST generate downloadable PDF feedback reports for individual interview slots.
- **FR-018**: The system MUST send automated aging SLA alerts (with Excel attachments) to skill group and tower lead distribution lists.
- **FR-019**: The system MUST send interview reminder notifications to interviewers before their scheduled interviews.
- **FR-020**: The system MUST send feedback status notifications to recruiters/PMO when interviewers mark feedback status.
- **FR-021**: The system MUST send feedback form reminder notifications to interviewers who have not submitted feedback after completing an interview.
- **FR-022**: The system MUST allow admins to register new users with roles, skills, BU, grade, accounts, and supervisor assignments.
- **FR-023**: The system MUST allow admins to update existing user attributes without affecting unrelated records.
- **FR-024**: The system MUST serve all reference/master data (statuses, skills, grades, market units, accounts, practices, technologies) via a unified lookup API.
- **FR-025**: The system MUST expose runtime configuration properties to authorised clients.
- **FR-026**: The system MUST allow external systems to update prescreen records without authentication.
- **FR-027**: The system MUST support employee referral programme intake, providing all form master data in a single response.
- **FR-028**: The system MUST flag referred candidates in the pipeline and capture the referrer's identity.
- **FR-029**: The system MUST integrate with a calendar service (Teams/Graph API) to create and manage meeting links for scheduled interviews.
- **FR-030**: The system MUST store and serve candidate documents (resumes, attachments, screenshots) via a secure cloud file store with pre-signed access URLs.

### Key Entities

- **Candidate**: The central recruitment subject. Has profile data (name, skills, experience, CTC, notice period, company), a status trail, comments, documents, and aging metrics.
- **CandidateStatus**: A point-in-time status record for a candidate. Only one record per candidate may be open (no end date) at any time.
- **Employee**: A registered platform user (recruiter, interviewer, lead, admin, PMO). Has grade, BU, practice, skills, accounts, and role assignments.
- **EmployeeRole**: A role assigned to an employee. Controls access to features and data visibility.
- **InterviewerCalendarEntry**: An interviewer's availability or booked slot. Contains date/time, participation type, skills, booking status, and feedback status.
- **RecruiterCalendarEntry**: A recruiter's interview booking. Links candidate, interviewer, interview type, and time slot.
- **FeedbackFormTemplate**: A versioned, hierarchical definition of interview feedback fields for a given technology and practice.
- **FeedbackSubmission**: An interviewer's completed response to a feedback form for a specific interview.
- **PrescreenBatch**: A pre-screening record created by an external intake system, later assigned to a recruiter.
- **ReferralCandidate**: A candidate introduced via the employee referral programme, tracked with referrer identity.
- **SkillGroup / TowerMaster**: Groupings of skills/technologies used for routing alerts and approvals.
- **LookupItem**: A reference data value (status, grade, source, decline reason, etc.) belonging to a named category.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Recruiters can complete a full status change for a candidate (from search to confirmation) in under 60 seconds.
- **SC-002**: Bulk Excel uploads of up to 500 interviewer slots complete within 30 seconds, returning row-level error details for invalid entries.
- **SC-003**: Candidate search queries with up to 5 simultaneous filter criteria return results in under 3 seconds.
- **SC-004**: Aging SLA alert emails are dispatched to all skill group distribution lists within 5 minutes of the scheduled trigger time.
- **SC-005**: Interview reminder notifications reach interviewers at least 15 minutes before the scheduled start time.
- **SC-006**: PDF and Excel report downloads complete within 10 seconds for data sets covering up to 12 months of pipeline activity.
- **SC-007**: All protected endpoints consistently enforce authentication — zero unauthenticated accesses to non-public endpoints in production logs.
- **SC-008**: User registration (single employee with full role and skill assignments) completes in under 5 seconds including welcome email dispatch.
- **SC-009**: 95% of API requests under normal load complete without error.
- **SC-010**: Feedback form retrieval for any technology/practice combination returns the correct active version 100% of the time.

---

## Assumptions

- All frontend clients will pass a valid bearer token in the `Authorization` header for every non-public request.
- The identity provider (Keycloak) is already provisioned and reachable; the backend only validates tokens, it does not issue them.
- Skill group distribution lists are pre-configured in master data and kept current by administrators.
- The cloud file store is available and pre-configured; the platform does not manage storage infrastructure.
- Scheduled alert jobs are triggered externally (via cron, scheduler, or manual HTTP call) during the initial deployment; auto-scheduling can be enabled later.
- Bulk Excel upload files conform to the documented column structure; files with unrecognised headers are rejected as a whole.
- Mobile client support is out of scope; the API is designed for web application consumers.
- Only users registered in the platform's employee master can be assigned as interviewers or recruiters; external-only users are not supported.
- Calendar integration (Teams meetings) requires a valid Microsoft Graph API tenant and app registration pre-configured in environment properties.
- The prescreen public endpoint is trusted at the network level (firewall/API gateway restrictions); no application-level rate limiting is assumed in scope.
- Referral form submission (creating the referral candidate record) is handled by the consuming frontend using the master data returned by this API; the backend receives and persists the resulting candidate record.
