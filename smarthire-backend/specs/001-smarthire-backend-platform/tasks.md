---
description: "Task list for SmartHire Backend Platform implementation"
---

# Tasks: SmartHire Backend Platform

**Feature Branch**: `001-smarthire-backend-platform`
**Input**: Design documents from `specs/001-smarthire-backend-platform/`
**Prerequisites**: plan.md ✓ | spec.md ✓ | data-model.md ✓ | contracts/openapi.yaml ✓ | research.md ✓ | quickstart.md ✓

**Tests**: Test tasks are included — the plan's constitution mandates test-first (`pytest --cov-fail-under=80`).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1–US9 map to spec.md stories)
- Exact file paths are included in every task description

## Path Conventions

- **Source**: `src/smarthire/` (Python package root)
- **Tests**: `tests/unit/`, `tests/integration/`, `tests/contract/`
- **Migrations**: `alembic/versions/`
- **API contract**: `specs/001-smarthire-backend-platform/contracts/openapi.yaml`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, packaging, containerisation, and tooling

- [X] T001 Create `pyproject.toml` with all Python dependencies: FastAPI, uvicorn[standard], SQLAlchemy 2.x, asyncpg, alembic, pydantic-settings, python-jose[cryptography], boto3, httpx, openpyxl, reportlab, APScheduler, pytest, pytest-cov, pytest-asyncio, ruff, black, mypy
- [X] T002 Create `Dockerfile` using `python:3.11-slim` base with non-root user, COPY pyproject.toml + src/, install deps, EXPOSE 8083, ENTRYPOINT uvicorn
- [X] T003 [P] Create `docker-compose.yml` with PostgreSQL 15 service, volume mount, and init SQL creating `smarthire` schema in `smarthiredb001`
- [X] T004 [P] Create `.env.example` documenting all required environment variables: DATABASE_URL, SMARTHIRE_DB_SCHEMA, JWT_SECRET, JWT_ALGORITHM, KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_ADMIN_USERNAME, KEYCLOAK_ADMIN_PASSWORD, KEYCLOAK_VERIFY_SSL, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME, S3_FEEDBACK_BUCKET, SES_FROM_ADDRESS, MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, APP_PORT, LOG_LEVEL
- [X] T005 [P] Configure ruff (rules: E, W, F, I, UP), black, and mypy --strict in `pyproject.toml` `[tool.ruff]`, `[tool.black]`, `[tool.mypy]` sections
- [X] T006 Create `src/smarthire/__init__.py` and `src/smarthire/main.py` (FastAPI app factory with lifespan stub, include_router placeholders, CORS middleware)
- [X] T007 Create `src/smarthire/config.py` (pydantic-settings `BaseSettings` reading all env vars from T004; expose singleton `get_settings()`)
- [X] T008 Create `src/smarthire/database.py` (async SQLAlchemy engine using asyncpg; `AsyncSession` factory; `search_path=smarthire` connection arg; `get_db_session` async dependency)
- [X] T009 [P] Initialise Alembic: `alembic init alembic`; edit `alembic/env.py` to wire async SQLAlchemy metadata, `smarthire` schema, and `include_schemas=True`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: All SQLAlchemy models, the initial Alembic migration, shared schemas, auth utilities, external-service clients, background scheduler wiring, and test infrastructure. **MUST complete before any user story work begins.**

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T010 Create `src/smarthire/models/base.py` (`DeclarativeBase` subclass + `AuditMixin` adding `created_by VARCHAR(100)`, `created_date TIMESTAMP`, `updated_by VARCHAR(100)`, `updated_date TIMESTAMP` to every model)
- [X] T011 [P] Create `src/smarthire/models/masters.py` with all 30+ master/lookup tables inheriting `AuditMixin`: `grade_master`, `bu_master`, `practice_master`, `technology_master`, `tower_master`, `skill_group_master`, `status_master`, `role_master`, `account_master`, `market_unit`, `location_master`, `interview_type_master`, `source_master`, `rejection_reason_master`, `decline_reason_master`, `data_type_master`, `notification_type_master`, `bench_status_master`, `referral_bu_master`, `referral_technology_master`, `referral_certifications_master`, `skill_group_dl_master` (DL email per skill group), `tower_lead_master`
- [X] T012 [P] Create `src/smarthire/models/employee.py` (`EmployeeMaster`, `EmployeeRoleDetails`, `EmployeeTechnologyDetails` — all columns and FK relationships as specified in data-model.md §7–9)
- [X] T013 [P] Create `src/smarthire/models/candidate.py` (`CandidateDetail`, `CandidateInfoDetail`, `CandidateStatus`, `CandidateSkill`, `CandidatePanelDetails`, `CandidateComments` — all columns and FK relationships as specified in data-model.md §1–6)
- [X] T014 [P] Create `src/smarthire/models/calendar.py` (`InterviewerCalendarDetails`, `RecruiterCalendarDetails` — all columns including `booking_status`, `feedback_status`, `reminder_sent_flag`, `meeting_link` as specified in data-model.md §10–11)
- [X] T015 [P] Create `src/smarthire/models/feedback.py` (`FeedbackFormDetails`, `FeedbackTemplate`, `FeedbackFormPlaceholder`, `InterviewerFeedback` — all columns including `response_json JSONB`, `pdf_s3_key` as specified in data-model.md §12–14)
- [X] T016 [P] Create `src/smarthire/models/demand.py` (`DemandBatch`, `DemandData` — all columns including `demand_type`, `role_start_date`, `quantity` as specified in data-model.md §15)
- [X] T017 [P] Create `src/smarthire/models/bench.py` (`BenchBatch`, `BenchData` — all columns including `bench_start_date`, `status_id` as specified in data-model.md §16)
- [X] T018 [P] Create `src/smarthire/models/referral.py` (`ReferralCandidateInfo`, `ReferralCandidateSkill`, `ReferralCandidateCertification` — all columns as specified in data-model.md §17)
- [X] T019 Create `alembic/versions/0001_initial_schema.py` (forward migration: `CREATE SCHEMA IF NOT EXISTS smarthire`; create all tables from T010–T018 in dependency order; rollback: drop all tables, drop schema)
- [X] T020 [P] Create `src/smarthire/schemas/common.py` (`ResponseDto` Pydantic model with fields: `response: list[Any]`, `message: str`, `exception: str | None`, `result: str | None`; generic helper `ok_response()` and `error_response()`)
- [X] T021 Create `src/smarthire/auth/__init__.py` and `src/smarthire/auth/jwt.py` (`verify_token(token: str) -> dict`: decode HS256 JWT using `JWT_SECRET` from settings; raise `HTTPException(401)` on `JWTError` or expiry; never log the raw token)
- [X] T022 Create `src/smarthire/auth/dependencies.py` (`get_current_user` FastAPI `Depends` factory that extracts `Authorization: Bearer …` header, calls `verify_token`, and returns decoded payload)
- [X] T023 Wire JWT dependency as global router-level security in `src/smarthire/main.py`; add explicit path exclusions for `/prescreen/**`, `/health`, `/docs`, `/openapi.json`, `/redoc`; integrate `AsyncIOScheduler` lifespan
- [X] T024 [P] Create `src/smarthire/utils/s3_client.py` (`S3Client` wrapping boto3: `upload_file(bucket, key, data, max_bytes=10_485_760)`, `download_file(bucket, key) -> bytes`, `generate_presigned_url(bucket, key, expiry_seconds=3600)`; use `asyncio.get_event_loop().run_in_executor` threadpool for async compatibility)
- [X] T025 [P] Create `src/smarthire/utils/ses_client.py` (`SESClient` wrapping boto3: `send_email(to, subject, body_text, body_html=None, attachments: list[tuple[str, bytes]]=None)` supporting plain-text, HTML, and Excel MIME attachments)
- [X] T026 [P] Create `src/smarthire/utils/excel_parser.py` (base `parse_workbook(file_bytes) -> tuple[list[dict], list[dict]]` returning `(valid_rows, error_rows)` with row-number in errors; individual parsers call this)
- [X] T027 [P] Create `src/smarthire/utils/excel_exporter.py` (base `create_workbook(headers: list[str], rows: list[dict]) -> bytes` using openpyxl; freezes header row; returns workbook as bytes for streaming)
- [X] T028 [P] Create `src/smarthire/utils/pdf_generator.py` (reportlab skeleton: `PdfGenerator` class with `create_pdf(title, sections: list[dict]) -> bytes` building structured A4 PDF; ready for feedback content injection in T072)
- [X] T029 Create `src/smarthire/tasks/scheduler.py` (`get_scheduler() -> AsyncIOScheduler`; `register_all_jobs(scheduler, settings)` placeholder; startup/shutdown lifecycle functions consumed by `main.py` lifespan)
- [X] T030 Create `tests/conftest.py` (async DB session fixture: creates isolated schema from `SMARTHIRE_TEST_SCHEMA` env var, yields `AsyncSession`, drops schema after test; `pytest.ini` or `pyproject.toml` `asyncio_mode=auto`; `override_get_db` fixture)
- [X] T031 [P] Create `tests/contract/test_openapi.py` (load `specs/001-smarthire-backend-platform/contracts/openapi.yaml`; use FastAPI `app.routes` to collect all registered paths; assert every app route path appears in `paths` of openapi.yaml and vice versa)
- [X] T032 [P] Create `src/smarthire/repositories/lookup_repo.py` (`LookupRepository`: async `get_all(model_class)`, `get_by_id(model_class, id)`, `get_active(model_class)` generic helpers using SQLAlchemy `select()` — used by all stories)

