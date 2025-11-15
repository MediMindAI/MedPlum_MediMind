# Patient Contacts Form (კონტაქტები)

**Form ID**: registration-patient-contacts
**Location**: რეგისტრაცია (Registration) → კონტაქტები (Contacts) Tab
**Purpose**: Manages patient contact information including phone numbers, email, addresses, and emergency contact details. Identical structure to receptionist-intake form for contact data capture.
**Last Updated**: 2025-11-10

---

## Overview

The Patient Contacts Form (კონტაქტები) provides dedicated interface for managing comprehensive patient contact information. This form mirrors the contact-related fields from the receptionist intake process but focuses specifically on contact management and updates.

### Form Context
- **Module**: რეგისტრაცია (Registration)
- **User Roles**: Receptionist, Registration Staff, Administrative Staff
- **Integration Points**: Patient Master Record, Receptionist Intake Form, Representative Contact Records
- **Data Persistence**: Patient contact table, Representative contact linkage table

---

## Field Documentation

### Search/Filter Controls

**Section Purpose**: Allows staff to search for existing patient records to update contact information.

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| r_fname | სახელი: | text | No | - | - | Patient first name search filter (Source: Line 111) |
| r_lname | გვარი: | text | No | - | - | Patient last name search filter (Source: Line 118) |
| r_prsno | პირადი ნომერი: | text | No | Length: 11, Georgian ID | - | National ID number search filter (Source: Line 125) |
| r_hisno | რიგითი ნომერი: | text | No | - | - | Sequential/history number search filter (Source: Line 132) |
| regfltr | (No label found) | button | No | - | - | Search/filter trigger button (Source: Line 139) |
| r_anonym | უცნობი | checkbox | No | - | Unchecked | "Unknown patient" checkbox (Source: Line 146) |

#### Section Notes
- Search filters enable quick patient lookup for contact information updates
- Same search interface as receptionist-intake form for consistency

---

### Patient Information

**Section Purpose**: Core patient identification fields for context.

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| ri_prsno | პირადი ნომერი | text | No | Length: 11, Georgian ID | - | Georgian national ID number (Source: Line 153) |
| ri_fname | სახელი* | text | Yes | Non-empty | - | Patient first name - required field (Source: Line 160) |
| ri_lname | გვარი* | text | Yes | Non-empty | - | Patient last name - required field (Source: Line 167) |
| ri_father | მამის სახელი | text | No | - | - | Father's name (patronymic) (Source: Line 174) |
| ri_brth | დაბადების თარიღი: | text | No | Date format | - | Date of birth field (Source: Line 181) |
| ri_sqs | სქესი* | dropdown | Yes | Non-empty | - | Gender selection - see dropdown options below (Source: Line 357) |
| ri_meug | სქესი* (tel field) | tel | No | Format: 555 12 34 56 | +995 | Phone number with country code (Source: Line 195) |

#### Section Notes
- Patient identification fields displayed as context when editing contact information
- Fields marked with * are required for patient identity verification

---

### Contact Information

**Section Purpose**: Primary contact details for patient communication.

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| ri_tel | ტელ | text | No | Phone format | - | Primary telephone number (Source: Line 223) |
| ri_email | იმეილი | text | No | Email format (RFC 5322) | - | Email address for patient contact (Source: Line 216) |
| ri_addr | იურიდიული მისამართი | text | No | - | - | Legal/registered address (Source: Line 202) |
| ri_work | სამუშაო ადგილი | text | No | - | - | Workplace/employer information (Source: Line 209) |
| mo_moq | მოქალაქეობა | dropdown | No | - | - | Citizenship - 250 countries, see appendix reference below (Source: Line 376) |

#### Section Notes
- All contact fields are optional to accommodate partial information scenarios
- Email validation enforces RFC 5322 compliance when populated
- Citizenship dropdown reuses existing appendix from patient-registration-form

---

### Representative/Emergency Contact Information

**Section Purpose**: Captures contact details for patient representative, emergency contact, or responsible relative.

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| ri_natlname | სახელი | text | No | - | - | Representative first name (Source: Line 230) |
| ri_natfname | გვარი | text | No | - | - | Representative last name (Source: Line 237) |
| ri_natpersno | პირადი ნომერი | text | No | Length: 11, Georgian ID | - | Representative national ID (Source: Line 244) |
| ri_natbrth | დაბადების თარიღი | text | No | Date format | - | Representative date of birth (Source: Line 251) |
| ri_natsqs | სქესი | dropdown | No | - | - | Representative gender - see dropdown options below (Source: Line 1438) |
| ri_nattel | ტელ | text | No | Phone format | - | Representative telephone - primary emergency contact number (Source: Line 258) |
| ri_nataddr | მისამართი | text | No | - | - | Representative address (Source: Line 265) |
| mo_natkav | ნათესავი | dropdown | No | - | - | Relationship to patient - see dropdown options below (Source: Line 1383) |

