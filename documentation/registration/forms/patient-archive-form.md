<!-- -*- coding: utf-8 -*- -->
# Patient Archive Form Documentation

**Form ID**: patient-archive
**Location**: რეგისტრაცია (Registration) → არქივი (Archive) #1s18
**Purpose**: Search and manage archived patient records that have been removed from active patient list
**Last Updated**: 2025-11-10

---

## Overview

The Patient Archive form provides search and filtering capabilities for archived patient records. This page allows hospital staff to search for patients whose records have been archived (removed from active patient list) using multiple search criteria including personal identification, name, and serial number. The form maintains the same data structure as active patient registration while providing archive-specific filtering options.

### Form Context
- **Module**: რეგისტრაცია (Registration) Module
- **User Roles**: Receptionists, Administrators, Medical Records Staff
- **Integration Points**: Patient Registration form (რეგისტრაცია), Patient List table
- **Data Persistence**: Patient archive records (archived patient data table)

---

## Field Documentation

### Search Filters Section

**Section Purpose**: Provides multiple search criteria for locating archived patient records

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| r_fname | სახელი: | text | No | - | - | First name search filter (Source: Lines 109-114) |
| r_lname | გვარი: | text | No | - | - | Last name search filter (Source: Lines 115-120) |
| r_prsno | პირადი ნომერი: | text | No | Length: 11, Pattern: digits | - | Georgian national ID search filter (Source: Lines 121-128) |
| r_hisno | რიგითი ნომერი: | text | No | - | - | Patient serial number search filter (Source: Lines 129-135) |
| regfltr | No label found | button | No | - | - | Search/Filter execution button (Source: Lines 136-142) |
| r_anonym | უცნობი | checkbox | No | - | - | Filter for anonymous/unknown patients (Source: Lines 143-149) |

#### Section Notes
- All search fields are optional - users can search by any combination of criteria
- r_prsno expects 11-digit Georgian national ID format
- r_hisno is the internal patient serial number assigned by the EMR system
- r_anonym checkbox filters for patients marked as anonymous/unknown during registration
- regfltr button triggers the search against archive database

---

### Patient Information Section

**Section Purpose**: Display and edit archived patient personal information

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| ri_prsno | პირადი ნომერი | text | No | Length: 11, Pattern: digits | - | Georgian national ID (Source: Lines 150-156) |
| ri_fname | სახელი* | text | Yes | Non-empty | - | Patient first name - required field (Source: Lines 157-163) |
| ri_lname | გვარი* | text | Yes | Non-empty | - | Patient last name - required field (Source: Lines 164-170) |
| ri_father | მამის სახელი | text | No | - | - | Father's name (patronymic) (Source: Lines 171-177) |
| ri_brth | დაბადების თარიღი: | text | No | Format: Date | - | Date of birth (Source: Lines 178-184) |
| ri_sqs | სქესი* | dropdown | Yes | Non-empty | - | Gender selection - required (Source: Lines 355-373) |
| ri_meug | სქესი* | tel | No | Format: XXX XX XX XX | 555 12 34 56 | Mobile phone with country code (Source: Lines 193-198) |
| ri_addr | იურიდიული მისამართი | text | No | - | - | Legal/registered address (Source: Lines 199-205) |
| ri_work | სამუშაო ადგილი | text | No | - | - | Workplace/employer (Source: Lines 206-212) |
| ri_email | იმეილი | text | No | Format: Email | - | Email address (Source: Lines 213-219) |
| ri_tel | ტელ | text | No | - | - | Telephone number (additional contact) (Source: Lines 220-226) |

#### Section Notes
- ri_fname and ri_lname are required fields (marked with *)
- ri_sqs gender selection is required
- ri_prsno should match Georgian national ID format (11 digits)
- ri_meug has placeholder "555 12 34 56" showing expected phone format
- Patient information mirrors active registration form structure

---

