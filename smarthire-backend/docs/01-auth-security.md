# Module: Authentication & Security

## Purpose

Protects all backend API endpoints using stateless JWT-based authentication. Integrates with Keycloak as the identity provider. A separate login endpoint validates active sessions and handles duplicate session detection.

---

## 1. Security Architecture

```
Client Request
    │
    ▼
JWTAuthorizationFilter  (OncePerRequestFilter)
    │ reads Authorization: Bearer <token>
    │ validates JWT signature (HS256, secret = "2018-Smart%2Recruit%2@1234#")
    │ extracts claims → sets Spring SecurityContextHolder
    ▼
WebSecurityConfig
    │ /prescreen/** → PERMIT ALL (no auth required)
    │ all other endpoints → AUTHENTICATED
    ▼
Controller
```

---

## 2. JWT Token

| Property | Value |
|---|---|
| **Algorithm** | HS256 |
| **Signing secret** | `2018-Smart%2Recruit%2@1234#` (hardcoded) |
| **Header name** | `Authorization` |
| **Prefix** | `Bearer ` |
| **Required claim** | `userID` (non-null) |
| **Subject** | Used as authenticated principal name |

### Token Validation Flow

1. Read `Authorization` header from request.
2. If header is absent or does not start with `Bearer `, clear security context and continue the filter chain (request proceeds unauthenticated — controller layer enforces auth).
3. Parse and verify signature using the hardcoded secret.
4. If `userID` claim is present, create a `UsernamePasswordAuthenticationToken` and set it in `SecurityContextHolder`.
5. On `ExpiredJwtException`, `UnsupportedJwtException`, or `MalformedJwtException` → respond with HTTP `401 Unauthorized`.

### Error Responses

| Condition | HTTP Status | Description |
|---|---|---|
| Missing / malformed `Authorization` header | 401 | Security context cleared |
| Expired token | 401 | `ExpiredJwtException` |
| Invalid token format | 401 | `MalformedJwtException` / `UnsupportedJwtException` |

---

## 3. Public (Unauthenticated) Endpoints

| Path Pattern | Controller | Notes |
|---|---|---|
| `/prescreen/**` | `PrescreenController` | Permit-all — used for external prescreen callbacks |

All other endpoints require a valid JWT.

---

## 4. Keycloak Configuration

SmartHire uses Keycloak as the identity provider. The backend does **not** issue tokens itself; it only validates tokens produced by Keycloak.

| Property | Source | Example Value |
|---|---|---|
| Keycloak Admin URL | `common-{profile}.properties` → `keycloakurl` | `https://52.214.113.246:8000/auth/admin/realms/SmartHire/users` |
| Realm | Inferred from URL path | `SmartHire` |
| Client ID (login session check) | `LoginController` | `d0209689-4b20-4367-adc0-f79c6774bf74` |
| Admin credentials (session mgmt) | Hardcoded in `LoginController` | `admin` / `admin` |
| Realm (MS Graph OAuth) | `TeamsMeetingController` | `76a2ae5a-9f00-4f6b-95ed-5d33d77c4d61` |

---

## 5. Role Model

Roles are stored in `EMPLOYEE_ROLE_DETAILS` table (entity: `EmployeeRoleDetailsEntity`) linked to `EMPLOYEE_MASTER`.

Roles are retrieved via:
- `GET /role/getRole` — returns roles by employee email
- `POST /role/getEmployeeRole` — returns roles by email + password

Known role constants in code:
- `interviewer`
- `lead`
- `RECRUITER`
- `Tower Lead`
- `INVENT`
- `SAP`

---

## 6. Session Management (Keycloak Sessions)

**Endpoint**: `POST /login/validateSession`

**Purpose**: Detect and clean up duplicate login sessions in Keycloak.

**Flow**:
1. Accept `{ "userName": "<email>" }` in request body.
2. Authenticate against Keycloak `master` realm using admin credentials to obtain an admin access token.
3. Fetch all active user sessions for the SmartHire Keycloak client.
4. Filter sessions matching the given `userName`.
5. If more than one session exists → delete all sessions → return `"Multiple Session Found"`.
6. Otherwise → return `"Session Validated"`.

**Note**: This endpoint bypasses SSL certificate validation (custom `TrustManager` that trusts all certs). This is a security concern that should be remediated in a fresh implementation.

---

## 7. Security Notes & Concerns (for Fresh Implementation)

| Issue | Detail | Recommended Fix |
|---|---|---|
| Hardcoded JWT secret | `"2018-Smart%2Recruit%2@1234#"` in `JWTAuthorizationFilter.java` | Externalise to environment variable / secrets manager |
| Hardcoded Keycloak admin credentials | `username=admin&password=admin` in `LoginController` | Use service account credentials from secrets manager |
| SSL verification disabled | `JWTAuthorizationFilter` / `LoginController` bypass all cert validation | Use proper trust stores |
| Credentials in properties files | DB passwords, AWS keys, SMTP passwords in `common-prod.properties` | Use secrets management (AWS Secrets Manager, Vault) |
| CSRF disabled | `http.csrf().disable()` | Acceptable for stateless JWT APIs; document explicitly |
