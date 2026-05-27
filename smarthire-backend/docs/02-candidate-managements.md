# Module: Candidate Management

## Purpose

Manages candidate data entry and retrieval within the recruitment pipeline. Supports creating new candidate records, fetching existing candidate profiles, saving skill-based distribution list (DL) mappings, and creating new entries with previously unseen skills.

---

## API Endpoints

Base path: `/candidateData`

### 1. Save Candidate Data

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/candidateData/saveCandidateData` |
| **Auth** | Required (JWT) |

**Request Body**: `CandidateDataDTO`

| Field | Type | Description |
|---|---|---|
| `candidateName` | String | Full name of the candidate |
| `candidateEmailID` | String | Candidate email address |
| `totalExp` | String | Total years of experience |
| `relExp` | String | Relevant years of experience |
| `gender` | String | Gender |
| `skill` | String | Primary skill / technology |
| `fromTime` | Date | Interview start time |
| `toTime` | Date | Interview end time |
| `contactNumber` | String | Phone number |
| `pmoCoordinator` | String | PMO coordinator name |
| `panelEmailID` | String | Panel member email |
| `pmoCoordinatorEmailId` | String | PMO coordinator email |
| `interviewType` | String | Type of interview (e.g., L1, L2) |
| `revisitFlag` | boolean | Whether this is a revisit |
| `isReferral` | boolean | Whether candidate came via referral |
| `isRehire` | boolean | Whether candidate is a rehire |
| `previousInterviewsInfo` | List\<PreviousInterviewInfoDTO\> | Past interview history |
| `practiceId` | long | Practice/competency area ID |
| `buId` | long | Business Unit ID |
| `meetingLink` | String | Virtual meeting link (Teams) |
| `role` | String | Role being hired for |
| `inventFlag` | boolean | Invent-specific flag |
| `createdBy` | String | Logged-in user email |
| `source` | String | Candidate source (e.g., Naukri, LinkedIn) |
| `referredVendor` | String | Vendor name if referred |
| `capability` | String | Capability area |
| `currentCompany` | String | Current employer |
| `accountName` | String | Client account name |
| `region` | String | Geographic region |

**Success Response**:
```json
{
  "response": [true],
  "message": "CANDIDATE DATA SAVED SUCCESSFULLY"
}
```

**Failure Response**:
```json
{
  "exception": "<error message>"
}
```

---

### 2. Get Candidate Data

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/candidateData/getCandidateData` |
| **Auth** | Required (JWT) |

**Request Body**: `CheckCandidateDTO`

| Field | Type | Description |
|---|---|---|
| (fields inferred from usage) | | Candidate lookup criteria (e.g., email, candidateId) |

**Success Response**:
```json
{
  "response": [<CandidateDataDTO>],
  "message": "CANDIDATE FOUND..."
}
```

**Failure Response**:
```json
{
  "exception": "<error message>"
}
```

---

### 3. Save Skill DL Mapping

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/candidateData/saveSkillDL` |
| **Auth** | Required (JWT) |

**Request Body**: JSON object containing skill-to-distribution-list mapping information.

**Purpose**: Maps a skill group to an email distribution list for routing notifications and alerts.

**Success Response**:
```json
{
  "response": ["<success message>"],
  "message": "<success message>"
}
```

---

### 4. Create New Entry with New Skill

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/candidateData/createNewEntry` |
| **Auth** | Required (JWT) |

**Request Body**: `CheckCandidateDTO`

**Purpose**: Creates a new interview entry for a candidate who is being interviewed with a skill not previously recorded in their profile.

**Success Response**:
```json
{
  "response": [<InterviewTypeDTO>],
  "message": "CANDIDATE DATA SAVED SUCCESSFULLY WITH NEW SKILL"
}
```

---

## Business Rules

- A candidate can have multiple interview records (identified by skill).
- The `revisitFlag` indicates a repeat interview for the same candidate.
- Referral candidates (`isReferral = true`) are tracked separately.
- Rehire candidates (`isRehire = true`) are tracked separately.
- `createdBy` captures the recruiter who originated the record.
- `source` tracks acquisition channel for pipeline analytics.
- `practiceId` links the candidate to an organisational practice/competency.

---

## Service Dependencies

| Service | Purpose |
|---|---|
| `CandidateDataService` / `CandidateDataServiceimpl` | All business logic for this module |

## Repository Dependencies

| Repository | Table | Purpose |
|---|---|---|
| `CandidateDetailsRepository` | `CANDIDATE_DETAIL` | Primary candidate record |
| `CandidateInfoDetailsRepository` | `CANDIDATE_INFO_DETAIL` | Financial & offer details |
| `CandidateSkillRepository` | `CANDIDATE_SKILL` | Skill associations |
| `CandidateStatusRepository` | `CANDIDATE_STATUS` | Status history |
| `SkillDLMappingRepository` | `SKILL_DL_MAPPING` | Skill → DL mappings |

---

## Error States

| Condition | Handling |
|---|---|
| Service throws exception | `exception` field populated in response; `response` field absent |
| Candidate not found | Exception thrown by service layer, returned in `exception` field |
| Parse error on date fields | `ParseException` propagated and returned in `exception` field |
