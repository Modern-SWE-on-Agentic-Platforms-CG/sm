# SmartHire UI - Auth and Routing Specification

## Authentication Architecture

- Primary auth: Keycloak SSO (realm: SmartHire, clientId: Smarthireui)
- Token: JWT stored in `localStorage["token"]`
- Interceptor: `httpSetHeaders.interceptor.ts` adds `Authorization: Bearer <token>` to every request
- `enableSso` in `environment.ts` toggles SSO on/off (`false` in dev)

## Login Flow

1. User visits `/home`
2. `KeycloakService.init()` bootstrapped via `APP_INITIALIZER` (if `enableSso=true`)
3. SSO token exchanged via `getTokenId()` → JWT stored in `localStorage`
4. User roles fetched from `panel/fetchEmpRoles`
5. Role stored in `localStorage["role"]`, name in `localStorage["name"]`
6. Redirect to `/selectrole`

## Auth Guard

- Checks `localStorage["token"]`; redirects to `/home` if missing or expired
- `ReferralAuthGuard`: checks `localStorage["refrole"]` for `/referral-portal/ref-candidate-details`

## HTTP Interceptor

- Reads token from `localStorage["token"]`
- Appends `Authorization: Bearer <token>` header to every outgoing HTTP request

## Roles Matrix

| Role | Home Route | scheduleFlag |
|---|---|---|
| Interviewer | `/todolist` or `/weekend-drive` | false |
| Recruiter | `/todolist` | true |
| PMO | `/todolist` | true |
| Lead | `/upload` | true |
| Tower Lead | `/work-flow` | true |
| SL-BU Lead | `/work-flow` | true |
| NA Lead | `/work-flow` | true |
| Recruiter Lead | `/work-flow` | true |
| Practice Lead | `/todolist` | true |
| BU Admin | `/master-data` | false |
| Practice Admin | `/master-data` | false |
| Admin | `/candidate-referral` | false |
| SuperUser | `/candidate-referral` | false |
| Referral SPOC | `/candidate-referral` | false |

## Public Routes (No Auth Guard)

- `/home`, `/register`, `/selectrole`, `/error`, `/logout`
- `/referral-portal/referralRegister`, `/referral-form`
- `/referral-portal/error`, `/referral-portal/upload`, `/referral-portal/logout`
- `/ref-reports-bybu`, `/ref-reports-byaccount`, `/select`

## Routing Configuration

- Strategy: Hash-based routing (`useHash: true`)
- Preloading: `PreloadAllModules`
- Total routes: ~60, all feature modules lazy-loaded via `loadChildren`
- Default: `{ path: "", redirectTo: "home", pathMatch: "full" }`
- Wildcard: `{ path: "**", redirectTo: "home" }`

## Auth API Endpoints

| Endpoint | Purpose |
|---|---|
| `panel/fetchEmpRoles` | Fetch roles for logged-in user |
| `panel/getEmpName` | Fetch employee display name |
| `panel/getEmpBU` | Fetch employee BU |
| `panel/checkEmployee` | Validate employee is registered |
| `token/generateToken` | Generate app session token |
| `login/validateSession` | Validate existing session |
| `keycloak/addUser` | Add user to Keycloak realm |
| `keycloak/approveUser` | Approve pending Keycloak user |
| `keycloak/declineUser` | Decline and remove Keycloak user |