**Checkpoint**: Foundation ready — all models exist, Alembic migration is runnable, auth utilities are in place, external clients are stubbed, test infrastructure is ready. User story phases can now proceed.

---

## Phase 3: User Story 7 — Authentication & Session Security (Priority: P1)

**Goal**: Every protected endpoint is secured behind JWT validation; duplicate active sessions are detected; `/prescreen/**` remains public.

**Independent Test**: A user with a valid token accesses `/login/validateSession` → 200; expired token → 401; `/health` with no token → 200; duplicate session returns policy-driven response.

- [X] T033 [US7] Create `src/smarthire/schemas/auth.py` (`ValidateSessionRequest(userName: str)` Pydantic model; `SessionValidationResponse` with session status and user details)
- [X] T034 [US7] Create `src/smarthire/utils/keycloak_client.py` (`KeycloakClient` using httpx async: `get_user_sessions(user_id) -> list[dict]`; `count_active_sessions(username) -> int`; respects `KEYCLOAK_VERIFY_SSL` setting; raises `HTTPException(503)` on Keycloak unavailability)
- [X] T035 [US7] Create `src/smarthire/services/keycloak_session.py` (`validate_session(username: str) -> SessionValidationResponse`: call Keycloak Admin API, detect duplicate sessions; return `{status: "ok" | "duplicate" | "not_found"}`)
- [X] T036 [US7] Create `src/smarthire/routers/auth.py` (POST `/login/validateSession` → calls `keycloak_session.validate_session`, returns `ResponseDto`; GET `/health` → 200 `{"status": "ok"}` with no auth required)
- [X] T037 [P] [US7] Create `src/smarthire/routers/keycloak.py` (GET `/keycloak/getUserDetails`; GET `/keycloak/getUserRoles` — proxy calls to Keycloak Admin API via `keycloak_client`)
- [X] T038 [P] [US7] Write `tests/unit/test_jwt.py` (unit tests: valid HS256 token → decoded payload; expired token raises `HTTPException(401)`; malformed string raises `HTTPException(401)`; missing Bearer header raises `HTTPException(401)`)
- [X] T039 [US7] Write `tests/integration/test_auth.py` (integration tests: POST `/login/validateSession` with valid token → 200; GET `/health` without token → 200; GET protected endpoint without token → 401; GET `/prescreen/updatePrescreenDetails` without token → 200)

