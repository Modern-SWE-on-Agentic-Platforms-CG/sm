# Module: Keycloak Integration

## Purpose

Manages employee synchronisation with Keycloak Identity Provider: fetch all registered Keycloak users, delete an employee from both the local database and Keycloak, and update employee records in Keycloak.

---

## API Endpoints

Base path: `/keycloak`

### 1. Fetch All Keycloak Users

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/keycloak/fetchAllKeycloakUsers` |
| **Auth** | Required (JWT) |

**Request Body**: `KeycloakTokenDTO`

| Field | Type | Description |
|---|---|---|
| token | String | Valid Keycloak admin bearer token |
| (other fields) | | |

**Purpose**: Retrieve the full list of users registered in Keycloak (admin users query). Returns the raw Keycloak JSON user list as a string.

**Response**: String (raw JSON from Keycloak admin API)

**Error**: Returns exception message as string on failure (HTTP 200 with error in body).

---

### 2. Delete Employee

| Property | Value |
|---|---|
| **Method** | DELETE |
| **Path** | `/keycloak/deleteEmployee` |
| **Auth** | Required (JWT) |

**Query Parameter**: `employeeId` (long)

**Request Body**: `KeycloakTokenDTO`

| Field | Type | Description |
|---|---|---|
| token | String | Admin bearer token |
| id | String | Keycloak user UUID to delete |

**Flow**:
1. Load `EmployeeMasterEntity` by `employeeId`.
2. Delete from local `EMPLOYEE_MASTER`.
3. Call Keycloak Admin API `DELETE /users/{id}` with the admin bearer token.

**Response**: `Boolean` — `true` on success, `false` on failure.

---

### 3. Update Employee

| Property | Value |
|---|---|
| **Method** | PUT |
| **Path** | `/keycloak/updateEmployee` |
| **Auth** | Required (JWT) |

**Request Body**: `KeycloakTokenDTO`

| Field | Type | Description |
|---|---|---|
| token | String | Admin bearer token |
| id | String | Keycloak user UUID |
| (employee update fields) | | Name, email, etc. |

**Purpose**: Push employee attribute updates from SmartHire to Keycloak.

**Response**: `Boolean` — `true` if updated, `false` on failure.

---

## KeycloakTokenDTO

| Field | Type | Description |
|---|---|---|
| `token` | String | Keycloak admin bearer token |
| `id` | String | Keycloak user UUID (for delete/update) |
| (other optional fields) | | |

---

## External Keycloak Calls Made

| Operation | HTTP Method | URL |
|---|---|---|
| List users | GET | `{keycloakurl}` (full configured URL) |
| Delete user | DELETE | `{keycloakurl}/{userId}` |
| Update user | PUT | `{keycloakurl}/{userId}` |

**Keycloak Admin URL**: `keycloakurl` in `common-{profile}.properties`
Example: `https://52.214.113.246:8000/auth/admin/realms/SmartHire/users`

---

## SSL Bypass

All Keycloak HTTP calls use `SSLUtilities.trustAllHostnames()` and `SSLUtilities.trustAllHttpsCertificates()` which globally disable SSL verification.

> This is a security concern. Fresh implementation should use proper SSL/TLS trust stores.

---

## Service Dependencies

| Service | Notes |
|---|---|
| `KeycloakService` / `KeycloakServiceImpl` | All Keycloak admin integration logic |
| `ConfigurationServiceImpl` | Keycloak URL from properties |

## Repository Dependencies

| Repository | Table | Purpose |
|---|---|---|
| `EmployeeMasterRepository` | `EMPLOYEE_MASTER` | Local employee management |

---

## Error States

| Condition | Handling |
|---|---|
| Employee not found locally | `SmarthireException` — returns `false` |
| Keycloak API returns non-200 | `SmarthireException("token expired")` |
| IOException on HTTP call | Logged; returns `false` |
| Token expired | `SmarthireException("token expired")` |