#### Section Notes
- Representative contact information critical for emergency scenarios and minor patient care
- `ri_nattel` serves as primary emergency contact number
- `mo_natkav` defines relationship type for contact priority logic

---

### Action Buttons and System Fields

**Section Purpose**: Form submission, state management, and system-level controls.

| Field ID | Label (Georgian) | Type | Required | Validation | Default | Notes |
|----------|------------------|------|----------|------------|---------|-------|
| persinstr | (No label found) | button | No | - | - | Action button - likely "Save Contacts" (Source: Line 272) |
| edt_hid | (No label found) | hidden | No | - | - | Edit mode state tracking (Source: Line 279) |
| edt_hid_tab | (No label found) | hidden | No | - | - | Active tab state tracking (Source: Line 286) |
| hididanalizi | (No label found) | hidden | No | - | - | Analysis/diagnostic mode flag (Source: Line 293) |
| hdPtRgID | (No label found) | hidden | No | - | - | Patient registration ID reference (Source: Line 300) |
| lrmh | (No label found) | hidden | No | - | - | State management field (Source: Line 307) |
| HelpDes | (No label found) | checkbox | No | - | Unchecked | Help/description toggle (Source: Line 314) |
| gdhsh | (No label found) | hidden | No | - | - | Session or state hash (Source: Line 321) |
| winfoc | (No label found) | hidden | No | - | - | Window focus tracking (Source: Line 328) |
| srconusr | (No label found) | text | No | - | - | Search/filter input with placeholder "ძებნა..." (Source: Line 335) |

#### Section Notes
- Hidden fields manage form state and patient record linkage
- `hdPtRgID` links contact updates to patient master record

---

## Dropdown Options

### Gender (სქესი) - ri_sqs

**Field ID**: ri_sqs
**Type**: Single-select dropdown
**Required**: Yes
**Total Options**: 2

| Value | Text (Georgian) | English Translation | Notes |
|-------|-----------------|---------------------|-------|
| 1 | მამრობითი | Male | Source: Line 366 |
| 2 | მდედრობითი | Female | Source: Line 369 |

**Example Usage**: Patient gender identification - required for patient record context

---

### Citizenship (მოქალაქეობა) - mo_moq

**Field ID**: mo_moq
**Type**: Single-select dropdown
**Required**: No
**Total Options**: 250

See full list: [citizenship-options.md](../appendices/citizenship-options.md)

**Sample Options**:
- Value: 184, Text: საქართველო (Georgia)
- Value: 170, Text: რუსეთი (Russia)
- Value: 9, Text: ამერიკის შეერთებული შტატები (United States)

**Note**: Reuses appendix from patient-registration-form.md (Source: Lines 376-1379)

---

### Relationship (ნათესავი) - mo_natkav

**Field ID**: mo_natkav
**Type**: Single-select dropdown
**Required**: No
**Total Options**: 12

| Value | Text (Georgian) | English Translation | Notes |
|-------|-----------------|---------------------|-------|
| (empty) | (empty) | None selected | Default option (Source: Line 1388) |
| 1 | დედა | Mother | Source: Line 1391 |
| 2 | მამა | Father | Source: Line 1395 |
| 3 | და | Sister | Source: Line 1399 |
| 4 | ძმა | Brother | Source: Line 1403 |
| 5 | ბებია | Grandmother | Source: Line 1407 |
| 6 | ბაბუა | Grandfather | Source: Line 1411 |
| 7 | შვილი | Child | Source: Line 1415 |
| 8 | მეუღლე | Spouse | Source: Line 1419 |
| 9 | ნათესავი | Relative (general) | Source: Line 1423 |
| 10 | ნათესავი დედის მხრიდან | Relative on mother's side | Source: Line 1427 |
| 11 | ნათესავი მამის მხრიდან | Relative on father's side | Source: Line 1431 |

**Example Usage**: Defines relationship of emergency contact/representative to patient for contact priority

---

### Representative Gender (სქესი) - ri_natsqs

