# SmartHire — Export & File Management

## Module Purpose
Handles all file-based operations: Excel report generation and download, PDF generation, bulk data exports, S3 file storage/retrieval, resume handling, and scheduled file cleanup. Provides structured export of candidate, feedback, PMO, L2 aging, DOJ, and ARC deviation data.

---

## 1. Sub-Modules

| Sub-Module | File | Description |
|-----------|------|-------------|
| Export Excel (Refactored) | `exportExcelRefactor.js` | Unified Excel export endpoint |
| Export Excel (Legacy) | `exportExcel.js` | Legacy PDF dump and specialized exports |
| Feedback Export Excel | `feedbackExportExcel.js` | Feedback-specific Excel export |
| S3 Upload | `s3Upload.js` | Generic S3 upload handler |
| Resume Upload | `resumeUpload.js` | Candidate resume upload to S3 |
| Resume Dump | `resumeDump.js` | Bulk resume PDF download |
| Email Upload | `EmailUpload.js` | Email attachment upload |
| Comment File Upload | `commentFileUpload.js` | Comment attachment upload |
| Project Upload | `projectUpload.js` | Project file upload |
| Interview Video Upload | `InterviewVideoUpload.js` | Interview video upload |
| L2 Select Upload | `l2SelectUpload.js` | L2 select data upload |

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/downloadExcel/exportExcel` | Yes | Unified Excel export (refactored) |
| POST | `/downloadExcel/exportExcelPMO` | Yes | PMO report Excel export |
| POST | `/downloadExcel/exportExcelL2AgingReport` | Yes | L2 aging report Excel export |
| POST | `/downloadExcel/exportExcelDOJReport` | Yes | DOJ (joining) report Excel export |
| POST | `/download/dump` | Yes | PDF file download |
| POST | `/downloadExcel/pdfDump` | Yes | Candidate feedback PDF download |
| GET  | `/downloadExcel/agingCalc` | Yes | Trigger aging calculation |
| GET  | `/fetchAllExcelHistory` | Yes | Fetch list of generated Excel files |
| GET  | `/deleteExcelHistory` | Yes | Delete old Excel history records |
| POST | `/excel/feedbackExportExcel` | Yes | Feedback data Excel export |
| POST | `/s3Upload/upload` | Yes | Upload file to S3 |
| POST | `/resumeUpload/upload` | Yes | Upload candidate resume |
| POST | `/emailUpload/upload` | Yes | Upload email attachment |
| POST | `/l2SelectUpload/upload` | Yes | Upload L2 select data |
| POST | `/projectUpload/l1FileUpload` | No | Upload L1 project file |
| POST | `/upload/interviewVideoUpload` | No | Upload interview video |
| GET  | `/download/resumeDump` | No | Download bulk resume PDF |
| POST | `/presignedUrl` | Yes | Get S3 pre-signed URL (primary bucket) |
| POST | `/presignedUrl2` | Yes | Get S3 pre-signed URL (secondary bucket) |
| GET  | `/excel/downloadResume` | No | Download candidate resume |
| GET  | `/excel/downlodeReferralScreenshot` | Yes | Download referral screenshot |
| GET  | `/excel/downloadEmail` | Yes | Download email attachment |
| POST | `/excel/downloadFile` | Yes | Download project file |
| POST | `/excel/downloadInterviewVideo` | Yes | Download interview video |

---

## 3. Unified Excel Export (`/downloadExcel/exportExcel`)

**Request Body:**
```json
{
  "reportType": "main",
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "filters": { ... },
  "practice_id": 1
}
```

**Response:** Excel binary stream with `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Main Report Excel Columns (from `config.array`):**
```
Sr No., Duplicate (Y/N), Recvd Dt, Recvd Aging (Days), Quarter, Profile Rec YY, Profile Rec M,
Candidate Name, TotalExp(Y), Relexp(Y), Tower, Skill Group, Skill, Gender,
Source, Vendor / Partner Name, Email ID, Contact No, Current Co, Current Loc,
Preferred/Offered Loc, Current CTC (Lac), Exp CTC (Lac), Offer CTC (Lac),
Counter Offered (Lac), Revised Offered (Lac), Notice Period, Aspiring Test (Y/N), Test Score,
Overall Status, Rejection Reason, Declined Reason, Comments, L2 Rank,
L1 Date, L1 Aging (Days), L1 Type, L1 Panel,
L2 Date, L2 Aging (Days), L2 Type, L2 Panel,
L3 date, L3 Type, L3 Panel,
HR Coordinator, PMO Coordinator, JR Mapped/SF ID/SO ID, Account Name,
BU Head Apprvd Dt, BU Head Apprvd Dt Aging (Days), Level Offered, DOJ,
Dashboard Status, Offered Date, Offered M, Offered YY,
Referral Person Name/Email, College, Level Based On Exp,
Recruitment_Candidate_id, JR_ID, Recruitment_conversion_id
```

