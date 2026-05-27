# API Contract — SmartHire Microservice

All endpoints require `Authorization: Bearer <JWT>` unless marked **Public**.

Base URL: `http(s)://<host>:8083`

---

## Authentication & Session

| Method | Endpoint | Auth | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/login/validateSession` | None | Validate / deduplicate active sessions | `{ "userName": String }` | `ResponseDto { message }` |

---

## Candidate Data

| Method | Endpoint | Auth | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/candidateData/saveCandidateData` | JWT | Save new candidate record | `CandidateDataDTO` | `ResponseDto { response: [bool], message }` |
| POST | `/candidateData/getCandidateData` | JWT | Fetch candidate by criteria | `CheckCandidateDTO` | `ResponseDto { response: [CandidateDataDTO] }` |
| POST | `/candidateData/saveSkillDL` | JWT | Map skill to DL | JSON object | `ResponseDto { response, message }` |
| POST | `/candidateData/createNewEntry` | JWT | New entry with new skill | `CheckCandidateDTO` | `ResponseDto { response: [InterviewTypeDTO] }` |

---

## Interviewer

| Method | Endpoint | Auth | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/interviewer/getAllEmployees` | JWT | All employees list | — | JSON array |
| POST | `/interviewer/getInterviewerSlots` | JWT | Available interviewer slots | `CheckAvailabilityDTO` | `ResponseDto { response: [List<InterviewerCalenderDetailsDto>] }` |
| POST | `/interviewer/getAllScheduleSlots` | JWT | All scheduled slots | `CheckScheduleDTO` | `ResponseDto { response: [List<InterviewerCalenderDetailsDto>] }` |
| POST | `/interviewer/saveFreeSlot` | JWT | Save free availability slot | `InterviewerSaveSlotDto` | `ResponseDto { response, message }` |
| POST | `/interviewer/saveInterviewSlot` | JWT | Direct-book interview slot | `SaveInterviewerSlotDto` | `ResponseDto { response, message }` |
| POST | `/interviewer/updateDirectBookedSlot` | JWT | Update direct booked slot | `SaveInterviewerSlotDto` | `ResponseDto { response, message }` |
| POST | `/interviewer/interviewerDropdown` | JWT | Filtered interviewer dropdown | `InterviewerDropdownRequestDTO` | `ResponseDto { response: [List<InterviewerDropdownDTO>] }` |
| GET | `/interviewer/deleteInterviewSlot` | JWT | Delete free slot | `?calenderId=long` | `ResponseDto { response: [bool] }` |
| DELETE | `/interviewer/deleteDirectInterviewSlot` | JWT | Delete direct slot | `?calenderId=long` | `ResponseDto { response: [bool] }` |
| POST | `/interviewer/saveFeedback` | JWT | Submit interview feedback | `SaveFeedbackDTO` | `ResponseDto { response: [bool], message }` |
| POST | `/interviewer/rescheduledRequest` | JWT | Request reschedule | `RescheduleRequestDto` | `ResponseDto { response: [bool] }` |
| GET | `/interviewer/interviewTypeReport` | JWT | Count by interview type | — | `ResponseDto { response: [List<StatusCountDto>] }` |
| POST | `/interviewer/addSupervisior` | JWT | Assign supervisor | `SupervisorDTO` | `ResponseDto { response: [bool] }` |
| POST | `/interviewer/getAvailibility` | JWT | Availability windows | `SlotDto` | `ResponseDto { response: [List<AvailabilityDTO>] }` |
| POST | `/interviewer/interviewSuccessReport` | JWT | Interview outcomes | `TimeDTO` | `ResponseDto { response: [List<StatusDTO>] }` |

---

## Recruiter

| Method | Endpoint | Auth | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/recruiter/getDirectRecruiterSlots` | JWT | Direct-booked slots | `DirectBookedDTO` | `ResponseDto { response: [List<RecruiterCalendarDetailsDto>] }` |
| POST | `/recruiter/saveInterviewSlot` | JWT | Book interview slot | `SaveRecruiterSlotDto` | `ResponseDto { response: [RecruiterCalendarDetailsDto] }` |
| POST | `/recruiter/rescheduleSlot` | JWT | Reschedule slot | `SaveRecruiterSlotDto` | `ResponseDto { message }` |
| POST | `/recruiter/deleteSlot` | JWT | Delete slot | `SaveRecruiterSlotDto` | `ResponseDto { response: [bool], message }` |
| POST | `/recruiter/feedbackForm` | JWT | Generate feedback form | `InterviewTypeDTO` | `ResponseDto { response: [FormDTO] }` |
| POST | `/recruiter/feedbackFormPDf` | JWT | Fetch PDF feedback response | `?interviewTypeId&recruiterCalendarId` | `ResponseDto { response: [FeedbackPdfDTO] }` |
| GET | `/recruiter/getAllRecuiters` | JWT | List all recruiters | — | JSON array |
| POST | `/recruiter/getAllRecruiterSlotsByMonth` | JWT | Slots by month | `EmailDto` | `ResponseDto { response: [List<RecruiterCalendarDetailsDto>] }` |

