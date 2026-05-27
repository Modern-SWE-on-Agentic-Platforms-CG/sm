# SmartHire — Intelligent Hiring Platform

> End-to-end recruitment management platform for enterprise consulting organisations.
> Coordinates the full hiring lifecycle: candidate intake → scheduling → feedback → approvals → reporting.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Tech Stack](#tech-stack)
3. [User Roles](#user-roles)
4. [Running the Application](#running-the-application)
5. [Demo Guide — All Roles & Flows](#demo-guide--all-roles--flows)
   - [Login](#step-1-open-the-application--login)
   - [Recruiter Flow](#recruiter-flow)
   - [Interviewer Flow](#interviewer-flow)
   - [Tower Lead Flow](#tower-lead-flow)
   - [PMO Flow](#pmo-flow)
   - [SPOC Flow](#spoc-flow)
   - [Admin Flow](#admin-flow)
6. [API Reference](#api-reference)
7. [Database](#database)
8. [Troubleshooting](#troubleshooting)

---

## Application Overview

SmartHire is a role-based hiring platform that manages the complete recruitment lifecycle:

```
Candidate Sourcing
      │
      ▼
Candidate Registration (SPOC / Referral)
      │
      ▼
Recruiter Pipeline (Shortlist → Schedule L1 Interview)
      │
      ▼
Interviewer Availability + Feedback Submission
      │
      ▼
Tower Lead Approval Queue (Approve / Reject / Hold)
      │
      ▼
PMO Oversight (Dashboard + Candidate Tracking)
      │
      ▼
Reports & Analytics (Rejection Ratio, Pipeline Metrics)
      │
      ▼
Admin Master Data Management (Tower / Skill / Source / BU)
```

### Core Features

| Feature | Description |
|---|---|
| Candidate Pipeline | Add, search, filter and track candidates by status |
| Interview Scheduling | Calendar-based slot management with availability tracking |
| Feedback Forms | Dynamic template-driven feedback with technical and behavioural ratings |
| Approval Workflow | Tower Lead queue for L2 candidate approvals |
| Referral Portal | SPOC can register referred candidates |
| Reports & Analytics | Pipeline metrics, rejection ratio charts, export to Excel |
| Master Data Admin | Manage towers, skills, skill groups, sources, BU accounts |
| To-Do List | Interviewer task tracker for pending feedback |

---

## Tech Stack

### Backend (`smarthire-backend`)

| Layer | Technology |
|---|---|
| Language | Python 3.11 |
| Framework | FastAPI (ASGI via Uvicorn) |
| ORM | SQLAlchemy 2.x (async) |
| Migrations | Alembic |
| Auth | JWT HS256 (python-jose) |
| Database | PostgreSQL 15 |
| Container | Docker + docker-compose |

### Frontend (`SmartHireUI`)

| Layer | Technology |
|---|---|
| Language | TypeScript 5 (strict) |
| Framework | React 18 |
| Build Tool | Vite 8 |
| State | Redux Toolkit + RTK Query |
| Router | React Router v7 |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Testing | Vitest + Playwright |

---

## User Roles

| Role | Login Button | Default Landing Page | Key Actions |
|---|---|---|---|
| **Recruiter** | `Recruiter` | `/booking/view` | Manage candidates, schedule interviews, view reports |
| **Interviewer** | `Interviewer` | `/booking/view` | Add availability slots, submit feedback |
| **Tower Lead** | `Tower Lead` | `/workflow` | Approve / reject / hold candidates |
| **PMO** | `PMO` | `/candidates` | View pipeline, track scheduling status |
| **SPOC** | `SPOC` | `/referral/form` | Submit referral candidates |
| **Admin** | `Admin` | `/admin/master-data` | Manage master data, view reports |

---

## Running the Application

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15 running on `localhost:5432`
- Database `smarthiredb001` with schema `smarthire` (see `docker/init.sql`)

### 1. Start the Backend (port 8050)

```powershell
cd smarthire-backend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Set environment variables
$env:APP_PORT="8050"
$env:DATABASE_URL="postgresql+asyncpg://postgres:niit%40123@localhost:5432/smarthiredb001"
$env:JWT_SECRET="smarthire-local-dev-secret-key-32chars"
$env:JWT_ALGORITHM="HS256"
$env:APP_ENV="development"
$env:SMARTHIRE_DB_SCHEMA="smarthire"

# Start server
uvicorn src.smarthire.main:application --host 0.0.0.0 --port 8050 --reload
```

Backend API: http://localhost:8050
Swagger UI: http://localhost:8050/docs

### 2. Start the Frontend (port 8051)

```powershell
cd SmartHireUI\app

# Install dependencies (first time only)
npm install

# Start dev server
$env:VITE_API_BASE_URL="http://localhost:8050"
$env:VITE_MOCK_AUTH="true"
npm run dev -- --port 8051
```

Frontend: http://localhost:8051

### 3. Using Docker (alternative)

```bash
# Start everything (PostgreSQL + Backend + Frontend)
docker-compose up -d
```

---

## Demo Guide — All Roles & Flows

> All demo steps use **http://localhost:8051** with the **DEMO LOGIN** buttons.
> No password required — click the role button to log in instantly.

---

### Step 1: Open the Application & Login

1. Open browser → go to **http://localhost:8051**
2. You will see the SmartHire landing page:

```
SmartHire — Intelligent Hiring Platform

DEMO LOGIN — CHOOSE A ROLE

[ Recruiter ]  [ PMO ]  [ Interviewer ]  [ Tower Lead ]  [ Admin ]  [ SPOC ]
```

3. Click the role button to log in as that role.
4. To switch roles: click **Logout** (top-right) → return to home → click another role.

---

### Recruiter Flow

**Goal**: Manage the candidate pipeline — add candidates, apply filters, schedule interviews, view reports.

#### A. View Candidate Pipeline

1. Login as **Recruiter**
2. Click **Candidates** in the left sidebar → lands on `/candidates`
3. You see the candidate table with columns: Name, Technology, Experience, Status, Actions
4. **Demo point**: Candidate data is loaded live from the database.

#### B. Filter Candidates by Status

1. On the Candidates page, click **Filters**
2. Select **Status → SHORTLISTED**
3. Click **Apply**
4. The table refreshes and shows only shortlisted candidates (e.g. Bob Smith)

#### C. Schedule an Interview

1. Click **Scheduling** in the sidebar → `/booking/view`
2. Click the **Interview Slots** tab to see available slots
3. Click **+ Add Slot** (on the calendar view) to create an availability slot
4. Fill in date, start time, end time → click **Save**
5. The slot appears on the calendar

#### D. View Reports

1. Click **Dashboard** in the sidebar
2. Navigate to **Reports** → `/reports`
3. You see:
   - Total candidates in pipeline
   - Rejection ratio pie chart (Selected / Rejected / On Hold)
   - Pipeline stage breakdown

---

### Interviewer Flow

**Goal**: Manage availability, view scheduled interviews, submit feedback.

#### A. View Interview Calendar

1. Login as **Interviewer**
2. Lands on `/booking/view` — Interview Slots calendar
3. Tabs: **Available**, **Booked**, **Interviewed**, **Panel Availability**
4. The calendar shows your scheduled slots for the current month

#### B. Add an Availability Slot

1. Click **Dashboard** → **+ Add Slot**
2. Fill in:
   - Date (e.g. `2026-06-15`)
   - Start Time (e.g. `10:00`)
   - End Time (e.g. `11:00`)
3. Click **Save Slot**
4. New slot appears in calendar with **Available** status

#### C. Submit Interview Feedback

1. Click **Feedback** in the sidebar → `/feedback`
2. (Or: from a booked slot, click **Submit Feedback**)
3. The feedback form loads with:
   - Candidate Info (name, technology, interview type, date/time)
   - Technical Ratings section (skill-by-skill ratings + remarks)
   - Behavioural Evaluation section
   - Overall section
4. Fill in:
   - **Overall Remark**: Select `Recommended`
   - **Feedback Status**: Select `SELECTED`
5. Click **Submit Feedback**
6. Form submits successfully → redirects to Dashboard

> **Demo URL shortcut** (to open feedback form directly):
> ```
> http://localhost:8051/feedback?slotId=1&candidateId=1&candidateName=Alice+Johnson&technology=Java&interviewType=L1&date=2026-06-10&start=10:00&end=11:00&interviewerName=John+Doe
> ```

#### D. View To-Do List

1. Click **To-Do List** in the sidebar → `/todo-list`
2. Shows pending feedback items assigned to the interviewer

---

### Tower Lead Flow

**Goal**: Review shortlisted candidates and approve/reject/hold them for next round.

#### A. View Approval Queue

1. Login as **Tower Lead**
2. Lands directly on `/workflow` — Approval Queue
3. You see the queue table:
   ```
   CANDIDATE  | TECHNOLOGY | BU | EXP (YRS) | STAGE      | STATUS  | SUBMITTED
   Bob Smith  |            |    | 3         | TOWER LEAD | PENDING | —
   ```
4. **Demo point**: Only SHORTLISTED candidates appear here.

#### B. Approve a Candidate

1. Click the **checkbox** next to Bob Smith
2. The **Take Action (1)** button becomes active
3. Click **Take Action**
4. A dialog appears:
   ```
   Approval Action
   Action will apply to 1 candidate.

   Decision:  ○ Approve  ○ Reject  ○ Hold
   Comments:  [text field]
   [ Confirm ]  [ Cancel ]
   ```
5. Select **Approve**
6. (Optional) Add a comment
7. Click **Confirm**
8. The queue refreshes — Bob Smith is removed (status updated to L2_SELECTED in DB)
9. Queue shows: "No candidates pending approval"

#### C. View History

1. On any candidate row, click **History**
2. See the full status progression for that candidate

---

### PMO Flow

**Goal**: Monitor the overall hiring pipeline and candidate scheduling status.

#### A. Dashboard Overview

1. Login as **PMO**
2. Lands on `/candidates` — Candidate Pipeline
3. See all candidates across all stages with Upload and Export options

#### B. Track Candidate Status

1. Browse the candidate table
2. Use **Filters** to narrow by:
   - Technology
   - Status (SHORTLISTED, L1_SCHEDULED, L1_SELECTED, etc.)
   - Experience range
3. Click **Export** to download candidate data as Excel

---

### SPOC Flow

**Goal**: Submit referral candidates into the hiring pipeline.

#### A. Submit a Referral

1. Login as **SPOC**
2. Lands directly on `/referral/form` — Submit Referral
3. Fill in the form:
   - **Candidate Name** (required)
   - **Contact Number** (required)
   - **Email** (required)
   - **Technology** / **Experience** / **Current CTC** / **Expected CTC**
   - **Notice Period**
   - **Referred By**
4. Click **Submit Referral**
5. Candidate is added to the recruiter pipeline

#### B. View Referral History

1. Click **Referrals** in the sidebar
2. See all previously submitted referrals and their current status

---

### Admin Flow

**Goal**: Manage master data (towers, skills, sources, BU accounts) used across the platform.

#### A. Manage Master Data

1. Login as **Admin**
2. Lands on `/admin/master-data`
3. Left panel shows categories:
   ```
   CATEGORIES
   Tower
   Skill
   Skill Group
   Source
   Vendor
   Role Comment
   Feedback Form
   PMO DL Skill Mapping
   BU Account
   ...
   ```
4. Click **Tower** → right panel shows:
   ```
   NAME
   Tower A
   Tower B
   Tower C
   ```
5. Click **Skill** → shows skill/technology master list
6. Click **Source** → shows candidate source channels

#### B. Add New Master Record

1. Select a category (e.g. **Tower**)
2. Click **+ Add** button
3. Fill in the name/details
4. Click **Save** → new record appears in the list

#### C. View Reports (Admin)

1. Click **Reports** in the sidebar
2. See hiring analytics including pipeline metrics and rejection ratios

---

## Complete Flow (End-to-End Demo Sequence)

For a full 10-minute demo showing the complete hiring lifecycle:

| Step | Role | Action | Duration |
|---|---|---|---|
| 1 | SPOC | Submit referral for new candidate | 1 min |
| 2 | Recruiter | View candidate in pipeline, shortlist | 1 min |
| 3 | Recruiter | Filter by SHORTLISTED status | 30 sec |
| 4 | Interviewer | Add availability slot on calendar | 1 min |
| 5 | Recruiter | Schedule L1 interview for candidate | 1 min |
| 6 | Interviewer | Submit feedback (Recommended / SELECTED) | 2 min |
| 7 | Tower Lead | View approval queue, approve candidate | 1 min |
| 8 | PMO | View updated pipeline status | 30 sec |
| 9 | Admin | Show master data (Tower/Skill) | 30 sec |
| 10 | Recruiter | View reports / rejection ratio chart | 1 min |

---

## API Reference

Backend REST API base URL: **http://localhost:8050**

Interactive documentation: **http://localhost:8050/docs** (Swagger UI)

### Key Endpoints

| Module | Method | Endpoint | Description |
|---|---|---|---|
| Auth | POST | `/dev/token` | Get JWT token for a role (dev only) |
| Candidates | GET | `/candidates/list` | List candidates with filters |
| Candidates | POST | `/candidates/add` | Add new candidate |
| Calendar | POST | `/calendar/addSlot` | Create availability slot |
| Calendar | GET | `/calendar/getAvailableSlots/{id}` | Get slots for interviewer |
| Scheduling | POST | `/recruiter/getDirectRecruiterSlots` | List recruiter slots |
| Feedback | GET | `/feedback/templates` | Get feedback template by technology |
| Feedback | POST | `/feedback/submit` | Submit interview feedback |
| Workflow | GET | `/workflow/candidates` | Get Tower Lead approval queue |
| Workflow | POST | `/workflow/approve` | Approve candidate(s) |
| Workflow | POST | `/workflow/reject` | Reject candidate(s) |
| Workflow | POST | `/workflow/hold` | Hold candidate(s) |
| Reports | POST | `/reports/candidatePipeline` | Get pipeline report data |
| Lookup | GET | `/lookup/{entity}` | Get master data (tower, skill, source, bu...) |
| Admin | GET | `/admin/masterData/{category}` | Admin master data by category |

### Authentication

All endpoints (except `/dev/token`) require a `Bearer` JWT token in the `Authorization` header.

**Dev login** (mock, no password):
```bash
curl -X POST http://localhost:8050/dev/token \
  -H "Content-Type: application/json" \
  -d '{"sub": "recruiter_user", "role": "RECRUITER"}'
```

---

## Database

**Connection**: `postgresql://postgres:niit@123@localhost:5432/smarthiredb001`
**Schema**: `smarthire`

### Key Tables

| Table | Description |
|---|---|
| `candidate_master` | All candidate records |
| `candidate_status` | Status history per candidate |
| `status_master` | Status definitions (ACTIVE, SHORTLISTED, L1_SCHEDULED, ...) |
| `interviewer_calendar_details` | Interviewer availability slots |
| `feedback_details` | Submitted interview feedback |
| `tower_master` | Tower master data |
| `skill_group_master` | Skill group master data |
| `technology_master` | Technology/skill master data |
| `source_master` | Candidate source channels |
| `bu_master` | Business unit master data |

### Candidate Status IDs

| ID | Status | Description |
|---|---|---|
| 1 | ACTIVE | New candidate |
| 2 | SHORTLISTED | Shortlisted by recruiter |
| 3 | L1_SCHEDULED | L1 interview scheduled |
| 4 | L1_SELECTED | Passed L1 interview |
| 5 | L1_REJECTED | Failed L1 interview |
| 6 | L2_SCHEDULED | L2 interview scheduled |
| 7 | L2_SELECTED | Passed L2 (Tower Lead approved) |
| 8 | L2_REJECTED | Failed L2 / Tower Lead rejected |
| 9 | HR_SCHEDULED | HR round scheduled |
| 10 | HR_SELECTED | Passed HR round |
| 11 | OFFERED | Offer letter sent |
| 12 | JOINED | Candidate joined |
| 13 | WITHDRAWN | Candidate withdrew |
| 14 | ON_HOLD | On hold |

---

## Troubleshooting

### Backend won't start

```powershell
# Check if port 8050 is free
netstat -ano | findstr :8050

# Check Python virtual environment is activated
.\.venv\Scripts\Activate.ps1

# Run database migrations
alembic upgrade head
```

### Frontend shows blank page

```powershell
# Check frontend server is running on 8051
# Open browser console (F12) for JavaScript errors

# Restart dev server
cd SmartHireUI\app
npm run dev -- --port 8051
```

### Login fails / "Unauthorized"

- Ensure backend is running on port 8050
- Ensure `VITE_API_BASE_URL=http://localhost:8050` in frontend env
- Ensure `VITE_MOCK_AUTH=true` for demo login buttons to appear

### "No records found" in Admin master data

- Seed data must be present in database
- Run: `psql -U postgres -d smarthiredb001 -f docker/init.sql`

### API returns 500 on lookup endpoints

- Check backend logs in the `uvicorn` terminal
- Common cause: database connection error or missing schema

### CORS errors in browser console

- Backend must have `http://localhost:8051` in its CORS allow list
- Check `src/smarthire/main.py` `allow_origins` list

---

## Project Structure

```
sm/
├── smarthire-backend/           # FastAPI Python backend
│   ├── src/smarthire/
│   │   ├── main.py              # App entry point, CORS, router registration
│   │   ├── routers/             # API route handlers
│   │   │   ├── candidates.py
│   │   │   ├── scheduling.py
│   │   │   ├── feedback.py
│   │   │   ├── workflow.py      # Tower Lead approval queue
│   │   │   ├── reports.py
│   │   │   ├── lookup.py        # Generic master data lookup
│   │   │   └── ...
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Database access layer
│   │   ├── models/              # SQLAlchemy ORM models
│   │   └── schemas/             # Pydantic request/response schemas
│   ├── alembic/                 # Database migrations
│   ├── docker/
│   │   └── init.sql             # Database seed data
│   └── docker-compose.yml
│
├── SmartHireUI/                 # React TypeScript frontend
│   └── app/src/
│       ├── screens/             # Full-page route components
│       │   ├── candidates/      # Candidate pipeline
│       │   ├── scheduling/      # Calendar + slot management
│       │   ├── feedback/        # Feedback form
│       │   ├── reports/         # Analytics dashboard
│       │   ├── admin/           # Admin master data
│       │   ├── workflow/        # Tower Lead approval queue
│       │   └── referral/        # SPOC referral portal
│       ├── components/          # Reusable UI components
│       ├── store/               # Redux store + slices
│       ├── services/api/        # Axios API clients per module
│       ├── hooks/               # Custom React hooks
│       └── types/               # TypeScript interfaces
│
└── README.md                    # This file
```

---

*SmartHire v1.0 — Built with FastAPI + React + PostgreSQL*
