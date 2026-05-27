# SmartHire UI - Feedback Specification

## Module: Mobile Feedback Form (`/feedback`)

### Purpose

Mobile-optimized post-interview evaluation form for Interviewers to submit structured candidate assessments.

### Navigation Flow

1. Interviewer clicks a pending feedback item in `/todolist`
2. Navigates to `/feedback`
3. Form pre-populated from `localStorage["feedBackInputDto"]` (set by calendar event click)
4. Interviewer fills in ratings and remarks
5. On successful submit → navigate to `/dashboard`

### Form Sections

**1. Candidate Info (read-only, pre-filled)**
- Candidate name, technology, interview type, interviewer name, slot time

**2. Technical Evaluation (dynamic, loaded from template)**
- Multiple skill rows; each row: Skill name, Rating (1–5), Remarks (dropdown)
- "Add Row" button to add extra tech evaluation rows

**3. Behavioral Evaluation**
- Dynamic section loaded from feedback template backend

**4. Overall**
- Overall remark (dropdown)
- Feedback status (dropdown): Select, Reject, Hold, etc.

### Form Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Technical Skill Rating | Rating scale 1–5 | Yes | One per skill from template |
| Technical Skill Remarks | Dropdown | Yes | Per skill row |
| Overall Remark | Dropdown | Yes | From lookup data |
| Feedback Status | Dropdown | Yes | Select / Reject / Hold |
| Interview Mode | Dropdown | No | Face-to-Face / Telephonic |

### Business Rules

1. Form is editable only when `feedbackStatus !== 0` AND `feedbackStatus !== 3`
2. Technical Area 1 must be filled before submission
3. Feedback status must be selected before submission
4. `allowSubmitForm` flag controls submit button enabled/disabled state
5. Revisit mode (re-open previously saved feedback) supported via `revisitFlag` in DataShare service
6. All `saveFeedbackDetailsDTOs` collected from `dynamicFeedBackForm` and `candidateDetailsII` sections

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/interviewer/getFeedbackForm` | Fetch dynamic feedback form template for a slot |
| GET | `/panel/fetchNewRatings` | Fetch rating options (1–5 labels) |
| GET | `/panel/fetchCommunicationSkills` | Fetch behavioral skill options |
| GET | `/panel/fetchNewCandidateRoles` | Fetch candidate role options |
| POST | `/interviewer/saveFeedback` | Submit completed feedback form |
| GET | `/interviewer/getRevisitFeedbackForm/{candidate_detail_id}` | Fetch existing feedback for revisit |

### Error Messages

- `"Please fill Technical Area 1 !!"` — required technical section not filled
- `"Please Select Feedback status"` — status dropdown not selected
- Backend failure → toastr shows exception message from response

---

## Module: Web Feedback Form (`/webFeedback`)

### Purpose

Desktop-optimized version of the feedback form. Identical functionality to mobile feedback.

### Key Differences from Mobile Feedback

- No slide/flip animation (`slideOpts` not used)
- Rendered inline on page (not in a carousel)
- Accessible on desktop screens with wider layout

### Navigation Flow

- Navigated to from `/todolist` when `feedbackChange()` is triggered (Interviewer clicks pending feedback row)
- Uses same `feedbackFormEmitter` and `feedbackSuccessEmitter` event pattern
- On submit → navigates back to source list

---

## Module: Feedback Form Report (`/feedbackform-report`)

### Purpose

Generates a downloadable Excel report of all feedback forms for a given date range and filter criteria.

### Screens

1. Filter panel — date range pickers (PrimeNG Calendar), technology filter
2. Report table — paginated list of feedback entries
3. Download Excel button

### Data Displayed

- Candidate name, interviewer, technology, interview date, feedback status, rating summary

### Filters

- Date range (from / to)
- Technology / BU

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `report/feedbackFormReport` | Fetch feedback report data |
| GET | `report/exportFeedbackExcel` | Download Excel export |

### Error States

- No data found → empty table with message
- Export failure → toastr error notification
