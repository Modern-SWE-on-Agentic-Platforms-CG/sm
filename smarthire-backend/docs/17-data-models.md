# Data Models — SmartHire

All entities are defined in the `smarthireReusable` library (`com.etap.smarthire.reusable.transaction.entity`).

All entities extend `BasicEntity` which provides audit fields.

---

## Base Entity: BasicEntity

All entities inherit these audit fields:

| Column | Type | Description |
|---|---|---|
| `CREATED_BY` | String | User who created the record |
| `CREATED_DATE` | Date | Auto-set on creation (JPA auditing) |
| `UPDATED_BY` | String | User who last updated |
| `UPDATED_DATE` | Date | Auto-set on update (JPA auditing) |

---

## Core Entities

---

### CandidateDetailEntity → CANDIDATE_DETAIL

Primary candidate identity record.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `CANDIDATE_DETAIL_ID` | long | PK, auto-increment | |
| `CANDIDATE_NAME` | String | | Full name |
| `EMAIL_ID` | String | | Email |
| `CONTACT_NUMBER` | String | | Phone |
| `GENDER` | String | | |
| `CURRENT_LOCATION` | String | | |
| `ACCOUNT_NAME` | String | | Client account |
| `REGION` | String | | Geographic region |
| `SR_NO` | String | | Serial number |
| + audit fields | | | From BasicEntity |

**Relationships**:
- OneToMany → `CandidateInfoDetailEntity` (financial/offer info)
- OneToMany → `CandidatePanelDetailsEntity` (panel assignments)
- OneToMany → `CandidateRecruitDetailEntity` (recruitment details)
- OneToMany → `CandidateSkillEntity` (skills)
- OneToMany → `CandidateScoreEntity` (scores)
- OneToMany → `CandidateBatchEntity` (batch assignments)
- OneToMany → `CandidateStatusEntity` (status history)
- OneToMany → `CandidateVendorDetailEntity` (vendor details)
- OneToMany → `CandidateProfileImageEnitity` (profile images)
- OneToMany → `AdditionalCandidateInfoEntity` (additional info)
- OneToMany → `CandidateAgingEntity` (aging tracking)
- OneToMany → `CandidateCommentsEntity` (comments/notes)

---

### CandidateInfoDetailEntity → CANDIDATE_INFO_DETAIL

Financial, offer, and sourcing details for a candidate.

| Column | Type | Description |
|---|---|---|
| `CANDIDATE_INFO_DETAIL_ID` | long PK | |
| `CANDIDATE_DETAIL_ID` | long FK | Parent candidate |
| `DUPLICATE` | String | Duplicate flag value |
| `CURRENT_COMPANY` | String | Current employer |
| `CURRENT_CTC` | String | Current salary |
| `EXPECTED_CTC` | String | Expected salary |
| `LEVEL_OFFERED` | String | Level/grade offered |
| `NOTICE_PERIOD` | String | Notice period |
| `OFFER_CTC` | String | Offer amount |
| `PREFERRED_OFFERED_LOCATION` | String | Preferred location |
| `RECVD_DATE` | Date | CV received date |
| `RELEVANT_EXP` | String | Relevant experience |
| `TOTAL_EXP` | String | Total experience |
| `COUNTER_OFFERED` | String | Counter offer details |
| `REVISED_OFFER` | String | Revised offer |
| `BU_HEAD_APPRVD_DT` | Date | BU head approval date |
| `DATE_OF_JOINING` | Date | Joining date |
| `REFERRED_VENDOR` | String | Vendor/referrer name |
| `IS_REFERRAL` | boolean | Referral flag |
| `IS_REHIRE` | boolean | Rehire flag |
| `BU_ID` | long FK | Business Unit |

---

### EmployeeMasterEntity → EMPLOYEE_MASTER

Core employee/interviewer/recruiter record.

| Column | Type | Description |
|---|---|---|
| `EMP_ID` | long PK | Employee ID (from HRMS — no auto-generate) |
| `EMP_NAME` | String | Full name |
| `EMAIL_ID` | String | Work email |
| `LOCATION` | String | Office location |
| `ACTIVE_FLAG` | boolean | Active/inactive |
| `IS_NEW_USER` | boolean | First-login flag |
| `PASSWORD` | String | Legacy password (pre-Keycloak) |
| `GRADE_ID` | long FK | Grade |
| `PRACTICE_ID` | long FK | Practice area |
| `BU_ID` | long FK | Business Unit |
| `SUPERVISOR_ID` | long FK (self-ref) | Supervisor employee |
| `L2_CHECK` | boolean | L2 eligibility |
| `SHOW_REPORTS` | boolean | Report access |
| `ASSIGNED_ROLE` | boolean | Manual role assignment |

