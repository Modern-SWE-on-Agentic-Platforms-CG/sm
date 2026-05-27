# Research: SmartHire Backend Platform

**Phase 0 output for**: [plan.md](plan.md)
**Date**: 2026-05-26

This document records all design decisions made during Phase 0 research, resolving every
"NEEDS CLARIFICATION" item before Phase 1 design begins.

---

## Decision 1 — Web Framework

**Decision**: FastAPI

**Rationale**: FastAPI is the constitution-preferred framework. It provides native async
support (required for non-blocking S3/SES/Graph API calls), automatic OpenAPI 3.x
generation, and Pydantic-based request/response validation that satisfies FR-001 through
FR-030 input validation requirements. Its dependency-injection system enables clean
separation of auth middleware from business logic.

**Alternatives considered**:
- Django REST Framework — synchronous by default; heavier ORM coupling; slower startup;
  not preferred by constitution.

---

## Decision 2 — Database Schema Isolation

**Decision**: Named PostgreSQL schema `smarthire` inside database `smarthiredb001`

**Rationale**: The existing Node.js reference implementation uses environment-specific
schemas (`sr_dev`, `sr_prod`). Using a fixed schema name `smarthire` (with environment
differentiation via separate databases or search_path override) keeps all DDL portable and
avoids schema-name drift. Alembic's `include_schemas` + `version_locations` support this
cleanly.

**Alternatives considered**:
- `public` schema (default) — no isolation; name collisions with other applications on
  the same PostgreSQL instance.
- Per-environment schemas (`smarthire_dev`, `smarthire_prod`) — rejected: environment
  differentiation belongs in connection config, not schema naming.

---

## Decision 3 — Async vs Synchronous SQLAlchemy

**Decision**: SQLAlchemy 2.x async (`asyncpg` driver) with `AsyncSession`

**Rationale**: FastAPI is ASGI. Using async SQLAlchemy keeps the event loop unblocked
during DB I/O, which matters for concurrent scheduling lookups (SC-003: < 3 s with 5
filters) and bulk operations. `asyncpg` is the fastest PostgreSQL driver for Python.

**Alternatives considered**:
- Synchronous SQLAlchemy (`psycopg2`) in thread executor — adds complexity, wastes threads.
- Tortoise ORM — smaller ecosystem; less Alembic tooling.

---

## Decision 4 — Background Job Scheduler

**Decision**: APScheduler `AsyncIOScheduler` embedded in the FastAPI process lifespan

**Rationale**: The alert jobs (aging SLAs, reminders) are lightweight email dispatches
triggered on cron schedules. Running them inside the FastAPI process via APScheduler
eliminates the need for an external broker (Celery + Redis), simplifies deployment to a
single container, and integrates naturally with the async event loop.

**Alternatives considered**:
- Celery + Redis — adds two extra infrastructure components; justified only at higher job
  throughput (thousands of jobs/hour); overkill for ≤ 5 scheduled jobs here.
- External cron + HTTP trigger — acceptable but requires separate orchestration; manual
  HTTP trigger endpoints are still provided for operational flexibility.

---

## Decision 5 — JWT Validation Approach

**Decision**: `python-jose` library; HS256 algorithm; secret from `JWT_SECRET` env var;
validation on every request via a FastAPI `Depends` dependency.

**Rationale**: Constitution §V mandates secrets via env vars. The original Java
implementation used a hardcoded JWT secret (`2018-Smart%2Recruit%2@1234#`) — this is an
OWASP A07 (Identification and Authentication Failures) vulnerability. The Python
implementation reads the secret from the environment at startup. Validation is wired as a
global `app.dependency_overrides`-compatible dependency, with explicit path exclusions for
`/prescreen/**`, `/health`, `/docs`, `/openapi.json` (FR-001 + FR-026).

**Alternatives considered**:
- `PyJWT` — equivalent capability; `python-jose` chosen for broader algorithm support and
  Keycloak RS256 key compatibility if algorithm is upgraded later.
- Keycloak token introspection on every request — too slow (remote call per request);
  local signature validation is correct for HS256 shared-secret tokens.

---

## Decision 6 — Keycloak SSL Verification

**Decision**: SSL verification enabled by default; configurable via `KEYCLOAK_VERIFY_SSL`
env var (default `"true"`); `httpx` client created with `verify=settings.keycloak_verify_ssl`.

**Rationale**: The reference implementations (Java and Node.js) globally disabled SSL
verification (`TrustAllCerts`, `rejectUnauthorized: false`) — this is OWASP A02 (Crypto
Failures). The Python implementation restores secure defaults and allows operators to
disable only in isolated dev environments via explicit env var.

**Alternatives considered**:
- Hard-coded `verify=True` — safest but inflexible for self-signed dev certs. Env var
  approach satisfies both security and development convenience.

---

## Decision 7 — File Storage Strategy

**Decision**: AWS S3 via `boto3`; async-compatible via `asyncio.get_event_loop().run_in_executor(None, ...)` wrapper; max 10 MB enforced at router layer before S3 call; pre-signed URLs for secure read access.

**Rationale**: Constitution §V mandates secure cloud file store with pre-signed URLs
(FR-030). Boto3 is the canonical AWS SDK. Since boto3 is synchronous, it is wrapped in a
thread-pool executor to avoid blocking the async event loop. Max 10 MB matches the
documented constraint in the file management module.

**Alternatives considered**:
- `aiobotocore` — async boto3 wrapper; heavier dependency; boto3 threadpool is simpler
  and well-understood.
- Local filesystem — not suitable for Cloud Foundry / container-native deployment.

---

## Decision 8 — PDF Generation

