# SmartHire UI - Shared Components and Models Specification

## BookingEvent Interface

Core model for interview scheduling. Defined in `booking-event.ts`.

| Field | Type | Description |
|---|---|---|
| `id` | `number` | Unique event ID |
| `start` | `Date` | Interview start datetime |
| `end` | `Date` | Interview end datetime |
| `title` | `string` | Display title (candidate name or slot label) |
| `color` | `{ primary, secondary }` | Highcharts/angular-calendar color object |
| `meta` | `object` | Arbitrary metadata (varies by context) |
| `candidate_detail_id` | `number` | Candidate FK |
| `employee_id` | `number` | Interviewer FK |
| `interview_type` | `string` | L1 / L2 / L1-L2 / L3 |
| `technology` | `string` | Skill/technology for the interview |
| `status` | `string` | Booking status (booked / available / interviewed) |
| `meeting_link` | `string` | Video meeting URL |
| `bu` | `string` | Business unit |
| `booking_id` | `number` | Booking record ID |
| `slot_id` | `number` | Slot FK |
| `feedback_status` | `number` | 0=pending, 3=submitted |

---

## LookupEvent Interface

Lightweight model for dropdown/autocomplete options.

| Field | Type | Description |
|---|---|---|
| `id` | `number` | Option ID |
| `name` | `string` | Display name |
| `value` | `string` | Stored value |
| `bu` | `string` | BU scope (if applicable) |

---

## DataService

Central reactive state and HTTP communication service. All components inject this service.

### State Properties (selected)

| Property | Type | Purpose |
|---|---|---|
| `employeeDetails` | `object` | Logged-in employee profile |
| `candidateDetails` | `object` | Current candidate in focus |
| `bookingDetails` | `object` | Active booking data |
| `buList` | `array` | All BU options |
| `skillList` | `array` | All skills |
| `towerList` | `array` | All towers |
| `sourceList` | `array` | All sources |
| `vendorList` | `array` | All vendors |

### EventEmitters and Subjects

| Name | Type | Used For |
|---|---|---|
| `candidateSelected` | `EventEmitter` | Notify when a candidate row is selected |
| `bookingCreated` | `EventEmitter` | Notify when a booking is saved |
| `refreshPipeline` | `EventEmitter` | Trigger pipeline table refresh |
| `employeeLoaded$` | `ReplaySubject<1>` | Emit once when employee profile is loaded |
| `buListLoaded$` | `ReplaySubject<1>` | Emit once when BU list is loaded |
| `roleChange$` | `Subject` | Emit when user role changes |

### Key HTTP Methods

| Method | Returns | Purpose |
|---|---|---|
| `getEmployeeDetails(email)` | `Observable` | Load logged-in employee |
| `getCandidateDetails(id)` | `Observable` | Load candidate by ID |
| `postData(url, body)` | `Observable` | Generic POST |
| `getData(url)` | `Observable` | Generic GET |
| `uploadFile(url, formData)` | `Observable` | Multipart file upload |
| `downloadFile(url)` | `Observable<Blob>` | File download |

---

## AuthService

Handles authentication state independently from Keycloak service.

| Method | Purpose |
|---|---|
| `getToken()` | Return current JWT from `localStorage["token"]` |
| `isAuthenticated()` | Return true if token exists and is not expired |
| `getDecodedToken()` | Return decoded JWT payload via `JwtHelperService` |
| `getUserRole()` | Extract role from decoded token |
| `logout()` | Clear localStorage, redirect to login |

---

## HTTP Interceptor (`httpSetHeaders.interceptor.ts`)

Applied globally. Intercepts all outgoing HTTP requests.

### Behavior

1. Reads token from `localStorage["token"]`
2. If token present → clones request with header `Authorization: Bearer <token>`
3. If token absent → passes request unchanged
4. Does **not** handle 401 responses (no token refresh logic)

```
GET /api/endpoint
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json
```

---

## AuthGuard

Protects all main application routes (non-referral).

### Logic

1. Check `localStorage["token"]` exists
2. Check token is not expired (`JwtHelperService.isTokenExpired()`)
3. If valid → allow navigation
4. If invalid/missing → navigate to `/login`

### Applied To

All lazy-loaded module routes (see routing config in `auth-and-routing.md`)

---

## ReferralAuthGuard

Protects referral portal routes separately from the main auth guard.

### Logic

1. Check `localStorage["refrole"]` exists
2. Check `localStorage["refname"]` exists
3. If both present → allow navigation
4. If missing → navigate to `/referral-portal/referralRegister`

