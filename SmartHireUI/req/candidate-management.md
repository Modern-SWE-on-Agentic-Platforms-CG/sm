# SmartHire UI - Candidate Management Specification

## Module: Candidate Pipeline / Upload (`/upload`)

### Purpose

Primary screen for Recruiters, PMO, and Leads to manage the hiring pipeline. Shows a paginated candidate table with filtering, status management, and bulk import.

### Navigation Flow

- Entry point for Recruiter / PMO / Lead after login
- Click **Schedule Interview** on a row → navigate to `/dashboard` with candidate params
- Click **View Details** or candidate name → navigate to `/candidate-details`

### Table Columns

Candidate Name, Contact Number, Email, Technology/Skill, Grade, Current Status, Source, Last Modified Date, Profile Aging (days)

### Filters

Technology, BU, Source, Vendor, Status, Date Range, Duration (last 1–6 months)

### Actions

| Action | Behavior |
|---|---|
| Upload Excel | Opens upload popup → POST file → refresh table |
| Schedule Interview | Navigate to `/dashboard` with candidate pre-filled |
| Change Status | Open status dropdown popup → save new status |
| Add Comment | Open comment dialog → POST comment |
| Download Resume | Download candidate PDF/DOC |
| Delete Candidate | DELETE API call |
| Export Excel | Download filtered table as Excel |

### Excel Upload Templates (from `environment.ts` S3 URLs)

| Template | Env Variable |
|---|---|
| Candidate Sheet | `DOWNLOAD_TEMPLATE` |
| Candidate Sheet (Invent) | `DOWNLOAD_TEMPLATE_INVENT` |
| Panel Slot | `SLOT_PANEL_DOWNLOAD_TEMPLATE` |
| L2 Sheet | `L2_TEMPLATE` |
| Instant Interview | `IMPORT_INSTANT_INTERVIEW` |
| Instant Interview GCCA | `IMPORT_INSTANT_INTERVIEW_GCCA` |

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `excel/fetchCandidatesByQuery` | Fetch candidates with filters |
| POST | `upload` | Upload Excel file |
| POST | `statusChange` | Update candidate status |
| POST | `candidateInfo/addComments` | Add comment |
| GET | `candidateInfo/fetchCandidateComments` | Fetch comments |
| GET | `downloadResume?candidate_detail_id={id}` | Download resume |
| POST | `excel/deleteCandidate` | Delete candidate |
| GET | `downloadExcel/allCandidates` | Export all to Excel |

---

## Module: Candidate Details (`/candidate-details`)

### Purpose

Full profile view of a single candidate: personal info, skill match analysis, documents, lifecycle timeline.

### Data Displayed

- **Personal**: Name, email, contact, grade, location, source
- **Skills**: Matching skills (vs demand), lagging skills, resume-extracted skills
- **Documents**: Resume (download), Email screenshot (download), Feedback form (download)
- **Photo**: Base64-encoded profile image shown via `DomSanitizer`
- **Lifecycle**: Status transition history with timestamps

### Actions

| Action | Behavior |
|---|---|
| Download Resume | Fetch presigned S3 URL → open file |
| Download Email | Fetch email attachment → open file |
| Download Feedback Form | Fetch feedback PDF → open file |
| Upload Resume | File input → POST to resume upload endpoint |
| Upload Email | File input → POST to email upload endpoint |
| View Old Feedback | Fetch via presigned URL |
| Back | Navigate to `/upload` |

### Business Rules

- Resume upload: PDF or DOC/DOCX only
- Email upload: `.msg` only
- File name must contain exactly one dot (otherwise warning shown)
- Images decoded from base64 and displayed via Angular `DomSanitizer`
- Role from `localStorage` controls which actions are visible

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `oneEmployeeDemand` | Fetch demand skill matching |
| GET | `downloadResume?candidate_detail_id={id}` | Get resume link |
| GET | `downloadEmail?candidate_detail_id={id}` | Get email link |
| GET | `image/getCandidateImage/{id}` | Get profile image |
| POST | `resumeUpload/upload` | Upload resume |
| POST | `emailUpload/upload` | Upload email |
| GET | `candidateInfo/fetchCandidateCycle` | Fetch lifecycle history |
| GET | `/panel/fetchOldFeedback` | Fetch old feedback |
| POST | `presignedUrl` | Get presigned S3 URL |

### Error States

