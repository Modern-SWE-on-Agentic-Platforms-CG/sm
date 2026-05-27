# SmartHire — Data Models

## Overview
The system uses a PostgreSQL database accessed via **Sequelize ORM**. All tables reside within a configurable schema (e.g., `sr_dev`, `sr_prod`). Models are defined in `app/models/` and associated through Sequelize associations (hasMany, belongsTo, hasOne).

---

## 1. Core Candidate Tables

### `candidate_detail`
Primary candidate identity record.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| candidate_detail_id | BIGINT | PK, auto-increment | Unique candidate ID |
| candidate_name | STRING | | Full name |
| email_id | STRING | | Personal email |
| contact_number | STRING | | Phone number |
| current_location | STRING | | Current city |
| gender | STRING | | Gender |
| account_name | STRING | | Hiring account |
| region | STRING | | Geographic region (India/APAC/etc.) |
| sr_no | STRING | | Serial number from upload |
| candidate_id | STRING | | External candidate ID |
| employee_id | BIGINT | FK | If existing employee |
| capgemini_email_id | STRING | | Capgemini internal email (if employee) |
| created_by | STRING | | Email of creator |
| created_date | DATE | | Creation timestamp |
| updated_by | STRING | | Last updater |
| updated_date | DATE | | Last update timestamp |

**Associations:**
- hasMany → `candidate_batch`
- hasMany → `candidate_score`
- hasMany → `candidate_skill`
- hasMany → `candidate_status`
- hasOne → `candidate_info_detail`
- hasOne → `candidate_recruit_detail`
- hasOne → `candidate_panel_details`
- hasMany → `recruiter_calendar`

---

### `candidate_info_detail`
Extended candidate profile and recruitment details.

| Field | Type | Description |
|-------|------|-------------|
| candidate_info_detail_id | BIGINT (PK) | Auto-increment ID |
| candidate_detail_id | BIGINT (FK) | Links to candidate_detail |
| current_company | STRING | Employer |
| current_ctc | STRING | Current salary (Lac) |
| expected_ctc | STRING | Expected salary (Lac) |
| offer_ctc | STRING | Proposed offer |
| approved_offer_ctc | STRING | Approved offer after negotiations |
| level_offered | STRING | Level/band offered |
| proposed_grade | STRING | Grade offered |
| notice_period | STRING | Notice period (days/months) |
| total_exp | STRING | Total experience (years) |
| relevant_exp | STRING | Relevant experience (years) |
| recvd_date | DATE | Profile received date |
| date_of_joining | DATE | Confirmed joining date |
| counter_offered | STRING | Counter-offer amount |
| revised_offer | STRING | Revised offer amount |
| preferred_offered_location | STRING | Preferred joining location |
| joining_bonus | STRING | Joining bonus amount |
| hike_percent | STRING | Hike percentage |
| college | STRING | Educational institution |
| is_immediate_joinee | BOOLEAN | Can join immediately |
| arc_deviation | STRING | ARC policy deviation |
| band_deviation | STRING | Band deviation flag |
| is_referral | BOOLEAN | Referral candidate flag |
| bu_flag | BOOLEAN | BU-level approval flag |
| duplicate | STRING | Duplicate profile flag (Y/N) |
| approved_level_offered | STRING | Finally approved level |
| hiring_threshold_amount | STRING | Total hiring cost |
| threshold_value | STRING | Threshold percentage |
| level_based_on_exp | STRING | Level assigned based on experience |
| education_background | STRING | Education details |
| heading | STRING | Domain heading/specialization |
| domainExp | STRING | Domain-specific experience |
| totalSapExp | STRING | Total SAP experience |
| bu_head_apprvd_dt | DATE | BU head approval date |
| holding_offer_details | STRING | Details if offer on hold |

---

### `candidate_status`
Tracks all status changes (one active record at a time).

| Field | Type | Description |
|-------|------|-------------|
| candidate_status_id | BIGINT (PK) | Auto-increment |
| candidate_detail_id | BIGINT (FK) | Links to candidate |
| status_id | BIGINT (FK) | Links to status_master |
| status_change_date | DATE | When status was set |
| status_end_date | DATE | NULL = currently active; set when status changes |
| created_by | STRING | Email of who changed status |
| created_date | DATE | Record creation timestamp |

**Business Rule**: Exactly ONE record per candidate where `status_end_date IS NULL` (current status).

---

### `candidate_skill`
Candidate's primary technology assignment.

