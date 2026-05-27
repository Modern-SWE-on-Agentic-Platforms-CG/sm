# Module: Interviewer Module

## Purpose

Manages the full interviewer lifecycle: availability slot management, interview scheduling (free slots and direct bookings), feedback submission, rescheduling, availability reporting, and deletion of slots.

---

## API Endpoints

Base path: `/interviewer`

### 1. Get All Employees (Interviewer Dropdown)

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/interviewer/getAllEmployees` |
| **Auth** | Required (JWT) |

**Response**: JSON array of employee objects (name, emp ID, email, skills, grade, location).

---

### 2. Get Interviewer Slots (by Availability)

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/getInterviewerSlots` |
| **Auth** | Required (JWT) |

**Request Body**: `CheckAvailabilityDTO`

| Field | Type | Description |
|---|---|---|
| (skill, date range, bu, etc.) | | Criteria to find available interviewers |

**Response**: List of `InterviewerCalenderDetailsDto` containing matching free slots.

---

### 3. Get All Scheduled Slots

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/getAllScheduleSlots` |
| **Auth** | Required (JWT) |

**Request Body**: `CheckScheduleDTO`

**Response**: List of `InterviewerCalenderDetailsDto` for all schedule entries matching criteria.

---

### 4. Save Free Slot

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/saveFreeSlot` |
| **Auth** | Required (JWT) |

**Request Body**: `InterviewerSaveSlotDto`

| Field | Type | Description |
|---|---|---|
| empId | long | Interviewer employee ID |
| fromTime | Date | Slot start time |
| toTime | Date | Slot end time |
| participationTypeId | long | Participation type (e.g., Primary, Secondary) |
| (other fields) | | Slot metadata |

**Business Rule**: `weekendDriveCheck` is always set to `false` before saving.

**Success Response**:
```json
{
  "response": [<InterviewerCalendarSavedSlotDTO>],
  "message": "INTERVIEW SLOT SAVED SUCCESSFULLY"
}
```

---

### 5. Save Interview Slot (Direct Booking)

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/saveInterviewSlot` |
| **Auth** | Required (JWT) |

**Request Body**: `SaveInterviewerSlotDto`

**Purpose**: Directly book an interviewer for a candidate (bypasses free-slot step).

**Success Response**:
```json
{
  "response": [<InterviewerCalendarSavedSlotDTO>],
  "message": "INTERVIEW BOOKED SUCCESSFULLY"
}
```

---

### 6. Update Direct Booked Slot

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/updateDirectBookedSlot` |
| **Auth** | Required (JWT) |

**Request Body**: `SaveInterviewerSlotDto`

**Purpose**: Modify an existing directly booked interview slot.

**Success Response**:
```json
{
  "response": [<InterviewerCalendarSavedSlotDTO>],
  "message": "INTERVIEW UPDATED SUCCESSFULLY"
}
```

---

### 7. Interviewer Dropdown (Filtered)

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/interviewerDropdown` |
| **Auth** | Required (JWT) |

**Request Body**: `InterviewerDropdownRequestDTO`

| Field | Type | Description |
|---|---|---|
| skill | String | Skill to filter interviewers by |
| buId | long | Business unit filter |
| (other filters) | | Grade, location, etc. |

**Response**: List of `InterviewerDropdownDTO` (empId, name, email, grade, skills).

---

### 8. Delete Interview Slot (Free Slot)

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/interviewer/deleteInterviewSlot` |
| **Auth** | Required (JWT) |

**Query Parameter**: `calenderId` (long)

**Business Rule**: Only authorised users may delete slots. Returns error `"YOU ARE NOT AUTHORIZED TO DELETE INTERVIEW SLOTS"` if unauthorised.

**Success Response**:
```json
{
  "response": [true],
  "message": "INTERVIEW SLOT DELETED SUCCESSFULLY"
}
```

---

### 9. Delete Direct Interview Slot

| Property | Value |
|---|---|
| **Method** | DELETE |
| **Path** | `/interviewer/deleteDirectInterviewSlot` |
| **Auth** | Required (JWT) |

**Query Parameter**: `calenderId` (long)

**Success Response**:
```json
{
  "response": [true],
  "message": "INTERVIEW SLOT DELETED SUCCESSFULLY"
}
```

---

