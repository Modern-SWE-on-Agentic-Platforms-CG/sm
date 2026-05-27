# SmartHire — Demand Screen

## Module Purpose
Displays open hiring demands categorized by skill group and individual technology. Provides a matrix view of demand counts grouped by demand type (Billable, Strategic, Pursuit) and urgency buckets based on role start date proximity. Supports Excel export of demand data.

---

## 1. User Stories

- As a **Recruiter / PMO**, I want to see all current open demands organized by skill so that I can prioritize sourcing efforts.
- As a **Recruiter**, I want to filter demands by grade and primary location so that I see only relevant demands.
- As a **PMO**, I want to download demand data as an Excel file for offline reporting.

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/demandScreen/getDemandInfo` | Yes | Fetch demand matrix by skill group and technology |
| POST | `/demandUpload/upload` | Yes | Bulk upload new demand data from Excel |
| POST | `/downloadExcel/exportExcelPMO` | Yes | Export demand data as PMO Excel report |

---

## 3. Request Contract

### `POST /demandScreen/getDemandInfo`
**Request Body:**
```json
{
  "localGrade": [
    { "demand_grade_id": 1 }
  ],
  "primaryLocation": [
    { "hybrid_location": "Mumbai" }
  ]
}
```

**Response Shape:**
```json
[
  {
    "data": {
      "type": "parent",
      "skill": "Java",
      "pastdue": 5,
      "bill_one": 3,
      "bill_two": 2,
      "bill_three": 1,
      "strategic": 4,
      "pursuit": 2,
      "total": 17
    },
    "children": [
      {
        "data": {
          "type": "child",
          "skill": "Spring Boot",
          "pastdue": 2,
          "bill_one": 1,
          "bill_two": 1,
          "bill_three": 0,
          "strategic": 1,
          "pursuit": 0,
          "total": 5
        }
      }
    ]
  }
]
```

---

## 4. Business Rules

### Demand Bucketing Logic
Demands are bucketed based on `role_start_date` relative to today and `demand_type_category`:

| Bucket Key | Condition |
|-----------|-----------|
| `pastdue` | `role_start_date` is before today (Billable, Strategic, or Pursuit) |
| `bill_one` | Billable demand due in < 15 days |
| `bill_two` | Billable demand due in 15–29 days |
| `bill_three` | Billable demand due in ≥ 30 days |
| `strategic` | Demand type = `Strategic` |
| `pursuit` | Demand type = `Pursuit` |
| `total` | Sum of all open/offered demands |

### Demand Status Filter
Only demands with `demand_status_type` of `"Open"` or `"Offered"` are counted.

### Demand Data Source
- Always uses the **most recent demand batch** (`demand_batch` — sorted by upload date DESC, LIMIT 1)
- Demands are filtered by: selected grades, selected primary locations
- Filtered via `demand_location_master.primary_location`

### Hierarchy
- **Parent level**: Skill Group (e.g., "Java Technologies")
- **Child level**: Individual Technology (e.g., "Spring Boot", "Hibernate")
- A `totalMap` (Grand Total row) aggregates all groups

---

## 5. Demand Upload

### `POST /demandUpload/upload`
- Accepts multipart Excel file
- Expected sheet name: `"Open-Demand"` (configured in `config.demandSheet`)
- Excel columns mapped to `demand_data` table fields:
  - team_request_id, source, client, job_name, position_name, team_request_name
  - role_notes, role_type, backfill_reason, outgoing_employee
  - role_start_date, delivery_role, delivery_skills
  - client_reference, expected_daily_rate, practice, sub_sector
  - open_close_demand_status, demand_type (Billable / Strategic / Pursuit)
- Each upload creates a new `demand_batch` record; old batch data is superseded
- Upload errors are logged and returned to the caller

---

## 6. Demand Data Model (key fields)

| Field | Type | Description |
|-------|------|-------------|
| team_request_id | STRING (PK) | Unique demand identifier |
| client | STRING | Client/account name |
| job_name | STRING | Job title |
| position_name | STRING | Position name |
| team_request_name | STRING | Request name |
| role_start_date | STRING | Expected start date |
| role_notes | STRING(5000) | Notes about the role |
| delivery_role | STRING(5000) | Role description |
| delivery_skills | STRING(5000) | Required skills |
| demand_type | STRING | Billable / Strategic / Pursuit |
| open_close_demand_status | STRING | Open / Closed / Offered |
| demand_batch_id | BIGINT (FK) | Links to batch upload record |

---

## 7. Filter Dropdowns (supporting endpoints)

| Endpoint | Purpose |
|----------|---------|
| `GET /supplyVSdemandVSbench/fetchAllPrimaryLocation` | Location filter values |
| `GET /supplyVSdemandVSbench/fetchGradeStatus` | Grade filter values |

---

## 8. Error Handling

| Scenario | Response |
|----------|----------|
| No demands in current batch | Empty array `[]` |
| DB error | `{ error: true, Message: <error> }` |
| Empty uploaded Excel | `{ error: true, Message: "Uploaded Excel file is empty." }` |
