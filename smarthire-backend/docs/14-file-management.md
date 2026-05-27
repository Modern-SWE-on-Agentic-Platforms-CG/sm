# Module: File Management

## Purpose

Handles four categories of file operations:
1. **Profile Images** — upload/download candidate profile images
2. **MSG Attachments** — upload/download Outlook .msg email attachments linked to candidates
3. **User Manual / PDF Documents** — upload and download the application user manual
4. **Feedback PDF Upload** — batch upload of feedback PDFs to AWS S3
5. **Excel Data Reader** — read and process employee data from Excel (CSV)

---

## 1. Image Controller

Base path: `/image`

### 1.1 Get Candidate Profile Image

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/image/getCandidateImage/{candidateId}` |
| **Auth** | Required (JWT) |

**Path Variable**: `candidateId` (long)

**Response**: `ImageDTO`

| Field | Type | Description |
|---|---|---|
| imageData | byte[] / Base64 | Image binary or encoded |
| mimeType | String | Image MIME type |
| candidateId | long | Candidate reference |
| interviewType | String | Interview type context |

---

### 1.2 Upload Profile Image

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/image/uploadProfileImage` |
| **Content-Type** | `multipart/form-data` |
| **Auth** | Required (JWT) |

**Request Parameters**:

| Parameter | Type | Description |
|---|---|---|
| `file` | MultipartFile | Image file |
| `candidateId` | long | Target candidate ID |
| `interviewType` | String | Interview type context |

**Response**: `boolean` — `true` on success.

**Storage**: Image stored to AWS S3 and/or local database (`CANDIDATE_PROFILE_IMAGE`).

---

## 2. MSG File Controller

Base path: `/msg`

### 2.1 Get MSG Attachment

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/msg/getMSGAttachment/{candidateId}` |
| **Auth** | Required (JWT) |

**Path Variable**: `candidateId` (long)

**Response**: `ResponseDto` wrapping `MSGAttachmentDTO`

| message | Meaning |
|---|---|
| `"FILE FOUND!!"` | Attachment exists |
| `"FILE DOES NOT EXISTS!!"` | No attachment for this candidate |

**MSGAttachmentDTO fields**:

| Field | Type | Description |
|---|---|---|
| attachmentData | byte[] | .msg file binary |
| candidateId | long | Candidate reference |
| fileName | String | Original file name |

---

### 2.2 Upload MSG Attachment

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/msg/uploadMSGAttachment` |
| **Content-Type** | `multipart/form-data` |
| **Auth** | Required (JWT) |

**Request Parameters**:

| Parameter | Type | Description |
|---|---|---|
| `file` | MultipartFile | Outlook .msg file |
| `candidateId` | long | Target candidate |
| `interviewType` | String | Interview type context |

**Response**: `boolean` — `true` on success.

**Storage**: Stored to `CANDIDATE_MAIL_ATTACHMENT` table and/or AWS S3.

---

## 3. PDF Download Controller (User Manual)

Base path: `/pdfDownload`

### 3.1 Upload User Manual

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/pdfDownload/uploadUserManual` |
| **Content-Type** | `multipart/form-data` |
| **Auth** | Required (JWT) |

**Request Parameter**: `file` (MultipartFile)

**Purpose**: Upload/replace the application user manual PDF.

**Storage**: Saved to database via `UserManualEntity` / `IUserManualRepository`.

**Response**: `boolean`

---

### 3.2 Download User Manual

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/pdfDownload/downloadUserManual` |
| **Auth** | Required (JWT) |

**Response**: Streams PDF binary into `HttpServletResponse`.

**Alternative**: User manual URL can also be resolved from `userManual` property in `common-{profile}.properties` pointing to S3.

**Response**: `boolean` — `true` if download succeeded.

---

## 4. Upload Feedback PDF Controller

Base path: `/s3upload`

### 4.1 Batch Upload Feedback PDFs to S3

