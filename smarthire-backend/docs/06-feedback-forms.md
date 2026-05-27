# Module: Feedback Forms

## Purpose

Manages the creation and retrieval of dynamic interview feedback form templates. Feedback forms are hierarchical (parent-child heading structure), technology-specific, and versioned. They are rendered to interviewers at interview time and submitted as structured responses.

---

## API Endpoints

Base path: `/feedbackForm`

### 1. Add Feedback Form

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/feedbackForm/addFeedbackForm` |
| **Auth** | Required (JWT) |

**Request Body**: `NewFeedbackFormDTO`

| Field | Type | Description |
|---|---|---|
| (form definition fields) | | Headings, sub-headings, data types, required flags |

**Purpose**: Create or update a feedback form template definition.

**Success Response**:
```json
{
  "message": "<success key>",
  ...
}
```

**Error Response**:
```json
{
  "message": "<exception message>"
}
```

---

### 2. Get Feedback Form Headings

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/feedbackForm/getFeedbackFormHeadings` |
| **Auth** | Required (JWT) |

**Request Body**:
```json
{
  "technology": "<technology name>",
  "practice_id": "<practice ID as string>"
}
```

**Response**:
```json
{
  "feedbackFormDTO": <form structure>
}
```

**Purpose**: Retrieve the active feedback form headings for a given technology and practice area (used to render the feedback form to an interviewer).

---

## Feedback Form Data Model

### FEEDBACK_FORM table (`FeedbackFormDetails` entity)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `FEEDBACK_FORM_ID` | long (auto) | PK | |
| `FEEDBACK_SEQ_ID` | long | | Display order |
| `INTERVIEW_TYPE_ID` | long (FK) | | Which interview type this form applies to |
| `HEADING` | String (max 500) | | Question / section heading text |
| `FEEDBACK_PARENT_ID` | long (FK self-ref) | nullable | Parent heading ID (for hierarchical forms) |
| `DATATYPE_ID` | long (FK) | | Data type of the response field |
| `IS_REQUIRED` | boolean | | Whether this field is mandatory |
| `DROPDOWN_HINT` | String | | Hint text for dropdown fields |
| `DESCRIPTION` | String | | Additional description |
| `IS_ACTIVE` | boolean | | Soft delete / version management |
| `IS_BUTTON` | boolean | | Whether this item renders as a button |
| `TEMPLATE_ID` | long (FK) | | Feedback template association |
| `VERSION` | Double | | Form version number |

### FEEDBACK_TEMPLATE table (`FeedbackTemplateEntity`)

| Column | Type | Description |
|---|---|---|
| `TEMPLATE_ID` | long (auto PK) | |
| `TEMPLATE_NAME` | String | Template name (technology-specific) |
| `ACTIVE_FLAG` | boolean | Active/inactive |

### DATA_TYPE_MASTER table (`DataTypeMaster`)

Controls how each form field is rendered. Possible data types include: text input, dropdown, radio button, checkbox, textarea, etc.

---

## Form Hierarchy

Feedback forms use a self-referential parent-child structure:

```
FeedbackForm (parent, IS_BUTTON = false)
  ├── FeedbackForm (child - section)
  │     ├── FeedbackForm (child - question/field)
  │     └── FeedbackForm (child - question/field)
  └── FeedbackForm (child - section)
```

- A root form entry has `FEEDBACK_PARENT_ID = null`.
- Sections are intermediate-level entries.
- Leaf entries are the actual input fields.

---

## Business Rules

- Feedback forms are technology-specific and linked to a `FEEDBACK_TEMPLATE`.
- The `fetchFeedbackTemplateName` endpoint (in `/lookup`) resolves which template applies to a given technology + employee.
- A form can be versioned via the `VERSION` field; newer versions may co-exist with older ones.
- The `IS_ACTIVE` flag controls which version is currently displayed.
- Placeholder forms (empty shells) exist as drafts (`FeedbackFormPlaceholderEntity`, stored in a separate table).
- Custom feedback form data is stored in `CUSTOM_FEEDBACK_FORM_DATA` for non-standard responses.

---

## Feedback Submission

Feedback is **submitted** via the Interviewer Module (`POST /interviewer/saveFeedback`), not this module. This module handles form definition/templating only.

See [03-interviewer-module.md](03-interviewer-module.md) for feedback submission.

---

## Related Entities

| Entity | Table | Notes |
|---|---|---|
| `FeedbackFormDetails` | `FEEDBACK_FORM` | Form template definition |
| `FeedbackTemplateEntity` | `FEEDBACK_TEMPLATE` | Template metadata |
| `DataTypeMaster` | (data type master) | Field type definitions |
| `FeedbackFormPlaceholderEntity` | `FEEDBACK_FORM_PLACEHOLDER` | Draft/placeholder forms |
| `CustomFeedbackFormDataEntity` | `CUSTOM_FEEDBACK_FORM_DATA` | Custom field responses |
| `InterviewerFeedbackFormDetails` | (interviewer feedback form details) | Interviewer's submitted form data |
| `FeedbackStatusEntity` | `FEEDBACK_STATUS` | Feedback status codes |
| `OverallFeedbackEntity` | (overall feedback) | Overall feedback rating |

---

## PDF Generation

Submitted feedback forms can be exported as PDF. See [14-file-management.md](14-file-management.md) and `UploadFeedbackPDFController`.

- Generated PDFs are stored to AWS S3 bucket `smarthireprod` / `smarthireprod`.
- PDF links are stored in `FEEDBACK_FORM_PDF_LINK_STORING`.
- PDF binary data is stored in `FEEDBACK_FORM_PDF_STORING`.

---

## Service Dependencies

| Service | Notes |
|---|---|
| `FeedbackFormService` | Form template management |
| `BlankFeedbackFormServiceImpl` | Blank form generation |

## Repository Dependencies

| Repository | Table |
|---|---|
| `FeedbackFormDetailsRepository` | `FEEDBACK_FORM` |
| `FeedbackTemplateRepository` | `FEEDBACK_TEMPLATE` |
| `FeedbackFormPdfStoringRepository` | `FEEDBACK_FORM_PDF_STORING` |
| `FeedbackFormPdfLinkStoringRepository` | `FEEDBACK_FORM_PDF_LINK_STORING` |
| `PlaceholderFeedbackFormRepository` | Placeholder forms |
| `CustomFeedbackFormDataRepository` | Custom form data |
| `InterviewerFeedbackFormDetailsRepository` | Interviewer responses |
