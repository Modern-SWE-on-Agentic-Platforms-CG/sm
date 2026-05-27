# SmartHire UI - Reports and Analytics Specification

## Overview

All report modules use **Highcharts** for chart rendering and support Excel export. Reports are accessible via navigation links from the Select/Reject page and the main navigation menu.

---

## Module: Select / Reject Report (`/select-reject`)

### Purpose

Shows pie charts for candidate selection and rejection ratios with multi-select filters.

### Charts

1. **Reject/Select Ratio** — Overall pie chart of select vs reject counts
2. **Select Ratio** — Breakdown of selected candidates
3. **Reject Ratio** — Breakdown of rejected candidates

### Filters

Source (multi-select), Vendor (multi-select), Tower (multi-select), Skill (multi-select)

### Navigation Links (from this page to other reports)

| Report | Route |
|---|---|
| Feedback Form Report | `/feedbackform-report` |
| Panel Insights | `/panel-insights` |
| L2 Report | `/l2-report` |
| Date of Joining | `/dateofjoining` |
| Channel Insights | `/channel-insights` |
| Trend Chart | `/trend-chart` |
| L2 Aging | `/l2-aging` |
| ARC Deviation | `/arc-deviation` |
| Rejection Report | `/rejection-report` |

### API: `GET/POST REJECTIONREPORTINFO`

---

## Module: L2 Report (`/l2-report`)

### Purpose

Tracks candidates at the L2 (second interview) stage.

### Data Displayed

Candidate name, skill, current status, L2 date, aging days

### Filters

Technology, date range

### Actions

Filter, Export to Excel

### API: `GET/POST L2REPORT`, `GET downloadL2Excel`

---

## Module: L2 Aging (`/l2-aging`)

### Purpose

Aging analysis for candidates stuck at L2 stage beyond an acceptable threshold. Color-coded by aging severity.

### Data Displayed

Candidate name, L2 date, days since L2, current status

### API: `GET L2AGINGREPORT`

---

## Module: Panel Insights (`/panel-insights`)

### Purpose

Analytics on interviewer panel performance: interview counts, availability, utilization.

### Charts

Bar/pie chart of interviews per panel member; panel utilization rate

### API: `POST PANELINSIGHTS`

---

## Module: Status Insights (`/status-insights`)

### Purpose

Shows status distribution of all candidates across the hiring pipeline.

### Charts

Pie/bar chart of candidate count per status bucket; funnel view of pipeline stages

### API: `POST STATUSINSIGHTS`

---

## Module: Channel Insights (`/channel-insights`)

### Purpose

Analytics on candidate sourcing channels — source breakdown by volume and conversion rate.

### Charts

Pie chart of candidates per source; conversion rate by source

### API: `POST CHANNELINSIGHTS`

---

## Module: Rejection Report (`/rejection-report`)

### Purpose

Detailed breakdown of rejection reasons across candidates and interview stages.

### Data Displayed

Rejection reason, count, technology, stage of rejection

### Filters

Technology, date range

### API: `POST REJECTIONREPORTINFO`

---

## Module: Trend Chart (`/trend-chart`)

### Purpose

Line chart showing hiring metrics over time (interviews, feedback submitted, selections, rejections).

### Charts

Line chart with time-series, multiple series overlaid (interviewed / selected / rejected)

### API: `POST TRENDCHART`

---

## Module: Date of Joining (`/dateofjoining`)

### Purpose

Report on candidates' expected or confirmed joining dates for offer tracking.

### Data Displayed

Candidate name, DOJ, offer status, BU, technology

### API: `POST DATEOFJOINING`

---

## Module: ARC Deviation (`/arc-deviation`)

### Purpose

Shows deviation between actual and recommended/committed hiring numbers.

### Charts

Bar chart of demand vs supply per BU/practice

### API: `POST ARCDEVIATION`

---

## Module: Dashboard Reports (`/dashboard-reports`)

### Purpose

Executive summary dashboard aggregating key metrics from multiple report sources.

### Data Displayed

Summary cards: total interviews, selects, rejects, pending feedbacks, open demands. Navigation shortcuts to detailed reports.

---

## Module: Interview Data (`/interview-data`)

### Purpose

Detailed tabular report of all interviews conducted.

### Data Displayed

Interview date/time, candidate, interviewer, technology, status, feedback status

### Filters

Date range, interviewer

### API: `POST INTERVIEWDATA`

---

## Module: Candidate Approval Data (`/candidate-approval-data`)

### Purpose

Report on candidates who have gone through approval workflow stages.

### Data Displayed

Candidate name, approval stage, approved by, approval date

---

## Common Behaviors (All Report Modules)

1. **Excel export** supported on all reports via a download button
2. **Date range filtering** via PrimeNG Calendar (from/to date pickers)
3. **Highcharts** renders all charts (pie, line, bar)
4. **Empty state**: "No data available" message shown in chart/table area
5. **Loading state**: `ngx-spinner` full-page overlay
6. Filters applied via API query params for large datasets; client-side for small ones