**Checkpoint**: Authentication fully operational. All P1 stories can be built on a secure foundation.

---

## Phase 4: User Story 1 — Candidate Pipeline Management (Priority: P1) 🎯 MVP

**Goal**: Recruiters create candidate records individually or via bulk Excel, transition statuses through the full pipeline lifecycle, add comments, and search with paginated filtered results.

**Independent Test**: A recruiter can POST a candidate, trigger a status change, add a comment, search with 5 filters, and GET the candidate history — each returning `ResponseDto`-wrapped data.

- [X] T040 [US1] Create `src/smarthire/schemas/candidate.py` (`CandidateDataRequest`, `CandidateSearchRequest`, `CandidateResponse`, `StatusChangeRequest(candidateId, statusId)`, `CommentRequest(candidateId, commentText, attachmentFileBytes?)` Pydantic models matching `openapi.yaml` schemas)
- [X] T041 [P] [US1] Create `src/smarthire/repositories/candidate_repo.py` (async: `create_candidate()`, `get_candidate_by_id()`, `search_candidates(filters, page, size) -> tuple[list, int]` with 5-filter parameterised query, `close_open_status()`, `insert_status()`, `add_comment()`, `get_comments()`, `get_status_history()`)
- [X] T042 [US1] Create `src/smarthire/services/candidate_service.py` (orchestration: `save_candidate()`, `update_candidate_status()` enforcing single-active-status rule — close open record then insert new, `add_comment_with_attachment()` calling `s3_client`, `search_candidates()` delegating to repo)
- [X] T043 [US1] Implement L3 escalation rule in `src/smarthire/services/candidate_service.py`: when status transitions to L2 Select, check `CandidateDetail.total_exp >= 10` OR `CandidateSkill` contains architect-level technology; if true, set `CandidateInfoDetail.l3_escalation_flag = true` (FR-007)
- [X] T044 [P] [US1] Implement `parse_candidate_excel(file_bytes) -> tuple[list[CandidateDataRequest], list[dict]]` in `src/smarthire/utils/excel_parser.py` (parse bulk Excel; validate required fields; return valid rows + row-level errors with row number)
- [X] T045 [P] [US1] Create `src/smarthire/schemas/lookup.py` (`LookupItem(id, name)`, `SkillDLRequest(technologyId, dlEmail)`, screen-specific dropdown response models)
- [X] T046 [US1] Create `src/smarthire/services/lookup_service.py` (thin service wrapping `lookup_repo.get_active()` for all master tables; `get_dropdowns_for_screen(screen_id)` returning filtered subset)
- [X] T047 [US1] Create `src/smarthire/routers/lookup.py` (GET `/lookup/getDropdownsForScreen/{screenId}`; GET `/lookup/getSkillList`; GET `/lookup/getMarketUnits`; GET `/lookup/getPracticeList`; GET `/lookup/getAccountList`; GET `/lookup/getSourceList`)
- [X] T048 [US1] Create `src/smarthire/routers/candidate.py` (POST `/candidateData/saveCandidateData`; POST `/candidateData/saveMultipleCandidates` with Excel file upload; POST `/candidateData/getCandidateData` (search); GET `/candidateData/getCandidateDetails/{id}`; POST `/candidateData/updateCandidateStatus`; POST `/candidateData/saveComment`; GET `/candidateData/getComments/{id}`; GET `/candidateData/downloadResume/{id}` streaming S3 presigned URL)
- [X] T049 [US1] Write `tests/integration/test_candidate.py` (integration tests: create candidate → status 200, id returned; status change → old record closed, new record active; add comment with attachment; search with skill + status + tower + source + date range → paginated result; bulk upload 3 valid + 1 invalid row → partial success + row error returned)

