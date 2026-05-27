# Data Model: SmartHire Backend Platform

**Phase 1 output for**: [plan.md](plan.md)
**Date**: 2026-05-26
**Database**: `smarthiredb001` | **Schema**: `smarthire`
**ORM**: SQLAlchemy 2.x (async) | **Migrations**: Alembic

All tables reside in the `smarthire` schema. Every entity inherits `AuditMixin` which adds
`created_by VARCHAR(100)`, `created_date TIMESTAMP`, `updated_by VARCHAR(100)`,
`updated_date TIMESTAMP`.

---

## Core Entities

### 1. CandidateDetail

Primary candidate identity record. One row per candidate.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `candidate_name` | VARCHAR(255) | NOT NULL | |
| `email_id` | VARCHAR(255) | | |
| `mobile_number` | VARCHAR(20) | | |
| `current_company` | VARCHAR(255) | | |
| `current_location` | VARCHAR(100) | | |
| `total_exp` | DECIMAL(4,1) | | Years of experience |
| `relevant_exp` | DECIMAL(4,1) | | |
| `current_ctc` | DECIMAL(12,2) | | |
| `notice_period` | VARCHAR(50) | | |
| `account_id` | BIGINT | FK → account_master | |
| `region` | VARCHAR(100) | | |
| `recvd_date` | DATE | | Date profile received |
| `is_referral` | BOOLEAN | DEFAULT false | |
| `referrer_name` | VARCHAR(255) | | |
| `is_rehire` | BOOLEAN | DEFAULT false | |
| `prescreen_id` | VARCHAR(100) | | External prescreen reference |
| `duplicate_flag` | BOOLEAN | DEFAULT false | |
| `active_flag` | BOOLEAN | DEFAULT true | |
| *audit fields* | | | inherited from AuditMixin |

---

### 2. CandidateInfoDetail

Extended financial / offer details. One row per candidate.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `candidate_id` | BIGINT | FK → candidate_detail | |
| `offered_ctc` | DECIMAL(12,2) | | |
| `negotiated_ctc` | DECIMAL(12,2) | | |
| `date_of_joining` | DATE | | |
| `joining_bonus` | DECIMAL(12,2) | | |
| `bu_approval` | BOOLEAN | DEFAULT false | |
| `tower_approval` | BOOLEAN | DEFAULT false | |
| `dg_approval` | BOOLEAN | DEFAULT false | |
| `na_approval` | BOOLEAN | DEFAULT false | |
| `arc_deviation_flag` | BOOLEAN | DEFAULT false | |
| `deviation_reason` | TEXT | | |
| `l3_escalation_flag` | BOOLEAN | DEFAULT false | |
| `revisit_flag` | BOOLEAN | DEFAULT false | |
| *audit fields* | | | |

---

### 3. CandidateStatus

Status history — only one record per candidate may have `status_end_date IS NULL` (open).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `candidate_id` | BIGINT | FK → candidate_detail NOT NULL | |
| `status_id` | BIGINT | FK → status_master NOT NULL | |
| `status_start_date` | TIMESTAMP | NOT NULL DEFAULT NOW() | |
| `status_end_date` | TIMESTAMP | | NULL = currently active |
| `changed_by` | VARCHAR(100) | | |
| *audit fields* | | | |

**Business rule**: Before inserting a new status, set `status_end_date = NOW()` on all
open records for the same `candidate_id`.

---

### 4. CandidateSkill

Technology and tower assignment for a candidate.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `candidate_id` | BIGINT | FK → candidate_detail | |
| `technology_id` | BIGINT | FK → technology_master | |
| `tower_id` | BIGINT | FK → tower_master | |
| `practice_id` | BIGINT | FK → practice_master | |
| `skill_group_id` | BIGINT | FK → skill_group_master | |
| `primary_flag` | BOOLEAN | DEFAULT true | |
| *audit fields* | | | |

---

### 5. CandidatePanelDetails