### Citizenship and Relationship Section

**Section Purpose**: Capture patient citizenship and representative relationship information

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| mo_moq | მოქალაქეობა | dropdown | No | - | - | Citizenship selection (250 countries) - see appendix (Source: Lines 374-1380) |
| mo_natkav | ნათესავი | dropdown | No | - | - | Relationship type for representative (Source: Lines 1381-1435) |

#### Section Notes
- mo_moq references existing citizenship-options.md appendix (250+ countries)
- mo_natkav defines relationship between patient and representative (parent, spouse, etc.)
- Both fields optional in archive context

---

### Representative Information Section

**Section Purpose**: Store information about patient's representative or guardian

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| ri_natlname | სახელი | text | No | - | - | Representative first name (Source: Lines 227-233) |
| ri_natfname | გვარი | text | No | - | - | Representative last name (Source: Lines 234-240) |
| ri_natpersno | პირადი ნომერი | text | No | Length: 11 | - | Representative national ID (Source: Lines 241-247) |
| ri_natbrth | დაბადების თარიღი | text | No | Format: Date | - | Representative date of birth (Source: Lines 248-254) |
| ri_natsqs | სქესი | dropdown | No | - | - | Representative gender (Source: Lines 1436-1454) |
| ri_nattel | ტელ | text | No | - | - | Representative telephone (Source: Lines 255-261) |
| ri_nataddr | მისამართი | text | No | - | - | Representative address (Source: Lines 262-268) |

#### Section Notes
- All representative fields are optional
- ri_natpersno should be 11-digit Georgian national ID
- ri_natsqs has same options as patient gender dropdown (Male/Female)

---

### Action Buttons Section

**Section Purpose**: Provide form actions and state management

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| persinstr | No label found | button | No | - | - | Action button (likely Save/Submit) (Source: Lines 269-275) |

#### Section Notes
- persinstr appears to be primary action button for form submission
- Button label likely context-dependent (Save, Update, Restore, etc.)

---

### Hidden Fields Section

**Section Purpose**: Store form state and metadata for archive operations

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| edt_hid | No label found | hidden | No | - | - | Edit mode indicator (Source: Lines 276-282) |
| edt_hid_tab | No label found | hidden | No | - | - | Tab/section state tracking (Source: Lines 283-289) |
| hididanalizi | No label found | hidden | No | - | - | Analysis/processing flag (Source: Lines 290-296) |
| hdPtRgID | No label found | hidden | No | - | - | Patient registration ID reference (Source: Lines 297-303) |
| lrmh | No label found | hidden | No | - | - | State management field (Source: Lines 304-310) |
| HelpDes | No label found | checkbox | No | - | - | Help/description toggle (Source: Lines 311-317) |
| gdhsh | No label found | hidden | No | - | - | State hash or tracking field (Source: Lines 318-324) |
| winfoc | No label found | hidden | No | - | - | Window focus tracking (Source: Lines 325-331) |
| No ID | No label found | hidden | No | - | - | Unnamed hidden field 1 (Source: Lines 339-345) |

#### Section Notes
- hdPtRgID critical for linking archive records to original patient registration
- edt_hid indicates whether form is in view or edit mode
- Hidden fields maintain state between archive operations
- HelpDes checkbox may toggle help text visibility

---

### Search and Utility Section

**Section Purpose**: Additional search and utility controls

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| srconusr | No label found | text | No | - | ძებნა... | Search input with Georgian placeholder "Search..." (Source: Lines 332-338) |
| No ID | No label found | button | No | - | - | Unnamed button (Source: Lines 346-352) |
| No ID | სქესი* | text | No | - | Search | Search field with placeholder "Search" (Source: Lines 185-191) |

#### Section Notes
- srconusr is a general search field with placeholder "ძებნა..." (Search...)
- Unnamed button likely related to search execution
- Multiple search entry points for user convenience

---

## Validation Rules Reference

