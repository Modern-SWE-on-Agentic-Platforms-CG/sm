# SmartHire — Reports & Analytics

## Module Purpose
Provides multiple analytical views of the recruitment pipeline. Covers pie charts (reject/select ratios), line charts (interview trends over time), L2 dashboard (critical skills pipeline), L2 aging reports, ARC deviation reports, interview reports, rejection reason analysis, and status insight exports.

---

## 1. Sub-Modules

| Sub-Module | Controller File | Description |
|-----------|----------------|-------------|
| Pie Charts (Funnel Reports) | `reports.js` | Outer/inner pie charts for select/reject ratios |
| Line Chart | `lineChart.js` | Monthly/yearly interview count trends |
| L2 Dashboard | `l2_dashboard_reports.js` | Critical skill status matrix |
| L2 Aging Report | `l2_aging_report.js` | Time-based aging for post-L2 candidates |
| ARC Deviation Report | `arc_deviation_reports.js` | Candidates with ARC policy deviations |
| Interview Report | `interview_report.js` | Scheduled interview counts and L2 select ratio |
| Rejection Reason | `rejection_reason.js` | Rejection breakdown by reason |
| Status Insight | `status_insight.js` | Status insight export and updates |
| Feedback Form Report | `feedbackformReport.js` | Feedback submission status report |

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/reports/filterOuterPieChart` | Yes | Overall select/reject ratio (filtered) |
| POST | `/reports/filterInnerPieChart` | Yes | Status breakdown pie chart (filtered) |
| POST | `/reports/filterReferralOuterPieChart` | Yes | Referral candidate outer pie chart |
| POST | `/reports/filterReferralInnerPieChart` | Yes | Referral candidate inner pie chart |
| GET  | `/reports/initialOuterPieChart` | Yes | Initial (unfiltered) outer pie chart |
| GET  | `/reports/getStartEndDate` | Yes | Fetch date range boundaries for filters |
| POST | `/reports/fetchSkillsByTowers` | Yes | Fetch skills for selected towers |
| POST | `/reports/fetchVendorsBySources` | Yes | Fetch vendors for selected sources |
| POST | `/reports/getOfferApproveCandidate` | Yes | Fetch candidates at offer-approval stage |
| POST | `/lineChart/fetchInterviewtakenCountByMonth` | Yes | Interview counts by month (filtered) |
| POST | `/lineChart/fetchInterviewtakenCountByYear` | Yes | Interview counts by year |
| GET  | `/lineChart/fetchAllYears` | Yes | Fetch distinct years available |
| GET  | `/lineChart/fetchAllMonths` | Yes | Fetch month labels |
| POST | `/l2_dashboard_reports/reports` | Yes | L2 status matrix for critical skills |
| POST | `/l2_dashboard_reports/getL2StatusInfoExcel` | Yes | Export L2 status data to Excel |
| POST | `/l2_dashboards_reports/getDOJStatusInfo` | Yes | DOJ (joining) status breakdown |
| POST | `/l2_dashboard_reports/agingReport` | Yes | L2 aging report matrix |
| POST | `/arc_deviation_reports/getArcDeviationInfo` | Yes | ARC deviation report |
| POST | `/arc_deviation_reports/exportExcelArcDeviationReport` | Yes | Export ARC deviation to Excel |
| POST | `/report/rejectSelectRatio` | Yes | Overall reject/select ratio |
| POST | `/report/l2selectRatioForSource` | Yes | L2 select ratio broken down by source |
| POST | `/report/fetchInterviewScheduledCountDay` | Yes | Interview count by day |
| POST | `/report/feedbackFormReport` | Yes | Feedback form submission status report |
| POST | `/report/exportFeedbackExcel` | Yes | Export feedback report to Excel |
| POST | `/statusInsight/exportStatusInsight` | Yes | Export status insight data |
| POST | `/statusInsight/updateStatusInReports` | Yes | Bulk update candidate status via reports screen |
| POST | `/rejectionReasonReport/rejectionReport` | Yes | Rejection reason breakdown report |
| POST | `/rejectionReasonExcelReport/rejectionExcelReport` | Yes | Export rejection report to Excel |

---

## 3. Pie Chart Reports

### Outer Pie Chart (Overall Select/Reject Ratio)
**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "towerIds": [1, 2],
  "sourceIds": [1, 2],
  "vendorIds": [1],
  "practice_id": 1
}
```

**Response:**
```json
{
  "select_Ratio": 42.5,
  "reject_Ratio": 35.2,
  "reject_Counts": 120,
  "select_Counts": 145,
  "total_Counts": 341
}
```

**Classification Logic:**

| Category | Status Types Included |
|----------|-----------------------|
| Select | Any status containing `"Select"`, `"BU Approved"`, `"Scheduled"`, `"On Hold"`, `"Offer-Accept"`, `"Joined"` |
| Reject | Any status containing `"Reject"`, `"Offer-Decline"`, `"Not Joined"` |
| N/A | All other statuses |