Panel member assignments per interview round.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `candidate_id` | BIGINT | FK → candidate_detail | |
| `l1_panel_id` | BIGINT | FK → employee_master | |
| `l2_panel_id` | BIGINT | FK → employee_master | |
| `l3_panel_id` | BIGINT | FK → employee_master | |
| `rejection_reason_id` | BIGINT | FK → rejection_reason_master | |
| `decline_reason_id` | BIGINT | FK → decline_reason_master | |
| `l3_escalation_flag` | BOOLEAN | DEFAULT false | Derived from escalation rule |
| *audit fields* | | | |

---

### 6. CandidateComments

Recruiter notes with optional S3 file attachment.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `candidate_id` | BIGINT | FK → candidate_detail | |
| `comment_text` | TEXT | NOT NULL | |
| `attachment_s3_key` | VARCHAR(500) | | S3 object key |
| `attachment_file_name` | VARCHAR(255) | | Original filename |
| *audit fields* | | | |

---

### 7. EmployeeMaster

All registered platform users (recruiter, interviewer, lead, admin, PMO).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `employee_id` | VARCHAR(50) | UNIQUE NOT NULL | HR employee ID |
| `first_name` | VARCHAR(100) | NOT NULL | |
| `last_name` | VARCHAR(100) | | |
| `email_id` | VARCHAR(255) | UNIQUE NOT NULL | Login identity |
| `grade_id` | BIGINT | FK → grade_master | |
| `practice_id` | BIGINT | FK → practice_master | |
| `bu_id` | BIGINT | FK → bu_master | |
| `supervisor_email` | VARCHAR(255) | | |
| `active_flag` | BOOLEAN | DEFAULT true | Soft-delete |
| `profile_image_s3_key` | VARCHAR(500) | | |
| *audit fields* | | | |

---

### 8. EmployeeRoleDetails

Role assignments — many-to-many between employee and role.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `employee_id` | BIGINT | FK → employee_master | |
| `role_id` | BIGINT | FK → role_master | |
| `active_flag` | BOOLEAN | DEFAULT true | |
| *audit fields* | | | |

---

### 9. EmployeeTechnologyDetails

Skill assignments for employees (interviewers declare skills).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `employee_id` | BIGINT | FK → employee_master | |
| `technology_id` | BIGINT | FK → technology_master | |
| `primary_flag` | BOOLEAN | DEFAULT true | |
| `active_flag` | BOOLEAN | DEFAULT true | |
| *audit fields* | | | |

---

### 10. InterviewerCalendarDetails

Interviewer availability or booked interview slot.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `interviewer_id` | BIGINT | FK → employee_master NOT NULL | |
| `interviewer_email` | VARCHAR(255) | | Denormalised for email lookups |
| `interview_date` | DATE | NOT NULL | |
| `start_time` | TIME | NOT NULL | |
| `end_time` | TIME | | Computed: start + 1 hour |
| `interview_type_id` | BIGINT | FK → interview_type_master | L1/L2/L3/HR |
| `technology_id` | BIGINT | FK → technology_master | |
| `account_id` | BIGINT | FK → account_master | |
| `participation_type` | VARCHAR(50) | | Virtual/In-person |
| `booking_status` | VARCHAR(50) | | Free/Booked/Cancelled |
| `candidate_id` | BIGINT | FK → candidate_detail | NULL if free slot |
| `feedback_status` | VARCHAR(50) | | Pending/Submitted/NA |
| `feedback_submitted_flag` | BOOLEAN | DEFAULT false | |
| `meeting_link` | VARCHAR(1000) | | Teams meeting URL |
| `meeting_request_sent_flag` | BOOLEAN | DEFAULT false | |
| `reminder_sent_flag` | BOOLEAN | DEFAULT false | For SC-005 |
| `reschedule_flag` | BOOLEAN | DEFAULT false | |
| `cancellation_reason` | TEXT | | |
| `bu_id` | BIGINT | FK → bu_master | |
| `s3_file_key` | VARCHAR(500) | | Original bulk upload file |
| *audit fields* | | | |