**Relationships**:
- ManyToOne → `GradeMasterEntity`
- ManyToOne → `PracticeMasterEntity`
- ManyToOne → `BUMasterEntity`
- ManyToOne → `EmployeeMasterEntity` (supervisor)
- OneToMany → `EmployeeAccountDetails`
- OneToMany → `EmployeeRoleDetailsEntity`
- OneToMany → `EmployeeTechnologyDetailsEntity`
- OneToMany → `InterviewerCalendarDetailsEntity`
- OneToMany → `RecruiterCalendarDetailsEntity` (as recruiter)
- OneToMany → `RecruiterCalendarDetailsEntity` (as interviewer)

---

### InterviewerCalendarDetailsEntity → INTERVIEWER_CALENDAR

Interview slot for a specific interviewer.

| Column | Type | Description |
|---|---|---|
| `INTERVIEWER_CALENDAR_ID` | long PK (auto) | |
| `EMP_ID` | long FK | Interviewer |
| `CANDIDATE_DETAIL_ID` | long FK | Candidate |
| `CANDIDATE_NAME` | String | Denormalised name |
| `COMMENTS` | String | Notes |
| `RECRUITER_CALENDER_ID` | long FK (OneToOne) | Linked recruiter slot |
| `IS_BOOKED` | boolean | Slot occupied |
| `IS_DIRECT_BOOKED` | boolean | Direct booking |
| `FROM_TIME` | Date | Start time |
| `TO_TIME` | Date | End time |
| `ACTIVE_FLAG` | boolean | Soft delete |
| `FEEDBACK_STATUS_ID` | long FK | Current feedback status |
| `PARTICIPATION_TYPE_ID` | long FK | Primary/secondary |
| `IS_MEETING_REQUESTED` | boolean | Meeting link requested |
| `IS_RESCHEDULE` | boolean | Rescheduled |
| `IS_DIRECT_L2_SELECT` | boolean | Direct L2 selection |
| `PANEL_NOT_AVAILABLE` | boolean | Panel unavailable |
| `CANDIDATE_NOT_AVAILABLE` | boolean | Candidate unavailable |
| `IS_REMINDED` | boolean | Reminder sent |
| `IS_STATUS_REMINDED` | boolean | Status reminder sent |
| `IS_RESCHEDULE_REQUESTED` | boolean | Reschedule requested |
| `ITEM_ID` | String | External calendar item ID |
| `IS_FEEDBACK_EMAIL` | boolean | Feedback email sent |
| `IS_CANCELLED` | boolean | Cancelled |
| `IS_CANCELLED_APPOINTMENT` | boolean | Appointment cancelled |
| `TEMPLATE_ID` | long FK | Feedback template |

---

### RecruiterCalendarDetailsEntity → RECRUITER_CALENDAR

Interview scheduling record created by recruiter.

| Column | Type | Description |
|---|---|---|
| `RECRUITER_CALENDAR_ID` | long PK (auto) | |
| `EMP_ID` | long FK | Recruiter |
| `CANDIDATE_NAME` | String | Denormalised |
| `CANDIDATE_DETAIL_ID` | long FK | Candidate |
| `COMMENTS` | String (max 1500) | Notes |
| `IS_INTERVIEWER_ASSIGNED` | boolean | Interviewer linked |
| `TECHNOLOGY_ID` | long FK | Technology |
| `INTERVIEW_TYPE_ID` | long FK | L1/L2/HR etc. |
| `INTERVIEWER_ID` | long FK (nullable) | Assigned interviewer |
| `BU_ID` | long FK | Business Unit |
| `FROM_TIME` | Date | Start |
| `TO_TIME` | Date | End |
| `ACTIVE_FLAG` | boolean | Soft delete |
| `IS_REVISIT` | boolean | Revisit |
| `IS_REUPLOAD` | boolean | Feedback re-upload |

**Relationship**: OneToOne → `InterviewerCalendarDetailsEntity`

---

### FeedbackFormDetails → FEEDBACK_FORM

Dynamic feedback form template definition (hierarchical).