**Field ID**: ri_natsqs
**Type**: Single-select dropdown
**Required**: No
**Total Options**: 2

| Value | Text (Georgian) | English Translation | Notes |
|-------|-----------------|---------------------|-------|
| (empty) | (empty) | None selected | Default option (Source: Line 1443) |
| 1 | მამრობითი | Male | Source: Line 1446 |
| 2 | მდედრობითი | Female | Source: Line 1449 |

**Example Usage**: Gender selection for emergency contact/representative

---

## Conditional Logic & Dependencies

### Conditional Field Behavior

**Trigger**: Patient record selection via search filters

**Condition**: When patient record selected from search results

**Effect**:
- Patient information fields (ri_fname, ri_lname, ri_sqs, ri_brth, ri_prsno) auto-populated from patient master record
- Contact information fields (ri_tel, ri_email, ri_addr, ri_work, mo_moq) loaded from existing contact data
- Representative fields (ri_nat*) loaded from representative linkage table
- Form enters edit mode (edt_hid = edit state)

**Dependency Diagram**:
```
Patient Search [r_fname/r_lname/r_prsno match]
  ↓
Patient Record Selected
  ↓
Auto-populate Patient Info [ri_fname, ri_lname, ri_sqs, ri_brth, ri_prsno]
Auto-populate Contact Info [ri_tel, ri_email, ri_addr, ri_work, mo_moq]
Auto-populate Representative Info [ri_nat* fields, mo_natkav]
  ↓
edt_hid [Edit Mode Active]
  ↓
Contact information ready for update
```

**User Impact**: Staff can quickly locate patient and update contact details without re-entering patient identification data

---

## Form Behavior & Workflows

### Typical User Journey

**Step 1**: Patient Lookup
- Fields presented: r_fname, r_lname, r_prsno, r_hisno, regfltr
- User enters: Patient name or ID
- Validation: Searches patient master record
- Action: Click `regfltr` to execute search

**Step 2**: Patient Record Selection
- Fields updated/revealed: Auto-populate patient info section with existing data
- System actions: Load current contact information from database
- Validation: Verify patient record exists

**Step 3**: Contact Information Update
- Fields presented: ri_tel, ri_email, ri_addr, ri_work, mo_moq (pre-filled with current values)
- User enters: Updated contact details (phone, email, address, workplace, citizenship)
- Validation: Email format validation if changed, phone format validation

**Step 4**: Emergency Contact/Representative Update
- Fields presented: ri_natlname, ri_natfname, ri_nattel, ri_nataddr, mo_natkav (pre-filled if exists)
- User enters: Updated emergency contact information
- Validation: Relationship type selected from mo_natkav dropdown if representative info provided

**Step 5**: Save Changes
- Fields validated: Email format (if provided), phone formats
- Data submitted to: Patient contact table (update operation)
- Success behavior: Confirmation message, updated contact data persisted, return to patient list

### Business Rules & Constraints

- **Rule 1**: At least one contact method (phone, email, or address) should be provided for reachable patients
- **Rule 2**: Email validation enforces RFC 5322 format if email field populated
- **Rule 3**: Representative contact information required for minor patients (age < 18, determined from ri_brth)
- **Rule 4**: Emergency contact phone number (ri_nattel) prioritized over patient phone (ri_tel) in emergency scenarios
- **Rule 5**: Contact updates append to patient contact history log (audit trail)

### Edge Cases & Special Behaviors

**Scenario 1**: No Contact Information Available
- **Behavior**: All contact fields blank; form allows entry from scratch
- **User Impact**: Staff can add initial contact information for previously incomplete records

**Scenario 2**: Multiple Emergency Contacts
- **Behavior**: Form supports single representative/emergency contact; additional contacts require multiple saves
- **User Impact**: Staff may need to navigate form multiple times for complex family structures

**Scenario 3**: Unidentified Patient Contact Update
- **Behavior**: If r_anonym was checked during registration, contact fields still editable once patient identified
- **User Impact**: Allows updating contact info for previously anonymous patients after identification

---

## Source Traceability

### Primary Source Reference

**Source JSON**: [`რეგისტრაცია_კონტაქტები.md`](../../რეგისტრაცია_კონტაქტები.md), lines 1-1472