---

### 11. RecruiterCalendarDetails

Recruiter-created interview booking. 1:1 with an InterviewerCalendarDetails row.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `recruiter_id` | BIGINT | FK → employee_master NOT NULL | |
| `recruiter_email` | VARCHAR(255) | | |
| `interviewer_calendar_id` | BIGINT | FK → interviewer_calendar_details UNIQUE | 1:1 |
| `candidate_id` | BIGINT | FK → candidate_detail NOT NULL | |
| `interview_type_id` | BIGINT | FK → interview_type_master | |
| `technology_id` | BIGINT | FK → technology_master | |
| `slot_date` | DATE | | |
| `slot_start_time` | TIME | | |
| `status` | VARCHAR(50) | | Scheduled/Rescheduled/Cancelled |
| *audit fields* | | | |

---

### 12. FeedbackFormDetails

Hierarchical feedback form node. Self-referential for sections and questions.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `template_id` | BIGINT | FK → feedback_template | |
| `parent_id` | BIGINT | FK → feedback_form_details (self) | NULL = root |
| `heading` | VARCHAR(500) | NOT NULL | Section title or question label |
| `data_type_id` | BIGINT | FK → data_type_master | text/radio/checkbox/dropdown/textarea |
| `required_flag` | BOOLEAN | DEFAULT false | |
| `order_index` | INTEGER | | Display order within parent |
| `version` | INTEGER | NOT NULL DEFAULT 1 | |
| `active_flag` | BOOLEAN | DEFAULT true | |
| *audit fields* | | | |

---

### 13. FeedbackTemplate

Groups a set of FeedbackFormDetails nodes into a named template.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `template_name` | VARCHAR(255) | NOT NULL | |
| `technology_id` | BIGINT | FK → technology_master | |
| `practice_id` | BIGINT | FK → practice_master | |
| `version` | INTEGER | NOT NULL DEFAULT 1 | |
| `active_flag` | BOOLEAN | DEFAULT true | |
| *audit fields* | | | |

---

### 14. InterviewerFeedback

An interviewer's submitted responses for a specific interview slot.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | BIGSERIAL | PK | |
| `interviewer_calendar_id` | BIGINT | FK → interviewer_calendar_details UNIQUE | 1:1 |
| `candidate_id` | BIGINT | FK → candidate_detail | |
| `template_id` | BIGINT | FK → feedback_template | |
| `response_json` | JSONB | | Submitted answers as JSON |
| `feedback_status` | VARCHAR(50) | | Select/Reject/On Hold/NA |
| `rating` | INTEGER | | Overall rating |
| `pdf_s3_key` | VARCHAR(500) | | Generated PDF S3 key |
| `old_feedback_form_pdf_link` | VARCHAR(500) | | Legacy PDF link |
| *audit fields* | | | |

---

### 15. DemandData / DemandBatch

Open hiring demands, uploaded periodically.

**DemandBatch**

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | |
| `batch_name` | VARCHAR(255) | |
| `upload_date` | TIMESTAMP | |
| `active_flag` | BOOLEAN | |
| *audit* | | |

**DemandData**

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | |
| `batch_id` | BIGINT FK → demand_batch | |
| `technology_id` | BIGINT FK → technology_master | |
| `skill_group_id` | BIGINT FK → skill_group_master | |
| `grade_id` | BIGINT FK → grade_master | |
| `account_id` | BIGINT FK → account_master | |
| `market_unit_id` | BIGINT FK → market_unit | |
| `location_id` | BIGINT FK → location_master | |
| `demand_type` | VARCHAR(50) | Billable/Strategic/Pursuit |
| `role_start_date` | DATE | Bucketing key |
| `status` | VARCHAR(50) | Open/Offered/Closed |
| `quantity` | INTEGER | |
| *audit* | | |

---

### 16. BenchData / BenchBatch

Available/bench employees, uploaded periodically.

**BenchBatch** — same structure as DemandBatch.