| Column | Type | Description |
|---|---|---|
| `FEEDBACK_FORM_ID` | long PK (auto) | |
| `FEEDBACK_SEQ_ID` | long | Display sequence |
| `INTERVIEW_TYPE_ID` | long FK | Interview type |
| `HEADING` | String (max 500) | Question/section text |
| `FEEDBACK_PARENT_ID` | long FK (self-ref) | Parent entry |
| `DATATYPE_ID` | long FK | Input type |
| `IS_REQUIRED` | boolean | Mandatory |
| `DROPDOWN_HINT` | String | Dropdown placeholder |
| `DESCRIPTION` | String | Help text |
| `IS_ACTIVE` | boolean | Active version |
| `IS_BUTTON` | boolean | Renders as button |
| `TEMPLATE_ID` | long FK | Template association |
| `VERSION` | Double | Form version |

---

### FeedbackTemplateEntity → FEEDBACK_TEMPLATE

| Column | Type | Description |
|---|---|---|
| `TEMPLATE_ID` | long PK (auto) | |
| `TEMPLATE_NAME` | String | Template name |
| `ACTIVE_FLAG` | boolean | Active |

---

### ReferralFormEntity → REFERRAL_FORM

Referral programme form field definitions (hierarchical).

| Column | Type | Description |
|---|---|---|
| `REFERRAL_FORM_ID` | long PK (auto) | |
| `REFERRAL_SEQ_ID` | long | Display sequence |
| `HEADING` | String | Field/section label |
| `SUB_HEADING` | String | Sub-label |
| `DESCRIPTION` | String | Help text |
| `REFERRAL_PARENT_ID` | long FK (self-ref) | Parent entry |
| `DATATYPE_ID` | long FK | Input type |
| `IS_REQUIRED` | boolean | Mandatory |
| `IS_ACTIVE` | boolean | Active |

---

## Master / Reference Tables

| Entity | Table | Key Fields |
|---|---|---|
| `GradeMasterEntity` | `GRADE_MASTER` | gradeId, gradeName |
| `BUMasterEntity` | `BU_MASTER` | buId, buName |
| `PracticeMasterEntity` | `PRACTICE_MASTER` | practiceId, practiceName |
| `TechnologyMasterEntity` | `TECHNOLOGY_MASTER` | technologyId, technologyName |
| `TechnologyTemplateEntity` | `TECHNOLOGY_TEMPLATE` | Template-technology mapping |
| `InterviewTypeMasterEntity` | `INTERVIEW_TYPE_MASTER` | typeId, typeName (L1/L2/HR etc.) |
| `LocationMasterEntity` | `LOCATION_MASTER` | locationId, locationName |
| `SourceMasterEntity` | `SOURCE_MASTER` | sourceId, sourceName |
| `StatusMasterEntity` | `STATUS_MASTER` | statusId, statusName |
| `FeedbackStatusEntity` | `FEEDBACK_STATUS` | statusId, statusName |
| `RatingMasterEntity` | `RATING_MASTER` | ratingId, ratingValue |
| `OverallFeedbackEntity` | (overall_feedback) | Rating labels |
| `RoleMasterEntity` | `ROLE_MASTER` | roleId, roleName |
| `MarketUnitEntity` | `MARKET_UNIT` | muId, muName, buId |
| `AccountMasterEntity` | `ACCOUNT_MASTER` | accountId, accountName |
| `ParticipationTypeEntity` | (participation_type) | Primary/Secondary |
| `JoiningPeriodMasterEntity` | `JOINING_PERIOD_MASTER` | periodId, description |
| `RejectionReasonMasterEntity` | `REJECTION_REASON_MASTER` | reasonId, reason |
| `DeclineReasonMasterEntity` | `DECLINE_REASON_MASTER` | reasonId, reason |
| `LookupMasterEntity` | `LOOKUP_MASTER` | lookupId, value, screenId |
| `DataTypeMaster` | (data_type_master) | typeId, typeName |
| `TowerMasterEntity` | `TOWER_MASTER` | towerId, towerName |
| `TowerApproverMasterEntity` | `TOWER_APPROVER_MASTER` | towerId, approverEmail |
| `TowerLeadEmailEntity` | `TOWER_LEAD_EMAIL` | towerId, leadEmail |
| `SkillGroupMasterEntity` | `SKILL_GROUP_MASTER` | groupId, groupName, dlEmail |
| `SkillDLMappingEntity` | `SKILL_DL_MAPPING` | skill, dlEmail |
| `VendorMasterEntity` | `VENDOR_MASTER` | vendorId, vendorName |
| `SourceVendorMappingEntity` | (source_vendor_mapping) | sourceId → vendorId |

