# SmartHire — Email & Notifications

## Module Purpose
Manages all outbound email communication in the system including offer approval emails, feedback reminder emails, interview scheduling notifications, error alerts, and automated cron-based reminders. Uses AWS SES via SMTP for delivery.

---

## 1. Email Infrastructure

### Transport Configuration
- **Provider**: AWS Simple Email Service (SES)
- **SMTP Host**: `email-smtp.eu-west-1.amazonaws.com`
- **Port**: 25
- **Connection Timeout**: 240,000ms (4 minutes)
- **Greeting Timeout**: 6,000ms
- **Library**: `nodemailer` with connection pooling (`pool: true`)
- **From Address**: `smartrecruit@capgemini.com`
- **Email Signature**: `Smart Recruit Team`

---

## 2. Email Types

### 2.1 Offer Approval Email
**Trigger**: When a candidate's status is moved to `"Offer Sent for Appr"` (offer sent for approval)  
**Recipients**:
- Tower Lead DL (from `approver_email_master`)
- All approver DLs (from `constants.approverDLs`):
  ```
  alltowers@capgemini.com
  nalead@capgemini.com
  recruiterlead@capgemini.com
  cfscgp-profile-coordinator.in@capgemini.com
  allrecruiters@capgemini.com
  sl-bulead@capgemini.com
  ```
- CC: `monica.mohapatra@capgemini.com` (for experienced candidates — `constants.expCCMail`)

**Content**: Candidate offer details including name, skill, CTC, grade, joining date, and approval chain status.

---

### 2.2 Feedback Reminder Email (Daily Cron)
**Trigger**: Daily at 10:00 AM (`cron.schedule('00 00 10 * * *', ...)`)  
**Function**: `feedbackformRptController.sendfeedBackEmailRemainder()`

**Logic**:
1. Find all panel members with unsubmitted feedback (`feedback_status_id IS NULL`, interview date past)
2. Collect pending candidate list per panel member
3. Send individual reminder email to each panel member
4. **From**: `smartrecruit@capgemini.com`
5. **Subject**: Lists pending interview details

---

### 2.3 New Feedback Reminder (Hourly Cron — Mon–Sat)
**Trigger**: Every hour on Monday through Saturday (`cron.schedule('0 * * * 1-6', ...)`)  
**Function**: `job.triggerEmailReminders()`

**Logic**: More frequent reminder for the new feedback workflow. Queries `interviewer_calendar` for unsubmitted feedback and sends targeted reminders.

---

### 2.4 Interview Scheduling Error Email
**Trigger**: When the interview bulk upload (`/instantInterviewUpload/upload`) encounters row-level errors  
**Function**: `emailService.sendErrorEmail(errors, emailId)`  
**Recipient**: Email of the user who uploaded the file (`req.body.emailId`)  
**Subject**: `"Interview Scheduling Errors"`

**Content**: HTML table with columns:
| Sr.No | Candidate | Message |
|-------|-----------|---------|
| 1 | John Doe | Candidate not found in system |
| 2 | Jane Smith | Invalid interview date format |

---

### 2.5 Offer Letter / Approval Chain Emails
Triggered from `workflow.js` at various approval stages:
- Status change to `Tower Input Required`: Notification to tower lead
- Status change to `DG_Appr`/`NA_Appr`: Notification to respective approvers
- Status change to `Offer Sent for Appr`: Full approval chain email with candidate CTC details

---

### 2.6 L2 Select Notification  
Triggered when candidate reaches `L2 Select` status — notifications sent to profile coordinator:  
**Email**: `cfscgp-profile-coordinator.in@capgemini.com`

---

## 3. Cron Job Schedule Summary

| Schedule Expression | Timing | Function | Purpose |
|--------------------|--------|----------|---------|
| `00 00 10 * * *` | 10:00 AM daily | `sendfeedBackEmailRemainder()` | Daily feedback reminder to panels |
| `0 * * * 1-6` | Every hour, Mon–Sat | `triggerEmailReminders()` | Frequent new-feedback reminders |
| `0 9,21 * * *` | 9 AM and 9 PM daily | `deleteExcelHistory()` | Clean up old Excel export files |

---

## 4. Email Controller (`app/controller/email.js`)

Handles candidate-specific notification emails. Key functions called from other controllers (e.g., `candidate_info.js`):
- Sends status change notifications to recruiter and panel
- Sends candidate interview schedule confirmation
- Sends offer acceptance/declination notifications to relevant DLs

---

## 5. Email Data Flow

```
Controller (workflow.js / candidateInfo.js / etc.)
    |
    ├─→ email.js (controller/email.js)
    |       └─→ nodemailer transport → AWS SES → Recipient
    |
    └─→ emailService.js (middleware/emailService.js)
            └─→ nodemailer transport → AWS SES → Uploader email
```

---

## 6. SMTP Authentication (from config.json)
- **Auth Type**: Username/password (AWS SES SMTP credentials)
- **User**: IAM SES user key (`smtp_auth.user`)
- **Pass**: IAM SES password (`smtp_auth.pass`)
- Credentials stored in `config.json` per environment (development/staging/production)

---

## 7. Email Template Patterns

All emails use HTML content. Common patterns observed:
- **Error table**: `<table border="1">` with rows per error
- **Candidate details**: Inline HTML with candidate fields
- **Reminder**: List of pending candidates per interviewer
- **Approval email**: Rich HTML with offer details and approval chain context

---

## 8. Error Handling

| Scenario | Behavior |
|----------|----------|
| SMTP connection failure | Error logged to `console.error()`; silent to API caller |
| Email send error | `console.log("mail_error_send", error)` |
| Missing recipient email | Email silently skipped |
| Cron job exception | Exception caught; job continues on next schedule |

---

## 9. Non-Functional Notes for Fresh Implementation

- All email credentials are stored in `config.json` — migrate to environment variables / secrets manager
- Hard-coded approver email DLs in `constants.js` — externalize to database configuration
- Email connection pooling enabled — suitable for high-volume sends during cron jobs
- No email delivery tracking or bounce handling implemented
- No unsubscribe mechanism — internal corporate system