**Checkpoint**: User Story 1 fully functional — candidate lifecycle from intake through status history and comments is independently trackable.

---

## Phase 5: User Story 2 — Interview Scheduling & Slot Management (Priority: P1)

**Goal**: Recruiters search interviewer availability, book/reschedule/cancel slots, upload bulk availability via Excel, and receive Teams meeting links for virtual interviews.

**Independent Test**: A recruiter can POST a free slot, search for available slots, book one for a candidate, reschedule, and delete — calendar state reflecting each transition immediately.

- [X] T050 [US2] Create `src/smarthire/schemas/calendar.py` (`FreeSlotRequest`, `InterviewSlotRequest`, `RescheduleRequest`, `SlotResponse`, `BulkSlotUploadResponse(successCount, errorRows)` Pydantic models matching `openapi.yaml`)
- [X] T051 [P] [US2] Create `src/smarthire/repositories/calendar_repo.py` (async: `create_free_slot()`, `get_available_slots(technology_id, from_date, to_date, bu_id) -> list`, `book_slot(calendar_id, candidate_id, recruiter_id)`, `reschedule_slot(calendar_id, new_date, new_start_time)`, `cancel_slot(calendar_id)`, `get_recruiter_slots(recruiter_id)`, `get_slot_details(calendar_id)`)
- [X] T052 [US2] Create `src/smarthire/services/interview_service.py` (orchestrate slot lifecycle; enforce `booking_status` transitions: Free → Booked, Booked → Rescheduled, Booked → Cancelled; call `teams_client.create_online_meeting()` when `participation_type == "Virtual"`)
- [X] T053 [US2] Create `src/smarthire/utils/teams_client.py` (`TeamsClient` using httpx async: `get_access_token()` via client-credentials OAuth2 using `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`; `create_online_meeting(subject, start_datetime, end_datetime) -> str` returning Teams join URL)
- [X] T054 [US2] Implement `parse_slot_excel(file_bytes) -> tuple[list[FreeSlotRequest], list[dict]]` in `src/smarthire/utils/excel_parser.py` (validate required fields per row; return valid rows + row-level error list; must handle 500-row file within 30 s — SC-002)
- [X] T055 [US2] Create `src/smarthire/routers/slot.py` (POST `/slot/addFreeSlot`; POST `/slot/bulkUploadSlots` with Excel file; POST `/slot/bookSlot`; POST `/slot/rescheduleSlot`; DELETE `/slot/deleteSlot/{id}`; POST `/slot/getAvailableSlots`; GET `/slot/getRecruiterSlots/{recruiterId}`)
- [X] T056 [P] [US2] Create `src/smarthire/routers/interviewer.py` (GET `/interviewer/getInterviewerList` filtered by skill/BU; GET `/interviewer/getInterviewerSlots/{id}`; GET `/interviewer/getSlotDetails/{slotId}`)
- [X] T057 [P] [US2] Create `src/smarthire/routers/recruiter.py` (GET `/recruiter/getRecruiterList`; GET `/recruiter/getRecruiterDetails/{id}`)
- [X] T058 [P] [US2] Create `src/smarthire/routers/download.py` (GET `/downloadExcel/bulkSlotTemplate` returning pre-formatted XLSX template for bulk slot upload)
- [X] T059 [US2] Write `tests/integration/test_scheduling.py` (integration tests: create free slot; search by skill → slot found; book slot → status Booked; reschedule → new date persisted; cancel → slot removed; bulk upload 3 valid + 1 invalid → correct counts)

**Checkpoint**: User Story 2 fully functional — complete slot lifecycle including bulk upload and Teams meeting link generation.

---

## Phase 6: User Story 6 — User Registration & Role Management (Priority: P2)

**Goal**: Admins register employees, assign roles and skills, and update attributes. Newly registered interviewers appear in the interviewer dropdown.

**Independent Test**: An admin can POST a new employee with interviewer role + skill, and GET `/interviewer/getInterviewerList` returns that employee.

