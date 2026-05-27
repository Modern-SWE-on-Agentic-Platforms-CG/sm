# Module: Referral Candidate

## Purpose

Supports the employee referral programme. Provides the master data (form headers, dropdown options) needed to submit a referral form. Referred candidates are tracked separately from direct-sourced candidates in the pipeline.

---

## API Endpoints

Base path: `/referralCandidate`

### 1. Get Referral Form Headers

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/referralCandidate/getReferralFormHeaders` |
| **Auth** | Required (JWT) |

**Purpose**: Retrieve all master data required to populate and render the candidate referral submission form.

**Response**: `ReferralMasterDataDTO`

| Field | Type | Description |
|---|---|---|
| referralFormFields | List | Form field definitions (headings, types, required flags) |
| technologies | List | Technology options for the form |
| locations | List | Location options |
| buList | List | Business unit options |
| noticePeriods | List | Notice period options |
| certifications | List | Certification options |

---

## Referral Form Data Model

### REFERRAL_FORM table (`ReferralFormEntity`)

| Column | Type | Description |
|---|---|---|
| `REFERRAL_FORM_ID` | long (auto PK) | |
| `REFERRAL_SEQ_ID` | long | Display order |
| `HEADING` | String | Field/section label |
| `SUB_HEADING` | String | Sub-section label |
| `DESCRIPTION` | String | Help text |
| `REFERRAL_PARENT_ID` | long (FK self-ref) | Parent entry (hierarchical form) |
| `DATATYPE_ID` | long (FK) | Field data type |
| `IS_REQUIRED` | boolean | Mandatory field |
| `IS_ACTIVE` | boolean | Active/inactive |

Like the feedback form, referral forms use a self-referential parent-child hierarchy for sections and fields.

---

## Referral Master Data Tables

| Table | Entity | Purpose |
|---|---|---|
| `REFERRAL_FORM` | `ReferralFormEntity` | Form field definitions |
| `REFERRAL_TECHNOLOGY_MASTER` | `ReferralTechnologyMasterEnity` | Technologies for referral form |
| `REFERRAL_LOCATION_MASTER` | `ReferralLocationMasterEntity` | Locations for referral form |
| `REFERRAL_BU_MASTER` | `ReferralBUMasterEntity` | BUs for referral form |
| `REFERRAL_NOTICE_PERIOD_MASTER` | `ReferralNoticePeriodMasterEntity` | Notice period options |
| `REFERRAL_CERTIFICATIONS` | `ReferralCertificationsRepository` | Certification options |

---

## Referral Candidate Tracking

Referred candidates are flagged in the candidate pipeline via:
- `IS_REFERRAL = true` on `CandidateInfoDetailEntity`
- `REFERRED_VENDOR` field captures the referrer or vendor name
- `isReferral` flag on `CandidateDataDTO`

Referred candidates flow through the same interview pipeline as regular candidates once admitted.

---

## Business Rules

- Referral form is distinct from the hiring/interview process — it is the intake mechanism.
- After a referral is submitted, it is reviewed and the candidate may be added to the main pipeline.
- Referral master data (technologies, locations, BU) is maintained separately from the main lookup tables.

---

## Service Dependencies

| Service | Notes |
|---|---|
| `ReferralCandidateService` | All referral master data retrieval |

## Repository Dependencies

| Repository | Table |
|---|---|
| `ReferralFormRepository` | `REFERRAL_FORM` |
| `ReferralTechnologyMasterRepository` | `REFERRAL_TECHNOLOGY_MASTER` |
| `ReferralLocationMasterRepository` | `REFERRAL_LOCATION_MASTER` |
| `ReferralBUMasterRepository` | `REFERRAL_BU_MASTER` |
| `ReferralNoticePeriodMasterRepository` | `REFERRAL_NOTICE_PERIOD_MASTER` |
| `ReferralCertificationsRepository` | `REFERRAL_CERTIFICATIONS` |