---

## Candidate Sub-Tables

| Entity | Table | Description |
|---|---|---|
| `CandidateSkillEntity` | `CANDIDATE_SKILL` | Skills per candidate |
| `CandidateRolesEntity` | `CANDIDATE_ROLES` | Roles candidate is eligible for |
| `CandidateRoleExperienceEntity` | `CANDIDATE_ROLE_EXPERIENCE` | Role-specific experience |
| `CandidateScoreEntity` | `CANDIDATE_SCORE` | Interview scores |
| `CandidateBatchEntity` | `CANDIDATE_BATCH` | Batch tracking |
| `CandidateStatusEntity` | `CANDIDATE_STATUS` | Status change history |
| `CandidateVendorDetailEntity` | `CANDIDATE_VENDOR_DETAIL` | Vendor info |
| `CandidateProfileImageEnitity` | `CANDIDATE_PROFILE_IMAGE` | Profile image storage |
| `CandidateMailAttachmentEntity` | `CANDIDATE_MAIL_ATTACHMENT` | MSG/email attachments |
| `CandidateAgingEntity` | `CANDIDATE_AGING` | Aging SLA tracking |
| `CandidateCommentsEntity` | `CANDIDATE_COMMENTS` | Recruiter notes |
| `CandidatePanelDetailsEntity` | `CANDIDATE_PANEL_DETAILS` | Panel assignments |
| `CandidateRecruitDetailEntity` | `CANDIDATE_RECRUIT_DETAIL` | Recruitment step details |
| `AdditionalCandidateInfoEntity` | `ADDITIONAL_CANDIDATE_INFO` | Extra candidate fields |
| `CandidateInterviewEntity` | (candidate_interview) | Interview records |

---

## Employee Sub-Tables

| Entity | Table | Description |
|---|---|---|
| `EmployeeRoleDetailsEntity` | `EMPLOYEE_ROLE_DETAILS` | Role assignments |
| `EmployeeTechnologyDetailsEntity` | `EMPLOYEE_TECHNOLOGY_DETAILS` | Skill associations |
| `EmployeeAccountDetails` | `EMPLOYEE_ACCOUNT_DETAILS` | Account associations |
| `RecruiterSkillMappingEntity` | `RECRUITER_SKILL_MAPPING` | Recruiter ↔ skill |
| `InterviewGradeTypeDetailsEntity` | (interview_grade_type_details) | Grade eligibility |

---

## Feedback / Interview Sub-Tables

| Entity | Table | Description |
|---|---|---|
| `InterviewerFeedbackFormDetails` | (interviewer_feedback_form_details) | Submitted responses |
| `CustomFeedbackFormDataEntity` | `CUSTOM_FEEDBACK_FORM_DATA` | Non-standard responses |
| `FeedbackFormPdfStoringEntity` | `FEEDBACK_FORM_PDF_STORING` | PDF binary storage |
| `FeedbackFormPdfLinkStoringEntity` | `FEEDBACK_FORM_PDF_LINK_STORING` | S3 PDF URL storage |
| `FeedbackFormPlaceholderEntity` | `FEEDBACK_FORM_PLACEHOLDER` | Draft form entries |
| `RevisitInterviewFeedbackDataEntity` | (revisit_interview_feedback_data) | Re-interview data |
| `OverallFeedbackEntity` | (overall_feedback) | Overall ratings |

---

## Demand Management Tables (Lightly Used)

| Entity | Table | Description |
|---|---|---|
| `DemandDataEntity` | `DEMAND_DATA` | Hiring demand records |
| `DemandBatchEntity` | `DEMAND_BATCH` | Batch demand tracking |
| `DemandBuAccountMasterEntity` | (demand_bu_account) | BU-Account for demand |
| `DemandStatusMasterEntity` | (demand_status) | Demand status codes |
| `DemandTypeMasterEntity` | (demand_type) | Demand type codes |

---

## Candidate Status Flow

Typical status progression in `STATUS_MASTER` / `CANDIDATE_STATUS`:

```
Received → Screened → Scheduled → L1 Interview → L2 Interview →
HR Interview → Offer Released → Offer-Accept / Offer-Decline →
BU Head Approval → Joined
                    ↓
              Rejected (at any stage)
```

Status types in `CANDIDATE_ROLES_TEMPLATE_MAPPING` determine which feedback template applies.