- [X] T060 [US6] Create `src/smarthire/schemas/employee.py` (`EmployeeRegistrationRequest`, `EmployeeUpdateRequest`, `EmployeeResponse`, `RoleAssignmentRequest`, `TechnologyAssignmentRequest` Pydantic models)
- [X] T061 [P] [US6] Create `src/smarthire/repositories/employee_repo.py` (async: `create_employee()`, `update_employee()`, `get_by_email()`, `get_by_id()`, `get_all_active()`, `assign_role(employee_id, role_id)`, `assign_technology(employee_id, technology_id)`, `deactivate_employee(employee_id)`)
- [X] T062 [US6] Create `src/smarthire/services/employee_service.py` (orchestrate `register_employee()`: create `EmployeeMaster`, insert `EmployeeRoleDetails`, insert `EmployeeTechnologyDetails`, call `ses_client.send_email()` with welcome message; `update_employee()`: update changed fields without touching unrelated records)
- [X] T063 [US6] Create `src/smarthire/routers/register.py` (POST `/register/saveEmployeeData`; POST `/register/updateEmployeeData`; GET `/register/getEmployeeByEmail`)
- [X] T064 [P] [US6] Create `src/smarthire/routers/role.py` (GET `/role/getAllRoles`; POST `/role/assignRole`; GET `/users/getUsersByRole`)
- [X] T065 [P] [US6] Extend `src/smarthire/routers/admin.py` with user management endpoints (GET `/admin/getEmployeeList`; GET `/admin/getEmployeeDetails/{id}`; POST `/admin/deactivateEmployee`)
- [X] T066 [US6] Write `tests/integration/test_employee.py` (integration tests: register employee → 200, id returned; assign role; assign technology; update grade; GET by email → returns record; GET interviewer list → newly registered interviewer present)

**Checkpoint**: User Story 6 functional — employee onboarding and role assignment operational.

---

## Phase 7: User Story 3 — Feedback Collection & Form Management (Priority: P2)

**Goal**: Interviewers retrieve versioned technology-specific feedback forms, submit structured responses, and recruiters download PDF summaries per interview slot.

**Independent Test**: An interviewer can GET the correct form for a technology/practice pair, POST a feedback submission for a calendar slot, and the slot's `feedback_status` is updated; a recruiter can GET a PDF presigned URL for that slot.

- [X] T067 [US3] Create `src/smarthire/schemas/feedback.py` (`FeedbackFormCreateRequest`, `FeedbackSubmitRequest(interviewerCalendarId, feedbackStatus, rating, responseJson)`, `FeedbackFormNode` (hierarchical with children list), `FeedbackResponse` Pydantic models)
- [X] T068 [P] [US3] Create `src/smarthire/repositories/feedback_repo.py` (async: `get_active_template(technology_id, practice_id) -> FeedbackTemplate | None`; `get_form_tree(template_id) -> list[FeedbackFormDetails]`; `submit_feedback(data) -> InterviewerFeedback`; `update_slot_feedback_status(calendar_id, status)`; `get_feedback_by_slot(calendar_id)`)
- [X] T069 [US3] Create `src/smarthire/services/feedback_service.py` (`get_form_for_technology(technology_id, practice_id)`: resolve latest active template version, build hierarchical tree of `FeedbackFormDetails` nodes; `submit_feedback()`: save `InterviewerFeedback`, update `InterviewerCalendarDetails.feedback_status` and `feedback_submitted_flag`)
- [X] T070 [US3] Implement `create_feedback_pdf(feedback: InterviewerFeedback, candidate_name: str) -> bytes` in `src/smarthire/utils/pdf_generator.py` (reportlab: render A4 PDF with interviewer info, structured responses from `response_json`, rating, `feedback_status`; return bytes for S3 upload)
- [X] T071 [US3] Extend `src/smarthire/services/feedback_service.py` with `generate_and_store_pdf(feedback_id)`: call `pdf_generator.create_feedback_pdf()`, upload to S3 via `s3_client`, update `InterviewerFeedback.pdf_s3_key`
- [X] T072 [US3] Create `src/smarthire/routers/feedback_form.py` (GET `/feedbackForm/getForm/{technologyId}/{practiceId}`; POST `/feedbackForm/submitFeedback`; GET `/feedbackForm/getFeedbackBySlot/{slotId}`; POST `/feedbackForm/createTemplate` admin endpoint)
- [X] T073 [P] [US3] Create `src/smarthire/routers/files.py` (GET `/pdfDownload/{slotId}` → resolve `pdf_s3_key` for slot, return `s3_client.generate_presigned_url()`; POST `/image/uploadProfileImage` → upload to S3 with 10 MB limit; GET `/image/{s3Key}` → presigned URL; GET `/msg/{s3Key}` → presigned URL)
- [X] T074 [US3] Write `tests/integration/test_feedback.py` (integration tests: GET form for technology returns hierarchical nodes; POST submit feedback → slot feedback_status updated; GET feedback by slot; GET PDF endpoint returns presigned URL with `pdf_s3_key` populated)

**Checkpoint**: User Story 3 functional — complete feedback lifecycle from form retrieval through PDF generation.

---

## Phase 8: User Story 5 — Reports & Analytics (Priority: P2)

**Goal**: Managers download filtered Excel pipeline reports; PMO views supply/demand/bench screens with aggregated data; empty filter results return empty report rather than error.

**Independent Test**: A manager POSTs a report request with date range + skill filter and receives a populated XLSX file; a request yielding no rows returns an empty XLSX with headers, not an error.

