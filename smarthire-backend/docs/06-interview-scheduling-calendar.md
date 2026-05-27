# SmartHire — Interview Scheduling & Calendar

## Module Purpose
Manages the end-to-end interview scheduling process. Handles recruiter-side and interviewer/panel-side calendar slots, bulk upload of interview schedules, slot availability, panel assignment, revisit scheduling, and access to monthly interview views. Also manages employee panel information lookup.

---

## 1. User Stories

- As a **Recruiter**, I want to upload an Excel file with interview slots so that candidates are scheduled in bulk.
- As a **Recruiter**, I want to view all interview slots for a given month grouped by recruiter so that I can track scheduling throughput.
- As an **Interviewer / Panel Member**, I want to view my interview slots for a given month so that I can prepare for scheduled interviews.
- As a **Recruiter**, I want to look up available panel members by BU, technology, and market unit so that I can assign the right interviewer.
- As a **Panel Member**, I want to see which candidates are pending feedback submission so that I do not miss any evaluations.
- As a **Recruiter**, I want to view old feedback forms linked to a candidate so that I have full interview history.

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/instantInterviewUpload/upload` | Yes | Upload interview schedule Excel (bulk) |
| POST | `/interviewer/getAllInterviewerSlotsByMonth` | Yes | Get all interviewer slots for a month |
| POST | `/recruiter/getAllRecruiterSlotsByMonth` | Yes + Role | Get all recruiter slots for a month |
| POST | `/panel/employeeInfo` | Yes | Fetch panel employee details |
| POST | `/panel/getInterviewData` | Yes | Get interview data for a panel member |
| POST | `/panel/fetchAccountLeadMail` | Yes | Get account lead email addresses |
| POST | `/panel/fetchEmpRoles` | Yes | Fetch employee roles (SSO) |
| POST | `/panel/getEmpName` | Yes | Fetch employee name by email |
| POST | `/panel/checkEmployee` | Yes | Check if employee is registered |
| GET  | `/panel/fetchBU` | Yes | Fetch all business units |
| POST | `/panel/fetchAllAccount` | Yes | Fetch accounts by BU |
| POST | `/panel/updateAccountRegionMapping` | Yes | Update account-to-region mapping |
| POST | `/panel/getEmployeeInfo` | Yes | Fetch employee info by market unit |
| POST | `/panel/fetchOldFeedback` | Yes | Fetch historical feedback for a candidate |
| POST | `/panel/checkingOldOrNewFeedback` | Yes | Determine if feedback form is old or new version |
| GET  | `/panel/fetchCommunicationSkills` | Yes | Fetch communication skill options |
| GET  | `/panel/fetchNewRatings` | Yes | Fetch rating scale options |
| GET  | `/panel/fetchNewCandidateRoles` | Yes | Fetch candidate role options |
| POST | `/panel/fetchNewCandidateRoles1` | Yes | Fetch candidate roles filtered |
| GET  | `/panel/fetchRegion` | Yes | Fetch available regions |
| POST | `/panel/getEmpBU` | Yes | Get employee's BU assignment |
| GET  | `/interviewer/getCandidateFeedback` | No | Download candidate feedback document |

---

## 3. Interview Schedule Upload

### `POST /instantInterviewUpload/upload`
- Accepts single file via `multipart/form-data` (field name: `file`)
- File stored temporarily in `uploads/` directory, deleted after processing
- Empty Excel check performed before processing
- Processes each row via `interviewService.processCandidates(filePath, req)`
- Validation errors are collected per row and emailed to `req.body.emailId`

**Expected Excel Columns (from `config.array1`):**
```
Sr No., Candidate Name, Email ID, Contact No, Gender,
TotalExp(Y), Relexp(Y), Interview Type, Capability, Skill,
Interview Date, From Time Slot, To Time Slot,
Panel Email ID, Revisit Flag
```

**Error Email**: If any rows have errors, an HTML table is emailed to the uploader listing `sr_no`, `candidate`, and `message` per error.

---

## 4. Monthly Slot Retrieval

### `POST /interviewer/getAllInterviewerSlotsByMonth`
**Request Body:**
```json
{
  "buId": 1,
  "startDate": "2024-06-01",
  "lastDate": "2024-06-30",
  "practiceId": 1
}
```

**Response**: List of `recruiter_calendar` records joined with:
- `employee_master` (Interviewer) — name, email, grade, location
- `candidate_detail` — candidate name
- `technology_master` — technology/skill name
- `interview_type` — type name (L1, L2, L3, etc.)
- `interviewer_calendar` — booking status, feedback status
- `employee_account` → `account_master` → `market_unit`
- `grade_master` — grade name

**Filter**: `is_revisit = false`, `from_time` within specified month range.

### `POST /recruiter/getAllRecruiterSlotsByMonth`
Same structure, with additional role authorization check (Recruiter/PMO/Lead required).

---

## 5. Calendar Data Models

### `recruiter_calendar` (Recruiter-side scheduling entry)
| Field | Type | Description |
|-------|------|-------------|
| recruiter_calendar_id | BIGINT (PK) | Auto-increment ID |
| emp_id | STRING | Employee (recruiter) ID |
| candidate_name | STRING | Candidate name |
| comments | STRING | Scheduling notes |
| is_interviewer_assigned | BOOLEAN | Whether interviewer is assigned |
| interviewer_id | BIGINT | Assigned interviewer |
| from_time | DATE | Interview start time |
| to_time | DATE | Interview end time |
| active_flag | BOOLEAN | Record active flag |
| is_revisit | BOOLEAN | Whether this is a revisit interview |
| is_reupload | BOOLEAN | Whether re-uploaded |
| candidate_detail_id | BIGINT (FK) | Links to candidate |
| technology_id | BIGINT (FK) | Technology being interviewed for |
| interview_type_id | BIGINT (FK) | Interview type (L1/L2/L3) |

### `interviewer_calendar` (Interviewer/Panel side)
| Field | Type | Description |
|-------|------|-------------|
| interviewer_calendar_id | BIGINT (PK) | Auto-increment ID |
| is_booked | BOOLEAN | Whether slot is booked |
| is_direct_booked | BOOLEAN | Direct booking without slot |
| from_time | DATE | Slot start time |
| to_time | DATE | Slot end time |
| is_meeting_requested | BOOLEAN | Meeting invite sent |
| is_reschedule | BOOLEAN | Rescheduled flag |
| is_reschedule_requested | BOOLEAN | Reschedule requested flag |
| is_feedback_email | BOOLEAN | Feedback email sent |
| is_cancelled | BOOLEAN | Slot cancelled |
| panel_not_available | BOOLEAN | Panel marked N/A |
| candidate_not_available | BOOLEAN | Candidate marked N/A |
| feedback_status_id | BIGINT (FK) | Feedback submission status |
| template_id | BIGINT (FK) | Feedback form template |
| emp_id | BIGINT (FK) | Interviewer employee |
| recruiter_calender_id | BIGINT (FK) | Links to recruiter_calendar |

---

## 6. Panel Information

### Employee Info Lookup
- Filter by market unit (`market_unit_id`), technology (`technology_id`), BU
- Returns: `emp_id`, `emp_name`, `email_id`, `market_unit`, skill list
- Used to assign panel members during scheduling

### Feedback Version Check (`POST /panel/checkingOldOrNewFeedback`)
- Determines whether the linked feedback form uses the old PDF-based system or the new structured form
- Based on presence of record in `old_feedback_form_pdf_link` vs structured `feedback_form`

---

## 7. Business Rules

- Interview types tracked: `L1`, `L2`, `L3`, `L1-L2` (combined)
- Revisit interviews are tracked separately via `is_revisit` flag
- Feedback status drives the `interviewer_calendar.feedback_status_id` field (lookup: `feedback_status` table)
- `from_time` stored in UTC; server adds `+5:30` for IST display
- A `jrmapped_to` (JR / SF / SO ID) is tracked per candidate via `candidate_recruit_detail`

---

## 8. Error Handling

| Scenario | Response |
|----------|----------|
| No file uploaded | `400 { error: true, Message: "No file uploaded." }` |
| Empty Excel file | `400 { error: true, Message: "Uploaded Excel file is empty." }` |
| Processing errors | Errors emailed to uploader; `200 { error: false, Message: "File processed successfully." }` |
| Internal error | `500 { error: true, Message: "Internal server error." }` |
| No slots found | Empty array |
