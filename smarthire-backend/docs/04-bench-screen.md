# SmartHire — Bench Screen

## Module Purpose
Displays a matrix of bench employees (available or soon-to-be-available resources) categorized by skill group and technology. Buckets employees by aging duration (how long they have been on bench). Supports filtering by grade, hybrid location, and bench status.

---

## 1. User Stories

- As a **Recruiter / Resource Manager**, I want to see all bench employees grouped by skill so that I can match them to open demands.
- As a **Recruiter**, I want to filter bench employees by grade, location, and bench status so that I see only relevant available resources.
- As a **PMO**, I want to download bench data as an Excel file for offline analysis.

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/benchScreen/getBenchInfo` | Yes | Fetch bench matrix by skill group and technology |
| POST | `/benchUpload/upload` | Yes | Bulk upload bench data from Excel |

---

## 3. Request Contract

### `POST /benchScreen/getBenchInfo`
**Request Body:**
```json
{
  "localGrade": [
    { "demand_grade": "B3" }
  ],
  "hybridLocation": [
    { "hybrid_location": "Mumbai" }
  ],
  "currentStatus": [
    { "bench_status": "Available" }
  ]
}
```

**Response Shape:**
```json
[
  {
    "data": {
      "type": "parent",
      "skill": "Java Technologies",
      "0 - 29 Days": 4,
      "30 - 59 Days": 2,
      "60 - 89 Days": 1,
      "90 - 119 Days": 0,
      "120 - 149 Days": 0,
      "> 150 Days": 0,
      "Grand Total": 7
    },
    "children": [
      {
        "data": {
          "type": "child",
          "skill": "Java",
          "0 - 29 Days": 2,
          "30 - 59 Days": 1,
          "Grand Total": 3
        }
      }
    ]
  }
]
```

---

## 4. Business Rules

### Aging Buckets
Bench employees are bucketed by `available_ageing` (days on bench):

| Bucket Label | Condition |
|-------------|-----------|
| `0 - 29 Days` | Aging 0–29 days |
| `30 - 59 Days` | Aging 30–59 days |
| `60 - 89 Days` | Aging 60–89 days |
| `90 - 119 Days` | Aging 90–119 days |
| `120 - 149 Days` | Aging 120–149 days |
| `> 150 Days` | Aging 150+ days |
| `Grand Total` | All bench records |

### Data Source
- Always uses the **most recent bench batch** (`bench_batch` — sorted by upload date DESC, LIMIT 1)
- Employees with `bench_status_type = 'Closed'` are excluded
- Only `practice_id = 1` records are included (configurable in fresh implementation)
- Location filtering via `demand_location_master.primary_location`

### Hierarchy
- **Parent**: Skill Group name (from `skill_group_master`)
- **Child**: Individual technology name (matched via `tower_skill_mapping` → `technology_master`)
- A **Grand Total** row aggregates across all skill groups

---

## 5. Bench Upload

### `POST /benchUpload/upload`
- Accepts multipart Excel file
- Expected sheet name: `"Sheet1"` (configured in `config.benchSheet`)
- Excel columns mapped to `bench_data` table:
  - employee_id, employee_name, local_grade, practice, global_practice
  - resource_production_unit, resource_production_unit_name
  - current_status, available_date, joining_date
  - staffing_comments, key_skills, previous_accounts, hybrid_location
  - skill (primary skill name), available_ageing
  - bench_status (mapped to `bench_status_master`)
- Each upload creates a new `bench_batch` record; previous batch data is superseded
- Upload mismatches in technology name (against `technology_master`) result in row-level errors

---

## 6. Bench Data Model (key fields)

| Field | Type | Description |
|-------|------|-------------|
| employee_id | BIGINT (PK) | Employee identifier |
| employee_name | STRING | Full name |
| local_grade | STRING | Employee grade (e.g., B3, C1) |
| practice | STRING | Practice area |
| global_practice | STRING | Global practice grouping |
| current_status | STRING | Current availability status |
| available_date | STRING | Date available from bench |
| joining_date | STRING | Date originally joined |
| staffing_comments | STRING(5000) | Staffing notes |
| key_skills | STRING(1000) | Skills summary |
| previous_accounts | STRING | Prior accounts worked on |
| hybrid_location | STRING | Current location (hybrid/onsite) |
| skill | STRING | Primary technology skill |
| available_ageing | STRING / INT | Days on bench |
| bench_status_id | BIGINT (FK) | Links to `bench_status_master` |
| bench_batch_id | BIGINT (FK) | Links to batch upload record |

---

## 7. Filter Dropdowns (supporting endpoints)

| Endpoint | Purpose |
|----------|---------|
| `GET /supplyVSdemandVSbench/fetchAllHybridLocation` | Hybrid location filter values |
| `GET /supplyVSdemandVSbench/fetchBenchStatus` | Bench status filter values |
| `GET /supplyVSdemandVSbench/fetchGradeStatus` | Grade filter values |

---

## 8. Error Handling

| Scenario | Response |
|----------|----------|
| No bench data found | Empty array `[]` |
| DB error | `{ error: true, Message: <error> }` |
| Employee skill not in technology master | Row skipped / error logged |
| Empty uploaded Excel | `{ error: true, Message: "Uploaded Excel file is empty." }` |