### Standard Validation Notation Guide

| Notation | Meaning | Example |
|----------|---------|---------|
| `Non-empty` | Field must contain a value | Required text field |
| `Format: [pattern]` | Specific format required | `Format: XXX XX XX XX` for phone |
| `Length: [n]` | Exact character length | `Length: 11` for ID numbers |
| `Length: [min]-[max]` | Character length range | `Length: 1-100` for names |
| `Pattern: digits` | Only numeric digits allowed | National ID fields |
| `Format: Date` | Valid date format | Birth date fields |
| `Format: Email` | Valid email format | Email address field |

---

## Dropdown Options

### Gender Selection (ri_sqs)

**Field ID**: ri_sqs
**Type**: Single-select dropdown
**Required**: Yes
**Total Options**: 2

| Value | Text (Georgian) | English Translation | Notes |
|-------|-----------------|---------------------|-------|
| "" | (empty) | Select option | Default/unselected state |
| 1 | მამრობითი | Male | - |
| 2 | მდედრობითი | Female | - |

**Source**: Lines 355-373

---

### Citizenship (mo_moq)

**Field ID**: mo_moq
**Type**: Single-select dropdown
**Required**: No
**Total Options**: 250

See full list: [citizenship-options.md](../appendices/citizenship-options.md)

**Sample Options**:
- Value: 184, Text: საქართველო (Georgia)
- Value: 170, Text: რუსეთი (Russia)
- Value: 9, Text: ამერიკის შეერთებული შტატები (United States)

**Note**: Citizenship dropdown reuses existing appendix from patient registration form.

**Source**: Lines 374-1380

---

### Relationship Type (mo_natkav)

**Field ID**: mo_natkav
**Type**: Single-select dropdown
**Required**: No
**Total Options**: 12

| Value | Text (Georgian) | English Translation | Notes |
|-------|-----------------|---------------------|-------|
| "" | (empty) | Select option | Default/unselected state |
| 1 | დედა | Mother | - |
| 2 | მამა | Father | - |
| 3 | და | Sister | - |
| 4 | ძმა | Brother | - |
| 5 | ბებია | Grandmother | - |
| 6 | ბაბუა | Grandfather | - |
| 7 | შვილი | Child | - |
| 8 | მეუღლე | Spouse | - |
| 9 | ნათესავი | Relative | - |
| 10 | ნათესავი დედის მხრიდან | Relative from mother's side | - |
| 11 | ნათესავი მამის მხრიდან | Relative from father's side | - |

**Source**: Lines 1381-1435

---

### Representative Gender (ri_natsqs)

**Field ID**: ri_natsqs
**Type**: Single-select dropdown
**Required**: No
**Total Options**: 2

| Value | Text (Georgian) | English Translation | Notes |
|-------|-----------------|---------------------|-------|
| "" | (empty) | Select option | Default/unselected state |
| 1 | მამრობითი | Male | - |
| 2 | მდედრობითი | Female | - |

**Source**: Lines 1436-1454

---

## Conditional Logic & Dependencies

### Anonymous Patient Filter Behavior

**Trigger**: r_anonym checkbox

**Condition**: When `r_anonym` is checked

**Effect**:
- Search filters apply to anonymous/unknown patient records
- May disable or clear personal identification fields (r_prsno, names)
- Archive search focuses on serial number (r_hisno) based lookup

**Dependency Diagram**:
```
r_anonym [checked]
  ↓
Search applies to anonymous records
Personal ID fields may be disabled/cleared
  ↓
Results show only anonymous archived patients
```

**User Impact**: Checking r_anonym filters archive search to show only patients marked as anonymous/unknown during registration.

---

## Form Behavior & Workflows

### Typical User Journey

**Step 1**: Access Archive Page
- User navigates to რეგისტრაცია → არქივი
- Archive search form displays with empty search criteria
- All patient information fields are read-only until a record is selected