---

## Slot Booking (Bulk Upload)

| Method | Endpoint | Auth | Purpose | Request | Response |
|---|---|---|---|---|---|
| POST | `/slot/panelSlotUpload` | JWT | Upload Excel panel slots | `multipart: file, createdBy` | `FileDTO` |

---

## Feedback Forms

| Method | Endpoint | Auth | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/feedbackForm/addFeedbackForm` | JWT | Create/update feedback form template | `NewFeedbackFormDTO` | `Map<String,Object>` |
| POST | `/feedbackForm/getFeedbackFormHeadings` | JWT | Get form headings by tech+practice | `{ technology, practice_id }` | `{ feedbackFormDTO: ... }` |

---

## Alerts & Notifications

| Method | Endpoint | Auth | Purpose | Response |
|---|---|---|---|---|
| GET | `/alerts/sendAgingSLAs` | JWT | Send aging SLA emails | void |
| GET | `/alerts/sendInterviewReminder` | JWT | Send interview reminders | void |
| GET | `/alerts/sendInterviewStatus` | JWT | Send status update emails | void |
| GET | `/alerts/feedbackFormReminder` | JWT | Send feedback reminders | void |
| GET | `/alerts/sendTowerAgingSLAs` | JWT | Send tower aging SLA emails | void |

---

## Reports

| Method | Endpoint | Auth | Purpose | Request | Response |
|---|---|---|---|---|---|
| PUT | `/report/generateReport` | JWT | Generate Excel report | `?fromTime&toTime&techId&interviewTypeId&downloadId&filterDaysId&buId&accountStr` | Excel file stream |
| GET | `/report/generatePdf` | JWT | Generate PDF feedback report | `?interviewTypeId&recruiterCalendarId&interviewerCalendarId` | PDF / S3 link |
| GET | `/report/generateReport1` | JWT | Alternate report generation | `ExcelDTO` | boolean |

---

## Lookup

| Method | Endpoint | Auth | Purpose | Request | Response |
|---|---|---|---|---|---|
| GET | `/lookup/fetchDropdown` | JWT | Generic screen dropdown | `?screenId=long` | `ResponseDto { response: [List<LookupDTO>] }` |
| GET | `/lookup/fetchMarketUnit` | JWT | Market units by BU | `?buId=long` | `List<MarketUnitDTO>` |
| GET | `/lookup/fetchPractices` | JWT | Practices by BU | `?buId=long` | `List<MarketUnitDTO>` |
| POST | `/lookup/fetchAccountsByMu` | JWT | Accounts by MU | `MuDTO` | `List<MarketUnitDTO>` |
| GET | `/lookup/skills` | JWT | All skills | — | `List<MarketUnitDTO>` |
| GET | `/lookup/rating` | JWT | Rating options | — | `List<MarketUnitDTO>` |
| GET | `/lookup/feedback` | JWT | Feedback status options | — | `List<MarketUnitDTO>` |
| GET | `/lookup/grade` | JWT | Grade options | — | `List<MarketUnitDTO>` |
| GET | `/lookup/overallFeedback` | JWT | Overall feedback options | — | `List<MarketUnitDTO>` |
| POST | `/lookup/candidateRoles` | JWT | Roles by skill | `{ skill: String }` | `List<MarketUnitDTO>` |
| GET | `/lookup/joiningPeriod` | JWT | Joining period options | — | `List<MarketUnitDTO>` |
| GET | `/lookup/locations` | JWT | Location options | — | `List<MarketUnitDTO>` |
| GET | `/lookup/getTemplateName` | JWT | Feedback template by tech+empId | `?technology&empId=long` | `ResponseDto { result: FeedbackTemplateDTO }` |
| GET | `/lookup/getRoles` | JWT | Roles by BU | `?buId=long` | `List<MarketUnitDTO>` |
| GET | `/lookup/getRejectionReasons` | JWT | Rejection reasons | — | `List<MarketUnitDTO>` |
| GET | `/lookup/getDeclineReasons` | JWT | Decline reasons | — | `List<MarketUnitDTO>` |
| GET | `/lookup/getPossibleRole` | JWT | Infer role from skill+exp+BU | `?skill&totalExp&buName` | `List<String>` |
| GET | `/lookup/getVersion` | JWT | App version string | — | String |
| POST | `/lookup/getTemplateName1` | JWT | Feedback template by skill+practice | `CandidateDataDTO` | `ResponseDto { result: FeedbackTemplateDTO }` |

---

## Configuration

| Method | Endpoint | Auth | Purpose | Response |
|---|---|---|---|---|
| GET | `/configuration/constants` | JWT | All constants | `ResponseDto { response: [Map<String,String>] }` |

---

## User Registration & Management

| Method | Endpoint | Auth | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/register/registerNewUser` | JWT | Register new employee | `UserRegisterDTO` | `ResponseDto { message }` |
| POST | `/register/updateUserDetails` | JWT | Update employee | `UserRegisterDTO` | `ResponseDto { message }` |
| POST | `/register/removeSkill` | JWT | Remove skill from employee | `RemoveSkillDTO` | `ResponseDto { message }` |
| POST | `/role/getRole` | JWT | Get roles by email | `EmailDto` | `List<String>` |
| POST | `/role/getEmployeeRole` | JWT | Get roles by email+password | `EmailDto` | `List<String>` |
| POST | `/users/getUsers` | JWT | Get all users | JSON filter object | `List<UserDataDTO>` |
| POST | `/users/updateAssignedRole` | JWT | Update user role | JSON object | `ResponseDto { message }` |