| Field | Type | Description |
|-------|------|-------------|
| candidate_skill_id | BIGINT (PK) | Auto-increment |
| candidate_detail_id | BIGINT (FK) | Links to candidate |
| skill | STRING | Technology/skill name |
| tower_id | BIGINT (FK) | Assigned tower |
| practice_id | BIGINT (FK) | Practice area |

---

### `candidate_panel_details`
Interview panel assignment and offer metadata.

| Field | Type | Description |
|-------|------|-------------|
| candidate_panel_details_id | BIGINT (PK) | |
| candidate_detail_id | BIGINT (FK) | |
| l1_panel | STRING | L1 panel member email |
| l2_panel | STRING | L2 panel member email |
| l3_panel | STRING | L3 panel member email |
| l1_date | DATE | L1 interview date |
| l2_date | DATE | L2 interview date |
| l3_date | DATE | L3 interview date |
| bu_id | BIGINT (FK) | BU assigned to candidate |
| rejection_reason | STRING | Reason for rejection |
| declined_reason | STRING | Reason candidate declined |
| offer_sent_for_approval | BOOLEAN | Offer approval sent flag |

---

### `candidate_vendor_detail`
Sourcing channel and vendor for candidate.

| Field | Type | Description |
|-------|------|-------------|
| candidate_detail_id | BIGINT (FK) | |
| source_id | BIGINT (FK) | Source channel |
| vendor_id | BIGINT (FK) | Vendor/partner |

---

### `candidate_batch` / `prescreen_batch`
File attachment tracking for uploaded candidate documents.

| Field (candidate_batch) | Type | Description |
|------------------------|------|-------------|
| candidate_detail_id | BIGINT (FK) | |
| file_name | STRING | Resume filename in S3 |
| prescreen_batch_id | BIGINT (FK) | Links to upload batch |

| Field (prescreen_batch) | Type | Description |
|------------------------|------|-------------|
| prescreen_batch_id | BIGINT (PK) | |
| resume_path | STRING | S3 base path for batch |
| uploaded_date | DATE | When batch was uploaded |

---

### `candidate_recruit_detail`
Recruitment tracking fields.

| Field | Type | Description |
|-------|------|-------------|
| candidate_detail_id | BIGINT (FK) | |
| jr_id | STRING | Job Requisition ID |
| jrmapped_to | STRING | JR mapped to (SF/SO ID) |

---

### `candidate_comments`
Comments and annotations added to candidate records.

| Field | Type | Description |
|-------|------|-------------|
| comment_id | BIGINT (PK) | |
| candidate_detail_id | BIGINT (FK) | |
| comment_text | STRING | Comment content |
| comment_file_path | STRING | Attachment S3 path |
| created_by | STRING | Author email |
| created_date | DATE | Timestamp |

---

### `candidate_approval_status`
Tracks offer revision history.

| Field | Type | Description |
|-------|------|-------------|
| candidate_detail_id | BIGINT (FK) | |
| revised_flag | BOOLEAN | Whether this is a revised offer |

---

### `ctc_history`
CTC negotiation audit trail.

| Field | Type | Description |
|-------|------|-------------|
| candidate_detail_id | BIGINT (FK) | |
| old_ctc | STRING | Previous CTC |
| new_ctc | STRING | New CTC |
| changed_by | STRING | Who changed it |
| changed_date | DATE | When changed |
| reason | STRING | Reason for change |

---

### `candidate_aging`
Tracks aging metrics for reporting.

---

## 2. Interview Tables

### `recruiter_calendar`
Recruiter-side interview scheduling records.

| Field | Type | Description |
|-------|------|-------------|
| recruiter_calendar_id | BIGINT (PK) | |
| emp_id | STRING | Recruiter employee ID |
| interviewer_id | BIGINT (FK) | Assigned panel member |
| candidate_detail_id | BIGINT (FK) | |
| technology_id | BIGINT (FK) | Interview technology |
| interview_type_id | BIGINT (FK) | L1/L2/L3 |
| from_time | DATE | Interview start |
| to_time | DATE | Interview end |
| candidate_name | STRING | Denormalized name |
| comments | STRING | Scheduling notes |
| is_interviewer_assigned | BOOLEAN | |
| is_revisit | BOOLEAN | Revisit flag |
| is_reupload | BOOLEAN | Re-upload flag |
| active_flag | BOOLEAN | |

---

### `interviewer_calendar`
Panel member's slot and feedback tracking.

