# SmartHire — Authentication & Authorization

## Module Purpose
Protects all API endpoints with JWT-based stateless authentication. A secondary role-based authorization middleware restricts certain endpoints (e.g., recruiter calendar) to users with recognized recruiter roles.

---

## 1. Authentication

### Mechanism
- **Type**: Bearer Token (JWT)
- **Algorithm**: `HS256` (implied by `jsonwebtoken` default)
- **Secret Key**: Hard-coded static secret (`2018-Smart%2Recruit%2@1234#`)
- **Token Location**: `Authorization` HTTP header — format: `Bearer <token>`

### Login Flow
Token generation is handled by a dedicated endpoint:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/token/generateToken` | Generate JWT token for authenticated user |
| POST | `/panel/checkEmployee` | Verify that an employee exists in the system |
| POST | `/panel/fetchEmpRoles` | Fetch roles assigned to an employee |

**Token Generation Steps:**
1. Client posts employee credentials / SSO identity to `/token/generateToken`
2. Server signs a JWT with the static secret and returns it
3. Client stores the token and sends it in `Authorization: Bearer <token>` on every subsequent request

### Auth Middleware (`authChecking.js`)
Applied to **all protected routes** as a pre-handler:
1. Extract token from `Authorization` header (`split(" ")[1]`)
2. Verify token using `jwt.verify(token, secret)`
3. Attach decoded payload to `req.userData`
4. Call `next()` on success; return `401 { message: "Auth Failed" }` on failure

**Error Responses:**
| Condition | HTTP Status | Body |
|-----------|-------------|------|
| Missing or malformed header | 401 | `{ message: "Auth Failed" }` |
| Invalid / expired token | 401 | `{ message: "Auth Failed" }` |

---

## 2. Authorization

### Role-Based Authorization Middleware (`isAuthorized.js`)
Applied selectively to specific endpoints (e.g., `GET /recruiter/getAllRecruiterSlotsByMonth`).

**Roles recognized:**
- `Recruiter`
- `PMO`
- `Lead`

**Logic:**
1. Extract `email` from `req.body`
2. Look up employee record in `employee_master` by email
3. Fetch all role records from `role_master` for that employee
4. Check if any role name contains `"Recruiter"`, `"PMO"`, or `"Lead"`
5. If authorized → `next()`
6. If employee not found → `403 "RECRUITER_NOT_REGISTERED"`
7. If no matching role → `403 "NOT_AUTHORISED_RECRUITER"`

**Note:** There is a logic bug in the original — `(RECRUITERROLE || PMO || LEAD)` always evaluates to `"Recruiter"` due to JS short-circuit. Only `Recruiter` role check is effectively active.

### Application-Level Roles (used in query filters)
These roles are passed by the client in request bodies and control what data is visible:

| Role Name | Description |
|-----------|-------------|
| `Tower Lead` | Sees candidates in offer approval statuses for their assigned towers |
| `SL-BU Lead` | Sees candidates in specific approval statuses for their BU |
| `Recruiter` | Standard recruiter access |
| `PMO` | Project Management Office — reports and workflow access |
| `Lead` | Team lead — recruiter-level access |
| `Admin/SuperUser` | Referral admin with elevated access |
| `Referral SPOC` | Single point of contact for referral management |

### Protected vs Public Routes

| Route | Auth Required | Notes |
|-------|--------------|-------|
| `GET /` | No | Health check |
| `POST /token/generateToken` | No | Token generation endpoint |
| `GET /excel/downloadResume` | No | File download (legacy public) |
| `GET /interviewer/getCandidateFeedback` | No | Public feedback download |
| `GET /download/resumeDump` | No | Resume bulk dump |
| All other routes | Yes (`authChecking`) | JWT required |
| `GET /recruiter/getAllRecruiterSlotsByMonth` | Yes + Role Check | Requires Recruiter/PMO/Lead role |

---

## 3. CORS Policy

Allowed origins (whitelist-based):
- `https://www.smartrecruit-portal.com` (production)
- `http://localhost:4200`
- `http://127.0.0.1:4200`
- `http://localhost:4201`
- `http://127.0.0.1:4201`

Requests from unlisted origins receive a `Access-Control-Allow-Origin` header pointing to the production domain (not a block — a default fallback). All HTTP methods and standard headers are permitted.

---

## 4. Session / Token Management

- Tokens are **stateless** — no server-side session store
- No token refresh mechanism is present
- No token expiry is explicitly set at generation time (relies on JWT default behavior)
- Token secret is static and hard-coded — rotation requires code deployment

---

## 5. Security Observations (for fresh implementation)
- Replace static hard-coded JWT secret with environment variable
- Implement token expiry (`expiresIn`) during generation
- Fix role OR logic bug — use `roleName.includes(RECRUITERROLE) || roleName.includes(PMO) || roleName.includes(LEAD)`
- Consider refresh token flow for long sessions
- CORS wildcard fallback to production URL rather than blocking unknown origins — tighten in fresh implementation