---

## Keycloak Integration

| Method | Endpoint | Auth | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/keycloak/fetchAllKeycloakUsers` | JWT | List Keycloak users | `KeycloakTokenDTO` | String (raw JSON) |
| DELETE | `/keycloak/deleteEmployee` | JWT | Delete employee from KC + DB | `?employeeId=long` + `KeycloakTokenDTO` | Boolean |
| PUT | `/keycloak/updateEmployee` | JWT | Update employee in Keycloak | `KeycloakTokenDTO` | Boolean |

---

## Teams Meeting

| Method | Endpoint | Auth | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| GET | `/getCode` | None | OAuth2 authorize redirect | — | HTTP Redirect |
| POST | `/getMeetingLink` | JWT | Create Teams meeting link | `TeamsMeetingDTO1` | String (join URL) |
| POST | `/sendMeetingInvite` | JWT | Create + return invite link | `TeamsMeetingDTO1` | `ResponseDto { message: joinUrl }` |

---

## File Management

| Method | Endpoint | Auth | Purpose | Request | Response |
|---|---|---|---|---|---|
| GET | `/image/getCandidateImage/{candidateId}` | JWT | Get candidate image | path var | `ImageDTO` |
| POST | `/image/uploadProfileImage` | JWT | Upload candidate image | `multipart: file, candidateId, interviewType` | boolean |
| GET | `/msg/getMSGAttachment/{candidateId}` | JWT | Get MSG attachment | path var | `ResponseDto { response: [MSGAttachmentDTO] }` |
| POST | `/msg/uploadMSGAttachment` | JWT | Upload MSG attachment | `multipart: file, candidateId, interviewType` | boolean |
| POST | `/pdfDownload/uploadUserManual` | JWT | Upload user manual PDF | `multipart: file` | boolean |
| GET | `/pdfDownload/downloadUserManual` | JWT | Download user manual | — | PDF stream |
| POST | `/s3upload/file/upload` | JWT | Batch upload feedback PDFs to S3 | — | void |
| GET | `/excel/readExcel` | JWT | Read employee CSV into DB | — | boolean |

---

## Prescreen

| Method | Endpoint | Auth | Purpose | Request | Response |
|---|---|---|---|---|---|
| GET | `/prescreen/updatePrescreenDetails` | **None (public)** | Update prescreen with recruiter | `?prescreenId&recuiterEmailId&recuiterName` | void |

---

## Referral Candidate

| Method | Endpoint | Auth | Purpose | Response |
|---|---|---|---|---|
| GET | `/referralCandidate/getReferralFormHeaders` | JWT | Get referral form master data | `ReferralMasterDataDTO` |

---

## Standard Response Wrapper: ResponseDto

All endpoints returning `ResponseDto` follow this shape:

```json
{
  "response": [ <data> ],
  "message": "SUCCESS MESSAGE",
  "exception": null,
  "result": null
}
```

On error:
```json
{
  "response": null,
  "message": null,
  "exception": "Error description",
  "result": null
}
```
