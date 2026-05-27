# Module: Microsoft Teams Meeting Integration

## Purpose

Integrates with Microsoft Graph API to create Teams online meeting links for virtual interviews. Implements the OAuth 2.0 authorization code flow to obtain a Graph API access token, then calls the Graph API to create an online meeting.

---

## API Endpoints

### 1. Get OAuth Code (Redirect)

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/getCode` |
| **Auth** | None (public redirect endpoint) |

**Purpose**: Initiate the OAuth 2.0 authorization code flow with Microsoft. Redirects the browser to the Microsoft identity platform login page.

**Redirect URL built**:
```
https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/authorize
  ?client_id={clientId}
  &response_type=code
  &redirect_uri={graphJavaRedirectUrl}
  &response_mode=query
  &scope=https://graph.microsoft.com/OnlineMeetings.ReadWrite
  &state=random_state_String
```

**Configuration**:
| Property | Value |
|---|---|
| Tenant ID | `76a2ae5a-9f00-4f6b-95ed-5d33d77c4d61` |
| Client ID | `b0b61d51-4fc7-4e70-9ec4-33819aed7a53` |
| Redirect URI | `graphJavaRedirectUrl` from `common-{profile}.properties` |
| Scope | `https://graph.microsoft.com/OnlineMeetings.ReadWrite` |

---

### 2. Get Meeting Link

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/getMeetingLink` |
| **Auth** | Required (JWT) |

**Request Body**: `TeamsMeetingDTO1`

| Field | Type | Description |
|---|---|---|
| subject | String | Meeting title / interview subject |
| startTime | String | Meeting start datetime (ISO 8601) |
| endTime | String | Meeting end datetime |
| attendees | List | Email addresses of attendees |
| (other fields) | | |

**Purpose**: Create a Microsoft Teams online meeting and return the join URL.

**Response**: String — the Teams meeting join link (e.g., `https://teams.microsoft.com/l/meetup-join/...`).

---

### 3. Send Meeting Invite (Recruiter)

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/sendMeetingInvite` |
| **Auth** | Required (JWT) |

**Request Body**: `TeamsMeetingDTO1`

**Purpose**: Create a Teams meeting and send the invite link to the recruiter (wraps `getMeetingLink` internally).

**Success Response**:
```json
{
  "message": "<teams meeting join url>"
}
```

**Error Response**:
```json
{
  "exception": "<error message>"
}
```

---

## OAuth 2.0 Flow

```
1. Frontend calls /getCode
   → Redirect to Microsoft login page
   → User authenticates
   → Microsoft redirects to graphJavaRedirectUrl with ?code=...

2. Backend exchanges code for access token:
   POST {invite_url}
   Body: client_id={client_id}&client_secret={client_secret}
         &grant_type=authorization_code&code={code}
         &redirect_uri={graphJavaRedirectUrl}

3. Access token used to call Graph API:
   POST https://graph.microsoft.com/v1.0/me/onlineMeetings
   Body: { subject, startDateTime, endDateTime, participants }
```

---

## Configuration Dependencies

| Property | Source | Description |
|---|---|---|
| `token_url` | `common-{profile}.properties` | Graph API meetings endpoint |
| `invite_url` | `common-{profile}.properties` | Azure token endpoint |
| `client_id` | `common-{profile}.properties` | Azure AD app client ID |
| `client_secret` | `common-{profile}.properties` | Azure AD app client secret |
| `graphJavaRedirectUrl` | `common-{profile}.properties` | OAuth redirect URI (backend) |
| `graphRedirectUrl` | `common-{profile}.properties` | OAuth redirect URI (frontend) |

Production values:
- `token_url = https://graph.microsoft.com/v1.0/me/onlineMeetings`
- `invite_url = https://login.microsoftonline.com/2596e3b8-5353-4c44-b032-426407bcb387/oauth2/v2.0/token`
- Redirect: `https://www.smartrecruit-portal.com/smartrecruitmicro`

---

## TeamsMeetingDTO / TeamsMeetingDTO1

| Field | Type | Description |
|---|---|---|
| subject | String | Meeting title |
| startDateTime | Date/String | Start time |
| endDateTime | Date/String | End time |
| organizerEmail | String | Meeting organiser |
| attendees | List\<String\> | Attendee emails |
| joinWebUrl | String | Output — Teams join URL |

---

## Service Dependencies

| Service | Notes |
|---|---|
| `TeamsMeetingService` | Graph API integration logic |
| `ConfigurationServiceImpl` | Config value retrieval |

---

## Error States

| Condition | Handling |
|---|---|
| OAuth token exchange fails | Exception thrown and returned in `exception` field |
| Graph API call fails (non-200) | Exception thrown |
| `URISyntaxException` | Exception caught; returned in `exception` field |
| `ParseException` | Exception caught; returned in `exception` field |

---

## Security Notes

- Client secret is stored in `common-{profile}.properties` (plaintext). Should be moved to secrets manager in fresh implementation.
- The OAuth state parameter is `"random_state_String"` — a static value. CSRF protection for OAuth requires a random, unique state per request.
