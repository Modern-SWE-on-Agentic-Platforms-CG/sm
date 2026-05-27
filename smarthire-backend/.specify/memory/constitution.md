<!--
SYNC IMPACT REPORT
==================
Version change: (new) → 1.0.0
Added sections:
  - Core Principles (5 principles)
  - Technology Stack Constraints
  - Development Workflow
  - Governance
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gates align with principles below
  ✅ .specify/templates/spec-template.md — Scope constrained to backend + PostgreSQL
  ✅ .specify/templates/tasks-template.md — Task phases reflect Python/PostgreSQL stack
Deferred TODOs:
  - RATIFICATION_DATE set to first-commit date 2026-05-26 (no prior record)
-->

# SmartHire Backend Constitution

## Core Principles

### I. Python-First Backend (NON-NEGOTIABLE)

All server-side application code MUST be written in Python (≥ 3.11).
No other backend runtime language (Java, Node.js, Go, etc.) is permitted.
Framework choice MUST be a Python web framework (FastAPI recommended; Django REST Framework
as alternative). Dependencies MUST be managed via `pyproject.toml` / `requirements.txt`.
Rationale: establishes a single, consistent runtime; enables uniform tooling, linting,
and type-checking across the entire codebase.

### II. PostgreSQL-Only Persistence

The sole persistence store is PostgreSQL. The canonical database name is `smarthiredb001`.
No other relational or NoSQL databases may be introduced without a constitution amendment.
All schema changes MUST be applied through a migrations framework (Alembic preferred).
Connection configuration MUST be supplied via environment variables; no connection strings
hardcoded in source files.
Rationale: single-database discipline minimises operational complexity and keeps data
ownership clear.

### III. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory. Tests MUST be written and reviewed before implementation code is committed.
The Red-Green-Refactor cycle is strictly enforced: failing test → minimal implementation →
refactor. Test coverage gate: overall line coverage MUST NOT drop below 80 %.
Test framework: `pytest`. Integration tests targeting `smarthiredb001` MUST use a dedicated
test schema or a containerised PostgreSQL instance; they MUST NOT run against production.
Rationale: prevents regressions in a complex, multi-module hiring workflow and ensures
every behaviour is verifiable.

### IV. API Contract Integrity

All HTTP endpoints MUST be defined in an OpenAPI 3.x contract before implementation begins.
Breaking changes (field removal, type changes, endpoint removal) MUST increment the API
major version and MUST be communicated to consumers before deployment.
Authentication is required on every endpoint except `/health` and `/docs`.
Rationale: downstream consumers (frontend, integrations) depend on stable contracts; early
contract publication enables parallel frontend/integration work.

### V. Security by Design

Authentication MUST use JWT (HS256 minimum) validated on every protected request; Keycloak
OAuth 2.0 / OIDC integration is the preferred identity provider.
Secrets (passwords, API keys, DB credentials) MUST be stored in environment variables or a
secrets manager — never in source code or committed config files.
All user-supplied inputs MUST be validated and sanitised before use in SQL queries (use ORM
parameterised queries; raw SQL with f-strings is forbidden).
OWASP Top 10 MUST be addressed at design review stage for every new feature.
Rationale: the platform handles personal candidate data; a breach would violate privacy
regulations and organisational trust.

## Technology Stack Constraints

| Layer | Constraint |
|---|---|
| Language | Python ≥ 3.11 |
| Web Framework | FastAPI (preferred) or Django REST Framework |
| ORM / Migrations | SQLAlchemy + Alembic (preferred) or Django ORM |
| Database | PostgreSQL — database name: `smarthiredb001` |
| Auth | JWT + Keycloak OAuth 2.0 / OIDC |
| File Storage | AWS S3 (via `boto3`) |
| Email | AWS SES (via `boto3`) |
| PDF Generation | `reportlab` or `weasyprint` |
| Excel | `openpyxl` |
| Calendar / Meetings | Microsoft Graph API |
| Testing | `pytest`, `pytest-cov`, `httpx` (async test client) |
| Linting / Formatting | `ruff`, `black`, `mypy` (strict mode) |
| Dependency Management | `pyproject.toml` + `pip` or `poetry` |
| Containerisation | Docker; `docker-compose` for local dev with PostgreSQL |
| Deployment | Cloud Foundry or container-native; environment-specific config via env vars |

Scope is **backend only**. Frontend UI code does not live in this repository.

## Development Workflow

- All new work MUST be developed on a feature branch (`feature/<###>-<slug>`).
- A feature branch MUST NOT be merged until:
  1. All tests pass (unit + integration).
  2. Coverage gate ≥ 80 % is satisfied.
  3. `ruff` and `mypy --strict` report zero errors.
  4. At least one peer code review is approved.
  5. OpenAPI contract for any new/changed endpoints is committed alongside the code.
- Database migrations (Alembic scripts) MUST be reviewed separately and applied in a
  controlled sequence; migration rollback scripts are REQUIRED for every forward migration.
- Environment parity MUST be maintained: local dev runs PostgreSQL in Docker using database
  name `smarthiredb001`; CI/CD uses an ephemeral containerised instance with the same name.
- Secrets MUST NEVER be committed; a `.env.example` file with placeholder values is
  maintained in the repository root.

## Governance

This constitution supersedes all other development practices and agreements for the
SmartHire Backend project. Any practice not addressed here defaults to Python community
best practices (PEPs).

**Amendment procedure**:
1. Open a pull request that modifies this file.
2. Provide a written rationale and list affected principles/sections.
3. Obtain approval from at least two maintainers.
4. Update `CONSTITUTION_VERSION` per semantic versioning rules.
5. Propagate changes to dependent templates and docs within the same PR.

**Versioning policy**: MAJOR — breaking principle change or removal; MINOR — new principle
or section; PATCH — clarification, wording, or typo fix.

**Compliance review**: Constitution compliance is checked at PR review time and during
quarterly architecture reviews.

**Version**: 1.0.0 | **Ratified**: 2026-05-26 | **Last Amended**: 2026-05-26
