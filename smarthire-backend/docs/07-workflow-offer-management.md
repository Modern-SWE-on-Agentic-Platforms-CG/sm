# SmartHire — Workflow & Offer Management

## Module Purpose
Manages the post-L2 selection phase of the recruitment workflow. Handles candidates who have cleared L2 and are progressing through offer approval, negotiation, approval chain (Tower Lead → BU Lead → DG → NA), joining bonus tracking, CTC history, and threshold/band deviation management. Role-based views ensure each approver sees only candidates relevant to their level.

---

## 1. User Stories

- As a **Tower Lead**, I want to see candidates awaiting my tower's input/approval so that I can take timely action.
- As a **SL-BU Lead**, I want to see candidates in offer approval stages for my BU so that I can approve or reject offers.
- As a **Recruiter/PMO**, I want to view all workflow candidates filtered by my practice/BU so that I can track offer progress.
- As a **Recruiter**, I want to update a candidate's offer status (CTC, grade, level, DOJ) so that approvals move forward.
- As a **Tower Lead**, I want to update the approved offer CTC and level for a candidate so that the offer letter is accurate.
- As a **PMO**, I want to view and update joining bonus (JB) candidates and their project codes so that JB disbursement is tracked.
- As a **Recruiter**, I want to view the full CTC change history for a candidate so that negotiations are documented.
- As a **PMO**, I want to configure approver DL (distribution list) email addresses per tower so that approval emails go to the right group.
- As a **Recruiter**, I want to see the threshold and band deviation details so that I know whether hiring approval is needed.

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/workflow/fetchFlowCandidates` | Yes | Fetch candidates in workflow (role-filtered) |
| POST | `/workflow/updateFlowCandidates` | Yes | Update candidate offer/status in workflow |
| POST | `/workflow/commentsHistory` | Yes | Fetch comment history for a candidate |
| POST | `/workflow/commentDropdown` | Yes | Fetch available comment types |
| POST | `/workflow/addComments` | Yes | Add a comment to a candidate |
| POST | `/workflow/fetchJBCandidates` | Yes | Fetch joining bonus eligible candidates |
| GET  | `/workflow/fetchAllStatuses` | Yes | Fetch all available status values |
| GET  | `/workflow/fetchJBBonus` | Yes | Fetch joining bonus amount options |
| POST | `/workflow/updateJBCandidates` | Yes | Update joining bonus for a candidate |
| POST | `/workflow/fetchJBCandidatesForBU` | Yes | Fetch JB candidates filtered by BU |
| POST | `/workflow/updateJBCandidatesForBU` | Yes | Update JB candidates for BU |
| POST | `/workflow/ctcHistory` | Yes | Fetch CTC change history |
| GET  | `/workflow/rejectionReasonDropdown` | Yes | Fetch rejection reason options |
| POST | `/workflow/jbDLDropdown` | Yes | Fetch JB distribution list options |
| POST | `/workflow/thresholdApi` | Yes | Fetch hiring threshold details |
| POST | `/workflow/sourceByVendor` | Yes | Fetch source by vendor mapping |
| GET  | `/workflow/getCode` | Yes | Fetch project codes |
| POST | `/workflow/getAverageOfferedCTC` | Yes | Calculate average CTC for a level/grade |
| GET  | `/workflow/getApproverDLDetails` | Yes | Fetch all tower approver DL configuration |
| POST | `/workflow/updateApproverDLDetails` | Yes | Update approver DL email |
| POST | `/workflow/fetchDLTitle` | Yes | Fetch DL title for a tower |
| POST | `/workflow/fetchNewTowerForLead` | Yes | Fetch tower list for a lead |
| POST | `/workflow/getPossibleStatus` | Yes | Get next possible status transitions |
| POST | `/workflow/updateCandidateSkill` | Yes | Update candidate skill/tower assignment |

---

## 3. Workflow Candidate View (Role-Based)

### `POST /workflow/fetchFlowCandidates`
**Request Body:**
```json
{
  "emailId": "user@capgemini.com",
  "role": "Tower Lead",
  "practice_id": 1,
  "bu_name": "SAP",
  "key": true
}
```

**Role-based filtering logic:**

| Role | Visible Status Types | Additional Filter |
|------|---------------------|-------------------|
| `Tower Lead` (key=true) | `Offer Sent for Appr`, `NA_Appr`, `BU Approved`, `BU Reject`, `Offer_Negotiation`, `NA_Reject`, `Tower Input Required`, `DG_Appr`, `DG_Reject`, `Tower Approved`, `Tower Reject`, `L2 Select` | Only towers where email is in `approver_email_master` |
| `Tower Lead` (key=false) | `Offer Sent for Appr`, `Offer_Negotiation`, `Tower Input Required`, `L2 Select`, `Tower Reject` | Same tower filter |
| `SL-BU Lead` (SAP, key=false) | `Tower Input Required`, `Offer Sent for Appr`, `Tower Approved` | `bu_flag = true`, CTC fields non-null |
| Other roles | As per `practice_id` and BU assignment | |

**Response Fields per candidate:**
```
candidate_detail_id, candidate_name, candidate_email, contact_number,
current_location (joining_location), skill, current_status, previous_status,
current_company, preferred_offered_location, tower, region,
total_exp, rel_exp, current_ctc, expected_ctc, notice_period,
approved_level_offered, date_of_joining (doj), dojmonth,
offer_ctc (proposed_ctc), approved_offer_ctc, proposed_grade,
joining_bonus, hike_percent, file_name (resume), resume_path,
isImmediateJoinee, headings (domain heading), domainExp, totalSapExp,
arc_deviation, isRevised (revision count), counter_offered,
holding_offer_details, band_deviation, level_offered, college,
jrmapped_to, jr_id, hiring_threshold_amount, threshold_value,
level_based_on_exp, education_background, feedback_path,
account_name, offer_sent_for_approval flag
```

---

## 4. Offer Approval Chain

```
L2 Select
  → Tower Input Required
    → Tower Approved / Tower Reject
      → DG_Appr / DG_Reject
        → NA_Appr / NA_Reject
          → Offer Sent for Appr
            → Offer_Negotiation (if counter-offered)
            → BU Approved / BU Reject
              → Offer in system
                → Offer_Released
                  → Offer-Accept / Offer-Decline
                    → Joined / Not Joined