---

## 4. PMO Excel Report (`/downloadExcel/exportExcelPMO`)

Exports demand data in PMO-specific format for management reporting. Includes demand status, role details, assigned resources, and open demand metrics.

---

## 5. L2 Aging Report Excel (`/downloadExcel/exportExcelL2AgingReport`)

Columns (from `config.l2SheetArray`):
```
Candidate Detail ID, Candidate name, FTE, Skill, Skill Cluster, Email ID, Phone Number,
Account Mapped to or Bench, SO, Profile received date, L2 Select Date, Vendor Name,
Recruiter Coordinator, Notice Period, Level/Grade Offered, Docs Sub date, Test taken Dt,
Sent for appr, BU Aprv Dt, NA Approval dt, DG Appr Dt, Offer Release date,
Current Status, Previous Status, Last Updated on, Comment,
Total Exp (Y), Rel Exp(Y), Current CTC, Exp CTC, Offer CTC, Counter Offered, Revised Offered,
DOJ, HR Coordinator, Days since L2, Days since Doc received, Skill Group, Skill for DB,
Dashboard Status, Status nbr, Error, Baseline, Offer tracking team, actionable, gender,
Offered Location, l1_account_name, l2_account_name, Recruitment_Candidate_id, JR_ID,
Days Since L2 Select Category, Referral, Rehire, Referred Vendor, Source Name, College,
Level Based On Exp, Recruitment_conversion_id, Business Unit, Current Company,
Employee Id, Capgemini Email Id, Project Code, Region
```

---

## 6. Interview Report Excel (`config.array1`)

Columns:
```
Sr No., Candidate Name, Email ID, Contact No, Gender,
TotalExp(Y), Relexp(Y), Interview Type, Capability, Skill,
Interview Date, From Time Slot, To Time Slot, Panel Email ID, Revisit Flag
```

---

## 7. File Storage Strategy

### S3 Configuration
- **Primary bucket**: `config.BUCKET_NAME` (environment-specific)
- **ACL**: `private` (no public access)
- **Secondary bucket**: `smarthireprod` (legacy, hard-coded)
- Two `AWS.S3` instances used in `excel.js` — one per bucket

### File Path Conventions
| File Type | Path Pattern |
|-----------|-------------|
| Candidate Resume | `${prescreen_batch.resume_path}/${candidate_batch.file_name}` |
| Feedback PDF | `${feedback_form_pdf_link.feedback_path}/${feedback_pdf_file_name}` |
| Referral Resume | Referral-specific S3 path |
| Interview Video | Interview-specific S3 path |
| Email Attachment | Email-specific S3 path |
| Comment Attachment | Comment-specific S3 path |

### Pre-signed URLs
- Generated for secure temporary read access to S3 objects
- `/presignedUrl` — primary bucket
- `/presignedUrl2` — secondary bucket
- URL expiry: Default AWS SDK default (7 days unless overridden)

---

## 8. Excel History Management

### `GET /fetchAllExcelHistory`
Returns all records from `excel_dump` table with metadata: filename, generated_by, generated_date, file_path.

### `GET /deleteExcelHistory`
Deletes `excel_dump` records and associated S3 files older than the retention window.

### Cron: Scheduled Cleanup
- **Schedule**: `0 9,21 * * *` (runs at 9:00 AM and 9:00 PM daily)
- **Action**: Calls `exportExcel.deleteExcelHistory()` to purge stale export files

---

## 9. PDF / Binary Download

### `POST /download/dump`
- Accepts single file (5MB limit via `multiupload.single('file')`)
- Returns file as binary stream or base64

### `POST /downloadExcel/pdfDump`
- Accepts multipart files
- Used for downloading candidate feedback PDFs from S3

### `GET /download/resumeDump`
- No auth required
- Downloads bulk resumes as ZIP archive

---

## 10. Upload Validation

| Upload Type | File Size Limit | Accepted Types | Notes |
|-------------|----------------|---------------|-------|
| Generic (multipleUpload) | No explicit limit | Any | memoryStorage |
| Single file (multiupload) | 5MB | Any | Used for PDF/dump endpoints |
| Project file | No limit | Excel | multer disk storage, `uploads/` |
| Interview video | No limit | Video | memoryStorage |

---

## 11. Error Handling

| Scenario | Response |
|----------|----------|
| File too large | `413 Payload Too Large` (Express default) |
| No file in request | `400 { error: true, Message: "No file uploaded." }` |
| S3 upload failure | Error logged; response includes error details |
| Excel generation failure | `500 { error: true, Message: <error> }` |
| File not found in S3 | Error returned with S3 error code |
