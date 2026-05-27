# Implementation Plan: SmartHire Backend Platform

**Branch**: `001-smarthire-backend-platform` | **Date**: 2026-05-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-smarthire-backend-platform/spec.md`

---

## Summary

Build the complete SmartHire internal recruitment management platform backend as a Python 3.11 + FastAPI web service backed by PostgreSQL (`smarthiredb001`, schema `smarthire`). The platform manages the full hiring lifecycle — candidate intake, interview scheduling, feedback collection, offer management, reporting, and automated SLA alerts — for an enterprise consulting organisation. The backend exposes a REST API (OpenAPI 3.x) secured by JWT / Keycloak OAuth 2.0 OIDC on all endpoints except the public prescreen intake path. Background automation (aging alerts, reminders) runs via APScheduler embedded in the FastAPI process. All file assets are stored in AWS S3; email notifications use AWS SES; virtual interview links are created via the Microsoft Graph API.

---

## Technical Context

**Language/Version**: Python 3.11

**Web Framework**: FastAPI with `uvicorn` (ASGI)

**ORM / Migrations**: SQLAlchemy 2.x (async) + Alembic

**Storage**: PostgreSQL — database `smarthiredb001`, schema `smarthire` (REQUIRED by constitution)

**Auth**: JWT HS256 via `python-jose`; Keycloak OAuth 2.0 / OIDC as identity provider; token validated on every protected request; secret read from `JWT_SECRET` env var

**File Storage**: AWS S3 via `boto3` (threadpool executor for async compatibility); max 10 MB per upload; pre-signed URL delivery

**Email**: AWS SES via `boto3`; supports plain-text, HTML, and Excel attachments

**PDF Generation**: `reportlab`

**Excel**: `openpyxl` — bulk uploads (parse) and report exports (generate)

**Calendar / Meetings**: Microsoft Graph API via `httpx` async client; OAuth2 token exchange for Teams meeting link creation

**Background Scheduler**: APScheduler (`AsyncIOScheduler`) embedded in FastAPI lifespan; no external broker required

**Testing**: `pytest`, `pytest-cov`, `pytest-asyncio`, `httpx` (`AsyncClient` for endpoint tests)

**Linting / Formatting**: `ruff` (E, W, F, I, UP rules), `black`, `mypy --strict`

**Dependency Management**: `pyproject.toml` + `pip`

**Containerisation**: Docker (`python:3.11-slim`, non-root user); `docker-compose` with PostgreSQL 15; `smarthire` schema created via init SQL

**Deployment**: Cloud Foundry or container-native; all config via environment variables; port 8083

**Performance Goals**:
- Bulk 500-slot Excel upload completes in < 30 s (SC-002)
- Candidate search with 5 filters returns in < 3 s (SC-003)
- Excel / PDF reports for 12 months of data complete in < 10 s (SC-006)
- API p95 response time target < 500 ms for non-report endpoints

**Scale/Scope**: Enterprise internal; ~100 concurrent users typical; backend only — no frontend code in this repository

**Constraints**: Secrets via env vars only; no hardcoded credentials; raw SQL with f-strings forbidden (ORM parameterised queries only); public endpoint limited to `/prescreen/**`

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Python-First** — All implementation code is Python 3.11; FastAPI + uvicorn; no non-Python runtime introduced.
- [x] **II. PostgreSQL-Only** — All persistence targets `smarthiredb001` (schema `smarthire`); Alembic migrations with rollback scripts included.
- [x] **III. Test-First** — Tests written before implementation; `pytest` + `pytest-cov`; coverage gate ≥ 80 % enforced in CI.
- [x] **IV. API Contract** — Full OpenAPI 3.x contract committed at `specs/001-smarthire-backend-platform/contracts/openapi.yaml` before endpoint implementation begins.
- [x] **V. Security** — JWT enforced on all protected endpoints; secrets via env vars; all DB access via SQLAlchemy ORM (no raw f-string SQL); OWASP Top 10 addressed in design review.

**Re-check post-design**: ✓ All gates remain satisfied after Phase 1 design.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-smarthire-backend-platform/
├── plan.md              ← this file
├── research.md          ← Phase 0 decisions
├── data-model.md        ← Phase 1 entities + relationships
├── quickstart.md        ← Phase 1 local dev setup
├── contracts/
│   └── openapi.yaml     ← Phase 1 OpenAPI 3.x contract
└── tasks.md             ← Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
src/
└── smarthire/
    ├── __init__.py
    ├── main.py               # FastAPI app factory, lifespan (APScheduler), global middleware
    ├── config.py             # pydantic-settings BaseSettings (all env vars)
    ├── database.py           # async SQLAlchemy engine, session factory, search_path=smarthire
    ├── auth/
    │   ├── __init__.py
    │   ├── jwt.py            # verify_token() — raises HTTP 401 on failure
    │   └── dependencies.py   # Depends(get_current_user)
    ├── models/
    │   ├── __init__.py
    │   ├── base.py           # DeclarativeBase, AuditMixin
    │   ├── masters.py        # 30+ master/lookup tables
    │   ├── employee.py       # EmployeeMaster, EmployeeRoleDetails, EmployeeTechnologyDetails
    │   ├── candidate.py      # CandidateDetail, CandidateInfoDetail, CandidateStatus, CandidateSkill, CandidatePanelDetails, CandidateComments
    │   ├── calendar.py       # InterviewerCalendarDetails, RecruiterCalendarDetails
    │   ├── feedback.py       # FeedbackFormDetails, FeedbackTemplate, FeedbackFormPlaceholder, InterviewerFeedback
    │   ├── demand.py         # DemandData, DemandBatch
    │   ├── bench.py          # BenchData, BenchBatch
    │   └── referral.py       # ReferralCandidateInfo + child tables
    ├── schemas/
    │   ├── __init__.py
    │   ├── common.py         # ResponseDto wrapper
    │   ├── candidate.py
    │   ├── employee.py
    │   ├── calendar.py
    │   ├── feedback.py
    │   ├── lookup.py
    │   ├── reports.py
    │   └── referral.py
    ├── routers/
    │   ├── __init__.py
    │   ├── auth.py           # /login/validateSession, /health
    │   ├── candidate.py      # /candidateData/**
    │   ├── prescreen.py      # /prescreen/** (public)
    │   ├── interviewer.py    # /interviewer/**
    │   ├── recruiter.py      # /recruiter/**
    │   ├── slot.py           # /slot/**
    │   ├── feedback_form.py  # /feedbackForm/**
    │   ├── reports.py        # /report/**
    │   ├── download.py       # /downloadExcel/**
    │   ├── lookup.py         # /lookup/**
    │   ├── configuration.py  # /configuration/**
    │   ├── register.py       # /register/**
    │   ├── role.py           # /role/**, /users/**
    │   ├── keycloak.py       # /keycloak/**
    │   ├── teams.py          # /getCode, /getMeetingLink, /sendMeetingInvite
    │   ├── alerts.py         # /alerts/**
    │   ├── files.py          # /image/**, /msg/**, /pdfDownload/**
    │   ├── supply.py         # /supplyScreen/**
    │   ├── demand.py         # /demandScreen/**, /demandUpload/**
    │   ├── bench.py          # /benchScreen/**, /benchUpload/**
    │   ├── workflow.py       # /workflow/**
    │   ├── dashboard.py      # /dashboard/**
    │   ├── referral.py       # /referralCandidate/**
    │   └── admin.py          # /admin/**
    ├── services/
    │   ├── candidate_service.py
    │   ├── interview_service.py
    │   ├── feedback_service.py
    │   ├── employee_service.py
    │   ├── report_service.py
    │   ├── analytics_service.py
    │   ├── alert_service.py
    │   ├── file_service.py
    │   ├── referral_service.py
    │   ├── workflow_service.py
    │   ├── dashboard_service.py
    │   ├── admin_service.py
    │   ├── keycloak_session.py
    │   └── teams_service.py
    ├── repositories/
    │   ├── candidate_repo.py
    │   ├── employee_repo.py
    │   ├── calendar_repo.py
    │   ├── feedback_repo.py
    │   ├── lookup_repo.py
    │   └── referral_repo.py
    ├── tasks/
    │   └── scheduler.py      # AsyncIOScheduler + all cron job registrations
    └── utils/
        ├── s3_client.py      # boto3 S3 wrapper (threadpool)
        ├── ses_client.py     # boto3 SES email sender
        ├── keycloak_client.py# httpx Keycloak Admin API client
        ├── teams_client.py   # httpx Graph API client
        ├── pdf_generator.py  # reportlab PDF builder
        ├── excel_parser.py   # openpyxl upload parser
        └── excel_exporter.py # openpyxl report builder

alembic/
├── env.py                    # wired to SQLAlchemy metadata + smarthire schema
└── versions/
    └── 0001_initial_schema.py# forward + rollback migration

tests/
├── conftest.py               # async DB session fixture (isolated test schema)
├── contract/
│   └── test_openapi.py       # every route appears in openapi.yaml and vice versa
├── integration/
│   ├── test_auth.py
│   ├── test_candidate.py
│   ├── test_scheduling.py
│   ├── test_feedback.py
│   ├── test_reports.py
│   ├── test_employee.py
│   ├── test_referral.py
│   └── test_workflow.py
└── unit/
    ├── test_jwt.py
    ├── test_alerts.py
    ├── test_lookup.py
    └── test_files.py

pyproject.toml
.env.example
Dockerfile
docker-compose.yml
```

**Structure Decision**: Single FastAPI project (`src/smarthire`) — no frontend directories. Repository pattern (service → repository → SQLAlchemy session) keeps services testable without hitting the database.

---

## Module Delivery Plan

| Phase | Module(s) | Depends On | Spec Priority |
|-------|-----------|-----------|---------------|
| 0 | Scaffolding, config, Docker, Alembic skeleton | — | Infrastructure |
| 1 | All SQLAlchemy models + Alembic migration `0001` | Phase 0 | Infrastructure |
| 2 | Auth (JWT middleware, Keycloak session) | Phase 1 | P1 |
| 3 | Master data / Lookups, Configuration | Phase 1 | P3 |
| 4 | User Registration + Role Management + Keycloak sync | Phase 2+3 | P2 |
| 5 | Candidate Pipeline (CRUD, status, escalation, prescreen) | Phase 4 | P1 |
| 6 | Interview Scheduling (slots, bulk upload, Teams) | Phase 5 | P1 |
| 7 | Feedback (forms, submission, PDF, S3) | Phase 6 | P2 |
| 8 | Reports & Analytics (Excel, supply/demand/bench screens) | Phase 5 | P2 |
| 9 | Alerts & Notifications (APScheduler + SES) | Phase 5+7 | P2 |
| 10 | File Management (S3 images, MSG, manuals) | Phase 5 | P2 |
| 11 | Referral Management | Phase 5 | P3 |
| 12 | Workflow & Offer Management | Phase 5 | P3 |
| 13 | Recruiter Dashboard | Phase 5+6 | P2 |
| 14 | Admin Master Data CRUD | Phase 3 | P2 |
| 15 | OpenAPI contract + quality gates (all phases) | All | Infrastructure |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Background jobs | APScheduler (embedded) | No Celery/Redis dependency; fits enterprise-internal load |
| DB schema | Named schema `smarthire` in `smarthiredb001` | Isolates platform tables; cleaner multi-env separation |
| JWT secret | `JWT_SECRET` env var | Constitution §V; original Java impl hardcoded it — fixed |
| Keycloak SSL | Configurable via `KEYCLOAK_VERIFY_SSL` env var (default `true`) | Original impl globally disabled SSL — security regression fixed |
| Response shape | `ResponseDto` wrapper on all endpoints | API compatibility with existing contract (`{response, message, exception, result}`) |
| Async SQLAlchemy | `asyncpg` driver + async sessions | Consistent with FastAPI async-first; better concurrency under load |
| Test isolation | Separate test schema via `SMARTHIRE_TEST_SCHEMA` env var | Integration tests MUST NOT run against production (constitution §III) |

---

## Complexity Tracking

> No constitution violations. No additional justification required.

---

## Verification Checklist

- [ ] `docker-compose up -d db && alembic upgrade head` — all tables created in `smarthire` schema
- [ ] `alembic downgrade base` — all tables dropped cleanly
- [ ] `pytest --cov=src --cov-fail-under=80` — overall coverage ≥ 80%
- [ ] `ruff check src/ && mypy --strict src/` — zero errors
- [ ] `pytest tests/contract/test_openapi.py` — every route matches `openapi.yaml`
- [ ] Smoke: `POST /login/validateSession`, `POST /candidateData/saveCandidateData`, `GET /prescreen/updatePrescreenDetails` (no token → 200)
- [ ] SC-002: 500-row slot Excel upload < 30 s
- [ ] SC-003: Search with 5 filters < 3 s
- [ ] SC-006: Excel report for 12 months data < 10 s
- [ ] SC-007: Protected endpoint without token → 401; `/prescreen/` without token → 200
