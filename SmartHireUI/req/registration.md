# SmartHire UI - Registration and Role Selection Specification

## Module: Registration (`/register`)

Public route — no auth guard required.

### Purpose

Allows new employees to self-register in SmartHire by providing their professional information, BU, practice, skills, and desired roles.

### Navigation Flow

1. User arrives at `/register`
2. Employee info pre-filled from `localStorage["employeeInfo"]` (set from SSO JWT)
3. User selects BU → roles and practices dynamically loaded
4. User completes form → clicks Submit → validation runs → data POSTed
5. On success → redirect to `/selectrole`

### Form Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | Text (pre-filled) | Yes | From JWT token |
| Email | Text (pre-filled) | Yes | From JWT token |
| Employee ID (GGID) | Text (pre-filled) | Yes | From JWT token |
| Role(s) | Multi-select dropdown | Yes | Filtered by BU |
| Organization (BU) | Dropdown | Yes | |
| Practice | Dropdown | Yes | |
| Grade | Dropdown | Yes | |
| Location | Text | Yes | |
| Market Unit | Dropdown | Conditional | Hidden for Invent BU |
| Technology / Skill | Multi-select | Conditional | Required for Interviewer / Lead roles |
| Tower | Multi-select | Conditional | Required for Tower Lead role |

### Dynamic Field Visibility Flags

| Flag | Effect |
|---|---|
| `interviewerElements` = true | Show Technology and Market Unit |
| `towerLeadElements` = true | Show Tower fields |
| `marketUnitFlag` = false | Hide Market Unit (Invent BU) |
| `practiceElements` = true | Show Practice field |
| `roleElements` = true | Show Role dropdown (after BU selected) |

### BU-Specific Logic

- **GCCA**: Interviewer only → show Technology + Market Unit; Tower Lead only → show Tower; both → show all
- **SAP**: Different role combos with capability-based logic
- **Invent**: Market Unit hidden

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `panel/fetchBU` | Load Business Unit list |
| GET | `lookup/getRoles?buId={id}` | Load roles for selected BU |
| POST | `admin/fetchSkillByTemplate` | Load skills/technology by practice |
| POST | `admin/fetchAllTowers` | Load towers by practice |
| GET | `panel/fetchAllAccount` | Load account list |

### Error States

- Missing required field → inline client-side validation error
- Backend failure → toastr error notification
- BU/practice fetch failure → error logged to console

---

## Module: Role Selection (`/selectrole`)

### Purpose

Lets authenticated employees choose which role to operate under for the current session.

### Navigation Flow

1. User arrives at `/selectrole` after login
2. Roles loaded from `localStorage["roles"]`
3. User selects a role → clicks Proceed
4. System sets `localStorage["role"]` and `localStorage["scheduleFlag"]`
5. User routed to their home screen based on role

### Role to Route Mapping

| Role | Target Route |
|---|---|
| Interviewer | `/todolist` (if pending items) or `/weekend-drive` |
| Recruiter (non-SAP) | `/todolist` |
| Recruiter (SAP) | `/upload` |
| PMO (non-SAP) | `/todolist` |
| PMO (SAP) | `/upload` |
| Lead | `/upload` |
| Practice Lead | `/todolist` |
| Tower Lead / SL-BU Lead / NA Lead / Recruiter Lead | `/work-flow` |
| BU Admin / Practice Admin | `/master-data` |
| Admin / SuperUser | `/candidate-referral` |
| Referral SPOC | `/candidate-referral` |

### Interviewer Special Routing Logic

- Calls `GET /todoController/interviewscheduledtoday`
- Calls `GET /todoController/fetchPendingFeedbacks`
- If both lists are empty → route to `/weekend-drive`
- Otherwise → route to `/todolist`

### Business Rules

- `scheduleFlag="true"` for: Recruiter, PMO, Lead, Tower Lead, SL-BU Lead, NA Lead, Recruiter Lead, Practice Lead
- `scheduleFlag="false"` for: Interviewer, Admin roles
