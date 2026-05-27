# SmartHire — Referral Management

## Module Purpose
Manages employee referral candidates through a dedicated sub-flow. Employees refer external candidates; Referral SPOCs and Admins manage the intake, profile data, skills, certifications, and reporting. Referral candidates flow into the main recruitment pipeline after initial screening.

---

## 1. User Stories

- As an **Employee**, I want to refer a candidate by submitting their profile so that my referral is tracked.
- As a **Referral SPOC**, I want to upload referral candidate data in bulk via Excel so that intake is efficient.
- As a **Referral Admin / Super User**, I want to register new SPOCs so that they can manage referral intake.
- As a **Referral Admin**, I want to view all referral candidates within the past 6 months so that I can track pipeline.
- As a **Referral Admin**, I want to download referral candidate data as Excel so that I have offline reports.
- As a **Referral Admin**, I want to view detailed information for any referral candidate so that I can evaluate them.
- As a **PMO**, I want to generate a referral pipeline report by BU and account so that sourcing effectiveness is measured.
- As an **Employee**, I want to upload a referral candidate's resume so that their documents are stored.
- As an **Employee**, I want to upload a referral candidate's profile photo so that their identity is verified.

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/referralcandidates/upload` | Yes | Bulk upload referral candidates via Excel |
| POST | `/referralcandidates/referralForm` | Yes | Submit individual referral form |
| POST | `/referralcandidates/getCandidates` | Yes | Get last 6 months referral candidates |
| POST | `/referralresume` | Yes | Upload referral candidate resume |
| POST | `/downloadRefResume` | Yes | Download referral resume(s) by skill |
| POST | `/referralImage` | Yes | Upload referral candidate profile image |
| GET  | `/referralAdmin/fetchReferralBU` | Yes | Fetch BU list for referral admin |
| POST | `/referralAdmin/spocRegistrationByReferralAdmin` | Yes | Register a new Referral SPOC |
| POST | `/referralAdmin/getReferralCandidateInfo` | Yes | Get detailed referral candidate info |
| GET  | `/referralAdmin/accountNames` | Yes | Fetch account names for referral filter |
| POST | `/downloadExcel/allCandidates` | Yes | Export all referral candidates to Excel |
| POST | `/referral/referralreports` | Yes | Generate referral report by BU and account |

---

## 3. Referral Candidate Data Model

### `referral_candidate_info` (core profile)
| Field | Type | Description |
|-------|------|-------------|
| candidate_name | STRING | Referral candidate's name |
| email_id | STRING | Candidate email |
| contact_number | STRING | Phone number |
| total_exp | STRING | Total years of experience |
| current_company | STRING | Current employer |
| current_location | STRING | Current city |
| notice_period | STRING | Notice period |
| current_ctc | STRING | Current salary |
| expected_ctc | STRING | Expected salary |
| is_referral | BOOLEAN | Always true for referral candidates |
| referrer_email | STRING | Email of referring employee |
| referrer_name | STRING | Name of referring employee |
| bu_id | BIGINT (FK) | Business unit |
| account_id | BIGINT (FK) | Account/client |

### Supporting Referral Tables
| Table | Purpose |
|-------|---------|
| `referral_candidate_skill` | Skills of referral candidate |
| `referral_candidate_certification` | Certifications |
| `referral_candidate_attachments` | Resume / document attachments |
| `referral_certification_master` | Master list of certifications |
| `referral_technology_master` | Technology master for referrals |
| `referral_details` | Extended referral details |
| `referral_account_master` | Accounts available for referral |
| `referral_bu_master` | BUs available for referral |
| `employee_referral_sbu` | Employee ↔ SBU mapping for referrals |

---

## 4. Referral Upload

### `POST /referralcandidates/upload`
- Accepts multipart Excel file
- Parses referral candidate rows
- Creates records in `referral_candidate_info`, `referral_candidate_skill`, `referral_details`
- Duplicate detection based on email + referrer combination
- Upload errors returned in response

### `POST /referralcandidates/referralForm`
- Single candidate referral form submission
- Creates same set of records as bulk upload
- Validates required fields before insert

---

## 5. File Operations

### Resume Upload (`POST /referralresume`)
- Multipart file upload
- Stored in S3 under referral path
- Path recorded in `referral_candidate_attachments`

### Resume Download (`POST /downloadRefResume`)
- Downloads resume(s) filtered by primary skill
- Returns single file or ZIP archive for multiple

### Image Upload (`POST /referralImage`)
- Profile photo stored in S3
- Path linked to `referral_candidate_info`

---

## 6. SPOC Registration

### `POST /referralAdmin/spocRegistrationByReferralAdmin`
**Request Body:**
```json
{
  "spocEmail": "spoc@capgemini.com",
  "spocName": "SPOC Name",
  "buId": 1,
  "accountIds": [1, 2, 3]
}
```
- Creates employee record with `Referral SPOC` role if not already existing
- Associates SPOC with BU and account(s) for scoped access

---

## 7. Referral Reports

### `POST /referral/referralreports`
**Request Body:**
```json
{
  "buId": 1,
  "accountId": 2,
  "startDate": "2024-01-01",
  "endDate": "2024-06-30"
}
```
**Response:** Referral candidate pipeline metrics grouped by status, with counts per BU/account.

### `POST /downloadExcel/allCandidates`
Exports all referral candidates with full profile data as Excel file. Same columns as main candidate Excel export.

---

## 8. 6-Month Candidate Fetch

### `POST /referralcandidates/getCandidates`
- Returns referral candidates received in the last 6 months
- Filtered by requester's BU and role (SPOC sees only their assigned accounts)
- Returns: name, email, skill, status, referrer info, received date, aging

---

## 9. Roles in Referral Module

| Role | Access Level |
|------|-------------|
| `Admin/SuperUser` | Full access — all BUs, all accounts, SPOC management |
| `Referral SPOC` | Scoped to assigned BU and accounts only |
| Standard Employee | Can only submit referral form; no access to bulk data |

---

## 10. Error Handling

| Scenario | Response |
|----------|----------|
| No referral candidates found | Empty array |
| Duplicate referral submission | Row skipped, noted in error response |
| DB error | `{ error: true, Message: <error> }` |
| Missing required field | `{ error: true, Message: "Field cannot be empty" }` |
| File upload failure | Error returned in response |
