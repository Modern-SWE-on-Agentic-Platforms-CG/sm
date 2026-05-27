# SmartHire — Recruiter / Todo Dashboard

## Module Purpose
Provides a recruiter's personal dashboard showing active candidate pipeline, pending actions, scheduled interviews for today, and a weekly slot view. Acts as the primary "action queue" for recruiters to track candidates requiring attention.

---

## 1. User Stories

- As a **Recruiter**, I want to see all active candidates assigned to my practice so that I know who needs follow-up.
- As a **Recruiter**, I want to filter candidates by date range so that I focus on current-period profiles.
- As a **Recruiter**, I want to update a candidate's status from the dashboard so that I do not need to navigate to individual profiles.
- As a **Tower Lead**, I want to see candidates in my towers that need action so that I can process approvals promptly.
- As a **Recruiter**, I want to see which candidates have pending feedback so that I can follow up with the panel.
- As a **Recruiter**, I want to see today's scheduled interviews so that I can prepare for the day.
- As a **Recruiter**, I want to view interview slots for the current week so that I can plan scheduling.

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/todoController/fetchAllCandidates` | Yes | Fetch active candidates for dashboard |
| POST | `/todoController/todoStatusDropdown` | Yes | Fetch available status options per candidate |
| POST | `/todoController/updateStatus` | Yes | Update candidate status from dashboard |
| POST | `/todoController/fetchPendingFeedbacks` | Yes | Fetch candidates with pending feedback |
| POST | `/todoController/fetchSlotsByWeek` | Yes | Fetch interview slots for the current week |
| POST | `/todoController/interviewscheduledtoday` | Yes | Fetch interviews scheduled for today |

---

## 3. Candidate Dashboard List

### `POST /todoController/fetchAllCandidates`
**Request Body:**
```json
{
  "role": "Tower Lead",
  "emailId": "recruiter@capgemini.com",
  "practice_id": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-06-30"
}
```

**Default Date Range:** Last 1 month (if start/end dates not provided).

**Filters Applied:**
- Active status only (`status_end_date IS NULL`)
- Excludes terminal statuses: `*Reject`, `*Interested`, `*Decline`, `*Rejected`, `*Joined`, `*Candidate NA`, `*Panel NA`, `*Reachable`, `*resp/interest`, `*Scheduled`
- Profile aging > 2 days only (filters out very new profiles)
- Referral candidates: excluded if BU is assigned but in early-stage statuses
- For `Tower Lead` role: further filtered to only candidates in towers where the lead's email is in `approver_email_master`

**Response Fields:**
```
tower_type, candidate_name, contact_number, candidate_detail_id,
status_type, bu_id, status_change_date, recvd_date, is_referral,
status_id, total_exp, skill, aging (days since recvd_date),
status_type_with_id: { id, name },
statusFlag (true/false — escalation indicator)
```

**`statusFlag` Rule:**
- `false` if `total_exp >= 10` OR `skill contains "ARCHITECT"` AND status is `L2 Select` or `L1-L2 Select`
- `true` for all other candidates
- Purpose: Signals to the UI whether L3 escalation is needed for senior/architect profiles

---

## 4. Status Dropdown

### `POST /todoController/todoStatusDropdown`
Returns the available next statuses for a candidate's current status. The full list of statuses available on the todo screen:
```
PreScreen Select, L1 Panel NA, L1-L2 Panel NA, L1 Scheduled, L1 Select, L1 Reject,
L2 Scheduled, L2 Select, L3 Scheduled, L3 Select, L3 Panel NA, L3 Candidate NA,
L1-L2 Select, ID_Awaited, DocsSub, TestTaken, Offer_Negotiation, L2 Reject,
L2 Candidate NA, L3 Reject, L1-L2 Reject, L2 On Hold, L3 On Hold, L1-L2 On Hold,
HR Select, HR Reject, BU Reject, NA_Reject, DG_Reject, Offer-Accept, Offer-Decline,
Joined, PreScreen Reject, Not Interested, Not Reachable, L1 Candidate NA,
L1-L2 Candidate NA, Candidate Not resp/interest, Random, L2 Panel NA, L1-L2 Scheduled,
L1 On Hold, PreScreen Processing, NA_Appr, DG_Appr, BU Approved, Offer in system,
Offer_Released, Offer_Rejected, Not Joined, Offer Sent for Appr
```

---

## 5. Status Update from Dashboard

### `POST /todoController/updateStatus`
**Request Body:**
```json
{
  "candidateId": 12345,
  "newStatus": "L1 Select",
  "updatedBy": "recruiter@capgemini.com"
}
```
- Closes current status (`status_end_date = NOW()`)
- Creates new `candidate_status` record with new status
- Returns success/failure message

---

## 6. Pending Feedbacks

### `POST /todoController/fetchPendingFeedbacks`
Returns list of candidates where:
- Interview is scheduled (`recruiter_calendar` entry exists)
- `interviewer_calendar.feedback_status_id IS NULL` (feedback not submitted)
- Interview date is in the past

Response includes: `candidate_name`, `skill`, `panel_email`, `interview_date`, `interview_type`

---

## 7. Today's Interviews

### `POST /todoController/interviewscheduledtoday`
Returns all interviews scheduled for the current calendar day.
- Filters `recruiter_calendar.from_time` for today's date range
- Filtered by `practice_id` and optionally by `emailId` (for Tower Lead)
- Response: `candidate_name`, `skill`, `panel_email`, `from_time`, `to_time`, `interview_type`

---

## 8. Weekly Slot View

### `POST /todoController/fetchSlotsByWeek`
**Request Body:**
```json
{
  "weekStart": "2024-06-03",
  "weekEnd": "2024-06-07",
  "practice_id": 1,
  "emailId": "recruiter@capgemini.com"
}
```
Returns all interviewer slots for the given week, grouped by day.

---

## 9. Error Handling

| Scenario | Response |
|----------|----------|
| No candidates found | `{ error: true, Message: "NO RECORD FOUND" }` |
| DB error | `500 { error: true, Message: <error.message> }` |
| Status update success | `{ error: false, Message: "UPDATED STATUS SUCCESSFUL!" }` |
| Status update failure | `{ error: true, Message: "FAILED TO UPDATE STATUS!" }` |