### 10. Save Feedback

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/saveFeedback` |
| **Auth** | Required (JWT) |

**Request Body**: `SaveFeedbackDTO`

| Field | Type | Description |
|---|---|---|
| interviewTypeId | long | Interview type reference |
| feedbackStatusId | long | Selected feedback status (0 = not selected) |
| submitFlag | boolean | True when final submission |
| saveFlag | boolean | True when saving draft |
| (feedback data) | | Form field responses |

**Business Rules**:
- If `submitFlag = true` → message is `"FEEDBACK SUBMITTED SUCCESSFULLY"`.
- If interview type is `L1` AND `feedbackStatusId != 0` AND `saveFlag = true` → message is `"FEEDBACK SUBMITTED SUCCESSFULLY"`.
- Otherwise → message is `"FEEDBACK SAVED SUCCESSFULLY"`.

---

### 11. Reschedule Request

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/rescheduledRequest` |
| **Auth** | Required (JWT) |

**Request Body**: `RescheduleRequestDto`

**Purpose**: Flag an interview slot as reschedule-requested. Triggers email notification.

---

### 12. Interview Type Report

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/interviewer/interviewTypeReport` |
| **Auth** | Required (JWT) |

**Response**: List of `StatusCountDto` — count of interviews grouped by type.

---

### 13. Add Supervisor

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/addSupervisior` |
| **Auth** | Required (JWT) |

**Request Body**: `SupervisorDTO`

**Purpose**: Assign a supervisor to an interviewer.

---

### 14. Get Availability

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/getAvailibility` |
| **Auth** | Required (JWT) |

**Request Body**: `SlotDto`

**Response**: List of `AvailabilityDTO` showing interviewer availability windows.

---

### 15. Interview Success Report

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/interviewer/interviewSuccessReport` |
| **Auth** | Required (JWT) |

**Request Body**: `TimeDTO` (date range)

**Response**: List of `StatusDTO` — interview outcomes grouped by status.

---

## Data Model (INTERVIEWER_CALENDAR table)

See [17-data-models.md](17-data-models.md) — `InterviewerCalendarDetailsEntity`.

Key fields:

| Column | Type | Notes |
|---|---|---|
| `INTERVIEWER_CALENDAR_ID` | long (auto) | PK |
| `EMP_ID` | long (FK) | Interviewer employee |
| `CANDIDATE_DETAIL_ID` | long (FK) | Candidate |
| `CANDIDATE_NAME` | String | Denormalised name |
| `FROM_TIME` | Date | Slot start |
| `TO_TIME` | Date | Slot end |
| `IS_BOOKED` | boolean | Slot is occupied |
| `IS_DIRECT_BOOKED` | boolean | Direct booking |
| `ACTIVE_FLAG` | boolean | Soft delete |
| `FEEDBACK_STATUS_ID` | long (FK) | Current feedback status |
| `IS_RESCHEDULE` | boolean | Rescheduled |
| `IS_RESCHEDULE_REQUESTED` | boolean | Reschedule requested |
| `IS_REMINDED` | boolean | Reminder sent |
| `IS_FEEDBACK_EMAIL` | boolean | Feedback email sent |
| `IS_CANCELLED` | boolean | Cancelled |
| `TEMPLATE_ID` | long (FK) | Feedback template |
| `RECRUITER_CALENDER_ID` | long (FK, OneToOne) | Linked recruiter calendar entry |

---

## Business Rules

- Slot duration is governed by `constants.properties` (`slotDuration = 1` hour).
- Slot booking window: `fromTime = 8 AM`, `toTime = 8 PM` (IST).
- Duplicate slot booking is prevented — error: `"SLOT ALREADY BOOKED BY RECRUITER"`.
- Non-existent slot raises: `"INTERVIEW SLOT DOES NOT EXIST"`.
- Unauthorised slot view: `"YOU ARE NOT AUTHORIZED TO VIEW INTERVIEW SLOTS"`.
- L2 direct select flag (`IS_DIRECT_L2_SELECT`) is set for direct L2 confirmations.
- Panel not available (`PANEL_NOT_AVAILABLE`) and candidate not available (`CANDIDATE_NOT_AVAILABLE`) states are tracked.

---

## Service Dependencies

| Service | Notes |
|---|---|
| `InterviewerService` / `InterviewerServiceImpl` | Main business logic |
| `UploadFeedbackPDFServiceImpl` | For PDF generation linked to feedback |

## Error Constants

| Constant | Message |
|---|---|
| `NOT_AUTHOTIZE_DELETE_INTERVIEW_SLOTS` | YOU ARE NOT AUTHORIZED TO DELETE INTERVIEW SLOTS |
| `NOT_AUTHOTIZE_VIEW_INTERVIEW_SLOTS` | YOU ARE NOT AUTHORIZED TO VIEW INTERVIEW SLOTS |
| `SLOT_ALREADY_BOOKED` | SLOT ALREADY BOOKED BY RECRUITER |
| `SLOT_NOT_EXISTS` | INTERVIEW SLOT DOES NOT EXIST |
| `NO_INTERVIEWER_AVAILABLE` | NO INTERVIEWER AVAILABLE |
