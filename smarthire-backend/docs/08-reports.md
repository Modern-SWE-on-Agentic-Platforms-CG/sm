# Module: Reports

## Purpose

Generates and delivers interview pipeline reports in two formats:
1. **Excel report** — filterable, downloadable via HTTP response stream
2. **PDF report** — per-interview feedback summary, downloadable or viewable

---

## API Endpoints

Base path: `/report`

### 1. Generate Excel Report

| Property | Value |
|---|---|
| **Method** | PUT |
| **Path** | `/report/generateReport` |
| **Auth** | Required (JWT) |

**Query Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `fromTime` | String | Yes | Report start date (inclusive) |
| `toTime` | String | Yes | Report end date (inclusive) |
| `techId` | String | Yes | Technology/skill filter (ID or name) |
| `interviewTypeId` | long | Yes | Interview type filter (0 = all) |
| `downloadId` | long | Yes | Download type selector |
| `filterDaysId` | long | Yes | Days filter option |
| `buId` | long | Yes | Business Unit filter (0 = all) |
| `accountStr` | String | Yes | Account filter (empty = all) |

**Response**: Streams the Excel file directly into `HttpServletResponse`. No JSON wrapper.

**Content-Type**: `application/vnd.ms-excel` or `application/octet-stream` (set by service).

**Purpose**: Export interview pipeline data as an Excel spreadsheet for management reporting.

---

### 2. Generate PDF Feedback Report

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/report/generatePdf` |
| **Auth** | Required (JWT) |

**Query Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `interviewTypeId` | long | Yes | Interview type |
| `recruiterCalendarId` | long | Yes | Recruiter calendar entry ID |
| `interviewerCalendarId` | long | Yes | Interviewer calendar entry ID |

**Response**: Returns String (PDF content or S3 link), written to `HttpServletResponse`.

**Purpose**: Generate a PDF of the interviewer's feedback form response for a specific interview slot.

---

### 3. Generate Report (Async / Background — Variant)

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/report/generateReport1` |
| **Auth** | Required (JWT) |

**Request Body**: `ExcelDTO`

| Field | Type | Description |
|---|---|---|
| (filter fields) | | Criteria for report generation |

**Response**: `boolean` — `true` if report generation succeeded, `false` on error.

**Purpose**: Alternative report generation path (background/alternative implementation).

---

## Excel Report Content

The report contains interview pipeline data. Column headers (from `Constants.java`):

| Column | Source Field |
|---|---|
| Emp ID | Interviewer employee ID |
| Name | Interviewer name |
| Email | Interviewer email |
| Service Line | Service line / BU |
| Location | Location |
| Level / Grade | Grade |
| Skills | Skill set |
| Role | Role |
| Technology | Technology |
| Booking Date | Slot booking date |
| From Time | Slot start time |
| To Time | Slot end time |
| Is Booked | Boolean booked flag |
| Feedback Status | Feedback status label |
| Slot Status | Slot status |
| Account | Account/client |
| Organisation | Organisation |
| Market Unit | Market unit |
| Is Direct Booked | Boolean |
| Candidate Name | Candidate name |
| Recruiter Name | Recruiter name |
| Recruiter Emp ID | Recruiter employee ID |
| Recruiter Email | Recruiter email |
| Participation Type | Primary / Secondary |

---

## PDF Report Content

Generated from interview feedback form responses. Uses iTextPDF + XMLWorker.

Content includes:
- Candidate name, email, technology, interview type
- Interviewer details
- Each feedback form section heading and response
- Overall feedback rating
- Submission timestamp

PDF files are:
1. Generated dynamically from DB data
2. Stored to AWS S3 bucket (`feedbackBucket = smarthireprod`)
3. A link to the stored PDF is persisted in `FEEDBACK_FORM_PDF_LINK_STORING`

---

## Business Rules

- Reports are filtered by date range, technology, BU, interview type, and account.
- `downloadId` controls the type of download (e.g., full report vs. summary).
- `filterDaysId` applies a "last N days" filter on top of the date range.
- PDF generation requires both `recruiterCalendarId` and `interviewerCalendarId` to locate the specific interview slot.

---

## Service Dependencies

| Service | Notes |
|---|---|
| `ReportService` / `ReportServiceImpl` | Excel and PDF generation |
| `ExcelService` / `ExcelServiceImpl` | Low-level Excel file reading utility |

## Repository Dependencies

| Repository | Table |
|---|---|
| `InterviewerRepository` | `INTERVIEWER_CALENDAR` |
| `RecruiterCalendarDetailsRepository` | `RECRUITER_CALENDAR` |
| `FeedbackFormDetailsRepository` | `FEEDBACK_FORM` |
| `FeedbackFormPdfStoringRepository` | `FEEDBACK_FORM_PDF_STORING` |
| `FeedbackFormPdfLinkStoringRepository` | `FEEDBACK_FORM_PDF_LINK_STORING` |

---

## External Dependencies

| Dependency | Purpose |
|---|---|
| Apache POI HSSF | Excel generation |
| iTextPDF 5.x + XMLWorker | PDF generation |
| AWS S3 | PDF storage (`AwsS3ClientConfig`) |

---

## Error States

| Condition | Handling |
|---|---|
| Excel generation failure | Logged via `Logger.error`; exception swallowed at controller |
| PDF generation failure | `IOException`, `DocumentException`, `ParseException` — returns `null` |
| Report data not found | Empty Excel / empty PDF |