**BenchData**

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | |
| `batch_id` | BIGINT FK → bench_batch | |
| `employee_id` | VARCHAR(50) | HR employee ID |
| `employee_name` | VARCHAR(255) | |
| `technology_id` | BIGINT FK → technology_master | |
| `practice_id` | BIGINT FK → practice_master | |
| `skill_group_id` | BIGINT FK → skill_group_master | |
| `bench_start_date` | DATE | Aging calculated from this |
| `location_id` | BIGINT FK → location_master | |
| `status_id` | BIGINT FK → bench_status_master | |
| *audit* | | |

---

### 17. Referral Entities

**ReferralCandidateInfo**

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | |
| `referrer_employee_id` | VARCHAR(50) | HR employee ID of referrer |
| `referrer_name` | VARCHAR(255) | |
| `candidate_name` | VARCHAR(255) | |
| `email_id` | VARCHAR(255) | |
| `mobile_number` | VARCHAR(20) | |
| `total_exp` | DECIMAL(4,1) | |
| `current_ctc` | DECIMAL(12,2) | |
| `notice_period` | VARCHAR(50) | |
| `bu_id` | BIGINT FK → referral_bu_master | |
| `account_id` | BIGINT FK → account_master | |
| `resume_s3_key` | VARCHAR(500) | |
| `image_s3_key` | VARCHAR(500) | |
| *audit* | | |

**ReferralCandidateSkill**

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | |
| `referral_candidate_id` | BIGINT FK → referral_candidate_info | |
| `technology_id` | BIGINT FK → referral_technology_master | |
| *audit* | | |

**ReferralCandidateCertification**

| Column | Type | Notes |
|--------|------|-------|
| `id` | BIGSERIAL PK | |
| `referral_candidate_id` | BIGINT FK → referral_candidate_info | |
| `certification_id` | BIGINT FK → referral_certifications_master | |
| *audit* | | |

---

## Master / Lookup Tables

All master tables follow the same pattern: `id BIGSERIAL PK`, `name VARCHAR(255) NOT NULL`, `active_flag BOOLEAN DEFAULT true`, audit fields.

| Table | Purpose |
|-------|---------|
| `grade_master` | Employee grades (e.g., Senior Manager, Consultant) |
| `bu_master` | Business units |
| `practice_master` | Practice areas |
| `technology_master` | Technologies / skills |
| `tower_master` | Skill towers (links to practice) |
| `location_master` | Office / work locations |
| `status_master` | Candidate pipeline statuses (20+) |
| `source_master` | Candidate sources (portal, referral, vendor, etc.) |
| `vendor_master` | Recruitment vendors |
| `role_master` | Application roles (Recruiter, Interviewer, Lead, PMO, Admin, Referral SPOC) |
| `market_unit` | Market units (filter for accounts) |
| `account_master` | Client accounts |
| `skill_group_master` | Groups of related technologies for SLA routing |
| `interview_type_master` | L1, L2, L3, HR |
| `rating_master` | Feedback ratings (1–5 or named) |
| `rejection_reason_master` | Reasons for candidate rejection |
| `decline_reason_master` | Reasons for offer decline |
| `feedback_status_master` | Feedback states (Select, Reject, On Hold, L1/L2/L3 Panel NA) |
| `data_type_master` | Feedback form field types |
| `lookup_master` | Generic key-value lookup items for screen dropdowns |
| `tower_approver_master` | DL email addresses for tower-level approvals and alerts |
| `skill_dl_mapping` | Maps skill group → distribution list email |
| `tower_skill_mapping` | Maps tower → technology |
| `source_vendor_mapping` | Maps source → vendor |
| `demand_buaccount_master` | Maps BU → accounts valid for demand |
| `referral_technology_master` | Technologies used in referral forms |
| `referral_location_master` | Locations used in referral forms |
| `referral_bu_master` | BUs used in referral forms |
| `referral_notice_period_master` | Notice period options for referral forms |
| `referral_certifications_master` | Certifications listed in referral forms |
| `bench_status_master` | Bench employee statuses |
| `sap_capability_master` | SAP capabilities for admin reference |

