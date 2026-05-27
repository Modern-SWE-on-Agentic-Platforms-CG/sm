# SmartHire — Admin & Master Data Management

## Module Purpose
Provides CRUD operations for all master data that drives the recruitment system. Admins can manage technologies (skills), towers, skill groups, sources, vendors, BU accounts, demand types, role comments, feedback templates, and SAP capabilities. All master data changes affect dropdowns and filters across the entire application.

---

## 1. User Stories

- As an **Admin**, I want to add new technology/skill entries so that new skills appear in candidate profiles and demand screens.
- As an **Admin**, I want to add towers and map them to practices so that organizational structure is current.
- As an **Admin**, I want to add skill groups and map technologies to towers so that the hierarchy is maintained.
- As an **Admin**, I want to add sources and vendors and map them together so that candidate sourcing is tracked.
- As an **Admin**, I want to delete skills or vendors (soft-delete) so that outdated entries are hidden without data loss.
- As an **Admin**, I want to manage BU account mappings so that candidates can be linked to the correct business unit.
- As an **Admin**, I want to add role comments mapped to skills so that interviewers get role-specific guidance.
- As an **Admin**, I want to manage feedback form templates per technology so that interviewers use the correct form.

---

## 2. API Endpoints

### Technology (Skill) Management
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/admin/fetchAllSkill` | Yes | Fetch all technologies |
| POST | `/admin/fetchAllSkillGroup` | Yes | Fetch all skill groups |
| POST | `/admin/fetchAllSkillPractice` | Yes | Fetch all practices |
| POST | `/admin/fetchSkillBasedOnSkillGrpTower` | Yes | Fetch skills filtered by skill group and tower |
| POST | `/admin/addSkillWithMapping` | Yes | Add skill and map to tower |
| POST | `/admin/deleteSkillWithMapping` | Yes | Soft-delete skill and mapping |
| POST | `/admin/addSkillGroup` | Yes | Add new skill group |
| POST | `/admin/fetchSkillByTemplate` | Yes | Fetch skills associated with a feedback template |

### Tower Management
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/admin/fetchAllTowers` | Yes | Fetch all towers for a practice |
| POST | `/admin/addTower` | Yes | Add new tower |

### Source & Vendor Management
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET  | `/admin/fetchAllVendors` | Yes | Fetch all active vendors |
| POST | `/admin/fetchVendorsBasedOnSource` | Yes | Fetch vendors filtered by source |
| POST | `/admin/addVendorWithMapping` | Yes | Add vendor and map to source |
| POST | `/admin/deleteVendorWithMapping` | Yes | Soft-delete vendor and mapping |
| POST | `/admin/addSource` | Yes | Add new source channel |

### BU & Account Management
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET  | `/admin/fetchBuAccountMaster` | Yes | Fetch all BU account master records |
| POST | `/admin/addBUAccount` | Yes | Add new BU account mapping |
| GET  | `/admin/fetchAllmarketUnit` | Yes | Fetch all market units |
| GET  | `/admin/fetchAllEmpName` | Yes | Fetch all employee names/emails |

### Demand Type Management
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET  | `/admin/fetchTypeMaster` | Yes | Fetch all demand types |
| POST | `/admin/addTypeMaster` | Yes | Add new demand type |

### Role Comment Management
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/admin/addRoleComment` | Yes | Add role comment mapped to skill |
| POST | `/admin/fetchRoleCommentBasedOnSkill` | Yes | Fetch role comments for a skill |
| POST | `/admin/deleteRoleCommentWithMapping` | Yes | Delete role comment mapping |

### SAP Capability Management
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/sap_capability/fetchAllSapCapability` | Yes | Fetch all SAP capabilities |
| POST | `/sap_capability/fetchAllSapSkill` | Yes | Fetch all SAP skills |
| POST | `/sap_capability/fetchSkillsByCapability` | Yes | Fetch SAP skills by capability |

---

## 3. Business Rules

### Skill (Technology) Add Rule
- Check for duplicate: `technology_name` must not already exist for the same tower/skill group
- If duplicate: return `{ error: true, Message: "TECHNOLOGY ALREADY EXISTS!" }`
- If blank name: return `{ error: true, Message: "ANY SKILL FIELD CANNOT BE EMPTY" }`
- On success: creates `technology_master` record + `tower_skill_mapping` record
- Response: `{ error: false, Message: "TECHNOLOGY ADDED SUCCESSFULLY!" }`

