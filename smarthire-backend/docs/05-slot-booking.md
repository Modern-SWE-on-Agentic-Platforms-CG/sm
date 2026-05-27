# Module: Slot Booking (Bulk Upload)

## Purpose

Allows bulk upload of interviewer panel availability slots via an Excel file. This is the mechanism by which large batches of interviewer availability are ingested into the system (rather than individual slot-by-slot entry).

---

## API Endpoints

Base path: `/slot`

### 1. Panel Slot Upload

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/slot/panelSlotUpload` |
| **Content-Type** | `multipart/form-data` |
| **Auth** | Required (JWT) |

**Request Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `file` | MultipartFile | Yes | Excel file containing panel slot data |
| `createdBy` | String | Yes | Email of the user performing the upload |

**Response**: `FileDTO`

| Field | Type | Description |
|---|---|---|
| (fields in FileDTO) | | Upload result summary, error rows, success count |

**CORS**: Configured for `*` origins on POST and OPTIONS.

---

## Business Rules

- The uploaded Excel file is parsed row by row.
- Each row represents one interviewer availability slot.
- Rows with errors (invalid format, missing required fields, duplicate slots) are captured in the error result.
- The `createdBy` field is attached to all created records for audit trail.
- After parsing and validation, valid slots are persisted to `INTERVIEWER_CALENDAR`.
- Error rows are returned to the caller for user correction.

---

## Expected Excel File Format

The file (`panelUploadDataFile.xlsx`) contains the following columns (inferred from `Constants.java`):

| Column Header | Field | Notes |
|---|---|---|
| `INTERFVIEWER EMPID` | Interviewer employee ID | Numeric |
| `INTERVIEWER EMAIL` | Interviewer email | |
| `INTERVIEWER NAME` | Interviewer name | |
| `INTERVIEWER GRADE` | Grade | |
| `INTERVIEW TYPE` | Interview type | e.g., L1, L2 |
| `INTERVIEWER LOCATION` | Location | |
| `PARTICIPATION TYPE` | Participation type | Primary / Secondary |
| `INTERVIEWER SKILLS` | Skills | Comma-separated |
| `BOOKING DATE` | Booking date | dd-MM-yyyy |
| `CREATION DATE` | Creation date | dd-MM-yyyy |
| `FROM TIME` | Slot start time | |
| `TO TIME` | Slot end time | |
| `TECHNOLOGY` | Technology / skill | |
| `IS BOOKED` | Booked flag | |
| `FEEDBACK STATUS` | Feedback status | |
| `SLOT STATUS` | Slot status | |
| `ACCOUNT` | Account | |
| `ORGANIZATION` | Organisation | |
| `MARKET UNIT` | Market unit | |
| `IS DIRECTBOOKED` | Direct booked flag | |
| `CANDIDATE NAME` | Candidate name | |
| `RECRUITER NAME` | Recruiter name | |
| `RECRUITER EMPID` | Recruiter employee ID | |
| `RECRUITER EMAIL` | Recruiter email | |

---

## Return DTO: FileDTO

Contains:

| Field | Type | Description |
|---|---|---|
| errorRows | List | Rows that failed validation |
| successCount | int | Number of successfully uploaded slots |
| (other fields) | | File metadata |

---

## Related DTOs

- `ErrorExcelDTO` — captures per-row error details
- `ReaderReturnDTO` — internal parsing result
- `SplitResultDTO`, `SplitReturnDTO` — internal parsing utilities

---

## Service Dependencies

| Service | Notes |
|---|---|
| `SlotBookingService` / `SlotBookingServiceImpl` | Parses Excel, validates, persists |
| `ExcelServiceImpl` | Low-level Excel parsing |

## Repository Dependencies

| Repository | Table |
|---|---|
| `InterviewerRepository` (calendar) | `INTERVIEWER_CALENDAR` |
| `EmployeeMasterRepository` | `EMPLOYEE_MASTER` |

---

## Error States

| Condition | Handling |
|---|---|
| Invalid file format | `SmarthireException` thrown |
| Missing required columns | Row captured in error list |
| Duplicate slot | Row captured in error list |
| IOException during file read | `SmarthireException` |

---

## AWS S3 Integration

Uploaded panel slot files are also stored to AWS S3 for audit purposes:
- **Bucket**: configured via `bucket` / `bucket1` in `common-{profile}.properties`
- **Sub-folder**: `panelslotdata`
- **Region**: `eu-west-1`