- Candidate data null → redirect to `/upload`
- Image failure → toastr: `"Some Error Occured!"`
- Resume missing → `"Resume is not available for the candidate"`
- Email missing → `"Email not Found!"`
- Feedback missing → `"Feedback Form Not Found!"`

---

## Module: To-Do List (`/todolist`)

### Purpose

Role-specific task management dashboard showing pending actions for each user type.

### Views by Role

| Role | View Shown |
|---|---|
| Interviewer | Today's interviews + pending feedbacks + slot count warning |
| Recruiter / PMO / Lead | Candidate pipeline table with status dropdown |

### Interviewer View — Table Columns

**Today's Interviews:** Candidate Name, Contact, Interview Time, Total Exp, Skills

**Pending Feedbacks:** Candidate Name, Contact, Interview Time, Interview Type, Skills

### Recruiter/PMO/Lead View — Table Columns

Candidate Name, Contact, Tower, Last Modified Date, Current Status, Status Dropdown, Aging Days

### Business Rules

1. Interviewers shown warning popup if fewer than 5 free slots booked
2. Status cannot be changed to the same current value (error shown)
3. Duration filter (1–6 months) filters by `status_change_date`
4. `trivialFlag` marks certain statuses as trivial (displayed differently)
5. `disableDropdown` flag disables status change for terminal statuses

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/todoController/fetchAllCandidates` | Fetch to-do candidate list |
| POST | `/todoController/todoStatusDropdown` | Get status options per candidate |
| GET | `/todoController/interviewscheduledtoday` | Today's scheduled interviews |
| GET | `/todoController/fetchPendingFeedbacks` | Pending feedback list |
| POST | `/todoController/updateStatus` | Update candidate status |

---

## Module: Weekend Drive / Candidate Entry Form (`/weekend-drive`)

### Purpose

Direct candidate entry form for walk-in interviews, weekend drives, and instant interview scheduling.

### Form Fields

| Field | Required | Notes |
|---|---|---|
| Candidate Name | Yes | |
| Contact Number | Yes | Must be numeric |
| Email | Yes | Valid email format |
| Gender | Yes | Male / Female / Others |
| Total Experience | Yes | Non-negative decimal |
| Relevant Experience | Yes | |
| Skill | Yes | From employee's registered skills |
| Time Slot From | Yes | Start time |
| Time Slot To | Yes | End time |
| Interview Type | Yes | L1, L2, L1-L2, L3 |
| Source | No | |
| Referred Vendor | No | |
| Current Company | No | |
| Account Name | Conditional | GCCA BU only |
| Region | Conditional | GCCA BU / OTHERS account |
| Is Referral | No | GCCA L1/L1-L2 only |
| Is Rehire | No | GCCA L1/L1-L2 only |
| SAP Capability | Conditional | SAP BU only |
| SAP Skills | Conditional | SAP BU + Capability selected |
| Interviewer Email | Conditional | Required for Recruiter / PMO / Lead |
| Meeting Link | Conditional | Required for Invent BU + Recruiter role |

### BU-Specific Logic

- **SAP BU**: Capability multi-select + SAP Skill multi-select shown
- **GCCA BU**: Account Name + Region shown; L1/L1-L2 adds Is Referral / Is Rehire checkboxes
- **Invent BU + Recruiter**: Meeting link field enabled and required
- **Recruiter / PMO / Lead**: Interviewer email dropdown required
- **Admin / SuperUser / Referral SPOC**: Treated as Recruiter for this form

### Previous Interview History

Table below the form showing the candidate's past interviews:
- Columns: Candidate Status, Interview Skill, Interview Date, Panel Name (SAP only)

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `panel/fetchBU` | Load BU list |
| GET | `candidateInfo/fetchSources` | Load source options |
| GET | `getTechForEmployee(email)` | Load skills for logged-in employee |
| GET | `interviewer/getAllEmployees` | Load interviewer dropdown |
| GET | `/sap_capability/fetchAllSapCapability` | Load SAP capabilities |
| GET | `/sap_capability/fetchAllSapSkill` | Load SAP skills by capability |
| GET | `panel/fetchAllAccount` | Load account names |
| GET | `panel/fetchRegion` | Load region list |

### Error States

- Invalid contact → form validation error
- Invalid email → form validation error
- Negative experience → form validation error
- No interviewer selected (when required) → form validation error
- Backend save failure → toastr error
