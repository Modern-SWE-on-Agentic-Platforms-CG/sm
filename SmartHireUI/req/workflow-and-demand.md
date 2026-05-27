# SmartHire UI - Workflow and Demand Specification

## Module: Workflow (`/work-flow`)

### Purpose

Approval queue interface for leads to review, approve, or reject candidates at specific pipeline stages. The workflow enforces a multi-step approval chain before a candidate can proceed to the next hiring stage.

### Roles with Workflow Access

Tower Lead, SL-BU Lead, NA Lead, Recruiter Lead

### Data Displayed

Candidate name, skill, current status, submitted by, submitted date, recommended action, comment

### Actions

| Action | Behavior |
|---|---|
| Approve | POST approval → move candidate to next stage |
| Reject | POST rejection → candidate moved to rejected status |
| Hold | POST hold → candidate flagged for later review |
| Add Comment | POST comment → saved with timestamp and user |

### Workflow Stages (Multi-step Approval Chain)

1. **Tower Lead Approval** — first review gate
2. **SL-BU Lead Approval** — secondary review
3. **NA Lead Approval** — North America specific lead sign-off
4. **Recruiter Lead Approval** — final recruiter-side gate

### Business Rules

1. A lead can only approve/reject candidates submitted to their specific approval role
2. Once rejected, a candidate cannot be re-submitted without Recruiter action
3. Hold status freezes the candidate in the current approval step
4. Comments are mandatory when rejecting
5. Leads see only their own approval queue (role-filtered at API level)

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `FETCHFLOWCANDIDATES` | Fetch candidates in workflow |
| POST | `workFlow/approveCandidates` | Approve candidate |
| POST | `workFlow/rejectCandidates` | Reject candidate |
| POST | `workFlow/holdCandidates` | Hold candidate |
| POST | `candidateInfo/addComments` | Add comment |

---

## Module: Workflow Info (`/work-flow-info`)

### Purpose

Detailed view of a single candidate's approval chain history — shows each step, approver, timestamp, and decision.

### Data Displayed

Stage, approver name, decision (Approved/Rejected/Hold/Pending), timestamp, comments

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `workFlow/fetchCandidateWorkflowHistory?id={id}` | Fetch full approval chain |

---

## Module: Demand / Supply (`/demand-supply`)

### Purpose

Tracks open hiring demands vs available supply of candidates per BU, practice, and skill.

### Data Displayed

| Column | Description |
|---|---|
| BU | Business unit |
| Practice / Tower | Practice or Tower name |
| Skill | Required skill |
| Open Demand | Count of open demand entries |
| Candidates in Pipeline | Count of active candidates matching |
| Gap | Demand minus supply |

### Filters

BU, Practice, Skill, Date range

### Actions

- **Upload Demand** — Upload Excel file with demand data
- **Download Template** — Download demand upload template (S3 URL from `env.DEMAND_TEMPLATE`)
- **Export** — Export current view to Excel

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `demand/fetchDemandSupply` | Fetch demand vs supply data |
| POST | `demand/uploadDemand` | Upload demand Excel |
| GET | `demand/downloadDemandTemplate` | Download demand template |
| GET | `demand/downloadDemandExcel` | Export to Excel |

---

## Module: JB Candidates (`/jbcandidates`)

### Purpose

Tracks candidates eligible for or who have received a Joining Bonus (JB).

### Data Displayed

Candidate name, skill, offer date, joining date, joining bonus amount, JB status

### Filters

Date range, BU, JB status

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `FETCHJBCANDIDATES` | Fetch JB candidate list |

---

## Module: Joining Bonus (`/joiningbonus`)

### Purpose

Manage joining bonus configuration: which roles/grades are eligible, the bonus amount, and approval workflow for bonus disbursement.

### Data Displayed

Grade, role, eligible BU, bonus amount, approval status

### Actions

- Add/edit JB config rows
- Approve pending bonus disbursements

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `joiningBonus/fetchJBConfig` | Fetch JB eligibility config |
| POST | `joiningBonus/saveJBConfig` | Save JB config |
| POST | `joiningBonus/approveJB` | Approve bonus disbursement |

---

## Module: Update Skill (`/update-skill`)

### Purpose

Allows an employee to update their registered skills profile, which affects what interview slots they are offered.

### Form Fields

- Skill (multi-select from available skill list)
- Experience Level (dropdown: Junior / Mid / Senior)
- Is Primary (toggle per skill)

### Business Rules

1. At least one primary skill must be selected
2. Skills removed here will immediately affect available interview bookings
3. Changes take effect for future interview slot assignments only

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `getTechForEmployee(email)` | Load current employee skills |
| GET | `FETCHALLSKILLS` | Load all available skills |
| POST | `panel/updateEmployeeSkills` | Save updated skills |
