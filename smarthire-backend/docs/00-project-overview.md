# SmartHire Micro — Project Overview

## Purpose

SmartHire (also referred to as SmartRecruit) is an internal recruitment management platform built to streamline end-to-end hiring at an enterprise consulting organisation. It coordinates the full recruitment lifecycle: candidate intake, interview scheduling, interviewer availability management, feedback capture, and reporting.

## Target Users / Personas

| Persona | Description |
|---|---|
| **Recruiter** | Schedules interviews, manages candidate pipeline, generates feedback forms |
| **Interviewer / Panelist** | Marks availability slots, submits interview feedback |
| **PMO Coordinator** | Oversees interview pipeline and scheduling |
| **Tower Lead / Skill Lead** | Approves hiring, receives aging SLA alerts |
| **Admin / Registration Officer** | Registers new users, manages employee-role mappings |
| **Supervisor** | Oversees interviewer assignments |

## Detected Tech Stack (for reference only — specs are stack-agnostic)

| Layer | Technology |
|---|---|
| Runtime | Java 8 |
| Framework | Spring Boot 1.4.7 |
| Security | Spring Security + JWT (HS256) + Keycloak (OAuth 2.0 / OIDC) |
| Persistence | Spring Data JPA + Hibernate + PostgreSQL |
| File Storage | AWS S3 |
| Email | AWS SES (SMTP) + Apache Velocity templates |
| PDF Generation | iTextPDF + XMLWorker |
| Excel | Apache POI (HSSF) |
| Calendar Integration | Microsoft Graph API (Teams Meetings) |
| Build | Apache Maven |
| Deployment | Cloud Foundry (manifest.yml), containerisable (Dockerfile present) |

## Repository Structure

```
smarthiremicro/                 — Main microservice (this repo)
smarthireReusable/              — Shared JPA entity library (jar dependency)
```

## Key Entry Point

- **Main class**: `com.etap.smarthire.Application`
- **Server port**: `8083` (all profiles)
- **Active profile selector**: `application.properties` → `spring.profiles.active`

## Profiles

| Profile | Database schema | Notes |
|---|---|---|
| `local` | local PostgreSQL | Developer workstation |
| `dev` | `sr_dev` on AWS RDS (eu-west-1) | Shared dev environment |
| `prod` | `sr_prod` on AWS RDS (eu-west-1) | Production |

## Modules Documented

| # | Module | Source Path | Spec File |
|---|---|---|---|
| 1 | Auth & Security | `com.etap.security`, `WebSecurityConfig` | [01-auth-security.md](01-auth-security.md) |
| 2 | Candidate Management | `controller/CandidateDataController` | [02-candidate-management.md](02-candidate-management.md) |
| 3 | Interviewer Module | `controller/InterviewerController` | [03-interviewer-module.md](03-interviewer-module.md) |
| 4 | Recruiter Module | `controller/RecruiterController` | [04-recruiter-module.md](04-recruiter-module.md) |
| 5 | Slot Booking (Bulk Upload) | `controller/SlotBookingController` | [05-slot-booking.md](05-slot-booking.md) |
| 6 | Feedback Forms | `controller/FeedbackFormController` | [06-feedback-forms.md](06-feedback-forms.md) |
| 7 | Alerts & Notifications | `controller/AlertsController` | [07-alerts-notifications.md](07-alerts-notifications.md) |
| 8 | Reports | `controller/ReportController` | [08-reports.md](08-reports.md) |
| 9 | Lookup & Configuration | `controller/LookupController`, `ConfigurationController` | [09-lookup-configuration.md](09-lookup-configuration.md) |
| 10 | User Registration & Roles | `controller/RegistrationController`, `RoleController`, `GetUserController` | [10-user-registration-roles.md](10-user-registration-roles.md) |
| 11 | Login & Session Management | `controller/LoginController` | [11-login-session.md](11-login-session.md) |
| 12 | Keycloak Integration | `controller/KeycloakController` | [12-keycloak-integration.md](12-keycloak-integration.md) |
| 13 | Teams Meeting Integration | `controller/TeamsMeetingController` | [13-teams-meeting.md](13-teams-meeting.md) |
| 14 | File Management | `controller/ImageController`, `MSGFileController`, `PdfDownloadController`, `UploadFeedbackPDFController`, `ExcelReader` | [14-file-management.md](14-file-management.md) |
| 15 | Prescreen | `controller/PrescreenController` | [15-prescreen.md](15-prescreen.md) |
| 16 | Referral Candidate | `controller/ReferralCandidateController` | [16-referral-candidate.md](16-referral-candidate.md) |
| 17 | Data Models | `smarthireReusable` entities | [17-data-models.md](17-data-models.md) |
| 18 | Reusable Library | `smarthireReusable` utilities | [18-reusable-library.md](18-reusable-library.md) |
