# Module: Lookup & Configuration

## Purpose

Two related concerns:
1. **Lookup**: Provides all reference/master data dropdowns used by the frontend — statuses, skills, grades, roles, market units, accounts, practices, technologies, rejection reasons, etc.
2. **Configuration**: Exposes runtime constants (from `constants.properties`) to clients.

---

## Lookup API Endpoints

Base path: `/lookup`

### 1. Fetch Generic Dropdown

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/fetchDropdown` |
| **Auth** | Required (JWT) |

**Query Parameter**: `screenId` (long)

**Purpose**: General-purpose dropdown retrieval keyed by screen/context ID. Returns lookup items relevant to a specific screen.

**Response**: List of `LookupDTO` `{ id, value, type }`.

---

### 2. Fetch Market Unit by BU

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/fetchMarketUnit` |
| **Auth** | Required (JWT) |

**Query Parameter**: `buId` (long)

**Response**: List of `MarketUnitDTO`.

---

### 3. Fetch Practices by BU

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/fetchPractices` |
| **Auth** | Required (JWT) |

**Query Parameter**: `buId` (long)

**Response**: List of `MarketUnitDTO`.

---

### 4. Fetch Accounts by Market Unit

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/lookup/fetchAccountsByMu` |
| **Auth** | Required (JWT) |

**Request Body**: `MuDTO` `{ muId: long }`

**Response**: List of `MarketUnitDTO`.

---

### 5. Fetch Skills

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/skills` |
| **Auth** | Required (JWT) |

**Response**: List of all active skills/technologies.

---

### 6. Fetch Rating

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/rating` |
| **Auth** | Required (JWT) |

**Response**: List of rating master options (from `RATING_MASTER`).

---

### 7. Fetch Feedback Options

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/feedback` |
| **Auth** | Required (JWT) |

**Response**: List of feedback status options (from `FEEDBACK_STATUS`).

---

### 8. Fetch Grades

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/grade` |
| **Auth** | Required (JWT) |

**Response**: List of grade options (from `GRADE_MASTER`).

---

### 9. Fetch Overall Feedback Options

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/overallFeedback` |
| **Auth** | Required (JWT) |

**Response**: List of overall feedback rating options.

---

### 10. Fetch Candidate Roles by Skill

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/lookup/candidateRoles` |
| **Auth** | Required (JWT) |

**Request Body**: JSON `{ "skill": "<skill name>" }`

**Response**: List of roles applicable to the given skill.

---

### 11. Fetch Joining Periods

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/joiningPeriod` |
| **Auth** | Required (JWT) |

**Response**: List of joining period options (e.g., Immediate, 30 days, 60 days).

---

### 12. Fetch Locations

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/locations` |
| **Auth** | Required (JWT) |

**Response**: List of office/work locations (from `LOCATION_MASTER`).

---

### 13. Get Feedback Template Name (by empId)

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/getTemplateName` |
| **Auth** | Required (JWT) |

**Query Parameters**: `technology` (String), `empId` (long)

**Response**: `ResponseDto` wrapping `FeedbackTemplateDTO`.

---

### 14. Get Roles by BU

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/getRoles` |
| **Auth** | Required (JWT) |

**Query Parameter**: `buId` (long)

**Response**: List of roles applicable to the BU.

---

### 15. Get Rejection Reasons

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/getRejectionReasons` |
| **Auth** | Required (JWT) |

**Response**: List of rejection reason master entries.

---

### 16. Get Decline Reasons

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/getDeclineReasons` |
| **Auth** | Required (JWT) |

**Response**: List of decline reason master entries.

---

### 17. Get Possible Role (Role Inference)

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/getPossibleRole` |
| **Auth** | Required (JWT) |

**Query Parameters**: `skill` (String), `totalExp` (double), `buName` (String)

**Purpose**: Infer possible hiring roles for a candidate based on skill, total experience, and BU.

**Response**: List of role strings.

---

### 18. Get Application Version

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/lookup/getVersion` |
| **Auth** | Required (JWT) |

**Response**: `"Smart Recruit Verion 1.3"` (version string)

---

### 19. Get Feedback Template Name (by CandidateDataDTO)

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/lookup/getTemplateName1` |
| **Auth** | Required (JWT) |

**Request Body**: `CandidateDataDTO` (uses `skill` and `practiceId`)

**Response**: `ResponseDto` wrapping `FeedbackTemplateDTO`.

---

## Configuration API Endpoints

Base path: `/configuration`

### 1. Get All Configuration Constants

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/configuration/constants` |
| **Auth** | Required (JWT) |

**Purpose**: Returns all key-value pairs from `constants.properties` as a map.

Current `constants.properties` values:

| Key | Value |
|---|---|
| `slotDuration` | `1` (hours) |
| `fromTime` | `8 AM` |
| `toTime` | `8 PM` |
| `locale` | `IST` |

**Response**:
```json
{
  "response": [{ "slotDuration": "1", "fromTime": "8 AM", ... }]
}
```

---

## Master Data Tables Referenced

| Table | Entity | Purpose |
|---|---|---|
| `LOOKUP_MASTER` | `LookupMasterEntity` | Generic screen-specific dropdowns |
| `BU_MASTER` | `BUMasterEntity` | Business units |
| `PRACTICE_MASTER` | `PracticeMasterEntity` | Practice areas |
| `MARKET_UNIT` | `MarketUnitEntity` | Market units |
| `ACCOUNT_MASTER` | `AccountMasterEntity` | Client accounts |
| `TECHNOLOGY_MASTER` | `TechnologyMasterEntity` | Technology/skill master |
| `GRADE_MASTER` | `GradeMasterEntity` | Employee grades |
| `ROLE_MASTER` | `RoleMasterEntity` | Hiring roles |
| `RATING_MASTER` | `RatingMasterEntity` | Rating options |
| `FEEDBACK_STATUS` | `FeedbackStatusEntity` | Feedback status codes |
| `LOCATION_MASTER` | `LocationMasterEntity` | Office locations |
| `JOINING_PERIOD_MASTER` | `JoiningPeriodMasterEntity` | Notice period / joining periods |
| `REJECTION_REASON_MASTER` | `RejectionReasonMasterEntity` | Rejection reasons |
| `DECLINE_REASON_MASTER` | `DeclineReasonMasterEntity` | Decline reasons |
| `FEEDBACK_TEMPLATE` | `FeedbackTemplateEntity` | Feedback form templates |
| `OVERALL_FEEDBACK` | `OverallFeedbackEntity` | Overall feedback ratings |

---

## Service Dependencies

| Service | Notes |
|---|---|
| `LookupService` / `LookupServiceImpl` | All lookup data retrieval |
| `ConfigurationService` / `ConfigurationServiceImpl` | Constants and property access |
| `RecruiterServiceImpl` | Role inference logic |

---

## MarketUnitDTO (Generic Lookup Response Shape)

Used by many lookup endpoints for their response shape:

| Field | Type | Description |
|---|---|---|
| `id` | long | Record ID |
| `name` | String | Display name |

---

## LookupDTO

| Field | Type | Description |
|---|---|---|
| `id` | long | Lookup entry ID |
| `value` | String | Display value |
| `type` | String | Category / type identifier |