| Property | Value |
|---|---|
| **Method** | POST |
| **Path** | `/s3upload/file/upload` |
| **Auth** | Required (JWT) |
| **Transaction** | `@Transactional` |

**Purpose**: Batch job that uploads all pending feedback PDF files from local storage to AWS S3.

**Response**: `void`

**Business Logic**: Reads all feedback PDFs stored locally (from `FEEDBACK_FORM_PDF_STORING`), uploads each to S3 bucket `feedbackBucket`, stores the resulting S3 URL in `FEEDBACK_FORM_PDF_LINK_STORING`.

> **Note**: This endpoint has a `@Scheduled` annotation commented out (`fixedDelay = 60000 * 1` = every 1 minute). Can be triggered manually or re-enabled as a scheduled task.

---

## 5. Excel Reader Controller

Base path: `/excel`

### 5.1 Read Excel

| Property | Value |
|---|---|
| **Method** | GET |
| **Path** | `/excel/readExcel` |
| **Auth** | Required (JWT) |

**Purpose**: Trigger a one-time read of employee data from a predefined Excel/CSV file (`employeedata.csv`). Populates the `EMPLOYEE_MASTER` and related tables from the file.

**Response**: `Boolean` — `true` if successful.

**File location**: `src/main/resources/employeedata.csv` (classpath)

---

## AWS S3 Configuration

| Property | Source | Description |
|---|---|---|
| `accesskey` | `common-{profile}.properties` | AWS IAM access key |
| `secretkey` | `common-{profile}.properties` | AWS IAM secret key |
| `region` | `common-{profile}.properties` | AWS region (`eu-west-1`) |
| `bucket` | `common-{profile}.properties` | Primary S3 bucket name |
| `bucket1` | `common-{profile}.properties` | Alternate S3 bucket |
| `feedbackBucket` | `common-{profile}.properties` | Feedback PDF S3 bucket |
| `s3SubFolder` | `common-{profile}.properties` | Sub-folder (`panelslotdata`) |

**S3 Client**: `AwsS3ClientConfig` utility class (in `com.etap.smarthire.util`).

---

## File Size Limits

| Property | Value |
|---|---|
| Max file size | 10 MB |
| Max request size | 10 MB |

Configured in `application-{profile}.properties`:
```
spring.http.multipart.max-file-size=10MB
spring.http.multipart.max-request-size=10MB
```

---

## Service Dependencies

| Service | Notes |
|---|---|
| `ImageService` / `ImageServiceImpl` | Profile image handling |
| `MSGAttachmentService` / `MSGAttachmentServiceImpl` | MSG file handling |
| `UserManualService` / `UserManualServiceImpl` | User manual PDF |
| `UploadFeedbackPDFService` / `UploadFeedbackPDFServiceImpl` | S3 batch upload |
| `ExcelService` / `ExcelServiceImpl` | Excel/CSV parsing |

## Repository Dependencies

| Repository | Table | Purpose |
|---|---|---|
| `CandidateProfileImageRepository` | `CANDIDATE_PROFILE_IMAGE` | Profile images |
| `ProfileImageRepository` | (profile image) | Alternative image storage |
| `CandidateMailAttachmentRepository` | `CANDIDATE_MAIL_ATTACHMENT` | MSG attachments |
| `IUserManualRepository` | (user manual) | User manual PDF |
| `FeedbackFormPdfStoringRepository` | `FEEDBACK_FORM_PDF_STORING` | Pending PDFs |
| `FeedbackFormPdfLinkStoringRepository` | `FEEDBACK_FORM_PDF_LINK_STORING` | S3 PDF links |

---

## Error States

| Condition | Handling |
|---|---|
| `SmarthireException` on image ops | Returns false / exception in response |
| File not found in DB | `ImageDTO` or `MSGAttachmentDTO` is null; message set accordingly |
| S3 upload failure | Logged; exception may propagate |
| PDF generation failure | `DocumentException` caught |