- [X] T075 [US5] Create `src/smarthire/schemas/reports.py` (`ReportFilterRequest(fromDate, toDate, technologyId?, interviewTypeId?, buId?, accountId?, page?, size?)`, `ReportRow`, `ReportResponse` Pydantic models)
- [X] T076 [P] [US5] Create `src/smarthire/services/report_service.py` (`get_pipeline_report(filters) -> list[ReportRow]`: join `InterviewerCalendarDetails + CandidateDetail + InterviewerFeedback` on filter criteria; return empty list (not error) when no rows; target < 10 s for 12 months — SC-006)
- [X] T077 [P] [US5] Create `src/smarthire/services/analytics_service.py` (`get_supply_demand_summary(filters) -> dict`: aggregate `DemandData` and `BenchData` counts by technology/skill group; `get_pipeline_metrics() -> dict`: counts by status)
- [X] T078 [US5] Implement `generate_pipeline_report_excel(rows: list[ReportRow]) -> bytes` in `src/smarthire/utils/excel_exporter.py` (openpyxl: write header row + data rows; format date columns; freeze top row; return workbook bytes)
- [X] T079 [US5] Create `src/smarthire/routers/reports.py` (POST `/report/getInterviewReport` → stream XLSX response; POST `/report/getSupplyDemandReport`; GET `/report/getPipelineSummary`)
- [X] T080 [P] [US5] Create `src/smarthire/routers/supply.py` (POST `/supplyScreen/getSupplyData`; POST `/supplyScreen/uploadBenchData` with Excel file using `parse_bench_excel()`)
- [X] T081 [P] [US5] Create `src/smarthire/routers/demand.py` (POST `/demandScreen/getDemandData`; POST `/demandUpload/uploadDemand` with Excel file using `parse_demand_excel()`)
- [X] T082 [P] [US5] Create `src/smarthire/routers/bench.py` (POST `/benchScreen/getBenchData`; POST `/benchUpload/uploadBench` with Excel file)
- [X] T083 [P] [US5] Create `src/smarthire/routers/dashboard.py` (GET `/dashboard/getRecruiterDashboard`; GET `/dashboard/getPipelineMetrics` — calls `analytics_service`)
- [X] T084 [US5] Write `tests/integration/test_reports.py` (integration tests: POST report with date + skill filter → XLSX response with content-type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`; empty filter → empty XLSX rows not 404/500; supply/demand upload → counts returned)

**Checkpoint**: User Story 5 functional — Excel reports and supply/demand/bench screens operational.

---

## Phase 9: User Story 4 — Automated Alerts & SLA Notifications (Priority: P2)

**Goal**: APScheduler cron jobs automatically send aging SLA alerts to skill group DLs, interview reminders to interviewers, feedback reminders, and status notifications — without manual triggers. Manual HTTP trigger endpoints exist for operational flexibility.

**Independent Test**: Calling POST `/alerts/triggerAgingAlert` generates an Excel-attached SES email per skill group DL for groups with active non-terminal candidates; groups with no active candidates produce no email.

- [X] T085 [US4] Implement `generate_aging_report_excel(candidates_by_group: dict) -> dict[str, bytes]` in `src/smarthire/utils/excel_exporter.py` (per skill group: columns = candidate name, email, status, last_changed_date, aging_days; return map of DL email → workbook bytes)
- [X] T086 [US4] Create `src/smarthire/services/alert_service.py`:
  - `send_aging_sla_alerts()`: query `CandidateStatus` for active non-terminal status records, group by `skill_group_dl_master.dl_email`, generate Excel per group, send via `ses_client`, skip groups with 0 candidates
  - `send_interview_reminders()`: query `InterviewerCalendarDetails` where `interview_date` within alert window and `reminder_sent_flag = false`; send email, set flag
  - `send_feedback_reminders()`: query slots with `feedback_submitted_flag = false` past interview date; email interviewer
  - `send_feedback_status_notifications()`: query newly submitted feedback; notify assigned recruiter via `ses_client`
- [X] T087 [US4] Register cron jobs in `src/smarthire/tasks/scheduler.py` (daily 6 AM aging SLA cron; daily pre-interview reminder cron; daily feedback reminder cron; feedback status notification triggered on-demand from alert_service)
- [X] T088 [US4] Create `src/smarthire/routers/alerts.py` (POST `/alerts/triggerAgingAlert`; POST `/alerts/triggerInterviewReminder`; POST `/alerts/triggerFeedbackReminder`; POST `/alerts/triggerTowerAgingAlert` — all call corresponding `alert_service` methods)
- [X] T089 [US4] Write `tests/unit/test_alerts.py` (unit tests with mocked SES and DB session: aging alert with 2 skill groups → 2 SES calls with correct recipient; 0 candidates in group → 0 SES calls; feedback reminder → correct interviewer email addresses)

**Checkpoint**: User Story 4 functional — all automated alerts fire on schedule and are manually triggerable.

---

## Phase 10: User Story 9 — Lookup & Configuration Data (Priority: P3)

**Goal**: All frontend consumers receive consistent, screen-specific reference data from a single source. Admin can perform full CRUD on all master tables.

**Independent Test**: GET `/lookup/getDropdownsForScreen/{screenId}` called twice returns identical JSON; admin can POST a new grade entry and it appears in subsequent GET `/lookup/getGradeList` responses.

- [X] T090 [US9] Extend `src/smarthire/routers/lookup.py` with remaining endpoints: GET `/lookup/getTowerList`; GET `/lookup/getStatusList`; GET `/lookup/getRoleList`; GET `/lookup/getBuList`; GET `/lookup/getInterviewTypeList`; GET `/lookup/getGradeList`; GET `/lookup/getLocationList`; GET `/lookup/getNotificationTypeList`
- [X] T091 [P] [US9] Create `src/smarthire/routers/configuration.py` (GET `/configuration/getProperties` returns non-secret runtime config values as `ResponseDto`; admin-only POST `/configuration/updateProperty` for mutable runtime constants)
- [X] T092 [US9] Create `src/smarthire/services/admin_service.py` (`create_master_entry(table_name, name) -> LookupItem`; `update_master_entry(table_name, id, name)`; `deactivate_master_entry(table_name, id)` — generic operations for all master tables using `lookup_repo`)
- [X] T093 [P] [US9] Extend `src/smarthire/routers/admin.py` with master data CRUD endpoints (POST `/admin/saveMasterData`; PUT `/admin/updateMasterData/{id}`; DELETE `/admin/deactivateMasterData/{id}`) accepting `table_name` as path or body parameter
- [X] T094 [US9] Write `tests/unit/test_lookup.py` (unit tests: `get_all` for technology_master returns list of `LookupItem`; `get_dropdowns_for_screen` for candidate screen returns skills + statuses + towers; deactivated entry excluded from active results)

**Checkpoint**: User Story 9 functional — all lookup data served consistently; admin master-data CRUD operational.

---

## Phase 11: User Story 8 — Prescreen & Referral Intake (Priority: P3)

**Goal**: External systems POST prescreen updates without JWT; authenticated employees submit referrals with full master data support; `is_referral` flag and referrer name are captured.

**Independent Test**: POST `/prescreen/updatePrescreenDetails` without `Authorization` header returns 200; GET `/referralCandidate/getMasterData` returns all dropdown data; POST `/referralCandidate/saveReferralCandidate` creates a record with `is_referral = true`.

- [X] T095 [US8] Create `src/smarthire/schemas/referral.py` (`PrescreenUpdateRequest(prescreenId, recruiterName, recruiterEmail)`, `ReferralCandidateRequest`, `ReferralMasterDataResponse` Pydantic models)
- [X] T096 [P] [US8] Create `src/smarthire/repositories/referral_repo.py` (async: `update_prescreen_details(prescreen_id, recruiter_data)`, `create_referral_candidate(data) -> ReferralCandidateInfo`, `get_referral_master_data()`, `get_referral_candidates(page, size)`, `get_referral_by_id(id)`)
- [X] T097 [US8] Create `src/smarthire/services/referral_service.py` (`update_prescreen()`: find `CandidateDetail` by `prescreen_id`, update recruiter link fields; `create_referral()`: insert `ReferralCandidateInfo` with `is_referral = true` captured from request, upload resume to S3 if provided)
- [X] T098 [US8] Create `src/smarthire/routers/prescreen.py` (POST `/prescreen/updatePrescreenDetails` — **PUBLIC**, no JWT dependency; GET `/prescreen/getPrescreenDetails/{prescreenId}`)
- [X] T099 [P] [US8] Create `src/smarthire/routers/referral.py` (GET `/referralCandidate/getMasterData`; POST `/referralCandidate/saveReferralCandidate`; POST `/referralCandidate/uploadResume` with S3 upload and 10 MB limit; GET `/referralCandidate/getReferralCandidates`; GET `/referralCandidate/downloadResume/{id}`)
- [X] T100 [US8] Write `tests/integration/test_referral.py` (integration tests: POST prescreen update without token → 200; POST referral candidate → record has `is_referral = true` and `referrer_name` populated; GET master data → technologies + locations + BUs + certifications in response; resume upload endpoint rejects file > 10 MB)

**Checkpoint**: User Story 8 functional — prescreen public path operational; authenticated referral intake complete.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Workflow module, file management completeness, quality gates, and performance validation.

- [X] T101 [P] Create `src/smarthire/routers/workflow.py` (GET `/workflow/getWorkflowStatus/{candidateId}`; POST `/workflow/updateWorkflowStatus`; GET `/workflow/getOfferDetails/{candidateId}` — serves CandidateInfoDetail offer fields)
- [X] T102 [P] Write `tests/unit/test_files.py` (unit tests for `s3_client`: upload rejects files > 10 MB with `HTTPException(413)`; `generate_presigned_url` returns URL with expected domain; SES `send_email` constructs correct MIME structure for Excel attachment)
- [X] T103 Run `docker-compose up -d db && alembic upgrade head` — verify all tables created in `smarthire` schema; then `alembic downgrade base` — verify clean rollback (from plan.md verification checklist)
- [X] T104 [P] Run `ruff check src/ && mypy --strict src/` — resolve all reported errors to zero; fix any type stubs or `# type: ignore` usage
- [X] T105 [P] Run `pytest tests/contract/test_openapi.py` — every FastAPI route path must appear in `openapi.yaml` and vice versa; add missing routes or paths to resolve failures
- [X] T106 Run `pytest --cov=src --cov-fail-under=80` — identify modules below 80% coverage; add targeted unit or integration tests to reach the threshold
- [X] T107 [P] Validate SC-002: bulk upload 500-slot Excel via POST `/slot/bulkUploadSlots`; assert response time < 30 s (profile openpyxl loop if needed)
- [X] T108 [P] Validate SC-003: POST `/candidateData/getCandidateData` with 5 simultaneous filters on a seeded dataset; assert p95 < 3 s; add composite DB index on `candidate_status(candidate_id, status_end_date)` and `candidate_skill(candidate_id, technology_id)` if needed
- [X] T109 Validate SC-006: POST `/report/getInterviewReport` for 12-month date range on seeded dataset; assert response time < 10 s; add DB index on `interviewer_calendar_details(interview_date, technology_id, bu_id)` if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user story phases**
- **US7 Auth (Phase 3)**: Depends on Phase 2 — BLOCKS Phases 4–11 (all protected endpoints need auth)
- **US1 Candidate Pipeline (Phase 4)**: Depends on Phases 2–3; lookup service (T046–T047) must be in place
- **US2 Interview Scheduling (Phase 5)**: Depends on Phases 2–3; employee repo from Phase 6 used for interviewer lookups (can stub)
- **US6 User Registration (Phase 6)**: Depends on Phases 2–3
- **US3 Feedback (Phase 7)**: Depends on Phases 2–3, 5 (needs calendar slot IDs)
- **US5 Reports (Phase 8)**: Depends on Phases 2–3, 4, 5 (needs candidate + calendar data)
- **US4 Alerts (Phase 9)**: Depends on Phases 2–3, 4, 5, 7 (aging needs candidate; reminders need calendar; feedback notifications need feedback)
- **US9 Lookup & Config (Phase 10)**: Depends on Phase 2 (models already exist); extends work started in T032, T046
- **US8 Prescreen & Referral (Phase 11)**: Depends on Phases 2–3
- **Polish (Phase 12)**: Depends on all story phases being complete

### User Story Dependencies

| Story | Phase | Priority | Depends On |
|-------|-------|----------|-----------|
| US7 Auth | 3 | P1 | Foundation |
| US1 Candidate Pipeline | 4 | P1 | US7 |
| US2 Interview Scheduling | 5 | P1 | US7 |
| US6 User Registration | 6 | P2 | US7 |
| US3 Feedback | 7 | P2 | US7, US2 (calendar IDs) |
| US5 Reports | 8 | P2 | US7, US1, US2 |
| US4 Alerts | 9 | P2 | US7, US1, US2, US3 |
| US9 Lookup & Config | 10 | P3 | Foundation |
| US8 Prescreen & Referral | 11 | P3 | US7 |

### Within Each User Story

- Models (Phase 2) → Repositories → Services → Routers
- Each phase's tests must be written before or alongside implementation per constitution §III

### Parallel Opportunities

- All `[P]` tasks within a phase can run in parallel (different files)
- Model creation tasks T011–T018 can all run in parallel
- Utility creation tasks T024–T028 can all run in parallel
- Once Phase 2 completes, Phases 3–11 can be worked in parallel by different team members
- Within each user story: schema + repository tasks marked `[P]` can run simultaneously

---

## Parallel Example: User Story 1 (Candidate Pipeline)

```
Start │
      ├─ T040 Create candidate schemas ──────────────────────────────────┐
      ├─ T041 [P] Create candidate repo ─────────────────────────────────┤
      └─ T044 [P] Implement Excel parser ────────────────────────────────┤
                                                                          ▼
                                                           T042 Create candidate service
                                                                          │
                                                           T043 L3 escalation rule
                                                                          │
                                                    T045–T047 Schemas + lookup endpoints
                                                                          │
                                                           T048 Create candidate router
                                                                          │
                                                           T049 Integration tests
```

---

## Implementation Strategy

### MVP Scope (Recommended Phase 1 Delivery)

Implement **Phases 1–4** (Setup + Foundation + Auth + Candidate Pipeline) as the MVP:
- Delivers US7 (Auth) + US1 (Candidate Pipeline) — the two most critical P1 stories
- Provides a deployable, secured, testable backend with core business value
- Confirms Docker + Alembic + SQLAlchemy setup is correct before building the rest

### Incremental Delivery

| Sprint | Phases | Stories Delivered |
|--------|--------|------------------|
| 1 | 1–2 | Infrastructure only |
| 2 | 3–4 | US7 (Auth) + US1 (Candidate) — **MVP** |
| 3 | 5–6 | US2 (Scheduling) + US6 (Users) |
| 4 | 7–8 | US3 (Feedback) + US5 (Reports) |
| 5 | 9–11 | US4 (Alerts) + US9 (Lookup) + US8 (Prescreen) |
| 6 | 12 | Polish + performance validation |