| Field | Type | Description |
|-------|------|-------------|
| interviewer_calendar_id | BIGINT (PK) | |
| emp_id | BIGINT (FK) | Panel member |
| recruiter_calender_id | BIGINT (FK) | Links to recruiter_calendar |
| candidate_detail_id | BIGINT (FK) | |
| technology_id | BIGINT (FK) | |
| interview_type_id | BIGINT (FK) | |
| from_time | DATE | Slot start |
| to_time | DATE | Slot end |
| is_booked | BOOLEAN | Slot booked |
| is_direct_booked | BOOLEAN | Direct booking |
| feedback_status_id | BIGINT (FK) | Submission status |
| template_id | BIGINT (FK) | Feedback form template |
| is_submit | BOOLEAN | Feedback submitted flag |
| panel_not_available | BOOLEAN | Panel N/A flag |
| candidate_not_available | BOOLEAN | Candidate N/A flag |
| is_meeting_requested | BOOLEAN | |
| is_reschedule | BOOLEAN | |
| is_reschedule_requested | BOOLEAN | |
| is_feedback_email | BOOLEAN | |
| is_cancelled | BOOLEAN | |
| item_id | STRING | External calendar item reference |

---

### `candidate_interview`
Additional interview metadata.

---

### `interviewer_feedback`
Structured feedback form answers per question.

| Field | Type | Description |
|-------|------|-------------|
| interviewer_calendar_id | BIGINT (FK) | Links to slot |
| feedback_form_id | BIGINT (FK) | Links to question template |
| answer | STRING | Submitted answer |

---

## 3. Employee Tables

### `employee_master`
All users of the system.

| Field | Type | Description |
|-------|------|-------------|
| emp_id | BIGINT (PK) | |
| emp_name | STRING | Full name |
| email_id | STRING | Corporate email (login key) |
| location | STRING | Work location |
| active_flag | BOOLEAN | Account active |
| is_new_user | BOOLEAN | First login flag |
| password | STRING | (Legacy — SSO preferred) |
| grade_id | BIGINT (FK) | Grade level |
| practice_id | BIGINT (FK) | Practice area |
| bu_id | BIGINT (FK) | Business unit |
| show_reports | BOOLEAN | Reports access flag |
| l2_check | BOOLEAN | L2 interview eligibility |
| assigned_role | BOOLEAN | Role assignment flag |

**Associations:**
- belongsTo → `grade_master`
- hasMany → `recruiter_calendar`
- hasMany → `interviewer_calendar`
- hasMany → `employee_account`
- hasMany → `employee_technology`
- hasMany → `employee_role`

---

### `employee_role`
Roles assigned to employees.

| Field | Type | Description |
|-------|------|-------------|
| emp_id | BIGINT (FK) | |
| role_id | BIGINT (FK) | |

---

### `employee_technology`
Technologies an employee can interview for.

| Field | Type | Description |
|-------|------|-------------|
| emp_id | BIGINT (FK) | |
| technology_id | BIGINT (FK) | |

---

### `employee_account`
Account assignments for employees.

| Field | Type | Description |
|-------|------|-------------|
| emp_id | BIGINT (FK) | |
| account_id | BIGINT (FK) | |

---

### `recruiter_skill_mapping`
Maps recruiter to the skills they recruit for.

---

## 4. Demand / Bench Data Tables

### `demand_data`
Open demand/requisition records.

| Field | Type | Description |
|-------|------|-------------|
| team_request_id | STRING (PK) | Demand identifier |
| client | STRING | Client/account |
| job_name | STRING | Job title |
| position_name | STRING | Position name |
| role_start_date | STRING | Expected start |
| demand_type | STRING | Billable/Strategic/Pursuit |
| open_close_demand_status | STRING | Open/Closed/Offered |
| demand_batch_id | BIGINT (FK) | Batch upload reference |

### `demand_batch`
Upload batch record for demand data.

| Field | Type | Description |
|-------|------|-------------|
| demand_batch_id | BIGINT (PK) | |
| uploaded_date | DATE | Upload timestamp |

### `bench_data`
Bench employee records.

| Field | Type | Description |
|-------|------|-------------|
| employee_id | BIGINT (PK) | |
| employee_name | STRING | |
| local_grade | STRING | Grade |
| skill | STRING | Primary skill |
| available_ageing | INT | Days on bench |
| hybrid_location | STRING | Location |
| current_status | STRING | Availability status |
| bench_batch_id | BIGINT (FK) | Batch upload reference |

### `bench_batch`
Upload batch record for bench data.

---

## 5. Master / Lookup Tables

