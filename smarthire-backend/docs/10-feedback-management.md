# SmartHire — Feedback Management

## Module Purpose
Manages the structured interviewer feedback collection process. Tracks feedback form submissions per candidate per interview round (L1, L2, L3). Supports versioned feedback templates per technology, PDF generation and storage, feedback status tracking, email reminders for pending feedback, and feedback export to Excel.

---

## 1. User Stories

- As an **Interviewer (Panel Member)**, I want to submit structured feedback after an interview so that the evaluation is recorded.
- As a **Recruiter**, I want to know which panel members have not submitted feedback so that I can send reminders.
- As a **Recruiter**, I want to download a candidate's feedback PDF so that I can share it in the approval chain.
- As a **PMO/Admin**, I want to view a report of feedback submission statuses across all candidates so that compliance is monitored.
- As a **PMO**, I want to export feedback data to Excel for offline analysis.
- As a **Recruiter**, I want feedback reminders to be automatically emailed to panel members daily so that feedback is not delayed.

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/report/feedbackFormReport` | Yes | Fetch feedback submission status report |
| POST | `/report/exportFeedbackExcel` | Yes | Export feedback report to Excel |
| POST | `/excel/feedbackExportExcel` | Yes | Export structured feedback data to Excel |
| POST | `/panel/fetchOldFeedback` | Yes | Fetch old (PDF-based) feedback for a candidate |
| POST | `/panel/checkingOldOrNewFeedback` | Yes | Determine old vs new feedback form version |
| GET  | `/panel/fetchCommunicationSkills` | Yes | Fetch communication skill rating options |
| GET  | `/panel/fetchNewRatings` | Yes | Fetch rating scale options (new form) |
| GET  | `/panel/fetchNewCandidateRoles` | Yes | Fetch candidate role options |
| POST | `/panel/fetchNewCandidateRoles1` | Yes | Fetch candidate roles filtered by criteria |
| POST | `/downloadExcel/pdfDump` | Yes | Download candidate feedback PDF |
| POST | `/download/dump` | Yes | General document download (incl. feedback) |

---

## 3. Feedback Form Structure

### Form Versioning
- **Old feedback**: PDF uploaded to S3, path stored in `old_feedback_form_pdf_link`
- **New feedback**: Structured form stored in `interviewer_feedback`, template defined in `feedback_form` + `feedback_template`

### Feedback Form Template (`feedback_form`)
| Field | Type | Description |
|-------|------|-------------|
| feedback_form_id | BIGINT (PK) | Template entry ID |
| description | STRING | Question description |
| dropdown_hint | STRING | Hint text for dropdown input |
| feedback_seq_id | BIGINT | Ordering sequence |
| heading | STRING(500) | Section heading |
| is_active | BOOLEAN | Whether question is active |
| is_button | BOOLEAN | Whether rendered as button group |
| is_required | BOOLEAN | Mandatory field flag |
| version | DOUBLE | Form version number |

### Technology Template (`technology_template`)
- Maps `technology_master` → `feedback_template` (which version of the form to use per technology)

### Feedback Submission (`interviewer_feedback`)
- Stores each answer to the feedback form
- Linked to `interviewer_calendar` (specific interview slot)
- `is_submit = true` on `interviewer_calendar` marks feedback as submitted

---

## 4. Feedback Status Tracking

### `feedback_status` table
Tracks the outcome of each interview feedback:
- Common values: `Select`, `Reject`, `On Hold`, `L1 Panel NA`, `L2 Panel NA`, `L3 Panel NA`
- Linked to `interviewer_calendar.feedback_status_id`

### Feedback NA Statuses
Three special statuses tracked separately:
- `L1 FB NA` — L1 panel marked feedback not available
- `L1-L2 FB NA` — L1-L2 combined round feedback NA
- `L2 FB NA` — L2 panel feedback NA

### Feedback Report Status Groups (from `feedbackformReport.js`)
```
Interviewed Status = [BU_Approved, Tower_Input_Required, L1_Reject, L2_Scheduled, L1_L2_Select,
  BU_Reject, L1_Select, Offer_Sent_For_Approval, L2_Reject, DG_Reject, L1_L2_Reject, L2_Select,
  Joined, Offer_in_system, Offer_Released, Offer_Decline, HR_Reject, L2_Candidate_NA,
  Offer_Accept, L2_Panel_NA, Offer_Negotiation, Offer_Rejected, L3_Reject, HR_Select,
  NA_Appr, Tower_Approved, ID_Awaited, DocsSub, TestTaken]

Post-L2 Active Cases = [BU_Approved, Tower_Input_Required, L1_L2_Select, Offer_Sent_For_Approval,
  L2_Select, L3_Select, HR_Select, N/A_Select, Tower_Approved, ID_Awaited, DocsSub, TestTaken,
  NA_Appr, Offer_Negotiation]

Offer Statuses = [Offer_Accept, Offer_Released, Offer_in_system]
```

---

## 5. Feedback Report (`POST /report/feedbackFormReport`)

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "practice_id": 1,
  "sourceIds": "1,2,3"
}
```

**Response:** List of candidates with feedback metadata:
```json
[
  {
    "candidate_name": "John Doe",
    "skill": "Java",
    "status_type": "L2 Select",
    "l1_form_submitted": true,
    "l2_form_submitted": false,
    "l1_panel": "panel@capgemini.com",
    "l2_panel": "panel2@capgemini.com",
    "L1PanelEmail": "...",
    "L2PanelEmail": "...",
    "L3PanelEmail": "...",
    "Interviewed_Status": "L2 Select",
    "FB_Status": "...",
    "FB_NA_Status": "..."
  }
]
```

**Report Columns (output Excel):**
```
Candidate name, FTE, Skill, Skill Cluster, Email ID, Phone Number,
Account, Profile received date, L2 Select Date, Vendor Name,
Recruiter Coordinator, Notice Period, Level/Grade Offered,
Docs Sub date, Test taken Dt, Sent for appr, BU Aprv Dt,
Offer Release date, Current Status, L1 form submitted,
L2 form submitted, L3 form submitted, Panel Email(s), ...
```

---

## 6. Automated Feedback Reminder Emails

### Cron Schedule
- **Daily at 10:00 AM**: `feedbackformRptController.sendfeedBackEmailRemainder()`
- **Hourly on Mon–Sat**: `job.triggerEmailReminders()` (new feedback reminder)

### Reminder Logic
1. Find all `interviewer_calendar` records where:
   - `is_booked = true`
   - `feedback_status_id IS NULL` (no feedback submitted)
   - Interview date is in the past
2. Group by `emp_id` (panel member)
3. Send email to each panel member listing pending feedback candidates
4. From: `smartrecruit@capgemini.com`
5. Subject: Contains pending interview details

### Email Transport
- **SMTP Host**: AWS SES (`email-smtp.eu-west-1.amazonaws.com`)
- **Port**: 25
- **Connection timeout**: 240,000ms

---

## 7. PDF Feedback Storage

- Feedback PDFs generated after interview completion
- Stored in S3 at path: `${feedback_form_pdf_link.feedback_path}/${feedback_pdf_file_name}`
- `old_feedback_form_pdf_link` table tracks legacy PDF links
- Pre-signed URL endpoint provides temporary secure access

---

## 8. Error Handling

| Scenario | Response |
|----------|----------|
| No feedback found | Empty array |
| Email send failure | Logged to console, silent to user |
| DB error | `500 { error: true, Message: <error> }` |
| Feedback export errors | Error logged per candidate row |
