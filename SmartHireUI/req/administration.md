# SmartHire UI - Administration Specification

## Module: Administration / Master Data (`/administration`, `/master-data`)

### Purpose

Master data management interface for Admin, BU Admin, and Practice Admin roles. Enables CRUD operations on all reference data used throughout the system.

### Screens

1. **Category List** — Left sidebar listing available data categories
2. **Data Grid** — Table of existing records for the selected category
3. **Add/Edit Popup** — Dialog for creating or modifying a record

---

### Data Categories by BU

| BU | Available Categories |
|---|---|
| GCCA | Tower, Skill, Skill Group, Source, Vendor, Role Comment, Feedback Form, PMO DL Skill Mapping, Approver DL Mapping, Bu Account, Demand Type Master, Account Region Mapping |
| SAP | Capability, Skill Group |
| Invent | Tower, Skill, Source, Feedback Form |
| Europe | Tower, Skill, Skill Group, Source, Vendor, Feedback Form |
| Default | Tower, Skill, Skill Group, Source, Vendor, Role Comment, Feedback Form |

---

### Category Details

**Tower** — Fields: Tower Name, BU, Practice
- API: `GET admin/fetchAllTowers`, `POST admin/addTower`, `PUT admin/updateTower`, `DELETE admin/deleteTower`

**Skill / Skill Group** — Fields: Skill Name, Skill Group, BU
- API: `GET FETCHALLSKILLS`, `POST ADDSKILL`, `PUT admin/updateSkill`

**Source** — Fields: Source Name
- API: `GET admin/fetchAllSources`, `POST ADDSOURCE`

**Vendor** — Fields: Vendor Name, Contact, Account
- API: `GET admin/fetchAllVendors`, `POST admin/addVendor`

**Role Comment** — Fields: Comment Text, Role, BU

**Feedback Form** — Upload/replace feedback form templates per BU/practice
- API: `POST admin/uploadFeedbackTemplate`, `GET admin/fetchFeedbackTemplate`

**PMO DL Skill Mapping** — Map PMO distribution list email to specific skills
- Fields: PMO DL Email, Skill

**Approver DL Mapping** — Map approver DL emails to approval workflows
- Fields: Approver DL Email, BU, Practice

**Bu Account** — Map account names to BUs
- Fields: Account Name, BU

**Demand Type Master** — Add/edit demand type categories (New Hire, Replacement, Contract)
- Fields: Demand Type Name

**Account Region Mapping** — Map accounts to geographic regions
- Fields: Account Name, Region
- API: `GET panel/fetchAllAccount`, `GET panel/fetchRegion`, `POST panel/saveAccountRegionMapping`

---

### Popup Flags

The component uses numbered boolean flags to independently control each dialog:

| Flag | Controls |
|---|---|
| `popupFlag` | Tower add/edit |
| `popupFlag2` | Skill add/edit |
| `popupFlag3` | Source add/edit |
| `popupFlag4` | Vendor add/edit |
| `popupFlag5` | Role Comment add/edit |
| `popupFlag6` | Feedback Form upload |
| `popupFlag7` | PMO DL Skill Mapping |
| `popupFlag8` | Approver DL Mapping |
| `popupFlag9` | Skill Group add/edit |
| `popupFlag10` | Bu Account |
| `popupFlag11` | Demand Type Master |
| `popupFlag12` | Account Region Mapping |
| `popupFlag13–19` | Additional category dialogs |

---

### Actions

- **Add record** → open add popup → fill form → POST → refresh grid
- **Edit record** → click edit icon → pre-filled popup → PUT → refresh grid
- **Delete record** → click delete icon → confirm dialog → DELETE → refresh grid
- **Select category** → click category name in left nav → load records in grid

---

### Business Rules

1. BU Admin can only manage data within their own BU
2. Practice Admin can only manage data within their own practice
3. Admin and SuperUser can manage all categories across all BUs
4. Uploading a new feedback template replaces the current one (versioned)
5. Skill deletion is blocked if skill is referenced by existing candidate/demand records
6. Changes to skills and towers take effect immediately across the platform

---

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `admin/fetchAllTowers` | Load tower list |
| POST | `admin/addTower` | Add tower |
| GET | `FETCHALLSKILLS` | Load skills |
| POST | `ADDSKILL` | Add skill |
| POST | `ADDSOURCE` | Add source |
| GET | `admin/fetchAllSources` | Load sources |
| GET | `admin/fetchAllVendors` | Load vendors |
| POST | `admin/addVendor` | Add vendor |
| POST | `admin/uploadFeedbackTemplate` | Upload feedback template |
| GET | `admin/fetchFeedbackTemplate` | Fetch feedback template |
| GET | `panel/fetchAllAccount` | Load accounts |
| GET | `panel/fetchRegion` | Load regions |
| POST | `panel/saveAccountRegionMapping` | Save account-region mapping |

---

### Error States

- Duplicate name → toastr: `"Record already exists"`
- Deletion blocked → toastr: `"Cannot delete, record is in use"`
- Required field missing → inline form validation error
- API error → toastr with backend error message

---

## Module: Change Roles (`/changeroles`)

### Purpose

Allows Admin or BU Admin to change the assigned roles of an existing employee without requiring re-registration.

### Form Fields

- Employee Email (autocomplete search)
- New Role(s) (multi-select dropdown)
- BU (read-only — shows employee's current BU)

### API Dependencies

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `panel/fetchEmpRoles?email={email}` | Fetch current employee roles |
| POST | `panel/updateRoles` | Update employee roles |
| GET | `panel/getEmpBU` | Fetch employee BU for display |

### Error States

- Employee not found → toastr: `"Employee not found"`
- No roles selected → validation error
- API failure → toastr error
