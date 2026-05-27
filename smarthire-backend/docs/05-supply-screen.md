# SmartHire — Supply Screen

## Module Purpose
Aggregates recruitment pipeline data ("supply") by candidate recruitment status, technology, and skill group. Provides a matrix view showing how many candidates are at each recruitment stage for each skill, filtered by source channel and date range. Also includes a Source-Vendor trend chart.

---

## 1. User Stories

- As a **Recruiter / PMO**, I want to see the current supply of candidates grouped by skill and status so that I can track pipeline health.
- As a **Recruiter**, I want to filter supply by source channel and date range so that I can measure sourcing effectiveness.
- As a **PMO**, I want to view a trend chart of candidates by source and vendor over time so that I can evaluate vendor performance.
- As a **PMO**, I want to export trend chart data to Excel for reporting.

---

## 2. API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/supplyScreen/getSupplyInfo` | Yes | Fetch supply matrix by skill group/technology and status |
| POST | `/supplyScreen/getSourceVendorTrendInfo` | Yes | Fetch source/vendor trend chart data |
| POST | `/supplyScreen/getTrendChartExcelInfo` | Yes | Export trend chart data to Excel |
| POST | `/sourceVendorInfoScreen/getSourceInfo` | Yes | Fetch source-level aggregated info |

---

## 3. Request Contract

### `POST /supplyScreen/getSupplyInfo`
**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "sourceIds": "1,2,3"
}
```

**Response Shape:**
Returns a hierarchical tree with parent (skill group) and child (technology) nodes, each with status-based counts:
```json
[
  {
    "data": {
      "type": "parent",
      "skill": "Java Technologies",
      "PreScreen Select": 10,
      "L1 Scheduled": 5,
      "L2 Select": 3,
      "Joined": 1,
      "total": 19
    },
    "children": [
      {
        "data": {
          "type": "child",
          "skill": "Java",
          "PreScreen Select": 5,
          "Joined": 1
        }
      }
    ]
  }
]
```

---

## 4. Business Rules

### Status Categories
The supply screen uses ALL statuses from `status_master`. Three statuses (IDs 18, 49, 50 — representing `Offer in system`, `Offer-Accept`, `Offer_Released`) use a **DOJ-based date range** instead of `recvd_date`:
- For those statuses: filter by `date_of_joining` between `startDate` and `startDate + 4 months`
- For all other statuses: filter by `recvd_date` between `startDate` and `endDate`

### Data Source Filter
- `sourceIds` is a comma-separated list of source IDs
- Filters via `candidate_vendor_detail.source_id`

### Practice Filter
- Only `practice_id = 1` candidates are included (configurable in fresh implementation)
- Only technologies with `active_flag = true` are counted

### Hierarchy
- **Parent**: Skill Group (from `skill_group_master`)
- **Child**: Individual technology (via `tower_skill_mapping` → `technology_master`)
- Each node has one count per status type

---

## 5. Source-Vendor Trend Chart

### `POST /supplyScreen/getSourceVendorTrendInfo`
**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-06-30",
  "sourceIds": "1,2,3",
  "practice_id": 1
}
```

**Response**: Aggregated candidate counts grouped by source and vendor over time (monthly trend).

### `POST /supplyScreen/getTrendChartExcelInfo`
Same body as above — returns Excel binary/stream for download.

---

## 6. Source Info Screen

### `POST /sourceVendorInfoScreen/getSourceInfo`
Returns counts of candidates grouped by source channel with inner breakdown by vendor and candidate status.

---

## 7. Filter Dropdowns

| Endpoint | Purpose |
|----------|---------|
| `GET /excel/fetchAllSources` | Fetch all active source channels |
| `POST /admin/fetchVendorsBasedOnSource` | Fetch vendors for selected source |

---

## 8. Error Handling

| Scenario | Response |
|----------|----------|
| No supply data found | Empty hierarchical structure with zero counts |
| DB error | `{ error: true, Message: <error> }` |
| Invalid date range | Empty result set |
