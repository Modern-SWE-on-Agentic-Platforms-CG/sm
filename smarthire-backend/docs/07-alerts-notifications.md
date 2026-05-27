# Module: Alerts & Email Notifications

## Purpose

Sends automated email alerts and reminders to recruiting stakeholders. Alerts are triggered either by scheduled jobs (cron) or by manual API invocations. Five distinct alert types are implemented.

---

## API Endpoints

Base path: `/alerts`

All alert endpoints return `void`. Errors are logged but not surfaced to callers.

> **Note**: All endpoints have `@Scheduled` annotations commented out in the source. They can be triggered manually via HTTP or re-enabled as cron jobs.

### 1. Send Aging SLAs Alert

| Property | Value |
|---|---|
| **Method** | GET (RequestMapping) |
| **Path** | `/alerts/sendAgingSLAs` |
| **Auth** | Required (JWT) |
| **Scheduled Cron** | `0 0 09 * * *` IST (commented out — daily at 9 AM) |

**Purpose**: For each skill group, query candidates in active (non-terminal) statuses and send an aging report Excel attachment to the skill group DL.

**Email Content**: Excel spreadsheet with columns — Candidate Name, Email, Status, Last Changed Date, Aging.

**Recipients**: Skill group distribution list (from `SKILL_GROUP_MASTER`).

**Skipped statuses**: Reject*, Joined, Offer-Decline, Offer-Accept, Offer_Released.

---

### 2. Send Interview Reminder

| Property | Value |
|---|---|
| **Method** | GET (RequestMapping) |
| **Path** | `/alerts/sendInterviewReminder` |
| **Auth** | Required (JWT) |
| **Scheduled** | Every 15 minutes (commented out) |

**Purpose**: Send a reminder email to interviewers who have upcoming scheduled interviews that have not yet been marked as reminded (`IS_REMINDED = false`).

**Post-action**: Mark `IS_REMINDED = true` on the calendar entry.

---

### 3. Send Interview Status

| Property | Value |
|---|---|
| **Method** | GET (RequestMapping) |
| **Path** | `/alerts/sendInterviewStatus` |
| **Auth** | Required (JWT) |
| **Scheduled** | Every 15 minutes (commented out) |

**Purpose**: Notify recruiter/PMO when interviewer has submitted a feedback status after an interview. Marks entry as `IS_STATUS_REMINDED = true`.

---

### 4. Feedback Form Reminder

| Property | Value |
|---|---|
| **Method** | GET (RequestMapping) |
| **Path** | `/alerts/feedbackFormReminder` |
| **Auth** | Required (JWT) |
| **Scheduled Cron** | `0 0 09 * * *` IST (commented out — daily at 9 AM) |

**Purpose**: Remind interviewers who have completed interviews but have not yet submitted feedback forms.

---

### 5. Send Tower Aging SLAs

| Property | Value |
|---|---|
| **Method** | GET (RequestMapping) |
| **Path** | `/alerts/sendTowerAgingSLAs` |
| **Auth** | Required (JWT) |
| **Scheduled Cron** | `0 0 19 * * *` IST (commented out — daily at 7 PM) |

**Purpose**: Send tower-level aging SLA reports to tower approver email addresses.

**Recipients**: Tower approvers (from `TOWER_APPROVER_MASTER`).

---

## Email Service

All emails are sent via `EmailServiceImpl` using AWS SES SMTP.

### SMTP Configuration (`common-{profile}.properties`)

| Property | Description |
|---|---|
| `host` | SMTP host (`email-smtp.eu-west-1.amazonaws.com`) |
| `port` | SMTP port (`25`) |
| `smtp_username` | AWS SES SMTP username |
| `smtp_pass` | AWS SES SMTP password |
| `mailId` | From address |
| `admin` / `administrator` | Admin email address |
| `ccMailId` | CC address (profile coordinators) |
| `ccFeedbackMailID` | CC for feedback emails |
| `appsNARoleCc` | CC for NA role notifications |

### Email DTOs

`SendEmailDTO`:

| Field | Type | Description |
|---|---|---|
| to | String | Primary recipient |
| cc | String | CC recipients |
| subject | String | Email subject |
| body | String | HTML body |
| attachments | List | Optional file attachments |

---

## Aging SLA Excel Report Format

Generated via Apache POI HSSF. Single sheet named `CandidatesReport`.

Headers (bold, dark red font):
1. Candidate Name
2. Email
3. Status
4. Last Changed Date
5. Aging

---

## Business Rules

- Aging SLA alerts are per skill group — each skill group gets its own email.
- Terminal statuses are excluded from aging alerts: Reject*, Joined, Offer-Decline, Offer-Accept, Offer_Released.
- Interview reminders are sent for entries where `IS_REMINDED = false`.
- Status reminders are sent for entries where `IS_STATUS_REMINDED = false`.
- Tower aging SLAs run in the evening (19:00 IST).
- Skill group SLA emails run in the morning (09:00 IST).

---

## Service Dependencies

| Service | Notes |
|---|---|
| `AlertService` / `AlertServiceImpl` | All alert logic |
| `EmailServiceImpl` | SMTP sending |

## Repository Dependencies

| Repository | Table | Purpose |
|---|---|---|
| `SkillGroupRepository` | `SKILL_GROUP_MASTER` | Skill group definitions and DL |
| `CandidateDetailsRepository` | `CANDIDATE_DETAIL` | Candidate aging data (via custom JPQL) |
| `InterviewerRepository` | `INTERVIEWER_CALENDAR` | Interview reminder queries |
| `TowerMasterRepository` | `TOWER_MASTER` | Tower definitions |
| `TowerApproverMasterRepository` | `TOWER_APPROVER_MASTER` | Approver email addresses |

---

## Email Template Infrastructure

- Email bodies are HTML strings constructed in the service layer (no Velocity templates for alert emails — Velocity is available but not used for these).
- Excel attachments are embedded as `ByteArrayDataSource` in `MimeMultipart` messages.

---

## Error States

| Condition | Handling |
|---|---|
| SMTP send failure | Logged; exception swallowed at controller level |
| No candidates in aging | Skill group skipped silently |
| Empty skill group list | Loop exits immediately |