**Decision**: `reportlab` (PDF Toolkit)

**Rationale**: Constitution explicitly lists `reportlab` as the PDF library. Feedback form
PDFs are structured documents with consistent layout (candidate name, technology,
questions/answers, ratings). ReportLab's Platypus framework handles multi-page forms well.
PDFs are stored in S3 bucket `smarthireprod` and the S3 URL persisted in the feedback
record.

**Alternatives considered**:
- `weasyprint` — HTML-to-PDF; constitution lists it as alternative. Rejected for feedback
  PDFs because ReportLab gives precise control without HTML/CSS overhead.

---

## Decision 9 — Excel Handling

**Decision**: `openpyxl` for both reading (bulk upload parsing) and writing (report
generation).

**Rationale**: Constitution mandates `openpyxl`. It supports `.xlsx` format, cell
formatting, multi-sheet workbooks, and streaming write mode (`write_only=True`) needed for
large reports (SC-006: 12 months data < 10 s).

**Alternatives considered**:
- `xlrd` / `xlwt` — legacy `.xls` only; not suitable.
- `pandas` — heavier dependency; unnecessary for structured column-based bulk operations.

---

## Decision 10 — Microsoft Teams Integration

**Decision**: Microsoft Graph API via `httpx` async client; OAuth2 client-credentials flow
to obtain access token; `POST /me/onlineMeetings` to create meeting link.

**Rationale**: FR-029 mandates Teams meeting link creation. Graph API is the only
Microsoft-supported programmatic interface. `httpx` is already a project dependency
(testing). Credentials (`MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`) stored in env
vars.

**Alternatives considered**:
- `msal` library — official Microsoft auth library; adds a dependency when httpx already
  handles the OAuth2 token exchange with minimal code.

---

## Decision 11 — Response Envelope

**Decision**: All endpoints return a `ResponseDto` wrapper:
```json
{
  "response": [ <data> ],
  "message": "SUCCESS",
  "exception": null,
  "result": null
}
```

**Rationale**: The existing API contract (`19-api-contract.md`) specifies this wrapper.
All consuming clients expect it. A global Pydantic model `ResponseDto[T]` with a generic
type parameter is used for type-safe serialisation. A global exception handler maps
`ValueError` → 400, `PermissionError` → 403, unhandled → 500, all returning `ResponseDto`
shape (never leaking stack traces).

---

## Decision 12 — Candidate Status History Pattern

**Decision**: Single active status record per candidate enforced by application logic:
when a new status is set, the previous open record's `status_end_date` is set to NOW()
before inserting the new record. No database-level unique constraint (to allow data
correction by admins).

**Rationale**: Matches the existing data model (`CANDIDATE_STATUS` table). Application-
level enforcement gives more informative error messages and allows batch corrections.

**Alternatives considered**:
- Partial unique index on `(candidate_id) WHERE status_end_date IS NULL` — enforces at DB
  level but makes bulk correction harder; not used.

---

## Decision 13 — Escalation Rule Implementation

**Decision**: Service-layer function `check_escalation(candidate_id)` called whenever a
candidate reaches "L2 Select" status. Rule: if `total_exp >= 10` OR the candidate's skill
contains the substring "ARCHITECT" (case-insensitive) → set `l3_escalation_flag = true`
on `CANDIDATE_PANEL_DETAILS`.

**Rationale**: Directly from FR-007. Implemented as a pure function (no DB side effect
beyond the flag update) so it is unit-testable without a database fixture.

---

## Decision 14 — Bulk Excel Upload Error Handling

**Decision**: Row-level validation; valid rows are persisted atomically in a single
transaction; error rows are collected and returned in the response with row number and
error description. The upload never partially commits (all-or-nothing per valid-row batch).

**Rationale**: Edge case from spec: "mix of valid and invalid rows → valid rows persisted,
error rows returned with row-level details." The transaction boundary ensures that a
database error on row 450 of 500 doesn't leave 449 orphaned records.

---

## Decision 15 — Test Schema Isolation

**Decision**: Integration tests connect to a dedicated schema `smarthire_test` (controlled
by `SMARTHIRE_TEST_SCHEMA=smarthire_test` env var in test `conftest.py`). All tests run
inside a transaction that is rolled back after each test function.

**Rationale**: Constitution §III: "integration tests targeting `smarthiredb001` MUST use a
dedicated test schema or a containerised PostgreSQL instance; they MUST NOT run against
production." Transaction rollback pattern keeps tests fast without re-running migrations.

---

## Security Review (OWASP Top 10)

| OWASP Risk | Mitigation |
|---|---|
| A01 Broken Access Control | `get_current_user` dependency on all routes except public; role checks in service layer |
| A02 Crypto Failures | JWT secret via env var; Keycloak SSL verification enabled; S3 pre-signed URLs (HTTPS) |
| A03 Injection | SQLAlchemy ORM only; no raw f-string SQL; all user input through Pydantic validators |
| A04 Insecure Design | Approval chain transition validation; prescreen endpoint network-restricted |
| A05 Security Misconfiguration | No debug stack traces in responses; `.env.example` has placeholder values only |
| A06 Vulnerable Components | `pyproject.toml` dependency pinning; `pip audit` in CI pipeline |
| A07 Auth Failures | JWT expiry validated; duplicate session detection; no hardcoded secrets |
| A08 Software Integrity | Docker images from official `python:3.11-slim`; no untrusted build steps |
| A09 Logging Failures | Structured logging via Python `logging`; no PII in log messages; auth failures logged |
| A10 SSRF | All external URLs (Keycloak, Graph API) come from env var config, not user input |