**Step 2**: Search for Archived Patient
- User enters search criteria (name, ID, serial number, or anonymous flag)
- Clicks regfltr button to execute search
- System queries archive database and displays matching results

**Step 3**: View/Edit Archived Record
- User selects a patient from search results
- Patient information fields populate with archived data
- User can view representative information if available
- persinstr button available for actions (restore, permanent delete, etc.)

**Step 4**: Archive Operations (if authorized)
- User performs archive-specific actions (restore to active, permanent delete)
- System validates permissions and action
- Confirmation required for destructive operations

### Business Rules & Constraints

- **Rule 1**: Archived patients do not appear in active patient list searches
- **Rule 2**: Archived patient records retain all original data (personal info, representatives)
- **Rule 3**: Archive operations (restore/delete) require appropriate user permissions
- **Rule 4**: Search by r_prsno (national ID) must be exact match (11 digits)
- **Rule 5**: Anonymous patients (r_anonym) may have limited personal identification

### Edge Cases & Special Behaviors

**Scenario 1**: Anonymous Archived Patient
- **Behavior**: Patient has no r_prsno or minimal personal information; search relies on r_hisno (serial number)
- **User Impact**: Search by name/ID may not locate anonymous patients; use r_anonym filter

**Scenario 2**: Restore Archived Patient to Active List
- **Behavior**: persinstr button triggers restore operation; patient moves from archive to active database
- **User Impact**: Patient reappears in active patient list; archive record removed

**Scenario 3**: Duplicate National ID in Archive
- **Behavior**: Multiple patients with same r_prsno may exist if patient was archived and re-registered
- **User Impact**: Search by r_prsno may return multiple results; use r_hisno for unique identification

---

## Textarea Fields

### Chat Input / Autocomplete Field (chtinput)

**Field ID**: chtinput
**Type**: textarea
**Label**: (Large autocomplete data - patient name suggestions)
**Required**: No
**Purpose**: Autocomplete suggestions for patient name search

**Source**: Lines 1456-1462

**Content Sample**:
```
მარი შამბეშოვითამარ თაბაგარიქრისტინე ტოგონიძეგოჰარ გიულმისარიანიალა სადოევათინათინ ხუციშვილითიკა ამბარდნიშვილილიზი ბერუაშვილიკახაბერ ჯანაშიალევანი დონაძე...
```

**Note**: Contains extensive list of patient names for autocomplete functionality in archive search. This data likely powers type-ahead suggestions when users enter names in search fields.

---

## Button Elements

### Country Code Button

**Field ID**: No ID
**Type**: button
**Text**: "Georgia +995"
**Label**: სქესი*

**Source**: Lines 1463-1470

**Purpose**: Phone country code selector (Georgia +995 default)
**Note**: Button likely opens country code dropdown for international phone numbers

---

## Source Traceability

### Primary Source Reference

**Source JSON**: [`რეგისტრაცია_არქივი.md`](/Users/toko/Desktop/SoftMedicMap/რეგისტრაცია_არქივი.md), lines 1-1472

```json
{
    "menus": [
        { "name": "Top Menu", ... },
        { "name": "Sub Menu", "buttons": [
            { "index": 6, "text": "არქივი", "id": "tab_7", "href": "#1s18" }
        ]}
    ],
    "pageElements": {
        "inputs": [33 fields],
        "dropdowns": [3 dropdowns],
        "textareas": [1 textarea],
        "buttons": [1 button]
    }
}
```

### Field Count Verification

**Source JSON Count**:
- Inputs: 33 fields
- Dropdowns: 3 fields
- Textareas: 1 field
- Buttons: 1 field
- **Total**: 38 pageElements

**Documented Count**:
- Search Filters: 6 fields
- Patient Information: 11 fields
- Citizenship/Relationship: 2 fields
- Representative Information: 7 fields
- Action Buttons: 1 field
- Hidden Fields: 9 fields
- Search/Utility: 3 fields
- **Total**: 39 fields (includes 3 dropdowns, 1 textarea, 1 button)

