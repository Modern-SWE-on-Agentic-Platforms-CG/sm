# SmartHire — Candidate Management

## Module Purpose
The core module of the system. Manages the full lifecycle of a recruitment candidate — from initial profile upload, through interview stages, to offer and joining. Handles candidate data, status transitions, skill assignments, comments, documents, and file operations.

---

## 1. User Stories

- As a **Recruiter**, I want to upload candidate profiles in bulk via Excel so that candidate records are created automatically.
- As a **Recruiter**, I want to view and update candidate information (CTC, experience, company, notice period) so that profiles stay current.
- As a **Recruiter**, I want to change a candidate's current recruitment status so that the pipeline reflects accurate progress.
- As a **Recruiter**, I want to record the date of joining for accepted candidates so that onboarding is tracked.
- As a **Recruiter**, I want to add comments (with optional attachments) to a candidate so that communication is logged.
- As a **Recruiter**, I want to view a candidate's full status history (cycle view) so that I can understand interview progression.
- As a **PMO/Lead**, I want to search and filter candidates by skill, status, tower, source, and date range so that I can generate pipeline reports.
- As a **Recruiter**, I want to download a candidate's resume from cloud storage so that I can share it with the panel.

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/resumeUpload/upload` | Yes | Upload candidate resume to S3 |
| POST | `/demandUpload/upload` | Yes | Bulk upload demand Excel file |
| POST | `/s3Upload/upload` | Yes | Generic S3 file upload |
| POST | `/candidateInfo/fetchCandidateInfo` | Yes | Fetch full candidate profile by ID |
| POST | `/candidateInfo/updateCandidateInfo` | Yes | Update candidate profile fields |
| POST | `/candidateInfo/addComments` | Yes | Add comment (with optional file attachment) |
| POST | `/candidateInfo/fetchCandidateComments` | Yes | Fetch all comments for a candidate |
| POST | `/candidateInfo/updateSkill` | Yes | Update candidate's assigned skill/tower |
| POST | `/candidateInfo/fetchSources` | Yes | Fetch available sourcing channels |
| POST | `/candidateInfo/fetchVendorsBySource` | Yes | Fetch vendors filtered by source |
| POST | `/candidateInfo/fetchClientReqId` | Yes | Fetch client requisition ID options |
| POST | `/candidateInfo/fetchCandidateCycle` | Yes | Fetch full status history / interview cycle |
| GET  | `/candidateInfo/regions` | Yes | Fetch all candidate regions (dropdown) |
| POST | `/excel/statusChange` | Yes | Change current recruitment status for a candidate |
| POST | `/excel/statusDropdown` | Yes | Fetch available next statuses for a candidate |
| GET  | `/excel/declineReasonDropdown` | Yes | Fetch available decline reasons |
| POST | `/excel/updateDeclineReason` | Yes | Save decline reason for a candidate |
| POST | `/excel/dateOfJoining` | Yes | Set / update date of joining |
| POST | `/excel/rejectionReason` | Yes | Set rejection reason |
| POST | `/excel/fetchAllTechnology` | Yes | Fetch all technologies/skills |
| GET  | `/excel/fetchAllSources` | Yes | Fetch all active source channels |
| POST | `/excel/fetchFilteredCandidatesDataByQuery` | Yes | Filtered candidate list with pagination/compression |
| GET  | `/excel/downloadResume` | No | Download candidate resume from S3 |
| GET  | `/excel/downlodeReferralScreenshot` | Yes | Download referral screenshot |
| GET  | `/excel/downloadEmail` | Yes | Download email attachment |
| POST | `/excel/downloadFile` | Yes | Download project file attachment |
| POST | `/excel/downloadInterviewVideo` | Yes | Download interview video |
| POST | `/presignedUrl` | Yes | Get S3 pre-signed URL for file access |
| POST | `/presignedUrl2` | Yes | Get S3 pre-signed URL (alternate bucket) |

---

## 3. Key Business Rules

### Status Transition
- Each candidate has exactly **one active status** (`status_end_date IS NULL` in `candidate_status`)
- When a status changes, the old record gets `status_end_date` set; a new record is inserted
- Status names follow a predefined hierarchical flow:
  ```
  PreScreen Processing → PreScreen Select / PreScreen Reject
  → L1 Scheduled → L1 Select / L1 Reject / L1 On Hold / L1 Candidate NA / L1 Panel NA
  → L2 Scheduled → L2 Select / L2 Reject / L2 On Hold / L2 Candidate NA / L2 Panel NA
  → L1-L2 Scheduled → L1-L2 Select / L1-L2 Reject / L1-L2 On Hold
  → L3 Scheduled → L3 Select / L3 Reject / L3 On Hold
  → HR Select → HR Reject
  → BU Approved / BU Reject
  → Tower Input Required → Tower Approved / Tower Reject
  → DG_Appr / DG_Reject
  → NA_Appr / NA_Reject
  → Offer Sent for Appr → Offer_Negotiation
  → Offer in system → Offer_Released → Offer-Accept / Offer-Decline
  → Joined / Not Joined
  ```
- Special statuses: `Not Interested`, `Not Reachable`, `Candidate Not resp/interest`, `Random`, `Open for All`, `On Hold`

### Aging Calculation
- `aging = DATE(now()) - DATE(recvd_date)` (days since profile was received)
- L1 Aging = `l1_date - recvd_date`
- L2 Aging = `l2_date - l1_date` (or `l2_date - recvd_date` for combined L1-L2)
- BU Head Approved Date Aging = `bu_head_apprvd_dt - l2_select_date`

### Experience-Based Rules
- If `total_exp >= 10` OR skill contains `"ARCHITECT"` and status is `L2 Select` or `L1-L2 Select` → special flag (`statusFlag = false`) to potentially escalate to L3
- Otherwise `statusFlag = true`

### Duplicate Detection
- `candidate_info_detail.duplicate` field tracks whether a profile is a duplicate (`"Y"` / `"N"`)

### Date of Joining (DOJ)
- Only set when candidate status reaches offer-accepted stages
- Stored in `candidate_info_detail.date_of_joining`

---

## 4. Data Inputs (Upload)

### Resume Upload
- **File type**: PDF / Document
- **Storage**: AWS S3
- **Metadata stored in**: `candidate_batch` (file_name, prescreen_batch_id)
- **Bucket**: Configurable via `config.BUCKET_NAME`

### Candidate Excel Bulk Upload
- Uploaded via `/demandUpload/upload` (demand) or `/resumeUpload/upload` (resumes)
- Parsed server-side using `convert-excel-to-json` / `read-excel-file`
- Expected columns (from config `array`):
  ```
  Sr No., Duplicate (Y/N), Recvd Dt, Candidate Name, TotalExp(Y), Relexp(Y),
  Tower, Skill Group, Skill, Gender, Source, Vendor/Partner Name,
  Email ID, Contact No, Current Co, Current Loc, Preferred/Offered Loc,
  Current CTC (Lac), Exp CTC (Lac), Offer CTC (Lac), Counter Offered (Lac),
  Revised Offered (Lac), Notice Period, Aspiring Test (Y/N), Test Score,
  Overall Status, Rejection Reason, Declined Reason, Comments, ...
  ```

---

## 5. Candidate Profile — Key Data Fields

| Field | Source Table | Type | Description |
|-------|-------------|------|-------------|
| candidate_name | candidate_detail | STRING | Full name |
| email_id | candidate_detail | STRING | Personal email |
| contact_number | candidate_detail | STRING | Phone number |
| current_location | candidate_detail | STRING | Current city |
| gender | candidate_detail | STRING | M/F/Other |
| account_name | candidate_detail | STRING | Account being hired for |
| region | candidate_detail | STRING | Geographic region |
| current_company | candidate_info_detail | STRING | Current employer |
| current_ctc | candidate_info_detail | STRING | Current salary (Lac) |
| expected_ctc | candidate_info_detail | STRING | Expected salary (Lac) |
| offer_ctc | candidate_info_detail | STRING | Proposed offer (Lac) |
| approved_offer_ctc | candidate_info_detail | STRING | Approved offer after negotiations |
| notice_period | candidate_info_detail | STRING | Notice period in days |
| total_exp | candidate_info_detail | STRING | Total years of experience |
| relevant_exp | candidate_info_detail | STRING | Relevant experience years |
| recvd_date | candidate_info_detail | DATE | Profile received date |
| date_of_joining | candidate_info_detail | DATE | Confirmed joining date |
| proposed_grade | candidate_info_detail | STRING | Grade proposed for hire |
| level_offered | candidate_info_detail | STRING | Level offered |
| joining_bonus | candidate_info_detail | STRING | Joining bonus amount |
| hike_percent | candidate_info_detail | STRING | Salary hike percentage |
| college | candidate_info_detail | STRING | Educational institution |
| is_immediate_joinee | candidate_info_detail | BOOLEAN | Can join immediately |
| arc_deviation | candidate_info_detail | STRING | ARC (hiring norms) deviation flag |
| band_deviation | candidate_info_detail | STRING | Band deviation flag |
| is_referral | candidate_info_detail | BOOLEAN | Whether referral candidate |
| duplicate | candidate_info_detail | STRING | Duplicate profile flag |

---

## 6. Candidate Status Cycle View Response

Each entry in the status history contains:
- `status_type` — The status label
- `created_by` — Email of user who set the status
- `created_by_name` — Display name of user
- `created_date` — Timestamp of status change
- `l1_panel` / `l2_panel` / `l3_panel` — Panel member email for that round
- `l1_date` / `l2_date` / `l3_date` — Interview date for that round
- `recruiter_name` — Recruiter who scheduled the interview
- `rejection_reason` — Reason if rejected at that stage
- `declined_reason` — Reason if candidate declined offer
- `is_revisit` — Whether this was a revisit interview

---

## 7. Error Handling

| Scenario | Response |
|----------|----------|
| Candidate not found | Empty object / empty array |
| DB error on status change | `{ error: true, Message: "FAILED TO UPDATE STATUS!" }` |
| DOJ save failure | `{ error: true, Message: "FAIL TO SAVE DATE OF JOINING!" }` |
| Info update success | `{ error: false, Message: "RECORDS UPDATED SUCCESSFULLY!" }` |
| Comment added | `{ error: false, Message: "COMMENTS ADDED SUCCESSFULLY!" }` |
| Decline reason updated | `{ error: false, Message: "DECLINED REASON UPDATED SUCCESSFULLY!" }` |

---

## 8. File Storage (AWS S3)

- **Primary bucket**: Configured via `BUCKET_NAME` environment setting
- **ACL**: `private` (not public-read)
- **Resume path**: `${prescreen_batch.resume_path}/${candidate_batch.file_name}`
- **Feedback PDF path**: `${feedback_form_pdf_link.feedback_path}/${feedback_pdf_file_name}`
- Pre-signed URLs generated for secure temporary access via `/presignedUrl` endpoints
- Two S3 client instances are used — one per bucket (primary and legacy `smarthireprod`)
