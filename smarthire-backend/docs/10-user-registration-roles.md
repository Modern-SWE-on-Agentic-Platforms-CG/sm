# Module: User Registration & Roles

## Purpose

Three related controllers handle user/employee lifecycle:
1. **Registration** — onboard new users, update user details, remove skills
2. **Role** — retrieve roles assigned to an employee
3. **User Management** — query users, assign/update roles

---

## Registration API Endpoints

Base path: `/register`

### 1. Register New User

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/register/registerNewUser` |
| **Auth** | Required (JWT) |

**Request Body**: `UserRegisterDTO`

| Field | Type | Description |
|---|---|---|
| empId | long | Employee ID (from HRMS) |
| empName | String | Full name |
| emailId | String | Work email |
| location | String | Office location |
| gradeId | long | Grade master ID |
| buId | long | Business Unit ID |
| practiceId | long | Practice ID |
| roles | List\<String\> | Role names to assign |
| technologies | List\<String\> | Technology/skill IDs |
| accountIds | List\<long\> | Account associations |
| towerIds | List\<long\> | Tower associations |
| supervisorId | long | Supervisor employee ID |
| l2Check | boolean | L2 interview eligibility flag |
| showReports | boolean | Can view reports |
| inventFlag | boolean | Invent business unit flag |
| (other fields) | | |

**Flow**:
1. Check if employee already exists in `EMPLOYEE_MASTER` by `empId`.
2. If new: create `EmployeeMasterEntity`, link grade, BU, practice.
3. Persist role assignments to `EMPLOYEE_ROLE_DETAILS`.
4. Persist technology associations to `EMPLOYEE_TECHNOLOGY_DETAILS`.
5. Persist account associations to `EMPLOYEE_ACCOUNT_DETAILS`.
6. For tower leads: create `TowerApproverMasterEntity` entry.
7. For recruiters with skill mapping: create `RecruiterSkillMappingEntity`.
8. Send welcome email with sign-up document and user manual links.

**Success Response**:
```json
{
  "message": "<success message>"
}
```

---

### 2. Update User Details

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/register/updateUserDetails` |
| **Auth** | Required (JWT) |

**Request Body**: `UserRegisterDTO`

**Purpose**: Update existing user attributes (grade, BU, skills, roles, accounts, supervisor).

**Response**:
```json
{
  "message": "<update result message>"
}
```

---

### 3. Remove Skill

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/register/removeSkill` |
| **Auth** | Required (JWT) |

**Request Body**: `RemoveSkillDTO`

| Field | Type | Description |
|---|---|---|
| empId | long | Employee to update |
| technologyId | long | Technology to remove |

**Purpose**: Remove a specific technology/skill association from an employee profile.

**Response**:
```json
{
  "message": "<remove result message>"
}
```

---

## Role API Endpoints

Base path: `/role`

### 1. Get Role by Email

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/role/getRole` |
| **Auth** | Required (JWT) |

**Request Body**: `EmailDto` `{ email: String }`

**Response**: List of role name strings for the given employee email.

---

### 2. Get Role by Email + Password

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/role/getEmployeeRole` |
| **Auth** | Required (JWT) |

**Request Body**: `EmailDto` `{ email: String, password: String }`

**Purpose**: Authenticate employee locally (legacy path — pre-Keycloak) and return their roles.

**Response**: List of role name strings.

> **Note**: Local password-based authentication is a legacy pattern. Keycloak is the primary IdP. This endpoint may be used for fallback or administrative purposes.

---

## User Management API Endpoints

Base path: `/users`

### 1. Get All Users

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/users/getUsers` |
| **Auth** | Required (JWT) |

**Request Body**: JSON object with filter criteria (role, BU, etc.)

**Response**: List of `UserDataDTO`

| Field | Type | Description |
|---|---|---|
| empId | long | Employee ID |
| empName | String | Name |
| emailId | String | Email |
| roles | List\<String\> | Assigned roles |
| technologies | List\<String\> | Skills |
| location | String | Location |
| (other fields) | | |

---

### 2. Update Assigned Role

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/users/updateAssignedRole` |
| **Auth** | Required (JWT) |

**Request Body**: JSON object `{ empId: long, role: String, ... }`

**Purpose**: Assign or update role for a user.

**Success Response**:
```json
{
  "response": [<result>],
  "message": "Role Assigned Successfully!"
}
```

---

## Employee Data Model

See [17-data-models.md](17-data-models.md) — `EmployeeMasterEntity`.

Key tables involved:

| Table | Entity | Description |
|---|---|---|
| `EMPLOYEE_MASTER` | `EmployeeMasterEntity` | Core employee record |
| `EMPLOYEE_ROLE_DETAILS` | `EmployeeRoleDetailsEntity` | Role assignments |
| `EMPLOYEE_TECHNOLOGY_DETAILS` | `EmployeeTechnologyDetailsEntity` | Skill/technology associations |
| `EMPLOYEE_ACCOUNT_DETAILS` | `EmployeeAccountDetails` | Account associations |
| `RECRUITER_SKILL_MAPPING` | `RecruiterSkillMappingEntity` | Recruiter-to-skill mappings |
| `TOWER_APPROVER_MASTER` | `TowerApproverMasterEntity` | Tower approver list |

---

## Business Rules

### Registration

- Employee ID (`empId`) must be unique in `EMPLOYEE_MASTER`.
- `IS_NEW_USER` flag is set on first registration and cleared on first login (managed externally).
- An email is sent on registration containing:
  - Sign-up document link (AWS S3)
  - User manual link (AWS S3)
  - Administrator email CC'd
- Role `Tower Lead` triggers creation of a `TowerApproverMasterEntity` entry.
- The `INVENT` and `SAP` flags follow special business unit logic.
- `L2_CHECK` flag on `EMPLOYEE_MASTER` controls whether the interviewer is eligible for L2 interviews.
- `SHOW_REPORTS` flag on `EMPLOYEE_MASTER` controls report access.
- `ASSIGNED_ROLE` flag on `EMPLOYEE_MASTER` indicates if a custom role was manually assigned.

### Roles

- A user can have multiple roles simultaneously.
- Roles drive UI access and functional permissions.
- Role list: `interviewer`, `lead`, `RECRUITER`, `Tower Lead`, `INVENT`, `SAP`.

---

## Service Dependencies

| Service | Notes |
|---|---|
| `RegistrationService` / `RegistrationServiceImpl` | User creation and update |
| `RoleService` / `RoleServiceImpl` | Role retrieval |
| `GetUserService` / `GetUserServiceImpl` | User query and role assignment |
| `EmailServiceImpl` | Welcome email on registration |

---

## Email on Registration

- **To**: Registered user's email
- **CC**: Administrator email (`administrator` property)
- **Attachments**: Sign-up document PDF + User manual PDF (fetched from S3)

---

## Error States

| Condition | Handling |
|---|---|
| Duplicate employee ID | Exception returned in `exception` field |
| Grade/BU/Practice not found | `SmarthireException` thrown |
| Email send failure | Logged; registration may still succeed |