### Applied To

`/referral-portal/ref-candidate-details`, `/candidate-referral-details`

---

## URL_CONSTANTS (grouped by category)

### Authentication & Employee
`LOGIN`, `REGISTER`, `FETCHEMPLOYEEBYEMAIL`, `FETCHEMPBYBU`, `CHANGEPASSWORD`

### Candidate Pipeline
`FETCHCANDIDATES`, `UPLOADCANDIDATE`, `DELETECANDIDATE`, `STATUSCHANGE`, `ADDCOMMENT`, `FETCHCOMMENTS`, `DOWNLOADRESUME`, `DOWNLOADEXCEL`

### Interview Scheduling / Booking
`FETCHBOOKINGS`, `SAVEBOOKING`, `DELETEBOOKING`, `FETCHSLOTS`, `SAVESLOT`, `PANELAVAILABILITY`

### Feedback
`SAVEFEEDBACK`, `FETCHFEEDBACK`, `FETCHFEEDBACKBYID`, `SUBMITFEEDBACK`

### Reports
`L2REPORT`, `L2AGINGREPORT`, `REJECTIONREPORTINFO`, `PANELINSIGHTS`, `STATUSINSIGHTS`, `CHANNELINSIGHTS`, `TRENDCHART`, `DATEOFJOINING`, `ARCDEVIATION`, `INTERVIEWDATA`

### Workflow / Demand
`FETCHFLOWCANDIDATES`, `APPROVECANDIDATE`, `REJECTCANDIDATE`, `DEMANDUPLOAD`, `FETCHDEMANDSUPPLY`

### JB / Joining Bonus
`FETCHJBCANDIDATES`, `SAVEJBCONFIG`

### Referral
`REFERRALFORM`, `CANDIDATEREFERRAL`, `REFERRALUPLOAD`, `FETCHREFERRALCANDIDATES`

### Administration
`FETCHALLSKILLS`, `ADDSKILL`, `ADDSOURCE`, `FETCHTOWERS`, `ADDTOWER`

---

## environment.ts Config

| Key | Default (dev) | Purpose |
|---|---|---|
| `BASE_URL` | `http://localhost:7001/` | REST API base URL |
| `enableSso` | `false` | Toggle Keycloak SSO |
| `keycloakUrl` | `https://52.214.113.246:8000/auth` | Keycloak server |
| `realm` | `SmartHire` | Keycloak realm |
| `clientId` | `Smarthireui` | Keycloak client ID |
| `DOWNLOAD_TEMPLATE` | S3 URL | Candidate upload template |
| `DOWNLOAD_TEMPLATE_INVENT` | S3 URL | Invent BU candidate template |
| `SLOT_PANEL_DOWNLOAD_TEMPLATE` | S3 URL | Panel slot template |
| `L2_TEMPLATE` | S3 URL | L2 upload template |
| `IMPORT_INSTANT_INTERVIEW` | S3 URL | Instant interview template |
| `IMPORT_INSTANT_INTERVIEW_GCCA` | S3 URL | GCCA instant interview template |

---

## UI Libraries

| Library | Version | Used For |
|---|---|---|
| `@ionic/angular` | ~4.x | Mobile shell, `IonContent`, `IonButton`, `IonModal` |
| `@angular/material` | ~8.x | `MatSelect`, `MatDialog`, `MatFormField` |
| `primeng` | ~8.x | `p-table`, `p-dialog`, `p-calendar`, `p-multiSelect` |
| `highcharts-angular` | ~2.x | Pie, line, and bar charts in reports |
| `angular-calendar` | ~0.28.x | Monthly/weekly calendar in scheduling |
| `ngx-toastr` | ~11.x | Toast notifications (success, error, warning, info) |
| `ngx-spinner` | ~8.x | Full-page loading overlay |
| `keycloak-angular` | ~7.x | Keycloak SSO integration |
| `@auth0/angular-jwt` | ~3.x | JWT decoding and expiry check |

---

## Routing Configuration Summary

| Setting | Value |
|---|---|
| Strategy | Hash-based (`useHash: true`) |
| Preloading | `PreloadAllModules` |
| Guards | `AuthGuard` on all main routes; `ReferralAuthGuard` on referral routes |
| Public routes | `/login`, `/register`, `/referral-portal/referralRegister`, `/referral-form` |
| Total routes | ~60 |
| Lazy modules | ~12 feature modules, each with own routing module |

See [auth-and-routing.md](auth-and-routing.md) for the full route table.
