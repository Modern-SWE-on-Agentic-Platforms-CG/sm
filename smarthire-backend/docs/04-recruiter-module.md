# Module: Recruiter Module

## Purpose

Manages the recruiter side of interview scheduling: viewing and managing recruiter calendar slots, direct booking, rescheduling, deletion, feedback form generation/retrieval, and access to a list of recruiters.

---

## API Endpoints

Base path: `/recruiter`

### 1. Get Direct Recruiter Slots

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/recruiter/getDirectRecruiterSlots` |
| **Auth** | Required (JWT) |

**Request Body**: `DirectBookedDTO`

**Purpose**: Retrieve recruiter calendar slots that were directly booked (bypassing the availability matching step).

**Response**: List of `RecruiterCalendarDetailsDto`.

---

### 2. Save Interview Slot

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/recruiter/saveInterviewSlot` |
| **Auth** | Required (JWT) |

**Request Body**: `SaveRecruiterSlotDto`

| Field | Type | Description |
|---|---|---|
| recruiterEmpId | long | Recruiter employee ID |
| candidateName | String | Candidate name |
| candidateDetailId | long | Candidate ID |
| technologyId | long | Technology/skill being interviewed |
| interviewTypeId | long | Interview type (L1, L2, HR, etc.) |
| interviewerId | long | Assigned interviewer ID |
| buId | long | Business Unit |
| fromTime | Date | Interview start |
| toTime | Date | Interview end |
| (other fields) | | Comments, meeting details |

**Response**: `RecruiterCalendarDetailsDto`.

---

### 3. Reschedule Slot

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/recruiter/rescheduleSlot` |
| **Auth** | Required (JWT) |

**Request Body**: `SaveRecruiterSlotDto`

**Purpose**: Move an existing booked slot to a new time.

**Success Response**:
```json
{
  "response": [<RecruiterCalendarDetailsDto>],
  "message": "RESCHEDULED SLOT SUCCESSFULLY"
}
```

---

### 4. Delete Slot

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/recruiter/deleteSlot` |
| **Auth** | Required (JWT) |

**Request Body**: `SaveRecruiterSlotDto`

**Success Response**:
```json
{
  "response": [true],
  "message": "DELETED SLOT SUCCESSFULLY"
}
```

---

### 5. Generate Feedback Form

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/recruiter/feedbackForm` |
| **Auth** | Required (JWT) |

**Request Body**: `InterviewTypeDTO`

| Field | Type | Description |
|---|---|---|
| interviewTypeId | long | Interview type (L1, L2, etc.) |
| (other fields) | | Additional context |

**Purpose**: Generate the feedback form template to be presented to the interviewer.

**Response**: `FormDTO` containing form structure (headings, questions, data types, required flags).

**Success Message**: `"FEEDBACK FORM GENERATED SUCCESSFULLY"`

---

### 6. Fetch Feedback Form Response (PDF)

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/recruiter/feedbackFormPDf` |
| **Auth** | Required (JWT) |

**Query Parameters**:
- `interviewTypeId` (long)
- `recruiterCalendarId` (long)

**Purpose**: Retrieve the filled feedback form response for generating/viewing a PDF.

**Response**: `FeedbackPdfDTO`.

---

### 7. Get All Recruiters

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/recruiter/getAllRecuiters` |
| **Auth** | Required (JWT) |

**Purpose**: Return list of all active recruiter and PMO employees.

**Response**: JSON array of employee records.

---

### 8. Get Recruiter Slots by Month

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/recruiter/getAllRecruiterSlotsByMonth` |
| **Auth** | Required (JWT) |

**Request Body**: `EmailDto`

| Field | Type | Description |
|---|---|---|
| email | String | Recruiter email |

**Purpose**: Fetch all interview slots for a recruiter within the current or specified month.

**Response**: List of `RecruiterCalendarDetailsDto`.

---

## Data Model (RECRUITER_CALENDAR table)

See [17-data-models.md](17-data-models.md) — `RecruiterCalendarDetailsEntity`.

Key fields:

| Column | Type | Notes |
|---|---|---|
| `RECRUITER_CALENDAR_ID` | long (auto) | PK |
| `EMP_ID` | long (FK) | Recruiter employee |
| `CANDIDATE_NAME` | String | Denormalised |
| `CANDIDATE_DETAIL_ID` | long (FK) | Candidate |
| `COMMENTS` | String (max 1500) | Free text |
| `IS_INTERVIEWER_ASSIGNED` | boolean | Interviewer linked |
| `TECHNOLOGY_ID` | long (FK) | Technology being evaluated |
| `INTERVIEW_TYPE_ID` | long (FK) | L1/L2/HR etc. |
| `INTERVIEWER_ID` | long (FK, nullable) | Assigned panel member |
| `BU_ID` | long (FK) | Business Unit |
| `FROM_TIME` | Date | Slot start |
| `TO_TIME` | Date | Slot end |
| `ACTIVE_FLAG` | boolean | Soft delete |
| `IS_REVISIT` | boolean | Revisit flag |
| `IS_REUPLOAD` | boolean | Feedback re-upload flag |

Relationship: `RECRUITER_CALENDAR` ↔ `INTERVIEWER_CALENDAR` is OneToOne.

---

## Business Rules

- Only one interviewer can be assigned per recruiter calendar entry.
- Rescheduling creates a new slot record and inactivates the old one.
- PMO coordinators and recruiters share the same employee data but have different role assignments.
- Feedback form generation depends on the `interview_type_id` and the assigned feedback template.
- Direct booking skips interviewer availability matching.

---

## Service Dependencies

| Service | Notes |
|---|---|
| `RecruiterService` / `RecruiterServiceImpl` | Main business logic |

## Repository Dependencies

| Repository | Table |
|---|---|
| `RecruiterCalendarDetailsRepository` | `RECRUITER_CALENDAR` |
| `FeedbackFormDetailsRepository` | `FEEDBACK_FORM` |
| `FeedbackFormPdfStoringRepository` | `FEEDBACK_FORM_PDF_STORING` |
| `InterviewTypeMasterRepository` | `INTERVIEW_TYPE_MASTER` |

---

## Error States

| Condition | Handling |
|---|---|
| Service exception | `exception` field in response |
| Parse exception | `exception` field in response |
| Slot not found | `SmarthireException` → `exception` in response |
