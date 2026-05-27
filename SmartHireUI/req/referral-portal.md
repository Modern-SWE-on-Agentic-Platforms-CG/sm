# SmartHire UI - Referral Portal Specification

## Authentication Model

The Referral Portal uses **separate authentication** from the main Keycloak SSO:

- Role stored in `localStorage["refrole"]` (not the main JWT token)
- Protected by **`ReferralAuthGuard`** (not the standard `AuthGuard`)
- `ReferralAuthGuard` checks `localStorage["refrole"]` and `localStorage["refname"]` presence
- If missing, redirects to `/referral-portal/referralRegister`
- Token/session stored locally without Keycloak

---

## Module: Referral Registration (`/referral-portal/referralRegister`)

### Purpose

Entry/login page for the referral portal. Employees register or log in as a referral SPOC.

### Form Fields

| Field | Required | Notes |
|---|---|---|
| Employee ID | Yes | |
| Employee Name | Yes | |
| Employee Email | Yes | Valid email format |
| Role | Yes | SPOC / Candidate |
| BU | Yes | |

### Business Rules

1. On successful registration, `localStorage["refrole"]` and `localStorage["refname"]` are set
2. Redirects to `/referral-portal/ref-candidate-details` on success
3. If already logged in (localStorage values present), auto-redirect skips registration page

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `referral/registerReferralUser` | Register or authenticate referral user |

---

## Module: Referral Form (`/referral-form`)

### Purpose

Form for a referral SPOC to submit a candidate referral.

### Form Fields

| Field | Required | Notes |
|---|---|---|
| Candidate Name | Yes | |
| Contact Number | Yes | Numeric validation |
| Email | Yes | Valid email format |
| Total Experience | Yes | Non-negative decimal |
| Relevant Experience | Yes | |
| Skill | Yes | |
| Source | Yes | Fixed to "Referral" |
| Referred By (Employee ID) | Yes | Auto-populated from logged-in SPOC |
| Referred By (Name) | Yes | Auto-populated |
| Resume | Yes | PDF/DOC upload |

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `REFERRALFORM` | Submit referral |
| POST | `resumeUpload/upload` | Upload resume file |

### Error States

- Duplicate candidate email → `"Candidate already referred"`
- Missing resume → form validation error
- API failure → toastr error

---

## Module: Referral Candidate Details (`/referral-portal/ref-candidate-details`)

### Purpose

Dashboard for a referral SPOC to view and track all candidates they have referred.

### Access Control

- Protected by `ReferralAuthGuard`
- If guard fails → redirected to `/referral-portal/referralRegister`

### Data Displayed

Candidate name, skill, status, date referred, last status change

### Filters

Status, date range

### Actions

- View candidate details (navigate to `/candidate-details`)
- Refresh list

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `referral/fetchCandidatesByReferralId` | Fetch referred candidates |

---

## Module: Candidate Referral (`/candidate-referral`)

### Purpose

Admin-side view of all referred candidates across all referral SPOCs.

### Data Displayed

Candidate name, referred by, skill, current status, date referred

### Filters

BU, skill, status, date range

### Actions

- Export to Excel
- Click candidate → view full details

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `CANDIDATEREFERRAL` | Fetch all referral candidates |
| GET | `referral/exportReferralExcel` | Export to Excel |

---

## Module: Referral Upload (`/referral-upload`)

### Purpose

Bulk upload of referral candidates via Excel.

### Actions

- Download upload template (S3 URL from env)
- Upload Excel file → POST → status report

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `REFERRALUPLOAD` | Upload referral Excel |
| GET | `referral/downloadReferralTemplate` | Download template |

---

## Module: Referral Reports By BU (`/ref-reports-bybu`)

### Purpose

Referral analytics grouped by Business Unit — counts and conversion rates.

### Charts

Bar chart of referrals per BU; conversion rate (referred → hired) per BU

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `referral/fetchReferralReportByBU` | Fetch BU-grouped data |

---

## Module: Referral Reports By Account (`/ref-reports-byaccount`)

### Purpose

Referral analytics grouped by Account — counts and status breakdown.

### Charts

Pie chart of referrals per account; bar chart of status distribution per account

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `referral/fetchReferralReportByAccount` | Fetch account-grouped data |

---

## Module: Referral User Register (`/referralUserRegister`)

### Purpose

Admin page to manage referral SPOC user accounts — view, activate, deactivate registered SPOCs.

### Data Displayed

SPOC Name, Employee ID, Email, BU, Registered Date, Status (Active/Inactive)

### Actions

- Activate / Deactivate SPOC account
- View referred candidate list per SPOC

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `referral/fetchAllReferralUsers` | Load all SPOC accounts |
| POST | `referral/updateReferralUserStatus` | Activate/deactivate |

---

## Module: Candidate Referral Details (`/candidate-referral-details`)

### Purpose

Detailed view of a single referred candidate including full referral history and current pipeline status.

### Data Displayed

Full candidate profile, referral chain, status history, feedback summary (if interviewed)

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `referral/fetchReferralCandidateDetail?id={id}` | Fetch full referral detail |