`total_Counts` = select + reject (N/A excluded from ratio denominator)

### Inner Pie Chart (Status Breakdown)
Returns individual counts for each specific status type across:
- Reject statuses: `PreScreen Reject`, `L1 Reject`, `L1-L2 Reject`, `L2 Reject`, `L3 Reject`, `HR Reject`, `BU Reject`, `Offer-Decline`, `Not Joined`
- Select statuses: `PreScreen Select`, `L1 Scheduled`, `L1 Select`, `L1 On Hold`, `L1-L2 Scheduled`, `L1-L2 Select`, etc.

---

## 4. L2 Dashboard (Critical Skills)

### `POST /l2_dashboard_reports/reports`
**Request Body:**
```json
{
  "practice_id": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "sourceIds": "1,2,3"
}
```

**Response:** Array of skill rows, one per critical technology:
```json
[
  {
    "mu": "Java",
    "selected": 10,
    "offered": 5,
    "joined": 3,
    "reject": 8,
    "declined": 2
  }
]
```

**Status Parent Types (from `status_intermediate_mapping`):**

| status_parent_type | Meaning |
|-------------------|---------|
| `Select/offer WIP` | Counted as `selected` |
| `Offered` | Counted as `offered` |
| `Joined` | Counted as `joined` |
| `Reject` | Counted as `reject` |
| `Declined` | Counted as `declined` |

- Only `critical_flag = true` AND `active_flag = true` technologies are included
- Results de-duplicated and aggregated across candidate records

---

## 5. L2 Aging Report

### `POST /l2_dashboard_reports/agingReport`
Categorizes post-L2-Select candidates by time elapsed since L2 selection:

| Category | Days Since L2 Select |
|----------|---------------------|
| `0 - 10 days` | 0–9 days |
| `10 - 20 days` | 10–19 days |
| `20 - 30 days` | 20–29 days |
| `30 - 40 days` | 30–39 days |
| `40 - 50 days` | 40–49 days |
| `Greater than 50 days` | 50+ days |

L2 Aging Excel columns (from `config.l2SheetArray`):
```
Candidate Detail ID, Candidate name, FTE, Skill, Skill Cluster, Email ID, Phone Number,
Account Mapped to or Bench, SO, Profile received date, L2 Select Date, Vendor Name,
Recruiter Coordinator, Notice Period, Level/Grade Offered, Docs Sub date, Test taken Dt,
Sent for appr, BU Aprv Dt, NA Approval dt, DG Appr Dt, Offer Release date,
Current Status, Previous Status, Last Updated on, Comment,
Total Exp (Y), Rel Exp(Y), Current CTC, Exp CTC, Offer CTC,
Counter Offered, Revised Offered, DOJ, HR Coordinator,
Days since L2, Days since Doc received, Skill Group, Skill for DB,
dashboard Status, Status nbr, Error, Baseline, Offer tracking team,
actionable, gender, Offered Location, l1/l2 account names,
Recruitment IDs, Days Since L2 Select Category, Referral, Rehire, ...
```

---

## 6. Interview Report

### `POST /report/rejectSelectRatio`
Returns overall reject/select ratio for all interviews.

### `POST /report/l2selectRatioForSource`
Returns L2 select ratio broken down per source channel.

### `POST /report/fetchInterviewScheduledCountDay`
Returns count of interviews scheduled per day within a date range.

---

## 7. ARC Deviation Report

### `POST /arc_deviation_reports/getArcDeviationInfo`
Returns candidates where `arc_deviation` is set (hiring policy deviations). Filtered by practice, date range, and source.

**Response fields:** Same as workflow candidate fields, with `arc_deviation` flag prominent.

---

## 8. Rejection Reason Report

### `POST /rejectionReasonReport/rejectionReport`
Returns counts of candidates grouped by `rejection_reason` and stage (L1, L2, HR, BU, etc.).

---

## 9. Status Insight

### `POST /statusInsight/exportStatusInsight`
Exports a snapshot of candidate statuses with detailed fields for PMO review.

### `POST /statusInsight/updateStatusInReports`
Allows bulk status updates to candidates directly from the reports screen (role-gated).

---

## 10. Feedback Form Report

### `POST /report/feedbackFormReport`
Returns list of candidates with feedback form submission status:
- Statuses tracked: `L1 FB NA`, `L1-L2 FB NA`, `L2 FB NA`
- `is_submit` flag on `interviewer_calendar`
- Feedback statuses: Select, Reject, On Hold, etc.

### `POST /report/exportFeedbackExcel`
Exports the feedback report as an Excel file.

---

## 11. Error Handling

| Scenario | Response |
|----------|----------|
| No records found | `{ error: true, Message: "No Record Found!" }` |
| DB error | `500 { error: true, Message: <error.message> }` |
| Empty filter result | Zero counts returned (not an error) |