### `status_master`
All candidate statuses.

| Field | Type | Description |
|-------|------|-------------|
| status_id | BIGINT (PK) | |
| status_type | STRING | Status label (e.g., "L2 Select") |
| active_flag | BOOLEAN | |

### `status_intermediate_mapping`
Maps statuses to parent categories for reporting.

| Field | Type | Description |
|-------|------|-------------|
| status_id | BIGINT (FK) | |
| status_parent_type | STRING | e.g., "Select/offer WIP", "Offered", "Joined", "Reject", "Declined" |

### `technology_master`
| Field | Type | Description |
|-------|------|-------------|
| technology_id | BIGINT (PK) | |
| technology_name | STRING | Skill name |
| active_flag | BOOLEAN | |
| critical_flag | BOOLEAN | Critical for L2 dashboard |
| practice_id | BIGINT (FK) | |

### `tower_master`
| Field | Type | Description |
|-------|------|-------------|
| tower_id | BIGINT (PK) | |
| tower_type | STRING | Tower name |
| practice_id | BIGINT (FK) | |
| created_by | STRING | |
| created_date | DATE | |

### `tower_skill_mapping`
Maps technologies to towers (and skill groups).

| Field | Type | Description |
|-------|------|-------------|
| tower_id | BIGINT (FK) | |
| technology_id | BIGINT (FK) | |
| skill_group_id | BIGINT (FK) | |

### `skill_group_master`
| Field | Type | Description |
|-------|------|-------------|
| skill_group_id | BIGINT (PK) | |
| skill_group_name | STRING | |
| practice_id | BIGINT (FK) | |

### `source_master`
| Field | Type | Description |
|-------|------|-------------|
| source_id | BIGINT (PK) | |
| source_name | STRING | Sourcing channel name |
| active_flag | BOOLEAN | |

### `vendor_master`
| Field | Type | Description |
|-------|------|-------------|
| vendor_id | BIGINT (PK) | |
| vendor_name | STRING | |
| contact_details | STRING | |
| active_flag | BOOLEAN | |

### `source_vendor_mapping`
| Field | Type | Description |
|-------|------|-------------|
| source_id | BIGINT (FK) | |
| vendor_id | BIGINT (FK) | |

### `tower_approver_master`
Tower-level approver configuration.

| Field | Type | Description |
|-------|------|-------------|
| tower_approver_master_id | BIGINT (PK) | |
| tower_id | BIGINT (FK) | |
| approver_role_master_id | BIGINT (FK) | |
| dl_title | STRING | DL title (e.g., "Tower Lead DL") |

### `approver_email_master`
| Field | Type | Description |
|-------|------|-------------|
| account_approver_id | BIGINT (PK) | |
| tower_approver_master_id | BIGINT (FK) | |
| email_id | STRING | Approver email |
| active_flag | BOOLEAN | |

### `account_approver_master`
Account-level approver emails.

### `feedback_form`
Feedback form question definitions.

### `feedback_template`
Feedback form template per version.

### `technology_template`
Maps technology → feedback template.

### `old_feedback_form_pdf_link`
Legacy PDF feedback link storage.

### `feedback_status`
| Values | Description |
|--------|-------------|
| Select | Candidate selected |
| Reject | Candidate rejected |
| On Hold | Decision deferred |
| Panel NA | Panel not available |
| Candidate NA | Candidate not available |

### `excel_dump`
Tracks generated Excel export files for history management.

---

## 6. Key Relationships Diagram

```
practice_master (1) ──→ (N) tower_master
tower_master (1) ──→ (N) tower_skill_mapping ←── (1) technology_master
tower_skill_mapping ──→ (1) skill_group_master

employee_master (1) ──→ (N) recruiter_calendar
employee_master (1) ──→ (N) interviewer_calendar
recruiter_calendar (1) ──→ (1) interviewer_calendar

candidate_detail (1) ──→ (1) candidate_info_detail
candidate_detail (1) ──→ (1) candidate_skill
candidate_detail (1) ──→ (N) candidate_status ──→ (1) status_master
candidate_detail (1) ──→ (1) candidate_vendor_detail ──→ source_master, vendor_master
candidate_detail (1) ──→ (N) recruiter_calendar
candidate_detail (1) ──→ (N) candidate_batch ──→ prescreen_batch

tower_approver_master ──→ approver_email_master
tower_master (1) ──→ (N) tower_approver_master

demand_data (N) ──→ (1) demand_batch
bench_data (N) ──→ (1) bench_batch
```
