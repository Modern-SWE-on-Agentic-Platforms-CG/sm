# Module: Prescreen

## Purpose

Handles pre-screening updates for candidates. This module is **publicly accessible** (no JWT required) — it is designed to be called by external systems or automated processes during the initial candidate screening phase before they enter the main recruitment pipeline.

---

## API Endpoints

Base path: `/prescreen`

**Authentication**: None required (`/prescreen/**` is permitted for all in `WebSecurityConfig`).

### 1. Update Prescreen Details

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/prescreen/updatePrescreenDetails` |
| **Auth** | None (public endpoint) |

**Query Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `prescreenId` | long | Yes | Prescreen record ID to update |
| `recuiterEmailId` | String | Yes | Email of the recruiter processing the prescreen |
| `recuiterName` | String | Yes | Name of the recruiter |

**Purpose**: Update a prescreen record with recruiter assignment details. This typically marks the prescreen as processed and associates it with a specific recruiter.

**Response**: `void` (no response body)

**Error Handling**: `SmarthireException` and `IOException` are caught and logged. No error is surfaced to the caller.

---

## Data Model

### PRESCREEN_BATCH table (`PrescreenBatchEntity`)

| Column | Type | Description |
|---|---|---|
| (fields inferred from entity name) | | Prescreen batch/record data |

---

## Business Rules

- This endpoint is intentionally unauthenticated to allow external pre-screening systems to post results without a JWT token.
- The `prescreenId` references a prescreen batch record.
- After update, the prescreen record is linked to the specified recruiter for follow-up.

---

## Service Dependencies

| Service | Notes |
|---|---|
| `PrescreenService` / `PrescreenServiceImpl` | Prescreen record retrieval and update |

## Repository Dependencies

| Repository | Table |
|---|---|
| `PrescreenBatchRepository` | `PRESCREEN_BATCH` |

---

## Error States

| Condition | Handling |
|---|---|
| Prescreen record not found | `SmarthireException` — logged, no response |
| IO error | `IOException` — logged, no response |