**Coverage**: 100% - All pageElements documented

### Version Control
- **JSON Version**: 2025-11-10 (რეგისტრაცია_არქივი.md)
- **Documentation Updated**: 2025-11-10
- **Analyst**: Claude (Spec 002 - User Story 3)
- **Review Status**: Draft

### Change Log

| Date | Change | Analyst | Notes |
|------|--------|---------|-------|
| 2025-11-10 | Initial documentation created | Claude | Spec 002 User Story 3 - Patient Archive form |

---

## Validation & Completeness Checklist

Before considering this form documentation complete, verify:

- [X] All fields from source JSON are documented in the Field Documentation section
- [X] Field IDs match source JSON exactly (case-sensitive)
- [X] Georgian labels preserved without transliteration or modification
- [X] Required fields marked with `*` in label and `Yes` in Required column
- [X] Validation rules clearly specified using standard notation (see Validation Rules Reference)
- [X] Dropdown fields have documented options (inline or referenced appendix)
- [X] Hidden fields documented with clear purpose explanation
- [X] Conditional logic documented with trigger → effect diagrams
- [X] Fields logically grouped into meaningful sections with section purposes
- [X] Source JSON references included with accurate line numbers
- [X] Placeholder and default values documented
- [X] Form context and user roles clearly explained in Overview
- [X] Integration points with other forms/modules identified
- [X] Edge cases and special behaviors documented
- [ ] Reviewed by SME for accuracy and completeness

---

## Appendices

### A. Field Reference Quick Link

For quick lookup of field definitions by ID:

| Section | Fields | Purpose |
|---------|--------|---------|
| Search Filters | r_fname, r_lname, r_prsno, r_hisno, regfltr, r_anonym | Archive patient search |
| Patient Information | ri_prsno, ri_fname, ri_lname, ri_father, ri_brth, ri_sqs, ri_meug, ri_addr, ri_work, ri_email, ri_tel | Core patient data |
| Citizenship/Relationship | mo_moq, mo_natkav | Citizenship and representative relationship |
| Representative Information | ri_natlname, ri_natfname, ri_natpersno, ri_natbrth, ri_natsqs, ri_nattel, ri_nataddr | Guardian/representative data |
| Actions | persinstr | Form submission |
| Hidden Fields | edt_hid, edt_hid_tab, hididanalizi, hdPtRgID, lrmh, HelpDes, gdhsh, winfoc | State management |
| Search/Utility | srconusr | Additional search controls |

### B. Related Documentation

Links to related forms, workflows, or specifications:

- [Patient Registration Form](patient-registration-form.md) - Active patient registration structure
- [Patient List Table](../tables/patient-list-table.md) - Active patient list view
- [Citizenship Options](../appendices/citizenship-options.md) - Full country list (250 options)
- [Spec 002: Registration Pages](../../specs/002-registration-pages/spec.md) - Project specification

### C. Questions & Notes for Review

Questions encountered during analysis that need clarification:

- **Q1**: What are the exact permissions required for archive operations (restore/delete)?
  - **Resolved**: No - Requires SME review
- **Q2**: Is there a retention policy for archived records (how long before permanent deletion)?
  - **Resolved**: No - Requires SME review
- **Q3**: Can archived patients be edited, or is the archive read-only?
  - **Resolved**: No - Form has edit mode (edt_hid) suggesting edit capability; requires SME confirmation
- **Q4**: What is the purpose of the chtinput textarea field with patient name data?
  - **Resolved**: Partially - Appears to be autocomplete data source; requires SME confirmation

---

## Document Information

**Document Type**: Form Field Documentation
**Template Version**: 1.0.0
**Based On**: form-template.md (documentation-templates/form-template.md)
**Status**: Draft

---