### Skill Delete Rule
- Soft delete: sets `active_flag = false`
- Check that the skill is not already deleted
- If already deleted: `{ error: true, Message: "TECHNOLOGY ALREADY DELETED" }`
- If blank: `{ error: false, Message: "CANNOT DELETE EMPTY TECHNOLOGY" }`
- On success: `{ error: false, Message: "TECHNOLOGY DELETED SUCCESSFULLY" }`

### Tower Add Rule
- Validates that `towerName` and `practice_id` are both provided
- Checks for duplicate tower per practice
- On success: creates `tower_master` record AND a default `tower_approver_master` entry with `approver_role_master_id = 4` and `dl_title = 'Tower Lead DL'`

### Vendor Add Rule
- Validates non-empty vendor fields
- Checks for duplicate vendor name
- On success: creates `vendor_master` record + `source_vendor_mapping`
- If duplicate: `{ error: true, Message: "VENDOR ALREADY EXISTS!" }`

### Source Add Rule
- Validates non-empty source name
- Checks for duplicate source name
- On success: creates `source_master` record
- If duplicate: `{ error: true, Message: "SOURCE ALREADY EXISTS!" }`

### Skill Group Add Rule
- Validates non-empty name
- Checks for duplicate
- On success: creates `skill_group_master` record
- If duplicate: `{ error: true, Message: "SKILLGROUP ALREADY EXISTS!" }`

---

## 4. Master Data Hierarchy

```
practice_master
  └── tower_master (multiple towers per practice)
        └── tower_skill_mapping
              └── technology_master (skills)
                    └── skill_group_master (groups skills)

source_master
  └── source_vendor_mapping
        └── vendor_master

bu_master
  └── demand_buaccount_master (BU ↔ account)
  └── bench_buAccount_master

market_unit
  └── employee_master (employee belongs to MU)

role_master → employee_role (employee ↔ role)

feedback_template → technology_template (template ↔ technology)
role_comment_master → (comment ↔ skill mapping)
```

---

## 5. Master Table List

| Table | Purpose |
|-------|---------|
| `technology_master` | All skills / technologies |
| `tower_master` | Organizational towers |
| `skill_group_master` | Skill group categories |
| `tower_skill_mapping` | Tower ↔ technology mapping |
| `source_master` | Sourcing channels |
| `vendor_master` | Recruitment vendors |
| `source_vendor_mapping` | Source ↔ vendor mapping |
| `demand_type_master` | Demand categories (Billable, Strategic, Pursuit) |
| `demand_buaccount_master` | BU ↔ account for demand |
| `bu_master` | Business units |
| `market_unit` | Market units |
| `practice_master` | Practice areas |
| `role_master` | User roles |
| `grade_master` | Employee grades |
| `status_master` | All recruitment statuses |
| `decline_reason_master` | Offer decline reasons |
| `rejection_reason_master` | Interview rejection reasons |
| `interview_type` | Interview types (L1, L2, L3) |
| `feedback_template` | Feedback form templates |
| `technology_template` | Technology ↔ feedback template |
| `sap_capability_master` | SAP capability list |
| `sap_skill_master` | SAP skills |
| `role_comment_master` | Role-specific interviewer guidance |
| `threshold_master` | Hiring budget thresholds |
| `joining_bonus_master` | JB amount options |
| `new_rating_master` | Rating scale for feedback |
| `new_candidate_roles` | Candidate role options for feedback |
| `communication_skill` | Communication skill rating options |
| `hybrid_location_master` | Location options |
| `demand_location_master` | Demand location mapping |
| `bench_location_master` | Bench location mapping |
| `bench_status_master` | Bench status options |
| `approver_role_master` | Approver role types |
| `jb_project_code_master` | Project codes for joining bonus |

---

## 6. Error Handling

| Scenario | Response |
|----------|----------|
| Empty field | `{ error: true, Message: "<field> CANNOT BE EMPTY" }` |
| Duplicate entry | `{ error: true, Message: "<entity> ALREADY EXISTS!" }` |
| Already deleted | `{ error: true, Message: "<entity> ALREADY DELETED" }` |
| DB error | `{ error: true, Message: <error_object> }` |
| Success | `{ error: false, Message: "<entity> <action> SUCCESSFULLY" }` |