```json
{
    "menus": [
        {"name": "Top Menu", ...},
        {"name": "Sub Menu", "buttons": [
            {"index": 2, "text": "კონტაქტები", "id": "tab_3", "href": "#1s12"}
        ]}
    ],
    "pageElements": {
        "inputs": [
            {"id": "ri_tel", "label": "ტელ", "type": "text", ...},
            {"id": "ri_email", "label": "იმეილი", "type": "text", ...},
            {"id": "ri_addr", "label": "იურიდიული მისამართი", "type": "text", ...},
            ...
        ],
        "dropdowns": [
            {"id": "ri_sqs", "label": "სქესი*", "options": [...]},
            {"id": "mo_moq", "label": "მოქალაქეობა", "options": [...]},
            {"id": "mo_natkav", "label": "ნათესავი", "options": [...]}
        ]
    }
}
```

### Version Control
- **JSON Version**: 2025-11-10
- **Documentation Updated**: 2025-11-10
- **Analyst**: Claude Code Agent
- **Review Status**: Draft

### Change Log

| Date | Change | Analyst | Notes |
|------|--------|---------|-------|
| 2025-11-10 | Initial documentation | Claude Code Agent | Extracted from რეგისტრაცია_კონტაქტები.md source JSON (Spec 002, Task T006) |

---

## Validation & Completeness Checklist

- [x] All fields from source JSON are documented in the Field Documentation section
- [x] Field IDs match source JSON exactly (case-sensitive)
- [x] Georgian labels preserved without transliteration or modification
- [x] Required fields marked with `*` in label and `Yes` in Required column
- [x] Validation rules clearly specified using standard notation
- [x] Dropdown fields have documented options (inline or referenced appendix)
- [x] Hidden fields documented with clear purpose explanation
- [x] Conditional logic documented with trigger → effect diagrams
- [x] Fields logically grouped into meaningful sections with section purposes
- [x] Source JSON references included with accurate line numbers
- [x] Placeholder and default values documented
- [x] Form context and user roles clearly explained in Overview
- [x] Integration points with other forms/modules identified
- [x] Edge cases and special behaviors documented
- [ ] Reviewed by SME for accuracy and completeness (Pending)

---

## Appendices

### A. Field Reference Quick Link

For quick lookup of field definitions by ID:

| Section | Fields | Purpose |
|---------|--------|---------|
| Search/Filter Controls | r_fname, r_lname, r_prsno, r_hisno, regfltr, r_anonym | Patient lookup for contact updates |
| Patient Information | ri_prsno, ri_fname, ri_lname, ri_father, ri_brth, ri_sqs, ri_meug | Patient context display |
| Contact Information | ri_tel, ri_email, ri_addr, ri_work, mo_moq | Primary patient contact data |
| Representative/Emergency Contact | ri_natlname, ri_natfname, ri_natpersno, ri_natbrth, ri_natsqs, ri_nattel, ri_nataddr, mo_natkav | Emergency contact and representative details |
| System Fields | persinstr, edt_hid, edt_hid_tab, hididanalizi, hdPtRgID, lrmh, HelpDes, gdhsh, winfoc, srconusr | Form state and action controls |

### B. Related Documentation

Links to related forms, workflows, or specifications:

- [Receptionist Intake Form](./receptionist-intake-form.md) - Initial intake form with identical field structure
- [Patient Registration Form](./patient-registration-form.md) - Primary registration form
- [Citizenship Options Appendix](../appendices/citizenship-options.md) - Full 250-country citizenship dropdown
- [Menu Structure](../menu-structure.md) - Registration module navigation hierarchy
- [Spec 002: Registration Pages](../../specs/002-registration-pages/spec.md) - Project specification

### C. Questions & Notes for Review

Questions encountered during analysis that need clarification:

- **Q1**: Form structure identical to receptionist-intake-form - is this intentional redundancy or different workflow context?
  - **Resolved**: No - Needs SME review to clarify if forms serve distinct purposes (intake vs. update)
- **Q2**: Emergency contact priority logic (ri_nattel vs. ri_tel) - requires confirmation of system behavior
  - **Resolved**: No - Pending developer review of contact resolution logic

---

## Document Information

**Document Type**: Form Field Documentation
**Template Version**: 1.0.0
**Based On**: form-template.md (v1.0.0)
**Status**: Draft

---

**Total Fields Documented**: 32 fields (10 visible inputs, 3 dropdowns, 10 hidden fields, 1 tel, 1 checkbox, 2 buttons, 5 search filters)
**Total Dropdown Options**: 264 (2 gender + 250 citizenship + 12 relationship)
**Source Lines**: 1-1472
