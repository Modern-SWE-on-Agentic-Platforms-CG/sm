# Module: Login & Session Management

## Purpose

Validates active user sessions via Keycloak and enforces a single-session-per-user policy. Does not issue tokens — token issuance is handled by Keycloak directly.

---

## API Endpoints

Base path: `/login`

### 1. Validate Session

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/login/validateSession` |
| **Auth** | None (no JWT required — called before the user's session is confirmed) |

**Request Body**:
```json
{
  "userName": "<keycloak username / email>"
}
```

**Response**: `ResponseDto`

| message value | Meaning |
|---|---|
| `"Session Validated"` | Exactly one active session found — OK |
| `"Multiple Session Found"` | Multiple sessions detected and terminated |

**Flow**:

1. Obtain a Keycloak admin access token from the `master` realm using admin credentials (`admin`/`admin`).
2. Call Keycloak Admin API to list all active user sessions for the SmartHire client (`client_id = d0209689-4b20-4367-adc0-f79c6774bf74`).
3. Filter sessions where `username` matches the supplied `userName`.
4. Count matching sessions:
   - If count > 1: delete **all** sessions for that user → return `"Multiple Session Found"`.
   - If count ≤ 1: return `"Session Validated"`.

---

## External Keycloak Calls Made

| Operation | HTTP Method | URL |
|---|---|---|
| Get admin token | POST | `{keycloakUrl}realms/master/protocol/openid-connect/token` |
| List user sessions | GET | `{keycloakUrl}admin/realms/{realm}/clients/{clientId}/user-sessions` |
| Delete session | DELETE | `{keycloakUrl}admin/realms/{realm}/sessions/{sessionId}` |

**Keycloak URL**: configured via `keycloakurl` in `common-{profile}.properties`

**Realm name**: `SmartHire` (inferred from keycloakurl path)

---

## Configuration Dependencies

| Property | Source | Description |
|---|---|---|
| `keycloakurl` | `common-{profile}.properties` | Base URL for Keycloak admin API |
| Realm | Hard-coded path segment in URL | `SmartHire` |
| Admin credentials | Hard-coded in source | `admin`/`admin` |
| Client ID | Hard-coded in source | `d0209689-4b20-4367-adc0-f79c6774bf74` |

---

## Security Notes

| Issue | Detail | Recommended Fix |
|---|---|---|
| SSL verification disabled | Custom `TrustManager` trusts all certificates | Use proper trust store in fresh implementation |
| Admin credentials hard-coded | `admin`/`admin` in source | Externalise to secrets manager |
| Client ID hard-coded | UUID in source | Move to configuration |

---

## Service Dependencies

| Service | Notes |
|---|---|
| `ConfigurationServiceImpl` | Retrieves Keycloak URL and realm name from properties |

---

## Error States

| Condition | Handling |
|---|---|
| Keycloak admin token request fails | Exception propagated |
| Session list request fails | IOException propagated |
| Session delete fails | IOException propagated |
| Invalid JSON in request body | JSONException thrown |
