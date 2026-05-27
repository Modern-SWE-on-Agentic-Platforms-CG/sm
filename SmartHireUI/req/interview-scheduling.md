# SmartHire UI - Interview Scheduling Specification

## Module: Dashboard / Interviewer Calendar (`/dashboard`)

### Purpose

Monthly calendar view for managing interview slots. Uses the `angular-calendar` library.

### Role-Based Behavior

| Role | Calendar Shows |
|---|---|
| Interviewer | Own slots only |
| Recruiter / PMO / Lead | Dropdown to select any interviewer; calendar updates on selection |

### Calendar Color Coding

| Color | Slot Status |
|---|---|
| Green | Interviewed — feedback submitted |
| Pink | Booked — feedback not yet submitted |
| Grey | Available — not booked |
| Yellow | Panel NA or Candidate NA |

### Day-Level Counts Displayed

Each calendar date shows counts: available / booked / interviewed / panel-NA / candidate-NA

### Actions

- **Previous / Next / Today** buttons → reload month slots
- **Click date** → open Booking Form
- **Click event** → view or manage slot details
- **Toggle switch** (Interviewer view) → switch between own view and all-recruiter view
- **Interviewer dropdown** (Recruiter/PMO) → filter calendar by selected interviewer

### Business Rules

1. Slots allowed only between 8:00 AM and 8:00 PM
2. Past dates cannot be booked
3. Interviewers can book multiple consecutive slots (4 or 8 hours) in one operation
4. Multi-day booking: select date range + days of week
5. `scheduleFlag` in `localStorage` controls booking mode vs view-only mode
6. `isPanelAvailability` flag controls panel availability overlay

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/interviewer/getAllInterviewerSlotsByMonth` | Fetch slots for current month |
| GET | `/interviewer/getAllEmployees` | Fetch all interviewers for dropdown |
| POST | `slot/panelSlotUpload` | Upload panel slot data via Excel |
| GET | `panel/panelSlotsInfo` | Get panel slot information |

---

## Module: Booking Form (`/booking-form`)

### Purpose

Form to create or reschedule interview slots. Used by Interviewers (marking free time) and Recruiters (booking a candidate).

### Reschedule Mode

Triggered when `slotInfo` is passed via `slotSubject` — form pre-populates with existing slot values. Controlled by `isReScheduleFlag`.

### Interviewer Booking Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Date | Date picker | Yes | Pre-filled from calendar click |
| Time Slot | Dropdown | Yes | 30-min increments, 8AM–8PM |
| Participation Type | Dropdown | Yes | Face to Face or Telephonic |
| Multiple Slots | Toggle | No | Book 4 or 8 consecutive hours |
| Multiple Days | Toggle | No | Recurring across a date range |
| Days of Week | Checkboxes | Conditional | Required when Multiple Days is on |
| To Date | Date picker | Conditional | Required when Multiple Days is on |

### Recruiter Booking Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| Interview Type | Dropdown | Yes | L1, L2, L1-L2, L3 |
| Business Unit | Dropdown | Yes | |
| Technology | Dropdown | Yes | |
| Candidate Name | Text | Yes | Pre-filled from navigation params |
| Time Slot | Dropdown | Yes | |
| Comments | Textarea | No | |

### Validation Error Messages

- Past time slot: `"Interview slot bookings not allowed for past"`
- Beyond 8 PM: `"Interview slot bookings are allowed only from 8:00AM to 8:00PM"`
- No weekday selected: `"Please select at least one week day"`
- No To Date: `"Please select To Date"`

---

## Module: Booking View (`/booking-view`)

Tabbed view showing slots grouped by status.

### Tabs

| Tab | Route | Description |
|---|---|---|
| Available | `/available` | Unbooked slots (`isBooked = false`) |
| Booked | `/booked` | Booked slots, feedback not yet submitted |
| Interviewed | `/interviewed` | Completed slots with feedback submitted |
| Panel Availability | `/panel-availability` | All panel members and their availability |

### Data Displayed Per Tab

Candidate name, technology, interview type, slot time, interviewer name/email, slot status

### Actions

- **Book** (Available tab) → navigate to Booking Form with pre-filled slot data
- **View Feedback** (Interviewed tab) → navigate to Feedback page
- **Cancel / Delete** slot → calls delete API

---

## Module: Panel Availability (`/panel-availability`)

Shows availability of all panel members across a selected time range.

**Data displayed:** Interviewer name, skill/technology, available time slots, booked count

---

## `BookingEvent` Data Model

| Field | Type | Description |
|---|---|---|
| `id` | number | Unique slot ID (calendar_id) |
| `start` / `end` | Date | Slot time boundaries |
| `title` | string | Calendar display label |
| `candidateName` | string | |
| `technology` | string | |
| `interviewType` | string | |
| `interviewerName` / `interviewerEmail` | string | |
| `participationType` | string | Face to Face or Telephonic |
| `isBooked` | boolean | Whether a candidate is booked |
| `slotStatus` | string | available / booked / interviewed / panel-na / candidate-na |
| `feedbackStatus` | number | 0=pending, 3=submitted, other=in-progress |
| `availableCount` / `bookedCount` / `interviewedCount` | number | Day-level aggregates |