---

## Entity Relationships Diagram

```
candidate_detail (1) ─── (N) candidate_status
candidate_detail (1) ─── (1) candidate_info_detail
candidate_detail (1) ─── (N) candidate_skill
candidate_detail (1) ─── (N) candidate_comments
candidate_detail (1) ─── (1) candidate_panel_details
candidate_detail (1) ─── (N) interviewer_calendar_details  [booked slots]
candidate_detail (1) ─── (N) recruiter_calendar_details

employee_master (1) ─── (N) employee_role_details
employee_master (1) ─── (N) employee_technology_details
employee_master (1) ─── (N) interviewer_calendar_details  [as interviewer]
employee_master (1) ─── (N) recruiter_calendar_details    [as recruiter]

interviewer_calendar_details (1) ─── (1) recruiter_calendar_details
interviewer_calendar_details (1) ─── (1) interviewer_feedback

feedback_template (1) ─── (N) feedback_form_details
feedback_form_details (1) ─── (N) feedback_form_details    [self-referential hierarchy]
feedback_template (1) ─── (N) interviewer_feedback

demand_batch (1) ─── (N) demand_data
bench_batch  (1) ─── (N) bench_data

referral_candidate_info (1) ─── (N) referral_candidate_skill
referral_candidate_info (1) ─── (N) referral_candidate_certification
```

---

## Status Transition Flow

Valid candidate status progression (partial — enforced at service layer):

```
Received
  → PreScreen
  → L1 Scheduled → L1 Selected / L1 Rejected
  → L2 Scheduled → L2 Selected / L2 Rejected
  → [Escalation: L3 Scheduled → L3 Selected / L3 Rejected]
  → HR Scheduled → HR Selected / HR Rejected
  → BU Approval → Tower Input → Tower Approved
  → DG Approval → NA Approval
  → Offer Sent → Offer Negotiation → Offer in System → Offer Released
  → Offer Accept → Joined
  (or Offer Decline at any offer stage)
  (or Not Joined after Offer Accept)
```

Terminal statuses (excluded from aging alerts): all `*Reject*`, `Joined`,
`Offer-Decline`, `Offer-Accept`, `Not Joined`

---

## Demand Screen Buckets

Bucketing based on `demand_data.role_start_date` vs. today:

| Bucket Key | Condition |
|---|---|
| `pastdue` | `role_start_date < today` |
| `bill_one` | `0 ≤ days_until < 15` AND type=Billable |
| `bill_two` | `15 ≤ days_until < 30` AND type=Billable |
| `bill_three` | `days_until ≥ 30` AND type=Billable |
| `strategic` | type=Strategic |
| `pursuit` | type=Pursuit |

---

## Bench Screen Aging Buckets

Based on `bench_data.bench_start_date` vs. today (excludes Closed status):

| Bucket | Days on bench |
|---|---|
| `0_29` | 0–29 days |
| `30_59` | 30–59 days |
| `60_89` | 60–89 days |
| `90_119` | 90–119 days |
| `120_149` | 120–149 days |
| `150_plus` | ≥ 150 days |

---

## Validation Rules

| Entity | Rule |
|---|---|
| CandidateDetail | `email_id` must pass RFC 5321 format if provided |
| CandidateDetail | `total_exp` ≥ 0 and ≤ 60 |
| CandidateStatus | At most one open record per `candidate_id` |
| InterviewerCalendarDetails | `end_time = start_time + 1 hour` (slot duration = 60 min from config) |
| InterviewerCalendarDetails | `interview_date` ≥ today for new bookings |
| FeedbackFormDetails | `parent_id` must not create circular reference |
| EmployeeMaster | `email_id` globally unique |
| BulkUpload | Required columns validated; row errors collected, valid rows committed |
| File Upload | Max 10 MB per file; allowed types: xlsx, pdf, jpg, png, msg |