```

Special override: Central Strategic account candidates follow a parallel path gated by `em_list` (account_approver_email with `account_approver_id > 10`).

---

## 5. Joining Bonus (JB) Management

- JB-eligible candidates are tracked via `candidate_info_detail.joining_bonus` field
- Project code linked via `jb_project_code_master`
- JB candidates for BU lead view filtered separately via `fetchJBCandidatesForBU`
- JB DL (distribution list) manages email notifications for JB approvals

---

## 6. CTC History

### `POST /workflow/ctcHistory`
- Stored in `ctc_history` table
- Tracks each CTC change with: old value, new value, changed_by, changed_date, reason
- Used to display negotiation audit trail

---

## 7. Threshold & Band Deviation

### `POST /workflow/thresholdApi`
- `threshold_master` stores hiring budget thresholds
- `candidate_info_detail.hiring_threshold_amount` — total hiring cost
- `candidate_info_detail.threshold_value` — threshold percentage
- `candidate_info_detail.band_deviation` — band deviation flag (Y/N)
- `candidate_info_detail.arc_deviation` — ARC (approval policy) deviation flag

### Average CTC Calculation
### `POST /workflow/getAverageOfferedCTC`
- Calculates average `approved_offer_ctc` for candidates at the same grade level
- Used to determine whether a proposed offer is within norms

---

## 8. CTC Amount-to-Words Conversion

Server-side utility converts numeric CTC values (in Lakhs) to words for offer letter generation:
- `convert_lakhs → convert_thousands → convert_hundreds → convert_tens`
- Example: `1250000` → `"Twelve Lakh Fifty Thousand"`
- Returns `"NA"` for null values, `"Zero"` for zero

---

## 9. Approver DL Configuration

### `GET /workflow/getApproverDLDetails`
Returns all `tower_approver_master` records with linked `approver_email_master` data.

### `POST /workflow/updateApproverDLDetails`
Updates an approver email address in `approver_email_master`.

**Default approver DLs (from constants):**
```
alltowers@capgemini.com
nalead@capgemini.com
recruiterlead@capgemini.com
cfscgp-profile-coordinator.in@capgemini.com
allrecruiters@capgemini.com
sl-bulead@capgemini.com
```

---

## 10. Error Handling

| Scenario | Response |
|----------|----------|
| No workflow candidates | Empty array |
| DB error | `{ error: true, Message: <error> }` |
| Status update success | `{ error: false, Message: "UPDATED STATUS SUCCESSFUL!" }` |
| Status update failure | `{ error: false, Message: "FAILED TO UPDATE STATUS!" }` |
| CTC history empty | Empty array |
